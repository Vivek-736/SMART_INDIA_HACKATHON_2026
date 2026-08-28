"use server";

import { db } from "@/db";
import { 
  interviewMessages, 
  interviewSessions, 
  clinicalHistories, 
  redFlags, 
  visits 
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrSyncCurrentPatient } from "@/lib/auth/sync-user";
import { extractClinicalEntities } from "@/lib/ai/gemini-extract";
import { InterviewSection } from "@/lib/clinical/interview-engine";
import { revalidatePath } from "next/cache";
import { generateAdaptiveQuestion } from "@/lib/ai/puter-gemini";

export interface RecordTurnPayload {
  sessionId: string;
  visitId: string;
  section: InterviewSection;
  doctorQuestion: string;
  patientAnswer: string;
  language: "en" | "hi" | "te" | "ta" | "kn";
  nextSection?: InterviewSection;
  nextBaseQuestion?: string;
  previousAnswers?: { section: string; answer: string }[];
}

export async function recordInterviewTurnAction(payload: RecordTurnPayload) {
  const patientData = await getOrSyncCurrentPatient();

  if (!patientData) {
    throw new Error("Unauthorized");
  }

  const { patient } = patientData;

  // 1. AI Clinical Extraction & Red Flag Detection
  const extraction = await extractClinicalEntities(
    payload.section,
    payload.doctorQuestion,
    payload.patientAnswer,
    payload.language
  );

  // 2. Persist Doctor's Question in Messages
  await db.insert(interviewMessages).values({
    sessionId: payload.sessionId,
    sender: "SYSTEM",
    textContent: payload.doctorQuestion,
  });

  // 3. Persist Patient's Answer in Messages with Extracted JSON
  await db.insert(interviewMessages).values({
    sessionId: payload.sessionId,
    sender: "PATIENT",
    textContent: payload.patientAnswer,
    extractedData: extraction.structured,
  });

  // 4. If Red Flag detected, create alert and elevate visit priority
  if (extraction.redFlagDetected) {
    await db.insert(redFlags).values({
      visitId: payload.visitId,
      patientId: patient.id,
      severity: extraction.redFlagSeverity || "HIGH",
      category: payload.section,
      description: extraction.redFlagReason || "Potential clinical red flag detected during intake.",
      detectedBy: "INTAKE_AI",
    });

    await db
      .update(visits)
      .set({ priority: "URGENT" })
      .where(eq(visits.id, payload.visitId));
  }

  // 5. Update session's current section
  await db
    .update(interviewSessions)
    .set({
      currentSection: payload.section,
      updatedAt: new Date(),
    })
    .where(eq(interviewSessions.id, payload.sessionId));

  // 6. Generate Adaptive Next Question via Gemini
  let adaptiveNext: { adaptedQuestion: string; suggestedOptions: string[] } | null = null;
  if (payload.nextSection && payload.nextBaseQuestion) {
    const updatedHistory = [
      ...(payload.previousAnswers || []),
      { section: payload.section, answer: payload.patientAnswer },
    ];
    adaptiveNext = await generateAdaptiveQuestion(
      payload.nextSection,
      payload.nextBaseQuestion,
      updatedHistory,
      payload.language
    );
  }

  return {
    success: true,
    extraction,
    adaptiveNext,
  };
}

export async function finalizeInterviewSessionAction(sessionId: string, visitId: string, summary: Record<string, unknown>) {
  const patientData = await getOrSyncCurrentPatient();

  if (!patientData) {
    throw new Error("Unauthorized");
  }

  const { patient } = patientData;

  // 1. Mark session as completed
  await db
    .update(interviewSessions)
    .set({
      status: "COMPLETED",
      completedAt: new Date(),
    })
    .where(eq(interviewSessions.id, sessionId));

  // 2. Visit stays at INTAKE_IN_PROGRESS — the review page confirm action
  //    sets READY_FOR_DOCTOR after the patient verifies their summary.
  // 3. Upsert Clinical History Record
  const existingHistory = await db.query.clinicalHistories.findFirst({
    where: eq(clinicalHistories.visitId, visitId),
  });

  const structuredSummaryText = `Chief Complaint: ${JSON.stringify(summary.chiefComplaint || "")}. HPI: ${JSON.stringify(summary.hpi || "")}. Past History: ${JSON.stringify(summary.pastHistory || "")}. Medications & Allergies: ${JSON.stringify(summary.medicationsAllergies || "")}.`;

  if (existingHistory) {
    await db
      .update(clinicalHistories)
      .set({
        chiefComplaint: summary.chiefComplaint as Record<string, unknown>,
        hpi: summary.hpi as Record<string, unknown>,
        pastMedicalHistory: summary.pastHistory as Record<string, unknown>,
        medications: summary.medicationsAllergies as Record<string, unknown>,
        ayushData: (summary.ayushData as Record<string, unknown>) || null,
        summaryText: structuredSummaryText,
        updatedAt: new Date(),
      })
      .where(eq(clinicalHistories.id, existingHistory.id));
  } else {
    await db.insert(clinicalHistories).values({
      visitId,
      patientId: patient.id,
      chiefComplaint: summary.chiefComplaint as Record<string, unknown>,
      hpi: summary.hpi as Record<string, unknown>,
      pastMedicalHistory: summary.pastHistory as Record<string, unknown>,
      medications: summary.medicationsAllergies as Record<string, unknown>,
      ayushData: (summary.ayushData as Record<string, unknown>) || null,
      summaryText: structuredSummaryText,
    });
  }

  revalidatePath("/patient/dashboard");

  return {
    success: true,
    visitId,
    sessionId,
  };
}
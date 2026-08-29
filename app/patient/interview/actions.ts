"use server";

import { db } from "@/db";
import { 
  interviewMessages, 
  interviewSessions, 
  clinicalHistories, 
  redFlags, 
  visits,
  patients
} from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getOrSyncCurrentPatient } from "@/lib/auth/sync-user";
import { extractClinicalEntities } from "@/lib/ai/gemini-extract";
import { InterviewSection } from "@/lib/clinical/interview-engine";
import { revalidatePath } from "next/cache";
import { generateAdaptiveQuestion } from "@/lib/ai/puter-gemini";
import { generatePhysicianBriefing } from "@/lib/ai/summary-aggregator";

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

  const { patient, user } = patientData;

  // 1. Mark session as completed
  await db
    .update(interviewSessions)
    .set({
      status: "COMPLETED",
      completedAt: new Date(),
    })
    .where(eq(interviewSessions.id, sessionId));

  // 2. Fetch all messages to construct full QA pairs for synthesis
  const messages = await db.query.interviewMessages.findMany({
    where: eq(interviewMessages.sessionId, sessionId),
    orderBy: [asc(interviewMessages.createdAt)],
  });

  const qaPairs: { question: string; answer: string; section?: string }[] = [];
  for (let i = 0; i < messages.length - 1; i++) {
    if (messages[i].sender === "SYSTEM" && messages[i + 1].sender === "PATIENT") {
      qaPairs.push({
        question: messages[i].textContent,
        answer: messages[i + 1].textContent,
      });
      i++;
    }
  }

  const targetVisit = await db.query.visits.findFirst({
    where: eq(visits.id, visitId),
  });

  const existingFlags = await db.query.redFlags.findMany({
    where: eq(redFlags.visitId, visitId),
  });

  const patientFullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Patient";

  // 3. Generate high-grade Physician Briefing using Gemini & Clinical Synthesizer
  const briefing = await generatePhysicianBriefing({
    patientName: patientFullName,
    patientAge: patient.age,
    patientGender: patient.gender,
    department: targetVisit?.department || "General Medicine",
    interviewQAPairs: qaPairs,
    clinicalHistory: {
      chiefComplaint: summary.chiefComplaint,
      hpi: summary.hpi,
      pastMedicalHistory: summary.pastHistory,
      medications: summary.medicationsAllergies,
      ayushData: summary.ayushData,
    },
    documentExtractions: [],
    existingRedFlags: existingFlags.map((f) => ({
      description: f.description,
      severity: f.severity,
    })),
  });

  // 4. Upsert Clinical History Record with rich synthesis
  const existingHistory = await db.query.clinicalHistories.findFirst({
    where: eq(clinicalHistories.visitId, visitId),
  });

  const historyValues = {
    visitId,
    patientId: patient.id,
    chiefComplaint: briefing.chiefComplaintSummary as unknown as Record<string, unknown>,
    hpi: briefing.hpiEvolution as unknown as Record<string, unknown>,
    pastMedicalHistory: briefing.pastMedicalHistorySummary as unknown as Record<string, unknown>,
    medications: briefing.activeMedications as unknown as Record<string, unknown>,
    ayushData: (summary.ayushData as Record<string, unknown>) || null,
    summaryText: briefing.synthesizedSummary,
    updatedAt: new Date(),
  };

  if (existingHistory) {
    await db
      .update(clinicalHistories)
      .set(historyValues)
      .where(eq(clinicalHistories.id, existingHistory.id));
  } else {
    await db.insert(clinicalHistories).values(historyValues);
  }

  // 5. Update visit priority if triage is urgent
  if (briefing.triagePriority === "URGENT") {
    await db
      .update(visits)
      .set({ priority: "URGENT", updatedAt: new Date() })
      .where(eq(visits.id, visitId));
  }

  revalidatePath("/patient/dashboard");
  revalidatePath("/patient/review");

  return {
    success: true,
    visitId,
    sessionId,
    briefing,
  };
}
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
import { eq, asc, desc } from "drizzle-orm";
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

/**
 * Fetch patient's single source of truth language preference and clinical mode
 */
export async function getPatientInterviewConfigAction() {
  const patientData = await getOrSyncCurrentPatient();
  if (!patientData) {
    return { language: "en" as const, ayushModeEnabled: false, uhid: null };
  }
  const lang = (patientData.patient.languagePreference || "en") as "en" | "hi" | "te" | "ta" | "kn";
  return {
    language: lang,
    ayushModeEnabled: !!patientData.patient.ayushModeEnabled,
    uhid: patientData.patient.uhid,
  };
}

/**
 * Resolves or creates an authentic, active database session and visit for the patient.
 * Prevents foreign key constraint violations if URL params are missing or contain demo values.
 */
async function resolveOrCreateValidSession(
  patientId: string,
  providedSessionId?: string,
  providedVisitId?: string,
  section: InterviewSection = "CHIEF_COMPLAINT",
  language: "en" | "hi" | "te" | "ta" | "kn" = "en",
  department: string = "General Medicine"
) {
  // 1. Try to find existing session by sessionId
  if (providedSessionId && providedSessionId !== "session-demo") {
    const existingSession = await db.query.interviewSessions.findFirst({
      where: eq(interviewSessions.id, providedSessionId),
    });
    if (existingSession) {
      return { session: existingSession, visitId: existingSession.visitId };
    }
  }

  // 2. Try to find existing visit by visitId
  let targetVisitId = providedVisitId;
  if (targetVisitId && targetVisitId !== "visit-demo") {
    const existingVisit = await db.query.visits.findFirst({
      where: eq(visits.id, targetVisitId),
    });
    if (existingVisit) {
      targetVisitId = existingVisit.id;
      // Look for active session in this visit
      const visitSession = await db.query.interviewSessions.findFirst({
        where: eq(interviewSessions.visitId, existingVisit.id),
        orderBy: [desc(interviewSessions.createdAt)],
      });
      if (visitSession) {
        return { session: visitSession, visitId: existingVisit.id };
      }
    } else {
      targetVisitId = undefined;
    }
  }

  // 3. If no valid visit, find latest open visit or create one
  if (!targetVisitId) {
    const latestVisit = await db.query.visits.findFirst({
      where: eq(visits.patientId, patientId),
      orderBy: [desc(visits.createdAt)],
    });

    if (latestVisit && latestVisit.status !== "COMPLETED") {
      targetVisitId = latestVisit.id;
    } else {
      const [newVisit] = await db
        .insert(visits)
        .values({
          patientId,
          department,
          status: "INTAKE_IN_PROGRESS",
          priority: "ROUTINE",
        })
        .returning();
      targetVisitId = newVisit.id;
    }
  }

  // 4. Create new authentic session linked to valid visit and patient
  const [createdSession] = await db
    .insert(interviewSessions)
    .values({
      visitId: targetVisitId,
      patientId,
      status: "ACTIVE",
      currentSection: section,
      language,
    })
    .returning();

  return { session: createdSession, visitId: targetVisitId };
}

export async function ensureActiveInterviewSessionAction(
  providedVisitId?: string,
  department: string = "General Medicine",
  language: "en" | "hi" | "te" | "ta" | "kn" = "en"
) {
  const patientData = await getOrSyncCurrentPatient();
  if (!patientData) {
    throw new Error("Unauthorized");
  }

  const effectiveLang = (patientData.patient.languagePreference || language || "en") as "en" | "hi" | "te" | "ta" | "kn";

  const { session, visitId } = await resolveOrCreateValidSession(
    patientData.patient.id,
    undefined,
    providedVisitId,
    "CHIEF_COMPLAINT",
    effectiveLang,
    department
  );

  return {
    sessionId: session.id,
    visitId,
    language: effectiveLang,
  };
}

export async function recordInterviewTurnAction(payload: RecordTurnPayload) {
  const patientData = await getOrSyncCurrentPatient();

  if (!patientData) {
    throw new Error("Unauthorized");
  }

  const { patient } = patientData;
  // Prioritize the active interview language and sync with patient profile
  const effectiveLang = (payload.language || patient.languagePreference || "en") as "en" | "hi" | "te" | "ta" | "kn";

  if (patient.languagePreference !== effectiveLang) {
    await db
      .update(patients)
      .set({
        languagePreference: effectiveLang,
        updatedAt: new Date(),
      })
      .where(eq(patients.id, patient.id));
  }

  // 1. Ensure Valid Database Session & Visit (Prevents foreign key 500 error)
  const { session: activeSession, visitId: activeVisitId } = await resolveOrCreateValidSession(
    patient.id,
    payload.sessionId,
    payload.visitId,
    payload.section,
    effectiveLang
  );

  // 2. AI Clinical Extraction & Red Flag Detection
  const extraction = await extractClinicalEntities(
    payload.section,
    payload.doctorQuestion,
    payload.patientAnswer,
    effectiveLang
  );

  // 3. Persist Doctor's Question in Messages
  await db.insert(interviewMessages).values({
    sessionId: activeSession.id,
    sender: "SYSTEM",
    textContent: payload.doctorQuestion,
  });

  // 4. Persist Patient's Answer in Messages with Extracted JSON
  await db.insert(interviewMessages).values({
    sessionId: activeSession.id,
    sender: "PATIENT",
    textContent: payload.patientAnswer,
    extractedData: extraction.structured,
  });

  // 5. If Red Flag detected, create alert and elevate visit priority
  if (extraction.redFlagDetected) {
    await db.insert(redFlags).values({
      visitId: activeVisitId,
      patientId: patient.id,
      severity: extraction.redFlagSeverity || "HIGH",
      category: payload.section,
      description: extraction.redFlagReason || "Potential clinical red flag detected during intake.",
      detectedBy: "INTAKE_AI",
    });

    await db
      .update(visits)
      .set({ priority: "URGENT" })
      .where(eq(visits.id, activeVisitId));
  }

  // 6. Update session's current section and language
  await db
    .update(interviewSessions)
    .set({
      currentSection: payload.section,
      language: effectiveLang,
      updatedAt: new Date(),
    })
    .where(eq(interviewSessions.id, activeSession.id));

  // 7. Generate Adaptive Next Question via Gemini in the patient's consistent preferred language
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
      effectiveLang
    );
  }

  return {
    success: true,
    sessionId: activeSession.id,
    visitId: activeVisitId,
    language: effectiveLang,
    extraction,
    adaptiveNext,
  };
}

export async function finalizeInterviewSessionAction(
  sessionId: string, 
  visitId: string, 
  summary: Record<string, unknown>
) {
  const patientData = await getOrSyncCurrentPatient();

  if (!patientData) {
    throw new Error("Unauthorized");
  }

  const { patient, user } = patientData;
  const effectiveLang = (patient.languagePreference || "en") as "en" | "hi" | "te" | "ta" | "kn";

  const { session: activeSession, visitId: activeVisitId } = await resolveOrCreateValidSession(
    patient.id,
    sessionId,
    visitId,
    "CHIEF_COMPLAINT",
    effectiveLang
  );

  // 1. Mark session as completed
  await db
    .update(interviewSessions)
    .set({
      status: "COMPLETED",
      completedAt: new Date(),
    })
    .where(eq(interviewSessions.id, activeSession.id));

  // 2. Fetch all messages to construct full QA pairs for synthesis
  const messages = await db.query.interviewMessages.findMany({
    where: eq(interviewMessages.sessionId, activeSession.id),
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
    where: eq(visits.id, activeVisitId),
  });

  const existingFlags = await db.query.redFlags.findMany({
    where: eq(redFlags.visitId, activeVisitId),
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
    where: eq(clinicalHistories.visitId, activeVisitId),
  });

  const historyValues = {
    visitId: activeVisitId,
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

  // 5. Update visit status to READY_FOR_DOCTOR (or URGENT if triage elevated)
  const visitUpdates: Record<string, unknown> = {
    status: "READY_FOR_DOCTOR",
    updatedAt: new Date(),
  };
  if (briefing.triagePriority === "URGENT") {
    visitUpdates.priority = "URGENT";
  }

  await db
    .update(visits)
    .set(visitUpdates)
    .where(eq(visits.id, activeVisitId));

  revalidatePath("/patient/dashboard");
  revalidatePath("/patient/review");
  revalidatePath("/doctor/dashboard");

  return {
    success: true,
    visitId: activeVisitId,
    sessionId: activeSession.id,
    briefing,
  };
}
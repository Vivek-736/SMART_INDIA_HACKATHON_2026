import { logger, task } from "@trigger.dev/sdk";
import { db } from "@/db";
import {
  visits,
  patients,
  users,
  clinicalHistories,
  interviewMessages,
  medicalDocuments,
  documentExtractions,
  redFlags,
} from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { generatePhysicianBriefing } from "@/lib/ai/summary-aggregator";

export interface FinalizeIntakePayload {
  visitId: string;
  sessionId?: string;
  patientId: string;
}

/**
 * Core intake finalization runner function that can be executed directly
 * or dispatched as an asynchronous Trigger.dev background task.
 */
export async function runFinalizePatientIntake(payload: FinalizeIntakePayload) {
  logger.log("Starting patient intake finalization pipeline", {
    visitId: payload.visitId,
    patientId: payload.patientId,
  });

  // 1. Fetch Patient, User, and Visit Data
  const [visit, patient] = await Promise.all([
    db.query.visits.findFirst({ where: eq(visits.id, payload.visitId) }),
    db.query.patients.findFirst({ where: eq(patients.id, payload.patientId) }),
  ]);

  if (!visit || !patient) {
    throw new Error(`Visit (${payload.visitId}) or Patient (${payload.patientId}) not found.`);
  }

  let patientFullName = "Patient";
  if (patient.userId) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, patient.userId),
    });
    if (user) {
      patientFullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Patient";
    }
  }

  // 2. Fetch Interview Transcript
  const qaPairs: { question: string; answer: string; section?: string }[] = [];
  if (payload.sessionId) {
    const messages = await db.query.interviewMessages.findMany({
      where: eq(interviewMessages.sessionId, payload.sessionId),
      orderBy: [asc(interviewMessages.createdAt)],
    });

    for (let i = 0; i < messages.length - 1; i++) {
      if (messages[i].sender === "SYSTEM" && messages[i + 1].sender === "PATIENT") {
        qaPairs.push({
          question: messages[i].textContent,
          answer: messages[i + 1].textContent,
        });
        i++;
      }
    }
  }

  // 3. Fetch Existing Clinical History
  const history = await db.query.clinicalHistories.findFirst({
    where: eq(clinicalHistories.visitId, payload.visitId),
  });

  // 4. Fetch Uploaded Documents & AI Extractions
  const docs = await db.query.medicalDocuments.findMany({
    where: eq(medicalDocuments.visitId, payload.visitId),
  });

  const docExtractionsList = [];
  for (const doc of docs) {
    const ext = await db.query.documentExtractions.findFirst({
      where: eq(documentExtractions.documentId, doc.id),
    });
    if (ext) {
      docExtractionsList.push({
        fileName: doc.fileName,
        rawText: ext.rawText,
        diagnoses: ext.diagnoses,
        medications: ext.medications,
        labResults: ext.labResults,
        documentDate: ext.documentDate,
      });
    }
  }

  // 5. Fetch Existing Red Flags
  const existingFlags = await db.query.redFlags.findMany({
    where: eq(redFlags.visitId, payload.visitId),
  });

  // 6. Synthesize Unified Physician Briefing via Puter Gemini
  const briefing = await generatePhysicianBriefing({
    patientName: patientFullName,
    patientAge: patient.age,
    patientGender: patient.gender,
    department: visit.department,
    interviewQAPairs: qaPairs,
    clinicalHistory: history,
    documentExtractions: docExtractionsList,
    existingRedFlags: existingFlags.map((f) => ({
      description: f.description,
      severity: f.severity,
    })),
  });

  logger.log("Synthesized physician briefing", {
    priority: briefing.triagePriority,
    summary: briefing.synthesizedSummary,
  });

  // 7. Update Clinical History in PostgreSQL
  if (history) {
    await db
      .update(clinicalHistories)
      .set({
        summaryText: briefing.synthesizedSummary,
        chiefComplaint: briefing.chiefComplaintSummary as unknown as Record<string, unknown>,
        hpi: briefing.hpiEvolution as unknown as Record<string, unknown>,
        pastMedicalHistory: briefing.pastMedicalHistorySummary as unknown as Record<string, unknown>,
        medications: briefing.activeMedications as unknown as Record<string, unknown>,
        isConfirmedByPatient: true,
        updatedAt: new Date(),
      })
      .where(eq(clinicalHistories.id, history.id));
  } else {
    await db.insert(clinicalHistories).values({
      visitId: payload.visitId,
      patientId: payload.patientId,
      summaryText: briefing.synthesizedSummary,
      chiefComplaint: briefing.chiefComplaintSummary as unknown as Record<string, unknown>,
      hpi: briefing.hpiEvolution as unknown as Record<string, unknown>,
      pastMedicalHistory: briefing.pastMedicalHistorySummary as unknown as Record<string, unknown>,
      medications: briefing.activeMedications as unknown as Record<string, unknown>,
      isConfirmedByPatient: true,
    });
  }

  // 8. Update Visit Priority & Mark READY_FOR_DOCTOR
  await db
    .update(visits)
    .set({
      priority: briefing.triagePriority,
      status: "READY_FOR_DOCTOR",
      updatedAt: new Date(),
    })
    .where(eq(visits.id, payload.visitId));

  // 9. If Finalizer detected a critical triage alert, persist
  if (briefing.triagePriority === "URGENT" && briefing.triageReason) {
    const alreadyLogged = existingFlags.some((f) => f.description === briefing.triageReason);
    if (!alreadyLogged) {
      await db.insert(redFlags).values({
        visitId: payload.visitId,
        patientId: payload.patientId,
        severity: "HIGH",
        category: "FINALIZATION_PIPELINE",
        description: briefing.triageReason,
        detectedBy: "INTAKE_AI",
      });
    }
  }

  logger.log("Intake finalization complete. Case is ready for doctor.", {
    visitId: payload.visitId,
    priority: briefing.triagePriority,
  });

  return {
    success: true,
    visitId: payload.visitId,
    priority: briefing.triagePriority,
    briefing,
  };
}

export const finalizePatientIntakeTask = task({
  id: "finalize-patient-intake",
  maxDuration: 600, // 10 minutes max
  run: async (payload: FinalizeIntakePayload) => {
    return await runFinalizePatientIntake(payload);
  },
});
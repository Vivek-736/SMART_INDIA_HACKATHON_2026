"use server";

import { db } from "@/db";
import { visits, consents, interviewSessions, patients } from "@/db/schema";
import { getOrSyncCurrentPatient } from "@/lib/auth/sync-user";
import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";

export interface CreateConsentPayload {
  language: "en" | "hi" | "te" | "ta" | "kn";
  department: "General Medicine" | "AYUSH (Ayurveda)";
  isKiosk?: boolean;
}

export async function submitConsentAndCreateSessionAction(payload: CreateConsentPayload) {
  const patientData = await getOrSyncCurrentPatient();

  if (!patientData) {
    throw new Error("Unauthorized: Please sign in to proceed.");
  }

  const { patient } = patientData;

  // 1. Immediately synchronize patient's language preference in database
  await db
    .update(patients)
    .set({
      languagePreference: payload.language,
      updatedAt: new Date(),
    })
    .where(eq(patients.id, patient.id));

  // 2. Generate Sequential OPD Queue Number (1, 2, 3, 4...) in database order
  const [maxQueueRow] = await db
    .select({ maxQueue: sql<number>`COALESCE(MAX(${visits.queueNumber}), 0)` })
    .from(visits);

  const queueNumber = Number(maxQueueRow?.maxQueue || 0) + 1;

  // 3. Create Active Visit
  const [newVisit] = await db
    .insert(visits)
    .values({
      patientId: patient.id,
      department: payload.department,
      queueNumber,
      status: "INTAKE_IN_PROGRESS",
      isKiosk: !!payload.isKiosk,
      priority: "ROUTINE",
    })
    .returning();

  // 4. Record Informed Consent
  await db.insert(consents).values({
    visitId: newVisit.id,
    patientId: patient.id,
    consentType: "CLINICAL_INTAKE_AND_AI_PROCESSING",
    isGranted: true,
  });

  // 5. Initialize Interview Session with selected language
  const [newSession] = await db
    .insert(interviewSessions)
    .values({
      visitId: newVisit.id,
      patientId: patient.id,
      status: "ACTIVE",
      currentSection: "CHIEF_COMPLAINT",
      language: payload.language,
    })
    .returning();

  revalidatePath("/patient/dashboard");
  revalidatePath("/patient/interview");

  return {
    success: true,
    visitId: newVisit.id,
    sessionId: newSession.id,
    queueNumber,
    department: payload.department,
    language: payload.language,
  };
}
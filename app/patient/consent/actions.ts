"use server";

import { db } from "@/db";
import { visits, consents, interviewSessions } from "@/db/schema";
import { getOrSyncCurrentPatient } from "@/lib/auth/sync-user";
import { revalidatePath } from "next/cache";

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

  // 1. Generate OPD Queue Number (10 - 99)
  const queueNumber = Math.floor(10 + Math.random() * 89);

  // 2. Create Active Visit
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

  // 3. Record Informed Consent
  await db.insert(consents).values({
    visitId: newVisit.id,
    patientId: patient.id,
    consentType: "CLINICAL_INTAKE_AND_AI_PROCESSING",
    isGranted: true,
  });

  // 4. Initialize Interview Session
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

  return {
    success: true,
    visitId: newVisit.id,
    sessionId: newSession.id,
    queueNumber,
    department: payload.department,
    language: payload.language,
  };
}
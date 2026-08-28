"use server";

import { db } from "@/db";
import { visits } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrSyncCurrentDoctor } from "@/lib/auth/sync-doctor";
import { revalidatePath } from "next/cache";

/**
 * Assigns the visit to the current doctor and locks the consultation session.
 */
export async function startConsultationAction(visitId: string) {
  const docAuth = await getOrSyncCurrentDoctor();

  if (!docAuth.isAuthorized || !docAuth.doctor) {
    return { success: false, error: "Unauthorized: Physician credentials required." };
  }

  const doctor = docAuth.doctor;

  // 1. Check current visit state
  const targetVisit = await db.query.visits.findFirst({
    where: eq(visits.id, visitId),
  });

  if (!targetVisit) {
    return { success: false, error: "Visit record not found." };
  }

  // 2. Multi-Doctor Lock Guard: If another doctor is already handling, block
  if (
    targetVisit.status === "IN_CONSULTATION" &&
    targetVisit.doctorId &&
    targetVisit.doctorId !== doctor.id
  ) {
    return {
      success: false,
      error: "This patient is already in active consultation with another physician.",
    };
  }

  // 3. Lock to current doctor
  await db
    .update(visits)
    .set({
      doctorId: doctor.id,
      status: "IN_CONSULTATION",
      updatedAt: new Date(),
    })
    .where(eq(visits.id, visitId));

  revalidatePath("/doctor/dashboard");
  revalidatePath(`/doctor/patients/${visitId}`);

  return { success: true, visitId };
}
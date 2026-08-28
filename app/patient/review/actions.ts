"use server";

import { db } from "@/db";
import { clinicalHistories, visits } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrSyncCurrentPatient } from "@/lib/auth/sync-user";
import { revalidatePath } from "next/cache";

/**
 * confirmReviewAction
 *
 * Called when the patient taps "Confirm & Proceed to Documents" on the review page.
 * 1. Marks clinical history as confirmed by patient.
 * 2. Transitions visit status to READY_FOR_DOCTOR.
 */
export async function confirmReviewAction(
  visitId: string
): Promise<{ success: boolean; error?: string }> {
  const patientData = await getOrSyncCurrentPatient();
  if (!patientData) {
    return { success: false, error: "Unauthorized" };
  }

  // Mark history as patient-confirmed
  await db
    .update(clinicalHistories)
    .set({ isConfirmedByPatient: true, updatedAt: new Date() })
    .where(eq(clinicalHistories.visitId, visitId));

  // Transition visit to doctor queue
  await db
    .update(visits)
    .set({ status: "READY_FOR_DOCTOR", updatedAt: new Date() })
    .where(eq(visits.id, visitId));

  revalidatePath("/patient/dashboard");

  return { success: true };
}
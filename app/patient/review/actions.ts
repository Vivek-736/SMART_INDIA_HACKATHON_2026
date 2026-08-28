"use server";

import { db } from "@/db";
import { clinicalHistories, visits } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrSyncCurrentPatient } from "@/lib/auth/sync-user";
import { revalidatePath } from "next/cache";
import {
  finalizePatientIntakeTask,
  runFinalizePatientIntake,
} from "@/trigger/finalize-intake";

/**
 * confirmReviewAction
 *
 * Called when the patient taps "Confirm & Proceed to Documents" on the review page.
 * 1. Marks clinical history as confirmed by patient.
 * 2. Transitions visit status to READY_FOR_DOCTOR.
 * 3. Triggers Trigger.dev intake finalization pipeline to synthesize physician brief & timeline.
 */
export async function confirmReviewAction(
  visitId: string,
  sessionId?: string
): Promise<{ success: boolean; error?: string }> {
  const patientData = await getOrSyncCurrentPatient();
  if (!patientData) {
    return { success: false, error: "Unauthorized" };
  }

  const { patient } = patientData;

  // 1. Mark history as patient-confirmed
  await db
    .update(clinicalHistories)
    .set({ isConfirmedByPatient: true, updatedAt: new Date() })
    .where(eq(clinicalHistories.visitId, visitId));

  // 2. Transition visit to doctor queue
  await db
    .update(visits)
    .set({ status: "READY_FOR_DOCTOR", updatedAt: new Date() })
    .where(eq(visits.id, visitId));

  // 3. Dispatch async finalization task via Trigger.dev or direct background runner
  try {
    if (process.env.TRIGGER_SECRET_KEY) {
      await finalizePatientIntakeTask.trigger({
        visitId,
        sessionId,
        patientId: patient.id,
      });
    } else {
      runFinalizePatientIntake({
        visitId,
        sessionId,
        patientId: patient.id,
      }).catch((e: unknown) => console.warn("Background finalizer run warning:", e));
    }
  } catch (err) {
    console.warn("Could not dispatch Trigger.dev finalizer task, falling back to direct run:", err);
    runFinalizePatientIntake({
      visitId,
      sessionId,
      patientId: patient.id,
    }).catch((e: unknown) => console.warn("Fallback finalizer run error:", e));
  }

  revalidatePath("/patient/dashboard");

  return { success: true };
}
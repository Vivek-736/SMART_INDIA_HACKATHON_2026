"use server";

import { db } from "@/db";
import { patients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrSyncCurrentPatient } from "@/lib/auth/sync-user";
import { z } from "zod";

const AgeSchema = z.object({
  age: z
    .number({ message: "Age must be a number" })
    .int()
    .min(1, "Age must be at least 1")
    .max(120, "Age must be 120 or below"),
});

export async function savePatientAgeAction(age: number): Promise<{ success: boolean; error?: string }> {
  const parsed = AgeSchema.safeParse({ age });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid age" };
  }

  const patientData = await getOrSyncCurrentPatient();
  if (!patientData) {
    return { success: false, error: "Unauthorized" };
  }

  await db
    .update(patients)
    .set({ age: parsed.data.age, updatedAt: new Date() })
    .where(eq(patients.id, patientData.patient.id));

  return { success: true };
}
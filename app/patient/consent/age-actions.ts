"use server";

import { db } from "@/db";
import { patients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrSyncCurrentPatient } from "@/lib/auth/sync-user";
import { z } from "zod";

const PatientProfileSchema = z.object({
  age: z
    .number({ message: "Age must be a number" })
    .int()
    .min(1, "Age must be at least 1")
    .max(120, "Age must be 120 or below"),
  gender: z.enum(["male", "female"], { message: "Please select a gender" }),
});

export async function savePatientProfileAction(
  age: number,
  gender: "male" | "female"
): Promise<{ success: boolean; error?: string }> {
  const parsed = PatientProfileSchema.safeParse({ age, gender });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const patientData = await getOrSyncCurrentPatient();
  if (!patientData) {
    return { success: false, error: "Unauthorized" };
  }

  await db
    .update(patients)
    .set({ age: parsed.data.age, gender: parsed.data.gender, updatedAt: new Date() })
    .where(eq(patients.id, patientData.patient.id));

  return { success: true };
}
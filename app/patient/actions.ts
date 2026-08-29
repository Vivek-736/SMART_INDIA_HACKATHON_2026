"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, patients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Server action to update the current logged-in patient's preferred language in the database.
 */
export async function updatePatientLanguageAction(newLanguage: string) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false, error: "Not authenticated" };
    }

    const userRow = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUser.id),
    });

    if (!userRow) {
      return { success: false, error: "User not found" };
    }

    const patientRow = await db.query.patients.findFirst({
      where: eq(patients.userId, userRow.id),
    });

    if (!patientRow) {
      return { success: false, error: "Patient record not found" };
    }

    await db
      .update(patients)
      .set({
        languagePreference: newLanguage,
        updatedAt: new Date(),
      })
      .where(eq(patients.id, patientRow.id));

    revalidatePath("/patient/dashboard");
    revalidatePath("/patient/consent");
    revalidatePath("/patient/interview");
    revalidatePath("/patient/documents");
    revalidatePath("/patient/review");
    revalidatePath("/patient/complete");

    return { success: true, language: newLanguage };
  } catch (error) {
    console.error("[updatePatientLanguageAction Error]:", error);
    return { success: false, error: "Failed to update language preference" };
  }
}
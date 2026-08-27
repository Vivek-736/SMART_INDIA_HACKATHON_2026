import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, patients } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getOrSyncCurrentPatient() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress || `${clerkUser.id}@preconsult.internal`;
  const firstName = clerkUser.firstName || "Patient";
  const lastName = clerkUser.lastName || "";

  // 1. Find or create user in Neon DB
  let existingUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });

  if (!existingUser) {
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId: clerkUser.id,
        email,
        firstName,
        lastName,
        role: "patient",
      })
      .returning();
    existingUser = newUser;
  }

  // 2. Find or create patient record
  let existingPatient = await db.query.patients.findFirst({
    where: eq(patients.userId, existingUser.id),
  });

  if (!existingPatient) {
    // Generate a readable demo UHID
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const uhid = `PRE-${new Date().getFullYear()}-${randomDigits}`;

    const [newPatient] = await db
      .insert(patients)
      .values({
        userId: existingUser.id,
        uhid,
        languagePreference: "en",
        ayushModeEnabled: false,
      })
      .returning();
    existingPatient = newPatient;
  }

  return {
    user: existingUser,
    patient: existingPatient,
  };
}
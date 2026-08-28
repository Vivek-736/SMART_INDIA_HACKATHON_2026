import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, doctors } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Whitelist of authorized physician email addresses.
 */
export const ALLOWED_DOCTOR_EMAILS = [
  "vivek338614@gmail.com",
  "myvini19@gmail.com",
  "vivekvrc777@gmail.com"
].map((e) => e.toLowerCase().trim());

export interface DoctorAuthResult {
  isAuthorized: boolean;
  reason?: "NOT_LOGGED_IN" | "UNAUTHORIZED_EMAIL";
  userEmail?: string;
  user?: typeof users.$inferSelect | null;
  doctor?: typeof doctors.$inferSelect | null;
}

/**
 * Authenticates and synchronizes the logged-in Clerk user as an authorized doctor.
 * If the email is not in the whitelist, denies access.
 */
export async function getOrSyncCurrentDoctor(): Promise<DoctorAuthResult> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return {
      isAuthorized: false,
      reason: "NOT_LOGGED_IN",
      user: null,
      doctor: null,
    };
  }

  const primaryEmail =
    clerkUser.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
    clerkUser.emailAddresses?.[0]?.emailAddress;

  const normalizedEmail = primaryEmail ? primaryEmail.toLowerCase().trim() : "";

  // Verify Whitelist
  if (!normalizedEmail || !ALLOWED_DOCTOR_EMAILS.includes(normalizedEmail)) {
    return {
      isAuthorized: false,
      reason: "UNAUTHORIZED_EMAIL",
      userEmail: normalizedEmail,
      user: null,
      doctor: null,
    };
  }

  const firstName = clerkUser.firstName || "Doctor";
  const lastName = clerkUser.lastName || "";

  // 1. Sync User Record with doctor role
  let existingUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });

  if (!existingUser) {
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId: clerkUser.id,
        email: normalizedEmail,
        firstName,
        lastName,
        role: "doctor",
      })
      .returning();
    existingUser = newUser;
  } else if (existingUser.role !== "doctor") {
    const [updatedUser] = await db
      .update(users)
      .set({
        role: "doctor",
        firstName,
        lastName,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingUser.id))
      .returning();
    existingUser = updatedUser;
  }

  // 2. Sync Doctor Record
  let existingDoctor = await db.query.doctors.findFirst({
    where: eq(doctors.userId, existingUser.id),
  });

  if (!existingDoctor) {
    const [newDoctor] = await db
      .insert(doctors)
      .values({
        userId: existingUser.id,
        department: "General Medicine",
        specialization: "General Physician / Internal Medicine",
        licenseNumber: "NMC-" + Math.floor(100000 + Math.random() * 900000),
        roomNumber: "OPD Room 104",
      })
      .returning();
    existingDoctor = newDoctor;
  }

  return {
    isAuthorized: true,
    userEmail: normalizedEmail,
    user: existingUser,
    doctor: existingDoctor,
  };
}
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Whitelist of authorized hospital administrator email addresses.
 */
export const ALLOWED_HOSPITAL_ADMIN_EMAILS = [
  "vivek338614@gmail.com",
  "myvini19@gmail.com",
  "vivekvrc777@gmail.com",
].map((e) => e.toLowerCase().trim());

export interface HospitalAdminAuthResult {
  isAuthorized: boolean;
  reason?: "NOT_LOGGED_IN" | "UNAUTHORIZED_EMAIL";
  userEmail?: string;
  user?: typeof users.$inferSelect | null;
}

/**
 * Authenticates and synchronizes the logged-in Clerk user as an authorized hospital administrator.
 */
export async function getOrSyncCurrentHospitalAdmin(): Promise<HospitalAdminAuthResult> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return {
      isAuthorized: false,
      reason: "NOT_LOGGED_IN",
      user: null,
    };
  }

  const primaryEmail =
    clerkUser.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
    clerkUser.emailAddresses?.[0]?.emailAddress;

  const normalizedEmail = primaryEmail ? primaryEmail.toLowerCase().trim() : "";

  // Verify Whitelist
  if (!normalizedEmail || !ALLOWED_HOSPITAL_ADMIN_EMAILS.includes(normalizedEmail)) {
    return {
      isAuthorized: false,
      reason: "UNAUTHORIZED_EMAIL",
      userEmail: normalizedEmail,
      user: null,
    };
  }

  const firstName = clerkUser.firstName || "Hospital";
  const lastName = clerkUser.lastName || "Admin";

  // Sync User Record with HOSPITAL_ADMIN role
  let existingUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });

  if (!existingUser) {
    const [insertedUser] = await db
      .insert(users)
      .values({
        clerkId: clerkUser.id,
        email: normalizedEmail,
        firstName,
        lastName,
        role: "hospital_admin",
      })
      .returning();
    existingUser = insertedUser;
  } else {
    // Ensure role is hospital_admin or doctor
    if (existingUser.role !== "hospital_admin" && existingUser.role !== "doctor") {
      await db
        .update(users)
        .set({
          role: "hospital_admin",
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id));
    }
  }

  return {
    isAuthorized: true,
    userEmail: normalizedEmail,
    user: existingUser,
  };
}
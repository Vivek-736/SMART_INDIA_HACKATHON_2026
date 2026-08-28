import { redirect } from "next/navigation";
import { getOrSyncCurrentPatient } from "@/lib/auth/sync-user";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { eq } from "drizzle-orm";
import ConsentScreen from "./consent-screen";

/**
 * /patient/consent — Server Component
 *
 * Checks whether the logged-in patient has their age on record.
 * Passes `ageRequired` to the client ConsentScreen so the AgeDialog
 * opens automatically on first visit and never re-appears once filled.
 */
export default async function PatientConsentPage() {
  const patientData = await getOrSyncCurrentPatient();

  if (!patientData) {
    redirect("/patient/login");
  }

  const patientRow = await db.query.patients.findFirst({
    where: eq(patients.id, patientData.patient.id),
    columns: { age: true },
  });

  const ageRequired = patientRow?.age == null;

  return <ConsentScreen ageRequired={ageRequired} />;
}
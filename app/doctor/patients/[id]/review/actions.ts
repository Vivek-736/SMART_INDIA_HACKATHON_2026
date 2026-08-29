"use server";

import { db } from "@/db";
import { 
  visits, 
  doctorReviews, 
  prescriptions, 
  patients, 
  users 
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrSyncCurrentDoctor } from "@/lib/auth/sync-doctor";
import { revalidatePath } from "next/cache";
import { sendDigitalPrescriptionEmail } from "@/lib/mail/prescription-mailer";

export interface PrescriptionItem {
  medicineName: string;
  form: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface SubmitDoctorReviewPayload {
  visitId: string;
  diagnosis: string;
  secondaryDiagnoses?: string[];
  clinicalNotes?: string;
  prescriptions: PrescriptionItem[];
  followUpDate?: string | null;
  ayushRegimen?: string | null;
}

export async function submitDoctorReviewAction(payload: SubmitDoctorReviewPayload) {
  const docAuth = await getOrSyncCurrentDoctor();

  if (!docAuth.isAuthorized || !docAuth.doctor) {
    return { success: false, error: "Unauthorized: Physician credentials required." };
  }

  const doctor = docAuth.doctor;
  const doctorUser = docAuth.user;

  if (!payload.diagnosis.trim()) {
    return { success: false, error: "Please enter at least one primary diagnosis." };
  }

  const targetVisit = await db.query.visits.findFirst({
    where: eq(visits.id, payload.visitId),
  });

  if (!targetVisit) {
    return { success: false, error: "Visit not found." };
  }

  const patientRow = await db.query.patients.findFirst({
    where: eq(patients.id, targetVisit.patientId),
  });

  const patientUser = patientRow?.userId
    ? await db.query.users.findFirst({
        where: eq(users.id, patientRow.userId),
      })
    : null;

  const patientName = patientUser
    ? [patientUser.firstName, patientUser.lastName].filter(Boolean).join(" ") || "Patient"
    : "Patient";

  const patientEmail = patientUser?.email || "";

  const doctorName = doctorUser
    ? [doctorUser.firstName, doctorUser.lastName].filter(Boolean).join(" ") || "Doctor"
    : "Doctor";

  const clinicalNotesFull = [
    payload.clinicalNotes || "",
    payload.ayushRegimen ? `Ayurvedic Regimen (Ahara/Vihara): ${payload.ayushRegimen}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const diagnosisPayload = {
    primary: payload.diagnosis.trim(),
    secondary: payload.secondaryDiagnoses || [],
    followUpDate: payload.followUpDate || null,
  };

  // 1. Check existing review & save
  const existingReview = await db.query.doctorReviews.findFirst({
    where: eq(doctorReviews.visitId, payload.visitId),
  });

  if (existingReview) {
    await db
      .update(doctorReviews)
      .set({
        doctorId: doctor.id,
        finalDiagnosis: diagnosisPayload,
        doctorNotes: clinicalNotesFull,
        status: "SIGNED",
        signedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(doctorReviews.id, existingReview.id));
  } else {
    await db.insert(doctorReviews).values({
      visitId: payload.visitId,
      doctorId: doctor.id,
      finalDiagnosis: diagnosisPayload,
      doctorNotes: clinicalNotesFull,
      status: "SIGNED",
      signedAt: new Date(),
    });
  }

  // 2. Clear old prescriptions and insert new ones
  await db.delete(prescriptions).where(eq(prescriptions.visitId, payload.visitId));

  const validPrescriptions = payload.prescriptions.filter((p) => p.medicineName.trim());
  if (validPrescriptions.length > 0) {
    await db.insert(prescriptions).values(
      validPrescriptions.map((p) => ({
        visitId: payload.visitId,
        doctorId: doctor.id,
        patientId: targetVisit.patientId,
        medicationName: `${p.form ? `${p.form} ` : ""}${p.medicineName}`.trim(),
        dosage: p.dosage || "As directed",
        frequency: p.frequency || "1-0-1",
        duration: p.duration || "5 Days",
        instructions: p.instructions || null,
      }))
    );
  }

  // 3. Dispatch Digital Prescription Custom HTML Email to Patient
  if (patientEmail) {
    await sendDigitalPrescriptionEmail({
      patientName,
      patientEmail,
      doctorName,
      doctorDepartment: doctor.department || targetVisit.department || "General Medicine",
      doctorRoom: doctor.roomNumber || "OPD Room 104",
      diagnosis: payload.diagnosis.trim(),
      prescriptions: validPrescriptions,
      clinicalNotes: clinicalNotesFull,
      followUpDate: payload.followUpDate || null,
      languagePreference: patientRow?.languagePreference || "en",
    });
  }

  // 4. Mark Visit as COMPLETED
  await db
    .update(visits)
    .set({
      status: "COMPLETED",
      doctorId: doctor.id,
      updatedAt: new Date(),
    })
    .where(eq(visits.id, payload.visitId));

  revalidatePath("/doctor/dashboard");
  revalidatePath("/patient/dashboard");
  revalidatePath(`/doctor/patients/${payload.visitId}`);
  revalidatePath(`/doctor/patients/${payload.visitId}/review`);

  return { success: true };
}
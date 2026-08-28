import { redirect, notFound } from "next/navigation";
import { getOrSyncCurrentDoctor } from "@/lib/auth/sync-doctor";
import { db } from "@/db";
import {
  visits,
  patients,
  users,
  clinicalHistories,
  doctorReviews,
  prescriptions as prescriptionsTable,
  doctors,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import DoctorReviewClient, {
  DoctorReviewViewData,
} from "./review-client";
import { PrescriptionItem } from "./actions";

interface DoctorReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function DoctorReviewPage({ params }: DoctorReviewPageProps) {
  const { id: visitId } = await params;

  // 1. Authenticate Doctor
  const docAuth = await getOrSyncCurrentDoctor();
  if (!docAuth.isAuthorized || !docAuth.doctor || !docAuth.user) {
    redirect("/doctor/login");
  }

  const currentDoctor = docAuth.doctor;

  // 2. Fetch Visit & Patient
  const visit = await db.query.visits.findFirst({
    where: eq(visits.id, visitId),
  });

  if (!visit) {
    notFound();
  }

  const patientRow = await db.query.patients.findFirst({
    where: eq(patients.id, visit.patientId),
  });

  if (!patientRow) {
    notFound();
  }

  const patientUser = patientRow.userId
    ? await db.query.users.findFirst({
        where: eq(users.id, patientRow.userId),
      })
    : null;

  const patientName = patientUser
    ? [patientUser.firstName, patientUser.lastName].filter(Boolean).join(" ") || "Patient"
    : "Patient";

  // 3. Check Lock State
  let attendingDoctorName: string | null = null;
  const isLockedByOtherDoctor =
    visit.status === "IN_CONSULTATION" &&
    !!visit.doctorId &&
    visit.doctorId !== currentDoctor.id;

  if (visit.doctorId) {
    const docRow = await db.query.doctors.findFirst({
      where: eq(doctors.id, visit.doctorId),
    });
    if (docRow) {
      const docUser = await db.query.users.findFirst({
        where: eq(users.id, docRow.userId),
      });
      attendingDoctorName = docUser
        ? [docUser.firstName, docUser.lastName].filter(Boolean).join(" ") || "Doctor"
        : "Doctor";
    }
  }

  // 4. Fetch Clinical History
  const history = await db.query.clinicalHistories.findFirst({
    where: eq(clinicalHistories.visitId, visitId),
  });

  // 5. Fetch Existing Doctor Review & Prescriptions
  const existingReview = await db.query.doctorReviews.findFirst({
    where: eq(doctorReviews.visitId, visitId),
  });

  const existingDbPrescriptions = await db.query.prescriptions.findMany({
    where: eq(prescriptionsTable.visitId, visitId),
  });

  let existingPrescriptions: PrescriptionItem[] = [];
  if (existingDbPrescriptions.length > 0) {
    existingPrescriptions = existingDbPrescriptions.map((p) => ({
      medicineName: p.medicationName,
      form: "Tablet",
      dosage: p.dosage,
      frequency: p.frequency,
      duration: p.duration,
      instructions: p.instructions || "",
    }));
  }

  let parsedDiagnosis = "";
  let parsedFollowUp = "";
  if (existingReview?.finalDiagnosis) {
    if (typeof existingReview.finalDiagnosis === "string") {
      parsedDiagnosis = existingReview.finalDiagnosis;
    } else if (typeof existingReview.finalDiagnosis === "object") {
      const fd = existingReview.finalDiagnosis as Record<string, string>;
      parsedDiagnosis = fd.primary || "";
      parsedFollowUp = fd.followUpDate || "";
    }
  }

  const reviewPayload: DoctorReviewViewData = {
    visitId: visit.id,
    queueNumber: visit.queueNumber || 1,
    department: visit.department,
    priority: visit.priority,
    status: visit.status,
    isLockedByOtherDoctor: !!isLockedByOtherDoctor,
    attendingDoctorName,
    patient: {
      id: patientRow.id,
      name: patientName,
      uhid: patientRow.uhid,
      age: patientRow.age,
      gender: patientRow.gender,
      ayushModeEnabled: patientRow.ayushModeEnabled,
    },
    initialSummaryText: history?.summaryText || "",
    initialDiagnosis: parsedDiagnosis,
    initialClinicalNotes: existingReview?.doctorNotes || "",
    initialPrescriptions: existingPrescriptions,
    initialFollowUpDate: parsedFollowUp || null,
    isAlreadySigned: existingReview?.status === "SIGNED",
  };

  return <DoctorReviewClient data={reviewPayload} />;
}
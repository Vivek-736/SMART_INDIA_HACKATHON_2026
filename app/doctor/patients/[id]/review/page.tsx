import { notFound, redirect } from "next/navigation";
import { getOrSyncCurrentDoctor } from "@/lib/auth/sync-doctor";
import { db } from "@/db";
import { 
  visits, 
  patients, 
  users, 
  clinicalHistories, 
  doctorReviews, 
  prescriptions as prescriptionsTable,
  doctors
} from "@/db/schema";
import { eq } from "drizzle-orm";
import DoctorReviewClient, { DoctorReviewViewData } from "./review-client";
import { PrescriptionItem } from "./actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DoctorPatientReviewPage({ params }: PageProps) {
  const { id: visitId } = await params;
  const docAuth = await getOrSyncCurrentDoctor();

  // 1. Auth Guard
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

  // 3. Parallel Batch Fetching: Doctor Info, Clinical History, Review, Prescriptions
  const [docRow, history, existingReview, existingDbPrescriptions] = await Promise.all([
    visit.doctorId ? db.query.doctors.findFirst({ where: eq(doctors.id, visit.doctorId) }) : Promise.resolve(null),
    db.query.clinicalHistories.findFirst({ where: eq(clinicalHistories.visitId, visitId) }),
    db.query.doctorReviews.findFirst({ where: eq(doctorReviews.visitId, visitId) }),
    db.query.prescriptions.findMany({ where: eq(prescriptionsTable.visitId, visitId) }),
  ]);

  let attendingDoctorName: string | null = null;
  const isLockedByOtherDoctor =
    visit.status === "IN_CONSULTATION" &&
    !!visit.doctorId &&
    visit.doctorId !== currentDoctor.id;

  if (docRow) {
    const docUser = await db.query.users.findFirst({
      where: eq(users.id, docRow.userId),
    });
    attendingDoctorName = docUser
      ? [docUser.firstName, docUser.lastName].filter(Boolean).join(" ") || "Doctor"
      : "Doctor";
  }

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

  const clientData: DoctorReviewViewData = {
    visitId: visit.id,
    queueNumber: visit.queueNumber || 1,
    department: visit.department,
    priority: visit.priority,
    status: visit.status,
    isLockedByOtherDoctor,
    attendingDoctorName,
    patient: {
      id: patientRow.id,
      name: patientName,
      age: patientRow.age,
      gender: patientRow.gender,
      uhid: patientRow.uhid,
      ayushModeEnabled: patientRow.ayushModeEnabled,
    },
    initialSummaryText: history?.summaryText || "",
    initialDiagnosis: parsedDiagnosis,
    initialClinicalNotes: existingReview?.doctorNotes || "",
    initialPrescriptions: existingPrescriptions,
    initialFollowUpDate: parsedFollowUp || null,
    isAlreadySigned: existingReview?.status === "SIGNED",
  };

  return <DoctorReviewClient data={clientData} />;
}
import { redirect, notFound } from "next/navigation";
import { getOrSyncCurrentDoctor } from "@/lib/auth/sync-doctor";
import { db } from "@/db";
import {
  visits,
  patients,
  users,
  clinicalHistories,
  medicalDocuments,
  redFlags,
  interviewSessions,
  interviewMessages,
  doctors,
} from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import ClinicalViewClient, { ClinicalPatientViewData } from "./clinical-view-client";

interface DoctorPatientPageProps {
  params: Promise<{ id: string }>;
}

export default async function DoctorPatientPage({ params }: DoctorPatientPageProps) {
  const { id: visitId } = await params;

  // 1. Authenticate Doctor
  const docAuth = await getOrSyncCurrentDoctor();
  
  if (!docAuth.isAuthorized || !docAuth.doctor || !docAuth.user) {
    redirect("/doctor/login");
  }

  const currentDoctor = docAuth.doctor;

  // 2. Fetch Visit & Patient Data
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

  // 3. Auto-Claim Visit if Unclaimed
  if (visit.status === "READY_FOR_DOCTOR" || !visit.doctorId) {
    await db
      .update(visits)
      .set({
        doctorId: currentDoctor.id,
        status: "IN_CONSULTATION",
        updatedAt: new Date(),
      })
      .where(eq(visits.id, visitId));
  }

  // 4. Fetch Attending Doctor
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

  // 5. Fetch Clinical History
  const history = await db.query.clinicalHistories.findFirst({
    where: eq(clinicalHistories.visitId, visitId),
  });

  // 6. Fetch Uploaded Documents Count
  const docs = await db.query.medicalDocuments.findMany({
    where: eq(medicalDocuments.visitId, visitId),
  });

  // 7. Fetch Red Flags
  const flags = await db.query.redFlags.findMany({
    where: eq(redFlags.visitId, visitId),
  });

  // 8. Fetch Interview Session & Transcript Messages
  const session = await db.query.interviewSessions.findFirst({
    where: eq(interviewSessions.visitId, visitId),
  });

  let transcriptMessages: {
    id: string;
    sender: "SYSTEM" | "PATIENT" | "AI";
    textContent: string;
    timestamp: string;
    extractedPills?: string[];
    isRedFlag?: boolean;
  }[] = [];

  if (session) {
    const msgs = await db.query.interviewMessages.findMany({
      where: eq(interviewMessages.sessionId, session.id),
      orderBy: [asc(interviewMessages.createdAt)],
    });

    transcriptMessages = msgs.map((m) => ({
      id: m.id,
      sender: m.sender,
      textContent: m.textContent,
      timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }));
  }

  // 9. Format Data Payload
  const patientDataPayload: ClinicalPatientViewData = {
    visitId: visit.id,
    queueNumber: visit.queueNumber || 1,
    department: visit.department,
    priority: visit.priority,
    status: visit.status,
    createdAt: visit.createdAt.toISOString(),
    isLockedByOtherDoctor: !!isLockedByOtherDoctor,
    attendingDoctorName,
    patient: {
      id: patientRow.id,
      name: patientName,
      uhid: patientRow.uhid,
      age: patientRow.age,
      gender: patientRow.gender,
      phone: patientRow.phone,
      language: patientRow.languagePreference,
      ayushModeEnabled: patientRow.ayushModeEnabled,
    },
    clinicalHistory: history
      ? {
          summaryText: history.summaryText,
          chiefComplaint: history.chiefComplaint,
          hpi: history.hpi,
          pastMedicalHistory: history.pastMedicalHistory,
          medications: history.medications,
          allergies: history.medications,
          ayushData: history.ayushData,
          isConfirmedByPatient: history.isConfirmedByPatient,
          updatedAt: history.updatedAt.toISOString(),
        }
      : null,
    redFlags: flags.map((f) => ({
      description: f.description,
      severity: f.severity,
      category: f.category,
    })),
    documentsCount: docs.length,
    interviewMessages: transcriptMessages,
  };

  return <ClinicalViewClient data={patientDataPayload} />;
}
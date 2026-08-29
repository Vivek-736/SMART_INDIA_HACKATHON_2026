import { notFound, redirect } from "next/navigation";
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
  doctors
} from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import ClinicalViewClient, { ClinicalPatientViewData } from "./clinical-view-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DoctorPatientClinicalPage({ params }: PageProps) {
  const { id: visitId } = await params;
  const docAuth = await getOrSyncCurrentDoctor();

  // 1. Doctor Auth Guard
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

  // 4. Parallel Batch Fetch: Doctor info, Clinical History, Documents, Red Flags, and Interview Session
  const [docRow, history, docs, flags, session] = await Promise.all([
    visit.doctorId ? db.query.doctors.findFirst({ where: eq(doctors.id, visit.doctorId) }) : Promise.resolve(null),
    db.query.clinicalHistories.findFirst({ where: eq(clinicalHistories.visitId, visitId) }),
    db.query.medicalDocuments.findMany({ where: eq(medicalDocuments.visitId, visitId) }),
    db.query.redFlags.findMany({ where: eq(redFlags.visitId, visitId) }),
    db.query.interviewSessions.findFirst({ where: eq(interviewSessions.visitId, visitId) }),
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
      sender: m.sender as "SYSTEM" | "PATIENT" | "AI",
      textContent: m.textContent,
      timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      extractedPills: m.extractedData ? Object.values(m.extractedData as Record<string, string>) : undefined,
    }));
  }

  // 5. Construct Complete Client Payload
  const clientData: ClinicalPatientViewData = {
    visitId: visit.id,
    queueNumber: visit.queueNumber || 1,
    department: visit.department,
    priority: visit.priority,
    status: visit.status,
    createdAt: new Date(visit.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    isLockedByOtherDoctor,
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
          allergies: history.allergies,
          ayushData: history.ayushData,
          isConfirmedByPatient: history.isConfirmedByPatient,
          updatedAt: new Date(history.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
      : null,
    redFlags: flags.map((f) => ({
      description: f.description,
      severity: f.severity,
      category: f.category || undefined,
    })),
    documentsCount: docs.length,
    interviewMessages: transcriptMessages,
  };

  return <ClinicalViewClient data={clientData} />;
}
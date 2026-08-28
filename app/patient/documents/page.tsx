import { redirect } from "next/navigation";
import { getOrSyncCurrentPatient } from "@/lib/auth/sync-user";
import { db } from "@/db";
import { visits, medicalDocuments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import DocumentsClient from "./documents-client";

interface DocumentsPageProps {
  searchParams: Promise<{ visit?: string; session?: string }>;
}

export default async function PatientDocumentsPage({ searchParams }: DocumentsPageProps) {
  const { visit: visitId, session: sessionId } = await searchParams;

  const patientData = await getOrSyncCurrentPatient();
  
  if (!patientData) {
    redirect("/patient/login");
  }

  const { patient } = patientData;

  // 1. Fetch active visit
  let targetVisit = null;
  if (visitId) {
    targetVisit = await db.query.visits.findFirst({
      where: eq(visits.id, visitId),
    });
  }

  // Fallback to latest active visit if visitId not supplied in URL
  if (!targetVisit) {
    targetVisit = await db.query.visits.findFirst({
      where: eq(visits.patientId, patient.id),
      orderBy: [desc(visits.createdAt)],
    });
  }

  if (!targetVisit) {
    redirect("/patient/consent");
  }

  // 2. Fetch existing documents for this visit
  const existingDocs = await db.query.medicalDocuments.findMany({
    where: eq(medicalDocuments.visitId, targetVisit.id),
    orderBy: [desc(medicalDocuments.uploadedAt)],
  });

  return (
    <DocumentsClient
      visitId={targetVisit.id}
      sessionId={sessionId || "session-active"}
      department={targetVisit.department}
      queueNumber={targetVisit.queueNumber}
      initialDocuments={existingDocs}
    />
  );
}
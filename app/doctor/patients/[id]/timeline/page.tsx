import { redirect, notFound } from "next/navigation";
import { getOrSyncCurrentDoctor } from "@/lib/auth/sync-doctor";
import { db } from "@/db";
import {
  visits,
  patients,
  users,
  medicalDocuments,
  documentExtractions,
  medicalTimelineEntries,
  doctors,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import DoctorTimelineClient, {
  DoctorTimelineViewData,
  ExtractedDocItem,
  TimelineEntryItem,
} from "./timeline-client";

interface DoctorTimelinePageProps {
  params: Promise<{ id: string }>;
}

export default async function DoctorTimelinePage({ params }: DoctorTimelinePageProps) {
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

  // 4. Fetch Uploaded Medical Documents & Extractions
  const docs = await db.query.medicalDocuments.findMany({
    where: eq(medicalDocuments.visitId, visitId),
    orderBy: [desc(medicalDocuments.uploadedAt)],
  });

  const formattedDocs: ExtractedDocItem[] = [];
  for (const doc of docs) {
    const ext = await db.query.documentExtractions.findFirst({
      where: eq(documentExtractions.documentId, doc.id),
    });

    formattedDocs.push({
      id: doc.id,
      fileName: doc.fileName,
      fileUrl: doc.fileUrl,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      uploadedAt: doc.uploadedAt.toLocaleDateString(),
      processingStatus: doc.processingStatus,
      extracted: ext
        ? {
            documentDate: ext.documentDate || undefined,
            summary: ext.rawText || undefined,
            diagnoses: Array.isArray(ext.diagnoses) ? (ext.diagnoses as string[]) : undefined,
            medications: Array.isArray(ext.medications)
              ? (ext.medications as Array<{ name: string; dosage?: string; frequency?: string; duration?: string; instructions?: string }>)
              : undefined,
            labResults: Array.isArray(ext.labResults)
              ? (ext.labResults as Array<{ testName: string; value: string; unit?: string; referenceRange?: string; isAbnormal?: boolean; interpretation?: string }>)
              : undefined,
          }
        : null,
    });
  }

  // 5. Fetch Medical Timeline Entries
  const rawTimeline = await db.query.medicalTimelineEntries.findMany({
    where: eq(medicalTimelineEntries.patientId, patientRow.id),
    orderBy: [desc(medicalTimelineEntries.createdAt)],
  });

  const formattedTimeline: TimelineEntryItem[] = rawTimeline.map((item) => ({
    id: item.id,
    date: item.date || new Date(item.createdAt).toLocaleDateString(),
    title: item.title,
    category: item.category as TimelineEntryItem["category"],
    details: item.details as Record<string, unknown> | null,
    isAbnormal: item.isAbnormal,
    documentId: item.documentId,
    sourceDocName: null,
  }));

  // 6. Assemble Payload
  const timelineViewData: DoctorTimelineViewData = {
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
    },
    documents: formattedDocs,
    timelineEntries: formattedTimeline,
  };

  return <DoctorTimelineClient data={timelineViewData} />;
}
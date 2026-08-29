import { notFound, redirect } from "next/navigation";
import { getOrSyncCurrentDoctor } from "@/lib/auth/sync-doctor";
import { db } from "@/db";
import { 
  visits, 
  patients, 
  users, 
  medicalDocuments, 
  documentExtractions, 
  medicalTimelineEntries,
  doctors
} from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import DoctorTimelineClient, { DoctorTimelineViewData, ExtractedDocItem, TimelineEntryItem } from "./timeline-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DoctorTimelinePage({ params }: PageProps) {
  const { id: visitId } = await params;
  const docAuth = await getOrSyncCurrentDoctor();

  // 1. Auth Guard
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

  // 3. Parallel Batch Fetching: Doctor info, Documents, and Timeline entries
  const [docRow, docs, timeline] = await Promise.all([
    visit.doctorId ? db.query.doctors.findFirst({ where: eq(doctors.id, visit.doctorId) }) : Promise.resolve(null),
    db.query.medicalDocuments.findMany({
      where: eq(medicalDocuments.visitId, visitId),
      orderBy: [desc(medicalDocuments.uploadedAt)],
    }),
    db.query.medicalTimelineEntries.findMany({
      where: eq(medicalTimelineEntries.visitId, visitId),
      orderBy: [desc(medicalTimelineEntries.createdAt)],
    }),
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

  // 4. Batch Fetch Extractions in ONE Query
  const docIds = docs.map((d) => d.id);
  const extractions =
    docIds.length > 0
      ? await db.query.documentExtractions.findMany({
          where: inArray(documentExtractions.documentId, docIds),
        })
      : [];

  const extMap = new Map(extractions.map((e) => [e.documentId, e]));

  const formattedDocs: ExtractedDocItem[] = docs.map((doc) => {
    const ext = extMap.get(doc.id);
    return {
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
        : undefined,
    };
  });

  const formattedTimeline: TimelineEntryItem[] = timeline.map((t) => ({
    id: t.id,
    category: t.category,
    date: t.date || t.createdAt.toLocaleDateString(),
    title: t.title,
    details: t.details ? (t.details as Record<string, unknown>) : null,
    isAbnormal: t.isAbnormal,
    documentId: t.documentId || null,
  }));

  const viewData: DoctorTimelineViewData = {
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
    },
    documents: formattedDocs,
    timelineEntries: formattedTimeline,
  };

  return <DoctorTimelineClient data={viewData} />;
}
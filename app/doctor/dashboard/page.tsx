import { redirect } from "next/navigation";
import { getOrSyncCurrentDoctor } from "@/lib/auth/sync-doctor";
import { db } from "@/db";
import { visits, patients, users, clinicalHistories, medicalDocuments, redFlags, doctors } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import DoctorDashboardClient, { QueueItem } from "./dashboard-client";

export default async function DoctorDashboardPage() {
  const docAuth = await getOrSyncCurrentDoctor();

  if (!docAuth.isAuthorized || !docAuth.doctor || !docAuth.user) {
    redirect("/doctor/login");
  }

  const currentDoctor = docAuth.doctor;
  const currentDoctorUser = docAuth.user;
  const doctorFullName = [currentDoctorUser.firstName, currentDoctorUser.lastName].filter(Boolean).join(" ") || "Doctor";

  // 1. Parallel Batch Query — Fetch all required data in ONE roundtrip (Eliminating N+1 query waterfall)
  const [
    allVisits,
    allPatients,
    allUsers,
    allHistories,
    allDocs,
    allFlags,
    allDoctors,
  ] = await Promise.all([
    db.query.visits.findMany({
      orderBy: [desc(visits.createdAt)],
    }),
    db.query.patients.findMany(),
    db.query.users.findMany(),
    db.query.clinicalHistories.findMany(),
    db.query.medicalDocuments.findMany(),
    db.query.redFlags.findMany(),
    db.query.doctors.findMany(),
  ]);

  // 2. Build high-speed O(1) in-memory lookup maps
  const patientMap = new Map(allPatients.map((p) => [p.id, p]));
  const userMap = new Map(allUsers.map((u) => [u.id, u]));
  const historyMap = new Map(allHistories.map((h) => [h.visitId, h]));
  const doctorMap = new Map(allDoctors.map((d) => [d.id, d]));

  // Group documents by visitId
  const docsCountMap = new Map<string, number>();
  for (const doc of allDocs) {
    if (doc.visitId) {
      docsCountMap.set(doc.visitId, (docsCountMap.get(doc.visitId) || 0) + 1);
    }
  }

  // Group red flags by visitId
  const flagsMap = new Map<string, Array<{ description: string; severity: string }>>();
  for (const flag of allFlags) {
    if (flag.visitId) {
      const list = flagsMap.get(flag.visitId) || [];
      list.push({ description: flag.description, severity: flag.severity });
      flagsMap.set(flag.visitId, list);
    }
  }

  // 3. Hydrate queue items with O(1) in-memory lookups
  const queueItems: QueueItem[] = [];

  for (const v of allVisits) {
    const patientRow = patientMap.get(v.patientId);
    if (!patientRow) continue;

    const patientUser = patientRow.userId ? userMap.get(patientRow.userId) : null;
    const patientName = patientUser
      ? [patientUser.firstName, patientUser.lastName].filter(Boolean).join(" ") || "Patient"
      : "Patient";

    const history = historyMap.get(v.id);
    const flags = flagsMap.get(v.id) || [];
    const documentsCount = docsCountMap.get(v.id) || 0;

    // Attending doctor info if assigned
    let attendingDoc = null;
    if (v.doctorId) {
      const docRow = doctorMap.get(v.doctorId);
      if (docRow) {
        const docUser = userMap.get(docRow.userId);
        attendingDoc = {
          id: docRow.id,
          name: docUser ? [docUser.firstName, docUser.lastName].filter(Boolean).join(" ") || "Doctor" : "Doctor",
          roomNumber: docRow.roomNumber,
        };
      }
    }

    // Extract chief complaint
    let chiefComplaintText = "";
    if (history?.chiefComplaint) {
      if (typeof history.chiefComplaint === "string") {
        chiefComplaintText = history.chiefComplaint;
      } else if (typeof history.chiefComplaint === "object") {
        chiefComplaintText =
          (history.chiefComplaint as Record<string, string>)?.primaryComplaint ||
          JSON.stringify(history.chiefComplaint);
      }
    }

    queueItems.push({
      visitId: v.id,
      queueNumber: v.queueNumber || 1,
      department: v.department,
      status: v.status,
      priority: v.priority,
      createdAt: v.createdAt,
      patient: {
        id: patientRow.id,
        uhid: patientRow.uhid,
        age: patientRow.age,
        gender: patientRow.gender,
        name: patientName,
      },
      attendingDoctor: attendingDoc,
      chiefComplaint: chiefComplaintText,
      summaryText: history?.summaryText || undefined,
      redFlags: flags,
      documentsCount,
    });
  }

  // Sort queue by queueNumber ASC for active patients, completed at the bottom
  queueItems.sort((a, b) => {
    if (a.status === "COMPLETED" && b.status !== "COMPLETED") return 1;
    if (a.status !== "COMPLETED" && b.status === "COMPLETED") return -1;
    return a.queueNumber - b.queueNumber;
  });

  return (
    <DoctorDashboardClient
      currentDoctorId={currentDoctor.id}
      currentDoctorName={doctorFullName}
      initialQueue={queueItems}
    />
  );
}
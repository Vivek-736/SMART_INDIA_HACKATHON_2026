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

  // 1. Query all visits
  const allVisits = await db.query.visits.findMany({
    orderBy: [desc(visits.createdAt)],
  });

  // 2. Hydrate visits with clinical data
  const queueItems: QueueItem[] = [];

  for (const v of allVisits) {
    const patientRow = await db.query.patients.findFirst({
      where: eq(patients.id, v.patientId),
    });

    if (!patientRow) continue;

    const patientUser = patientRow.userId
      ? await db.query.users.findFirst({
          where: eq(users.id, patientRow.userId),
        })
      : null;

    const patientName = patientUser
      ? [patientUser.firstName, patientUser.lastName].filter(Boolean).join(" ") || "Patient"
      : "Patient";

    const history = await db.query.clinicalHistories.findFirst({
      where: eq(clinicalHistories.visitId, v.id),
    });

    const docs = await db.query.medicalDocuments.findMany({
      where: eq(medicalDocuments.visitId, v.id),
    });

    const flags = await db.query.redFlags.findMany({
      where: eq(redFlags.visitId, v.id),
    });

    // Attending doctor info if assigned
    let attendingDoc = null;
    if (v.doctorId) {
      const docRow = await db.query.doctors.findFirst({
        where: eq(doctors.id, v.doctorId),
      });
      if (docRow) {
        const docUser = await db.query.users.findFirst({
          where: eq(users.id, docRow.userId),
        });
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
      redFlags: flags.map((f) => ({
        description: f.description,
        severity: f.severity,
      })),
      documentsCount: docs.length,
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
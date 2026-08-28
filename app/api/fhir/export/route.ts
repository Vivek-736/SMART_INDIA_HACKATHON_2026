import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { 
  visits, 
  patients, 
  users, 
  doctorReviews, 
  prescriptions, 
  clinicalHistories, 
  doctors 
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateFhirR4Bundle } from "@/lib/fhir/generator";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const visitId = searchParams.get("visitId");

    if (!visitId) {
      return NextResponse.json({ error: "Missing visitId parameter" }, { status: 400 });
    }

    // 1. Fetch Visit & Patient
    const targetVisit = await db.query.visits.findFirst({
      where: eq(visits.id, visitId),
    });

    if (!targetVisit) {
      return NextResponse.json({ error: "Visit not found" }, { status: 404 });
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

    // 2. Fetch Doctor Review & Prescriptions
    const review = await db.query.doctorReviews.findFirst({
      where: eq(doctorReviews.visitId, visitId),
    });

    const prescribedList = await db.query.prescriptions.findMany({
      where: eq(prescriptions.visitId, visitId),
    });

    const history = await db.query.clinicalHistories.findFirst({
      where: eq(clinicalHistories.visitId, visitId),
    });

    // 3. Fetch Doctor Details
    let doctorName = "Clinical Physician";
    let doctorDept = targetVisit.department || "General Medicine";
    let doctorRoom: string | null = "OPD Room 104";

    if (targetVisit.doctorId) {
      const docRow = await db.query.doctors.findFirst({
        where: eq(doctors.id, targetVisit.doctorId),
      });
      if (docRow) {
        doctorDept = docRow.department || doctorDept;
        doctorRoom = docRow.roomNumber || doctorRoom;
        const docUser = await db.query.users.findFirst({
          where: eq(users.id, docRow.userId),
        });
        if (docUser) {
          doctorName = [docUser.firstName, docUser.lastName].filter(Boolean).join(" ") || doctorName;
        }
      }
    }

    // Extract Diagnosis text
    let diagnosisText = "Routine Clinical Consultation";
    if (review?.finalDiagnosis) {
      if (typeof review.finalDiagnosis === "object") {
        diagnosisText = (review.finalDiagnosis as any)?.primary || JSON.stringify(review.finalDiagnosis);
      } else if (typeof review.finalDiagnosis === "string") {
        diagnosisText = review.finalDiagnosis;
      }
    }

    // Extract Chief complaint
    let chiefComplaintText = "";
    if (history?.chiefComplaint) {
      if (typeof history.chiefComplaint === "string") {
        chiefComplaintText = history.chiefComplaint;
      } else if (typeof history.chiefComplaint === "object") {
        chiefComplaintText = (history.chiefComplaint as any)?.primaryComplaint || JSON.stringify(history.chiefComplaint);
      }
    }

    // 4. Generate standard FHIR R4 Bundle
    const fhirBundle = generateFhirR4Bundle({
      visitId,
      patientName,
      patientUhid: patientRow?.uhid || null,
      patientGender: patientRow?.gender,
      patientAge: patientRow?.age,
      abhaId: `91-4589-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      doctorName,
      doctorDepartment: doctorDept,
      doctorRoom,
      department: targetVisit.department,
      diagnosis: diagnosisText,
      chiefComplaint: chiefComplaintText,
      medications: prescribedList.map((p) => ({
        medicineName: p.medicationName,
        dosage: p.dosage,
        frequency: p.frequency,
        duration: p.duration,
        instructions: p.instructions,
      })),
      doctorNotes: review?.doctorNotes,
      consultationDate: targetVisit.createdAt,
    });

    const filename = `preconsult-fhir-record-${visitId.slice(0, 8)}.json`;

    return new NextResponse(JSON.stringify(fhirBundle, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/fhir+json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[FHIR Export API Error]:", error);
    return NextResponse.json({ error: "Failed to export FHIR document" }, { status: 500 });
  }
}
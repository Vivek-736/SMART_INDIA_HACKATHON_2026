"use server";

import { db } from "@/db";
import { medicalDocuments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrSyncCurrentPatient } from "@/lib/auth/sync-user";
import { revalidatePath } from "next/cache";

export interface RecordUploadedDocPayload {
  visitId: string;
  fileUrl: string;
  fileKey: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

/**
 * Record an uploaded medical document in PostgreSQL linked to the active visit.
 */
export async function recordUploadedDocumentAction(payload: RecordUploadedDocPayload) {
  const patientData = await getOrSyncCurrentPatient();

  if (!patientData) {
    throw new Error("Unauthorized: Please sign in.");
  }

  const { patient } = patientData;

  const [newDoc] = await db
    .insert(medicalDocuments)
    .values({
      visitId: payload.visitId,
      patientId: patient.id,
      fileUrl: payload.fileUrl,
      fileKey: payload.fileKey,
      fileName: payload.fileName,
      fileType: payload.fileType || "application/octet-stream",
      fileSize: Math.round(payload.fileSize || 0),
      processingStatus: "PENDING",
    })
    .returning();

  revalidatePath(`/patient/documents`);
  revalidatePath(`/patient/dashboard`);

  return {
    success: true,
    document: newDoc,
  };
}

/**
 * Delete a document before final intake submission if uploaded by mistake.
 */
export async function deleteUploadedDocumentAction(documentId: string) {
  const patientData = await getOrSyncCurrentPatient();

  if (!patientData) {
    throw new Error("Unauthorized");
  }

  await db.delete(medicalDocuments).where(eq(medicalDocuments.id, documentId));

  revalidatePath(`/patient/documents`);
  revalidatePath(`/patient/dashboard`);

  return { success: true };
}

/**
 * Fetch all documents uploaded for a specific visit.
 */
export async function getVisitDocumentsAction(visitId: string) {
  const patientData = await getOrSyncCurrentPatient();
  if (!patientData) {
    return [];
  }

  const docs = await db.query.medicalDocuments.findMany({
    where: eq(medicalDocuments.visitId, visitId),
    orderBy: (docs, { desc }) => [desc(docs.uploadedAt)],
  });

  return docs;
}
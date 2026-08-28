"use server";

import { db } from "@/db";
import {
  medicalDocuments,
  documentExtractions,
  medicalTimelineEntries,
  redFlags,
  visits,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrSyncCurrentPatient } from "@/lib/auth/sync-user";
import { revalidatePath } from "next/cache";
import { extractMedicalDocumentData } from "@/lib/ai/document-extract";

export interface RecordUploadedDocPayload {
  visitId: string;
  fileUrl: string;
  fileKey: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

/**
 * Record an uploaded medical document in PostgreSQL and launch asynchronous Document Intelligence processing.
 */
export async function recordUploadedDocumentAction(payload: RecordUploadedDocPayload) {
  const patientData = await getOrSyncCurrentPatient();

  if (!patientData) {
    throw new Error("Unauthorized: Please sign in.");
  }

  const { patient } = patientData;

  // 1. Insert record into medical_documents
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

  // 2. Trigger Document Intelligence in Background (Trigger.dev with resilient in-process fallback)
  triggerDocumentIntelligenceBackground({
    documentId: newDoc.id,
    visitId: payload.visitId,
    patientId: patient.id,
    fileUrl: payload.fileUrl,
    fileName: payload.fileName,
    fileType: payload.fileType,
  }).catch((err) => {
    console.warn("Background document intelligence warning:", err);
  });

  revalidatePath(`/patient/documents`);
  revalidatePath(`/patient/dashboard`);

  return {
    success: true,
    document: newDoc,
  };
}

/**
 * Asynchronous document intelligence execution helper.
 * Tries Trigger.dev worker first, falls back to direct async extraction.
 */
async function triggerDocumentIntelligenceBackground(params: {
  documentId: string;
  visitId: string;
  patientId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
}) {
  try {
    // 1. Try triggering via Trigger.dev task
    const { processMedicalDocumentTask } = await import("@/trigger/process-document");
    if (processMedicalDocumentTask?.trigger) {
      await processMedicalDocumentTask.trigger(params);
      return;
    }
  } catch {
    // Trigger.dev daemon not actively connected; run via resilient server async engine
  }

  // Resilient Server Extraction Fallback:
  try {
    await db
      .update(medicalDocuments)
      .set({ processingStatus: "PROCESSING" })
      .where(eq(medicalDocuments.id, params.documentId));

    const extracted = await extractMedicalDocumentData(
      params.fileUrl,
      params.fileName,
      params.fileType
    );

    // Save extractions
    await db.insert(documentExtractions).values({
      documentId: params.documentId,
      rawText: extracted.summary,
      extractedJson: extracted,
      diagnoses: extracted.diagnoses,
      medications: extracted.medications,
      labResults: extracted.labResults,
      documentDate: extracted.documentDate,
    });

    // Save timeline events
    if (extracted.timelineEvents && extracted.timelineEvents.length > 0) {
      for (const event of extracted.timelineEvents) {
        await db.insert(medicalTimelineEntries).values({
          visitId: params.visitId,
          patientId: params.patientId,
          documentId: params.documentId,
          date: event.date || extracted.documentDate || new Date().toISOString().split("T")[0],
          title: event.title,
          category: event.category,
          details: {
            ...(event.details || {}),
            medications: extracted.medications,
            labResults: extracted.labResults,
            summary: extracted.summary,
          },
          isAbnormal: event.isAbnormal,
        });
      }
    }

    // Save red flags
    if (extracted.redFlags && extracted.redFlags.length > 0) {
      for (const flag of extracted.redFlags) {
        await db.insert(redFlags).values({
          visitId: params.visitId,
          patientId: params.patientId,
          severity: flag.severity || "HIGH",
          category: "DOCUMENT_AI",
          description: flag.description,
          detectedBy: "DOCUMENT_AI",
        });

        if (flag.severity === "CRITICAL" || flag.severity === "HIGH") {
          await db
            .update(visits)
            .set({ priority: "URGENT", updatedAt: new Date() })
            .where(eq(visits.id, params.visitId));
        }
      }
    }

    await db
      .update(medicalDocuments)
      .set({ processingStatus: "COMPLETED" })
      .where(eq(medicalDocuments.id, params.documentId));
  } catch (err) {
    console.error("Async document processing error:", err);
    await db
      .update(medicalDocuments)
      .set({ processingStatus: "FAILED" })
      .where(eq(medicalDocuments.id, params.documentId));
  }
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
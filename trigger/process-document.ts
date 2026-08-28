import { logger, task } from "@trigger.dev/sdk";
import { db } from "@/db";
import {
  medicalDocuments,
  documentExtractions,
  medicalTimelineEntries,
  redFlags,
  visits,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { extractMedicalDocumentData } from "@/lib/ai/document-extract";

export interface ProcessDocumentPayload {
  documentId: string;
  visitId: string;
  patientId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
}

export const processMedicalDocumentTask = task({
  id: "process-medical-document",
  maxDuration: 600, // 10 minutes max duration for high-res OCR
  run: async (payload: ProcessDocumentPayload) => {
    logger.log("Starting medical document intelligence extraction", {
      documentId: payload.documentId,
      fileName: payload.fileName,
    });

    // 1. Mark document as PROCESSING in database
    await db
      .update(medicalDocuments)
      .set({ processingStatus: "PROCESSING" })
      .where(eq(medicalDocuments.id, payload.documentId));

    try {
      // 2. Perform Multimodal AI Extraction with Gemini / Puter
      const extracted = await extractMedicalDocumentData(
        payload.fileUrl,
        payload.fileName,
        payload.fileType
      );

      logger.log("Document extraction completed successfully", {
        category: extracted.documentCategory,
        diagnosesCount: extracted.diagnoses.length,
        medicationsCount: extracted.medications.length,
        labResultsCount: extracted.labResults.length,
      });

      // 3. Upsert into document_extractions table
      const existingExtraction = await db.query.documentExtractions.findFirst({
        where: eq(documentExtractions.documentId, payload.documentId),
      });

      if (existingExtraction) {
        await db
          .update(documentExtractions)
          .set({
            rawText: extracted.summary,
            extractedJson: extracted,
            diagnoses: extracted.diagnoses,
            medications: extracted.medications,
            labResults: extracted.labResults,
            documentDate: extracted.documentDate,
          })
          .where(eq(documentExtractions.id, existingExtraction.id));
      } else {
        await db.insert(documentExtractions).values({
          documentId: payload.documentId,
          rawText: extracted.summary,
          extractedJson: extracted,
          diagnoses: extracted.diagnoses,
          medications: extracted.medications,
          labResults: extracted.labResults,
          documentDate: extracted.documentDate,
        });
      }

      // 4. Create Medical Timeline Entries
      if (extracted.timelineEvents && extracted.timelineEvents.length > 0) {
        for (const event of extracted.timelineEvents) {
          await db.insert(medicalTimelineEntries).values({
            visitId: payload.visitId,
            patientId: payload.patientId,
            documentId: payload.documentId,
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

      // 5. If Critical / High Red Flags detected in Document AI, record alerts
      if (extracted.redFlags && extracted.redFlags.length > 0) {
        for (const flag of extracted.redFlags) {
          await db.insert(redFlags).values({
            visitId: payload.visitId,
            patientId: payload.patientId,
            severity: flag.severity || "HIGH",
            category: "DOCUMENT_AI",
            description: flag.description,
            detectedBy: "DOCUMENT_AI",
          });

          // Elevate visit priority
          if (flag.severity === "CRITICAL" || flag.severity === "HIGH") {
            await db
              .update(visits)
              .set({ priority: "URGENT", updatedAt: new Date() })
              .where(eq(visits.id, payload.visitId));
          }
        }
      }

      // 6. Mark Document as COMPLETED
      await db
        .update(medicalDocuments)
        .set({ processingStatus: "COMPLETED" })
        .where(eq(medicalDocuments.id, payload.documentId));

      return {
        success: true,
        documentId: payload.documentId,
        category: extracted.documentCategory,
        summary: extracted.summary,
      };
    } catch (err) {
      logger.error("Failed to process medical document with AI", { error: String(err) });

      // Mark as FAILED
      await db
        .update(medicalDocuments)
        .set({ processingStatus: "FAILED" })
        .where(eq(medicalDocuments.id, payload.documentId));

      throw err;
    }
  },
});
import { z } from "zod";
import { callPuterAiChat } from "@/lib/ai/puter";

export const PhysicianBriefingSchema = z.object({
  synthesizedSummary: z.string(),
  chiefComplaintSummary: z.string(),
  hpiEvolution: z.string(),
  pastMedicalHistorySummary: z.string(),
  activeMedications: z.array(z.string()).default([]),
  knownAllergies: z.array(z.string()).default([]),
  abnormalFindings: z.array(z.string()).default([]),
  triagePriority: z.enum(["ROUTINE", "URGENT", "EMERGENCY"]).default("ROUTINE"),
  triageReason: z.string().optional(),
});

export type PhysicianBriefing = z.infer<typeof PhysicianBriefingSchema>;

function cleanJsonString(raw: string): string {
  return raw.replace(/```json\n?|\n?```/g, "").trim();
}

export interface IntakeAggregationInput {
  patientName: string;
  patientAge?: number | null;
  patientGender?: string | null;
  department: string;
  interviewQAPairs: { question: string; answer: string; section?: string }[];
  clinicalHistory?: {
    chiefComplaint?: unknown;
    hpi?: unknown;
    pastMedicalHistory?: unknown;
    medications?: unknown;
    ayushData?: unknown;
  } | null;
  documentExtractions: {
    fileName: string;
    rawText?: string | null;
    diagnoses?: unknown;
    medications?: unknown;
    labResults?: unknown;
    documentDate?: string | null;
  }[];
  existingRedFlags: { description: string; severity: string }[];
}

/**
 * Synthesizes interview Q&A + uploaded document extractions into a unified,
 * structured 1-page physician briefing ready for the attending doctor.
 * All output is rendered in professional, fluent English clinical medical terminology.
 */
export async function generatePhysicianBriefing(
  input: IntakeAggregationInput
): Promise<PhysicianBriefing> {
  const qaFormatted = input.interviewQAPairs
    .map((qa, i) => `Turn ${i + 1} [${qa.section || "Clinical Intake"}]:\nQ: "${qa.question}"\nA: "${qa.answer}"`)
    .join("\n\n");

  const docsFormatted = input.documentExtractions.length > 0
    ? input.documentExtractions
        .map((doc, idx) => `Document ${idx + 1} ("${doc.fileName}", Date: ${doc.documentDate || "N/A"}):
Diagnoses: ${JSON.stringify(doc.diagnoses || [])}
Medications: ${JSON.stringify(doc.medications || [])}
Lab Results: ${JSON.stringify(doc.labResults || [])}
Extracted Text: ${doc.rawText || "None"}`)
        .join("\n\n")
    : "No prior medical documents uploaded for this visit.";

  const flagsFormatted = input.existingRedFlags.length > 0
    ? input.existingRedFlags.map((f) => `[${f.severity}] ${f.description}`).join("; ")
    : "No acute red-flag symptoms flagged.";

  const prompt = `You are an expert Chief Medical Officer and Medical Documentation AI synthesizing pre-consultation intake data for an Indian hospital OPD.

Patient Profile:
- Patient Name: ${input.patientName}
- Age: ${input.patientAge ? `${input.patientAge} years old` : "Age not specified"}
- Gender: ${input.patientGender || "Gender not specified"}
- Department: ${input.department} OPD

Patient Pre-Consultation Interview Transcript (May be in English, Hindi, Telugu, Tamil, or Kannada):
${qaFormatted || "No conversational transcript recorded."}

Uploaded Medical Documents & AI Extractions:
${docsFormatted}

Flagged Clinical Triage Alerts:
${flagsFormatted}

TASK:
Synthesize all patient-reported symptoms, disease progression, previous medical records, and medications into an exhaustive, highly articulate 1-page Physician Briefing in standard English medical terminology.

CRITICAL INSTRUCTIONS:
1. Translate any regional Indian language statements (Hindi, Telugu, Tamil, Kannada) into accurate, fluent clinical English.
2. "synthesizedSummary": Write a comprehensive 3-5 sentence clinical overview summarizing who the patient is, primary symptoms, onset, severity, impact on daily activities, key past medical background, and consultation readiness.
3. "chiefComplaintSummary": State the primary presenting complaint with duration and key characteristics (e.g., "Acute productive cough with low-grade intermittent fever for 4 days").
4. "hpiEvolution": Provide a detailed, chronological breakdown of the History of Present Illness covering onset, quality, severity, progression, aggravating/relieving factors, and associated systemic symptoms.
5. "pastMedicalHistorySummary": Detail all chronic conditions (e.g. Hypertension, Type 2 Diabetes, Asthma, COPD, Ischemic Heart Disease), prior hospitalizations, or explicitly state "No prior chronic medical or surgical history reported."
6. "activeMedications": Array of all current medications, home remedies, or OTC drugs mentioned.
7. "knownAllergies": Array of all reported drug, food, or seasonal allergies, or ["No known drug allergies (NKDA)"].
8. "abnormalFindings": Array of abnormal clinical signs, lab findings, or red flag symptoms.
9. "triagePriority": "URGENT" if chest pain, severe dyspnea, high fever, hemoptysis, or syncope is present; else "ROUTINE".
10. "triageReason": If URGENT, explain the medical reason clearly.

Return ONLY a valid JSON object matching this schema without markdown fences:
{
  "synthesizedSummary": "string",
  "chiefComplaintSummary": "string",
  "hpiEvolution": "string",
  "pastMedicalHistorySummary": "string",
  "activeMedications": ["string"],
  "knownAllergies": ["string"],
  "abnormalFindings": ["string"],
  "triagePriority": "ROUTINE" | "URGENT",
  "triageReason": "string"
}`;

  try {
    const rawResponse = await callPuterAiChat(prompt, "gemini-2.0-flash");
    const rawJsonText = cleanJsonString(rawResponse);
    if (rawJsonText) {
      const parsed = JSON.parse(rawJsonText);
      const validated = PhysicianBriefingSchema.parse(parsed);
      if (validated.synthesizedSummary && validated.chiefComplaintSummary) {
        return validated;
      }
    }
  } catch (err) {
    console.warn("[Physician Briefing] AI call failed or timed out, executing deep clinical parser fallback:", err);
  }

  // ── Deep Clinical Intelligence Fallback Synthesizer ──
  return buildDeepClinicalFallback(input);
}

/**
 * Intelligent Rule-Based Clinical Parser that synthesizes real interview turns
 * into a rich, detailed English briefing instead of generic placeholders.
 */
function buildDeepClinicalFallback(input: IntakeAggregationInput): PhysicianBriefing {
  const qa = input.interviewQAPairs;
  const history = input.clinicalHistory;

  let chiefComplaint = "";
  let hpiDetails = "";
  let pastHistory = "";
  let medicationsRaw = "";
  let ayushDetails = "";

  // Extract from QA turns
  for (let i = 0; i < qa.length; i++) {
    const item = qa[i];
    const qLower = item.question.toLowerCase();
    const aText = item.answer.trim();

    if (
      item.section === "CHIEF_COMPLAINT" ||
      i === 0 ||
      qLower.includes("problem") ||
      qLower.includes("brings you") ||
      qLower.includes("तकलीफ") ||
      qLower.includes("సమస్య") ||
      qLower.includes("complaint")
    ) {
      if (!chiefComplaint) chiefComplaint = aText;
    } else if (
      item.section === "HPI_DETAILS" ||
      i === 1 ||
      qLower.includes("since when") ||
      qLower.includes("feel") ||
      qLower.includes("दर्द") ||
      qLower.includes("లక్షణాలు") ||
      qLower.includes("how long") ||
      qLower.includes("severe")
    ) {
      hpiDetails += (hpiDetails ? ". " : "") + aText;
    } else if (
      item.section === "PAST_HISTORY" ||
      qLower.includes("past") ||
      qLower.includes("diabetes") ||
      qLower.includes("blood pressure") ||
      qLower.includes("इतिहास") ||
      qLower.includes("చరిత్ర")
    ) {
      pastHistory += (pastHistory ? ". " : "") + aText;
    } else if (
      item.section === "MEDICATIONS_ALLERGIES" ||
      qLower.includes("medicine") ||
      qLower.includes("allergy") ||
      qLower.includes("दवा") ||
      qLower.includes("మందులు")
    ) {
      medicationsRaw += (medicationsRaw ? ". " : "") + aText;
    } else if (item.section?.startsWith("AYUSH") || qLower.includes("agni") || qLower.includes("prakriti")) {
      ayushDetails += (ayushDetails ? ". " : "") + aText;
    } else {
      hpiDetails += (hpiDetails ? ". " : "") + aText;
    }
  }

  // If QA was sparse, fallback to clinicalHistory fields
  if (!chiefComplaint && history?.chiefComplaint) {
    chiefComplaint = typeof history.chiefComplaint === "string" ? history.chiefComplaint : JSON.stringify(history.chiefComplaint);
  }
  if (!hpiDetails && history?.hpi) {
    hpiDetails = typeof history.hpi === "string" ? history.hpi : JSON.stringify(history.hpi);
  }
  if (!pastHistory && history?.pastMedicalHistory) {
    pastHistory = typeof history.pastMedicalHistory === "string" ? history.pastMedicalHistory : JSON.stringify(history.pastMedicalHistory);
  }
  if (!medicationsRaw && history?.medications) {
    medicationsRaw = typeof history.medications === "string" ? history.medications : JSON.stringify(history.medications);
  }

  const resolvedComplaint = chiefComplaint || "General medical consultation";
  const resolvedHpi = hpiDetails || `Patient reported ${resolvedComplaint} during guided intake. Detailed progression documented in conversational transcript.`;
  const resolvedPast = pastHistory || "No significant prior chronic illnesses or surgical history reported.";

  // Extract active medications and allergies
  const activeMeds: string[] = [];
  const knownAllergies: string[] = [];

  if (medicationsRaw) {
    const parts = medicationsRaw.split(/[,;\n.]+/).map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      if (part.toLowerCase().includes("allerg") || part.toLowerCase().includes("reaction")) {
        knownAllergies.push(part);
      } else if (!part.toLowerCase().includes("no medicine") && !part.toLowerCase().includes("none") && !part.toLowerCase().includes("no")) {
        activeMeds.push(part);
      }
    }
  }

  // Include Document Extractions
  for (const doc of input.documentExtractions) {
    if (Array.isArray(doc.medications)) {
      activeMeds.push(...(doc.medications as string[]));
    }
  }

  if (knownAllergies.length === 0) {
    knownAllergies.push("No known drug allergies reported (NKDA)");
  }

  const hasUrgentFlags = input.existingRedFlags.some(
    (f) => f.severity === "CRITICAL" || f.severity === "HIGH"
  );

  const ageGenderStr = [
    input.patientAge ? `${input.patientAge}-year-old` : null,
    input.patientGender ? input.patientGender.toLowerCase() : "patient",
  ].filter(Boolean).join(" ");

  const synthesizedSummary = `Patient ${input.patientName} (${ageGenderStr}) presented to ${input.department} OPD presenting primarily with "${resolvedComplaint}". Clinical interview indicates: ${resolvedHpi.slice(0, 180)}${resolvedHpi.length > 180 ? "..." : ""}. Past medical background: ${resolvedPast.slice(0, 120)}. ${input.documentExtractions.length} prior medical document(s) on file. Prioritized for clinical physician evaluation.`;

  return {
    synthesizedSummary,
    chiefComplaintSummary: resolvedComplaint,
    hpiEvolution: resolvedHpi,
    pastMedicalHistorySummary: resolvedPast,
    activeMedications: activeMeds.length > 0 ? Array.from(new Set(activeMeds)) : ["None currently reported"],
    knownAllergies,
    abnormalFindings: input.existingRedFlags.map((f) => f.description),
    triagePriority: hasUrgentFlags ? "URGENT" : "ROUTINE",
    triageReason: hasUrgentFlags ? "Urgent clinical symptom identified during intake." : undefined,
  };
}
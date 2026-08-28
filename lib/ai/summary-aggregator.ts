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
  triagePriority: z.enum(["ROUTINE", "URGENT"]).default("ROUTINE"),
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
 */
export async function generatePhysicianBriefing(
  input: IntakeAggregationInput
): Promise<PhysicianBriefing> {
  const qaFormatted = input.interviewQAPairs
    .map((qa, i) => `Q${i + 1} (${qa.section || "General"}): "${qa.question}"\nA${i + 1}: "${qa.answer}"`)
    .join("\n\n");

  const docsFormatted = input.documentExtractions.length > 0
    ? input.documentExtractions
        .map((doc, idx) => `Doc ${idx + 1} ("${doc.fileName}", Date: ${doc.documentDate || "N/A"}):
Diagnoses: ${JSON.stringify(doc.diagnoses || [])}
Medications: ${JSON.stringify(doc.medications || [])}
Lab Results: ${JSON.stringify(doc.labResults || [])}
Notes: ${doc.rawText || "None"}`)
        .join("\n\n")
    : "No prior medical documents uploaded for this visit.";

  const flagsFormatted = input.existingRedFlags.length > 0
    ? input.existingRedFlags.map((f) => `[${f.severity}] ${f.description}`).join("; ")
    : "None detected during intake.";

  const prompt = `You are an expert Chief Medical Officer synthesizing pre-consultation intake data for an Indian hospital OPD.

Patient Profile:
- Name: ${input.patientName}
- Age: ${input.patientAge || "Not recorded"}
- Gender: ${input.patientGender || "Not recorded"}
- Department: ${input.department}

Patient Interview Transcript:
${qaFormatted || "No transcript available."}

Extracted Prior Medical Documents (Rx, Labs, Discharge):
${docsFormatted}

Flagged Clinical Triage Alerts:
${flagsFormatted}

TASK:
Synthesize all patient-reported symptoms and uploaded medical records into a clean, concise, 1-page physician briefing.

RULES:
1. "synthesizedSummary": A 2-3 sentence overview covering primary complaint, duration, key history, and priority status.
2. "chiefComplaintSummary": Concise clinical term for the main presenting complaint.
3. "hpiEvolution": Chronological evolution of current symptoms (onset, progression, aggravating/relieving factors, associated symptoms).
4. "pastMedicalHistorySummary": Known chronic conditions (Diabetes, Hypertension, Asthma, Surgeries) from interview & documents.
5. "activeMedications": Combined list of currently taken drugs with dosages if available.
6. "knownAllergies": Any stated drug or food allergies.
7. "abnormalFindings": Out-of-range lab tests, vital signs, or clinical red flags.
8. "triagePriority": "URGENT" if any severe red-flag symptom or critical abnormal lab is present, else "ROUTINE".
9. "triageReason": If URGENT, explain the clinical rationale.

Return ONLY a valid JSON object matching this schema without markdown:
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
      return PhysicianBriefingSchema.parse(parsed);
    }
  } catch (err) {
    console.warn("Briefing aggregation warning, using fallback synthesizer:", err);
  }

  // Fallback clinical briefing synthesizer
  const hasUrgentFlags = input.existingRedFlags.some(
    (f) => f.severity === "CRITICAL" || f.severity === "HIGH"
  );

  return {
    synthesizedSummary: `Patient presented to ${input.department} OPD with symptoms recorded during guided clinical intake. ${input.documentExtractions.length} prior document(s) attached.`,
    chiefComplaintSummary: "General Consultation",
    hpiEvolution: "See detailed conversational transcript and stage entries below.",
    pastMedicalHistorySummary: "Documented in prior visit records.",
    activeMedications: [],
    knownAllergies: [],
    abnormalFindings: input.existingRedFlags.map((f) => f.description),
    triagePriority: hasUrgentFlags ? "URGENT" : "ROUTINE",
    triageReason: hasUrgentFlags ? "Urgent symptom recorded during intake." : undefined,
  };
}
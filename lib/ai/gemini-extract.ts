import { callPuterAiChat } from "@/lib/ai/puter";
import { InterviewSection } from "@/lib/clinical/interview-engine";

export interface ExtractionResult {
  structured: Record<string, unknown>;
  redFlagDetected: boolean;
  redFlagReason?: string;
  redFlagSeverity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  summarySnippet: string;
}

function cleanJsonString(raw: string): string {
  return raw.replace(/```json\n?|\n?```/g, "").trim();
}

export async function extractClinicalEntities(
  section: InterviewSection,
  question: string,
  answer: string,
  language: string
): Promise<ExtractionResult> {
  const prompt = `You are a clinical documentation assistant for an Indian hospital intake system.
Analyze the patient's answer in response to the clinical question.

Section: ${section}
Language: ${language}
Doctor's Question: "${question}"
Patient's Answer: "${answer}"

Rules:
1. Extract structured medical entities into clean English medical terms.
2. Identify any RED FLAG emergency symptoms (e.g. crushing chest pain, diaphoresis, sudden weakness, coughing blood, severe acute dyspnea, anaphylaxis).
3. Provide a concise 1-sentence doctor-ready summary snippet.

Return ONLY a valid JSON object with this exact structure without markdown:
{
  "structured": {},
  "redFlagDetected": true | false,
  "redFlagReason": "string description if true, else null",
  "redFlagSeverity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "summarySnippet": "concise English medical summary phrase"
}`;

  try {
    const rawResponse = await callPuterAiChat(prompt, "gemini-2.0-flash");
    const rawText = cleanJsonString(rawResponse);
    if (rawText) {
      const parsed = JSON.parse(rawText);
      return {
        structured: parsed.structured || {},
        redFlagDetected: !!parsed.redFlagDetected,
        redFlagReason: parsed.redFlagReason || undefined,
        redFlagSeverity: parsed.redFlagSeverity || (parsed.redFlagDetected ? "HIGH" : "LOW"),
        summarySnippet: parsed.summarySnippet || answer,
      };
    }
  } catch (error) {
    console.warn("Puter Gemini extraction warning, using heuristic fallback:", error);
  }

  // 2. High-reliability Heuristic Clinical Parser Fallback
  return fallbackClinicalParser(section, answer);
}

function fallbackClinicalParser(section: InterviewSection, answer: string): ExtractionResult {
  const lower = answer.toLowerCase();

  const redFlagKeywords = [
    "chest pain", "crushing", "heart attack", "can't breathe", "difficulty breathing",
    "coughing blood", "blood in vomit", "blackout", "unconscious", "stroke", "paralysis",
    "छाती में दर्द", "सांस फूलना", "खून", "ఛాతీ నొప్పి", "ఆయాసం", "రక్తం"
  ];

  const redFlagDetected = redFlagKeywords.some((kw) => lower.includes(kw));

  const structured: Record<string, unknown> = {
    rawAnswer: answer,
    section,
  };

  if (section === "CHIEF_COMPLAINT") {
    structured.primaryComplaint = answer;
  } else if (section === "HPI_DETAILS") {
    structured.hpiDetails = answer;
    const severityMatch = answer.match(/(\d+)\s*\/\s*10/);
    if (severityMatch) {
      structured.severity = parseInt(severityMatch[1], 10);
    }
  } else if (section === "PAST_HISTORY") {
    structured.pastConditions = answer;
  } else if (section === "MEDICATIONS_ALLERGIES") {
    structured.medicationsAndAllergies = answer;
  } else if (section === "AYUSH_EVALUATION") {
    structured.ayushDetails = answer;
  }

  return {
    structured,
    redFlagDetected,
    redFlagReason: redFlagDetected ? "Patient mentioned acute high-risk symptoms requiring immediate review." : undefined,
    redFlagSeverity: redFlagDetected ? "HIGH" : "LOW",
    summarySnippet: `${section}: ${answer.slice(0, 100)}`,
  };
}
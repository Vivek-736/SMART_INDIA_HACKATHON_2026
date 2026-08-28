import { env } from "@/lib/env";
import { InterviewSection } from "@/lib/clinical/interview-engine";

export interface ExtractionResult {
  structured: Record<string, unknown>;
  redFlagDetected: boolean;
  redFlagReason?: string;
  redFlagSeverity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  summarySnippet: string;
}

/**
 * Extract structured medical information from patient answers using Gemini 2.0 / 2.5 Flash API
 */
export async function extractClinicalEntities(
  section: InterviewSection,
  question: string,
  answer: string,
  language: string
): Promise<ExtractionResult> {
  const apiKey = env.GEMINI_API_KEY;

  // 1. If Gemini API key is available, call Gemini 2.0 Flash / 2.5 Flash for high-speed structured extraction
  if (apiKey) {
    try {
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

Return ONLY a valid JSON object with this exact structure:
{
  "structured": { ...extracted key-values },
  "redFlagDetected": true | false,
  "redFlagReason": "string description if true, else null",
  "redFlagSeverity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "summarySnippet": "concise English medical summary phrase"
}`;

      // Call Gemini 2.0 Flash (or 2.5) endpoint
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.1,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawJsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJsonText) {
          const parsed = JSON.parse(rawJsonText);
          return {
            structured: parsed.structured || {},
            redFlagDetected: !!parsed.redFlagDetected,
            redFlagReason: parsed.redFlagReason || undefined,
            redFlagSeverity: parsed.redFlagSeverity || (parsed.redFlagDetected ? "HIGH" : "LOW"),
            summarySnippet: parsed.summarySnippet || answer,
          };
        }
      }
    } catch (error) {
      console.warn("Gemini 2.0 extraction error, falling back to heuristic parser:", error);
    }
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
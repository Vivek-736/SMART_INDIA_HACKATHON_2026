import { callPuterAiChat } from "@/lib/ai/puter";
import { InterviewSection } from "@/lib/clinical/interview-engine";

export interface AdaptiveQuestionResult {
  adaptedQuestion: string;
  suggestedOptions: string[];
}

function cleanJsonString(raw: string): string {
  return raw.replace(/```json\n?|\n?```/g, "").trim();
}

const LANGUAGE_CONFIG: Record<
  "en" | "hi" | "te" | "ta" | "kn",
  { name: string; scriptInstruction: string }
> = {
  en: {
    name: "English",
    scriptInstruction:
      "You MUST write the 'adaptedQuestion' and ALL 'suggestedOptions' EXCLUSIVELY in English. NEVER output in Telugu, Hindi, Tamil, Kannada, or any other regional script.",
  },
  hi: {
    name: "Hindi (हिन्दी)",
    scriptInstruction:
      "You MUST write the 'adaptedQuestion' and ALL 'suggestedOptions' EXCLUSIVELY in Hindi Devanagari script (हिन्दी). NEVER output in English or Telugu.",
  },
  te: {
    name: "Telugu (తెలుగు)",
    scriptInstruction:
      "You MUST write the 'adaptedQuestion' and ALL 'suggestedOptions' EXCLUSIVELY in Telugu script (తెలుగు లిపి). NEVER output in English, Hindi, or any other language.",
  },
  ta: {
    name: "Tamil (தமிழ்)",
    scriptInstruction:
      "You MUST write the 'adaptedQuestion' and ALL 'suggestedOptions' EXCLUSIVELY in Tamil script (தமிழ்). NEVER output in English, Hindi, or Telugu.",
  },
  kn: {
    name: "Kannada (ಕನ್ನಡ)",
    scriptInstruction:
      "You MUST write the 'adaptedQuestion' and ALL 'suggestedOptions' EXCLUSIVELY in Kannada script (ಕನ್ನಡ). NEVER output in English, Hindi, or Telugu.",
  },
};

/**
 * Generate an adaptive, clinically accurate follow-up question tailored specifically
 * to the patient's primary complaint using authenticated Puter Gemini 2.0 Flash engine.
 */
export async function generateAdaptiveQuestion(
  currentSection: InterviewSection,
  baseQuestion: string,
  patientPreviousAnswers: { section: string; answer: string }[],
  language: "en" | "hi" | "te" | "ta" | "kn" = "en"
): Promise<AdaptiveQuestionResult> {
  const langConfig = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG.en;

  const previousContextText = patientPreviousAnswers
    .map((item) => `${item.section}: "${item.answer}"`)
    .join("\n");

  const chiefComplaint = patientPreviousAnswers.find((p) => p.section === "CHIEF_COMPLAINT")?.answer || "";

  const prompt = `You are an expert clinical intake doctor in a high-throughput Indian hospital OPD.
A patient has presented with the following intake answers:
${previousContextText || "Primary complaint just registered."}

Patient's Primary Concern / Chief Complaint: "${chiefComplaint || "General consultation"}"
Target Interview Section: "${currentSection}"
TARGET LANGUAGE: ${langConfig.name} (Code: "${language}")
Default Base Question: "${baseQuestion}"

CRITICAL SCRIPT & LANGUAGE RULES:
1. STRICT LANGUAGE REQUIREMENT: ${langConfig.scriptInstruction}
2. CLINICAL ADAPTATION LOGIC:
   - IF FEVER / CHILLS / INFECTION: Ask about fever duration, shivering, body aches, nighttime temperature spikes. (DO NOT ask "how severe is the pain 1-10" unless they specifically complained of localized pain!).
   - IF PAIN (chest, abdomen, joints, head, back): Ask exact location, character (sharp, burning, throbbing), severity (1-10), and radiation.
   - IF COUGH / BREATHLESSNESS: Ask duration, dry vs wet phlegm, wheezing, breathlessness on walking or lying down.
   - IF DIGESTIVE / ACIDITY: Ask about burning, nausea, food triggers, meal timings.
   - IF PAST_HISTORY: Ask about Diabetes, Hypertension, Asthma, previous surgeries.
   - IF MEDICATIONS_ALLERGIES: Ask about daily medications and known drug allergies.

3. SUGGESTIONS: Provide 4 to 5 concise, realistic quick-tap answer choices ONLY in ${langConfig.name}.

Return ONLY a valid JSON object without markdown formatting:
{
  "adaptedQuestion": "question in ${langConfig.name}",
  "suggestedOptions": ["option 1", "option 2", "option 3", "option 4", "option 5"]
}`;

  try {
    const rawResponse = await callPuterAiChat(prompt, "gemini-2.0-flash");
    const rawJsonText = cleanJsonString(rawResponse);
    if (rawJsonText) {
      const parsed = JSON.parse(rawJsonText);
      if (parsed.adaptedQuestion && typeof parsed.adaptedQuestion === "string") {
        return {
          adaptedQuestion: parsed.adaptedQuestion,
          suggestedOptions: Array.isArray(parsed.suggestedOptions) ? parsed.suggestedOptions : [],
        };
      }
    }
  } catch (err) {
    console.warn("Puter Gemini adaptive question warning:", err);
  }

  // Fallback if AI call does not return
  return {
    adaptedQuestion: baseQuestion,
    suggestedOptions: [],
  };
}
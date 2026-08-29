import { callPuterAiChat } from "@/lib/ai/puter";
import { InterviewSection } from "@/lib/clinical/interview-engine";

export interface AdaptiveQuestionResult {
  adaptedQuestion: string;
  suggestedOptions: string[];
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  hi: "Hindi (हिन्दी / देवनागरी లిపి)",
  te: "Telugu (తెలుగు లిపి)",
  ta: "Tamil (தமிழ் లిపి)",
  kn: "Kannada (ಕನ್ನಡ లిపి)",
};

function cleanJsonString(raw: string): string {
  return raw.replace(/```json\n?|\n?```/g, "").trim();
}

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
  const previousContextText = patientPreviousAnswers
    .map((item) => `${item.section}: "${item.answer}"`)
    .join("\n");

  const chiefComplaint = patientPreviousAnswers.find((p) => p.section === "CHIEF_COMPLAINT")?.answer || "";
  const targetLanguageLabel = LANGUAGE_LABELS[language] || "English";

  const prompt = `You are an expert clinical intake doctor in a high-throughput Indian hospital OPD.
A patient has presented with the following intake answers:
${previousContextText || "Primary complaint just registered."}

Patient's Primary Concern / Chief Complaint: "${chiefComplaint || "General consultation"}"
Target Interview Section: "${currentSection}"
Target Language: "${targetLanguageLabel}" (Code: "${language}")
Default Base Question: "${baseQuestion}"

CRITICAL SCRIPT & LANGUAGE RULES:
1. STRICT SCRIPT ENFORCEMENT:
   - For Telugu ("te"): You MUST write the "adaptedQuestion" and ALL "suggestedOptions" EXCLUSIVELY in Telugu script (తెలుగు లిపి). NEVER use Hindi (हिंदी/देवनागरी) or English.
   - For Tamil ("ta"): You MUST write EXCLUSIVELY in Tamil script (தமிழ்).
   - For Kannada ("kn"): You MUST write EXCLUSIVELY in Kannada script (ಕನ್ನಡ).
   - For Hindi ("hi"): You MUST write EXCLUSIVELY in Hindi Devanagari script (हिन्दी).
   - For English ("en"): Write in English.

2. CLINICAL ADAPTATION LOGIC:
   - IF FEVER / CHILLS / INFECTION: Ask about fever duration, shivering, body aches, nighttime spikes. (DO NOT ask "how severe is the pain 1-10" unless they specifically complained of pain!).
   - IF PAIN (chest, abdomen, joints, head, back): Ask exact location, character (sharp, burning, throbbing), severity (1-10), and radiation.
   - IF COUGH / BREATHLESSNESS: Ask duration, dry vs wet phlegm, wheezing, breathlessness on walking.
   - IF DIGESTIVE / ACIDITY: Ask about burning, nausea, food triggers, meal timings.
   - IF PAST_HISTORY: Ask about Sugar (Diabetes), BP (Hypertension), Asthma, previous surgeries.
   - IF MEDICATIONS_ALLERGIES: Ask about daily medications and drug allergies.

3. SUGGESTIONS: Provide 4 to 5 concise, realistic quick-tap answer choices ONLY in "${targetLanguageLabel}".

Return ONLY a valid JSON object without markdown formatting:
{
  "adaptedQuestion": "question in target language script",
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
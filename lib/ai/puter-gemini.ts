import { callPuterAiChat } from "@/lib/ai/puter";
import { InterviewSection } from "@/lib/clinical/interview-engine";

export interface AdaptiveQuestionResult {
  adaptedQuestion: string;
  suggestedOptions: string[];
}

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

  const prompt = `You are an expert clinical intake doctor in a high-throughput Indian hospital OPD.
A patient has presented with the following intake answers:
${previousContextText || "Primary complaint just registered."}

Patient's Primary Concern / Chief Complaint: "${chiefComplaint || "General consultation"}"
Target Interview Section: "${currentSection}"
Target Language: "${language}" (en = English, hi = Hindi, te = Telugu, ta = Tamil, kn = Kannada)
Default Fallback Question: "${baseQuestion}"

CRITICAL CLINICAL ADAPTATION RULES:
1. Tailor the question specifically to the nature of "${chiefComplaint}":
   - IF FEVER / CHILLS / INFECTION: Ask about temperature, duration, shivering/rigors, body aches, sweating, vomiting, or whether it worsens at night. (DO NOT ask "how severe is the pain 1-10" unless they specifically complained of localized pain!).
   - IF PAIN (chest, abdomen, joints, head, back): Ask exact location, character (sharp, dull, throbbing, burning), severity (1-10), radiation, and what makes it worse or better.
   - IF COUGH / BREATHLESSNESS: Ask duration, dry vs wet phlegm, wheezing, difficulty breathing when lying down or walking.
   - IF DIGESTIVE / STOMACH: Ask about nausea, vomiting, burning acidity, food triggers, bowel changes.
   - IF PAST_HISTORY: Ask if they have Sugar (Diabetes), BP (Hypertension), Asthma, Thyroid, or previous surgeries.
   - IF MEDICATIONS_ALLERGIES: Ask about regular daily medicines and any known drug or food allergies.

2. Tone: Warm, empathetic, clear, conversational, and accessible to Indian patients.
3. Target Language: The output question and suggestions MUST be written naturally in "${language}".
4. Suggestions: Provide 4 to 5 concise, realistic quick-tap answer options in "${language}" that directly answer the adapted question.

Return ONLY a valid JSON object without markdown formatting:
{
  "adaptedQuestion": "string in target language",
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
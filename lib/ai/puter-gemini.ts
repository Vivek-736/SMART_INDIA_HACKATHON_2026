import { env } from "@/lib/env";
import { InterviewSection } from "@/lib/clinical/interview-engine";

export interface AdaptiveQuestionResult {
  adaptedQuestion: string;
  suggestedOptions: string[];
}

/**
 * Generate an adaptive, clinically sound follow-up question tailored to the patient's previous answer
 * using Gemini 2.0 / 2.5 Flash via direct API or Puter.js integration.
 */
export async function generateAdaptiveQuestion(
  currentSection: InterviewSection,
  baseQuestion: string,
  patientPreviousAnswers: { section: string; answer: string }[],
  language: "en" | "hi" | "te" | "ta" | "kn" = "en"
): Promise<AdaptiveQuestionResult> {
  const apiKey = env.GEMINI_API_KEY;

  const previousContextText = patientPreviousAnswers
    .map((item) => `${item.section}: "${item.answer}"`)
    .join("\n");

  const prompt = `You are a clinical AI intake doctor in an Indian hospital OPD.
Context of patient's answers so far:
${previousContextText || "None yet (this is the first question)."}

Target Section: ${currentSection}
Target Language: ${language} (en = English, hi = Hindi, te = Telugu, ta = Tamil, kn = Kannada)
Default Section Question: "${baseQuestion}"

Task:
1. Adapt the question naturally in the target language to acknowledge any relevant prior symptoms while asking the core question for "${currentSection}".
2. Provide 4-5 concise, patient-friendly quick-tap options in the target language.
3. Keep the tone empathetic, professional, clear, and easy to understand for elderly or low-literacy patients.

Return ONLY a JSON object:
{
  "adaptedQuestion": "string in target language",
  "suggestedOptions": ["option 1", "option 2", "option 3", "option 4"]
}`;

  // 1. Call Gemini 2.0 Flash REST API
  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2,
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
            adaptedQuestion: parsed.adaptedQuestion || baseQuestion,
            suggestedOptions: parsed.suggestedOptions || [],
          };
        }
      }
    } catch (err) {
      console.warn("Gemini 2.0 API adaptive question error:", err);
    }
  }

  return {
    adaptedQuestion: baseQuestion,
    suggestedOptions: [],
  };
}
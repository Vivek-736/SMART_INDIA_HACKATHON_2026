import { AssemblyAI } from "assemblyai";
import { env } from "@/lib/env";
import { callPuterAiChat } from "@/lib/ai/puter";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi (हिन्दी)",
  te: "Telugu (తెలుగు)",
  ta: "Tamil (தமிழ்)",
  kn: "Kannada (ಕನ್ನಡ)",
};

const SCRIPT_RANGES: Record<string, RegExp> = {
  hi: /[\u0900-\u097F]/,
  te: /[\u0C00-\u0C7F]/,
  ta: /[\u0B80-\u0BFF]/,
  kn: /[\u0C80-\u0CFF]/,
};

/**
 * Ensures transcribed text matches the patient's selected regional language script.
 * If AssemblyAI returns Devanagari/Hindi when Telugu was chosen, converts it accurately.
 */
export async function alignTranscriptToSelectedLanguage(
  rawText: string,
  targetLang: "en" | "hi" | "te" | "ta" | "kn"
): Promise<string> {
  if (!rawText || !rawText.trim()) return "";
  const trimmed = rawText.trim();

  if (targetLang === "en") return trimmed;

  const targetRegex = SCRIPT_RANGES[targetLang];
  const hasDevanagari = /[\u0900-\u097F]/.test(trimmed);

  // If already in target script and no cross-language contamination (e.g. Hindi in Telugu)
  if (targetRegex && targetRegex.test(trimmed)) {
    if (targetLang === "hi" || !hasDevanagari) {
      return trimmed;
    }
  }

  const targetName = LANGUAGE_NAMES[targetLang] || "Telugu";

  const prompt = `You are a medical speech-to-text transcript corrector for an Indian clinical intake platform.
The patient spoke in ${targetName}, but the raw audio speech recognition produced this text:
"${trimmed}"

Task: Output the exact patient medical statement accurately and naturally in ${targetName} script.
- For Telugu ("te"): output strictly in Telugu script (తెలుగు అక్షరాలు). DO NOT output in Hindi/Devanagari or English.
- For Tamil ("ta"): output strictly in Tamil script (தமிழ்).
- For Kannada ("kn"): output strictly in Kannada script (ಕನ್ನಡ).
- For Hindi ("hi"): output strictly in Hindi Devanagari script (हिन्दी).

Output ONLY the corrected patient statement in ${targetName}, with no quotes, explanations, or additional text.`;

  try {
    const corrected = await callPuterAiChat(prompt, "gemini-2.0-flash");
    if (corrected && corrected.trim()) {
      return corrected.trim().replace(/^["']|["']$/g, "");
    }
  } catch (err) {
    console.warn("Language alignment warning:", err);
  }

  return trimmed;
}

export async function transcribeAudioBuffer(
  audioBuffer: Buffer,
  languageCode: "en" | "hi" | "te" | "ta" | "kn" = "en"
): Promise<{ text: string } | null> {
  const apiKey = env.ASSEMBLYAI_API_KEY;

  if (!apiKey) {
    console.warn("ASSEMBLYAI_API_KEY not configured.");
    return null;
  }

  try {
    const client = new AssemblyAI({ apiKey });

    const langMap: Record<string, string> = {
      en: "en",
      hi: "hi",
      te: "te",
      ta: "ta",
      kn: "kn",
    };

    const transcript = await client.transcripts.transcribe({
      audio: audioBuffer,
      language_code: langMap[languageCode] || "en",
    });

    if (transcript.status === "error") {
      console.error("AssemblyAI transcription error:", transcript.error);
      return null;
    }

    const rawText = transcript.text || "";
    if (!rawText.trim()) {
      return { text: "" };
    }

    // Align and verify script with the patient's selected language
    const alignedText = await alignTranscriptToSelectedLanguage(rawText, languageCode);
    return { text: alignedText };
  } catch (error) {
    console.error("Error transcribing with AssemblyAI:", error);
    return null;
  }
}
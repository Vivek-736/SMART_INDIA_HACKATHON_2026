import { AssemblyAI } from "assemblyai";
import { env } from "@/lib/env";

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
      speech_model: "universal",
    });

    if (transcript.status === "error") {
      console.error("AssemblyAI transcription error:", transcript.error);
      return null;
    }

    return { text: transcript.text || "" };
  } catch (error) {
    console.error("Error transcribing with AssemblyAI:", error);
    return null;
  }
}
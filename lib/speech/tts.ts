import { env } from "@/lib/env";

export interface TTSRequest {
  text: string;
  languageCode: "en-IN" | "hi-IN" | "te-IN" | "ta-IN" | "kn-IN";
  ssmlGender?: "MALE" | "FEMALE" | "NEUTRAL";
}

const LANGUAGE_VOICE_MAP: Record<string, { voiceName: string; languageCode: string }> = {
  "en-IN": { languageCode: "en-IN", voiceName: "en-IN-Wavenet-D" },
  "hi-IN": { languageCode: "hi-IN", voiceName: "hi-IN-Wavenet-A" },
  "te-IN": { languageCode: "te-IN", voiceName: "te-IN-Standard-A" },
  "ta-IN": { languageCode: "ta-IN", voiceName: "ta-IN-Standard-A" },
  "kn-IN": { languageCode: "kn-IN", voiceName: "kn-IN-Standard-A" },
};

/**
 * Synthesize speech using Google Cloud Text-to-Speech REST API via API Key
 */
export async function synthesizeSpeech(request: TTSRequest): Promise<{ audioContent: string } | null> {
  const apiKey = env.GOOGLE_CLOUD_API_KEY;

  if (!apiKey) {
    console.warn("GOOGLE_CLOUD_API_KEY is not configured. Falling back to browser speech synthesis.");
    return null;
  }

  const voiceConfig = LANGUAGE_VOICE_MAP[request.languageCode] || LANGUAGE_VOICE_MAP["en-IN"];

  try {
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: { text: request.text },
        voice: {
          languageCode: voiceConfig.languageCode,
          name: voiceConfig.voiceName,
          ssmlGender: request.ssmlGender || "FEMALE",
        },
        audioConfig: {
          audioEncoding: "MP3",
          pitch: 0,
          speakingRate: 0.95, // Slightly slower for clear hospital/kiosk comprehension
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google TTS API Error:", errorText);
      return null;
    }

    const data = await response.json();
    return { audioContent: data.audioContent }; // Base64 encoded MP3
  } catch (error) {
    console.error("Error synthesizing speech:", error);
    return null;
  }
}
import { synthesizeSpeech } from "@/lib/speech/tts";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ttsSchema = z.object({
  text: z.string().min(1).max(5000),
  languageCode: z.enum(["en-IN", "hi-IN", "te-IN", "ta-IN", "kn-IN"]).default("en-IN"),
  gender: z.enum(["FEMALE", "MALE", "NEUTRAL"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ttsSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Invalid request", details: validated.error.format() }, { status: 400 });
    }

    const result = await synthesizeSpeech({
      text: validated.data.text,
      languageCode: validated.data.languageCode,
      ssmlGender: validated.data.gender,
    });

    if (!result?.audioContent) {
      return NextResponse.json({
        fallback: true,
        message: "Google TTS unavailable or key missing. Use client Web Speech API.",
      });
    }

    return NextResponse.json({
      success: true,
      audioBase64: result.audioContent,
      mimeType: "audio/mp3",
    });
  } catch (error) {
    console.error("TTS API error:", error);
    return NextResponse.json({ error: "Internal server error during speech synthesis" }, { status: 500 });
  }
}
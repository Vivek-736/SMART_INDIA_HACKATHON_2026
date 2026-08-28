import { NextRequest, NextResponse } from "next/server";
import { transcribeAudioBuffer } from "@/lib/speech/stt";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob | null;
    const language = (formData.get("language") as "en" | "hi" | "te" | "ta" | "kn") || "en";

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await transcribeAudioBuffer(buffer, language);

    if (!result?.text) {
      return NextResponse.json({ 
        success: false, 
        text: "", 
        message: "No speech recognized or STT service unavailable." 
      });
    }

    return NextResponse.json({
      success: true,
      text: result.text,
    });
  } catch (error) {
    console.error("STT API error:", error);
    return NextResponse.json({ error: "Internal server error during speech transcription" }, { status: 500 });
  }
}
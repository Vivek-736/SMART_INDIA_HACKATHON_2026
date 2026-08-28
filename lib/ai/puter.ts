import { puter } from "@heyputer/puter.js";
import { env } from "@/lib/env";

/**
 * Resolve the Puter Auth Token from environment variables.
 */
function getPuterAuthToken(): string | undefined {
  return (
    process.env.PUTER_AUTH_TOKEN ||
    process.env.PUTER_TOKEN ||
    process.env.PUTER_API_KEY ||
    process.env.PUTER_KEY ||
    process.env.NEXT_PUBLIC_PUTER_AUTH_TOKEN ||
    process.env.NEXT_PUBLIC_PUTER_TOKEN ||
    env.PUTER_AUTH_TOKEN ||
    env.PUTER_TOKEN
  );
}

/**
 * Configure and return the authenticated Puter SDK instance for Node.js backend.
 */
export function getAuthenticatedPuter() {
  const token = getPuterAuthToken();
  if (token) {
    try {
      if (typeof puter.setAuthToken === "function") {
        puter.setAuthToken(token);
      }
      (puter as unknown as { authToken: string }).authToken = token;
    } catch (e) {
      console.warn("Could not set Puter auth token on SDK instance:", e);
    }
  }
  return puter;
}

/**
 * Multi-model resilient AI Chat caller supporting Puter models (gemini-2.0-flash, gpt-4o-mini, etc.)
 * with Google Gemini direct fallback if configured.
 */
export async function callPuterAiChat(
  prompt: string,
  preferredModel: string = "gemini-2.0-flash"
): Promise<string> {
  const puterClient = getAuthenticatedPuter();

  // Clean model identifier (remove google/ or openai/ prefix if present)
  const cleanPreferred = preferredModel.replace(/^(google|openai|anthropic)\//, "");

  const candidateModels = [
    cleanPreferred,
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gpt-4o-mini",
    "claude-3-5-sonnet",
    undefined, // Puter default model
  ];

  // 1. Try Puter with model candidates
  for (const model of candidateModels) {
    try {
      const options = model ? { model } : {};
      const res = await puterClient.ai.chat(prompt, options);
      const text = parsePuterResponse(res);
      if (text && text.trim()) {
        return text;
      }
    } catch (err: unknown) {
      const msg = String((err as { message?: string })?.message || (err as { error?: string })?.error || "");
      if (msg.includes("Model not found") || msg.includes("bad_request")) {
        continue;
      }
      // If error is other than model not found, keep trying candidate
    }
  }

  // 2. Direct Gemini 2.0 Flash REST fallback if GEMINI_API_KEY is present
  const googleApiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (googleApiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleApiKey}`,
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
      if (res.ok) {
        const data = await res.json();
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (raw) return raw;
      }
    } catch (gErr) {
      console.warn("Direct Google Gemini REST fallback error:", gErr);
    }
  }

  throw new Error("Puter AI chat failed to receive response from available models.");
}

function parsePuterResponse(res: unknown): string {
  if (typeof res === "string") return res;
  const anyRes = res as {
    message?: { content?: unknown };
    text?: string;
    result?: { message?: { content?: unknown }; text?: string };
  };

  if (anyRes?.result?.message?.content) {
    if (typeof anyRes.result.message.content === "string") return anyRes.result.message.content;
    return JSON.stringify(anyRes.result.message.content);
  }
  if (anyRes?.result?.text) {
    return anyRes.result.text;
  }
  if (anyRes?.message?.content) {
    if (typeof anyRes.message.content === "string") return anyRes.message.content;
    if (Array.isArray(anyRes.message.content)) {
      return (anyRes.message.content as Array<{ text?: string }>).map((c) => c.text || JSON.stringify(c)).join("\n");
    }
  }
  if (anyRes?.text) return anyRes.text;
  return JSON.stringify(res);
}
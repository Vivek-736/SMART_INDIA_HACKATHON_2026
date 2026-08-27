import { z } from "zod";

const envSchema = z.object({
  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "Clerk Publishable Key is required"),
  CLERK_SECRET_KEY: z.string().min(1, "Clerk Secret Key is required"),

  // Database
  DATABASE_URL: z.string().min(1, "Database URL is required"),

  // Document Uploads (UploadThing)
  UPLOADTHING_SECRET: z.string().optional(),
  UPLOADTHING_APP_ID: z.string().optional(),
  UPLOADTHING_TOKEN: z.string().optional(),

  // Speech-to-Text
  ASSEMBLYAI_API_KEY: z.string().optional(),

  // Google Cloud TTS / Speech API Key
  GOOGLE_CLOUD_API_KEY: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS_JSON: z.string().optional(),
  GOOGLE_CLOUD_PROJECT_ID: z.string().optional(),
  GOOGLE_CLOUD_CLIENT_EMAIL: z.string().optional(),
  GOOGLE_CLOUD_PRIVATE_KEY: z.string().optional(),

  // AI & Extraction
  GEMINI_API_KEY: z.string().optional(),
  NEXT_PUBLIC_PUTER_APP_ID: z.string().optional(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
  UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
  UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
  UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
  ASSEMBLYAI_API_KEY: process.env.ASSEMBLYAI_API_KEY,
  GOOGLE_CLOUD_API_KEY: process.env.GOOGLE_CLOUD_API_KEY,
  GOOGLE_APPLICATION_CREDENTIALS_JSON: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
  GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
  GOOGLE_CLOUD_CLIENT_EMAIL: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
  GOOGLE_CLOUD_PRIVATE_KEY: process.env.GOOGLE_CLOUD_PRIVATE_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  NEXT_PUBLIC_PUTER_APP_ID: process.env.NEXT_PUBLIC_PUTER_APP_ID,
});
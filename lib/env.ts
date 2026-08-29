import { z } from "zod";

const envSchema = z.object({
  // App
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),

  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().default("pk_test_placeholder"),
  CLERK_SECRET_KEY: z.string().default("sk_test_placeholder"),

  // Database
  DATABASE_URL: z.string().default("postgresql://postgres:postgres@localhost:5432/preconsult"),

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
  PUTER_AUTH_TOKEN: z.string().optional(),
  PUTER_TOKEN: z.string().optional(),
  PUTER_API_KEY: z.string().optional(),
  NEXT_PUBLIC_PUTER_AUTH_TOKEN: z.string().optional(),
  NEXT_PUBLIC_PUTER_APP_ID: z.string().optional(),

  // Email (Nodemailer SMTP)
  NODEMAILER_EMAIL: z.string().optional(),
  NODEMAILER_PASSWORD: z.string().optional(),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_placeholder",
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || "sk_test_placeholder",
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/preconsult",
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
  PUTER_AUTH_TOKEN: process.env.PUTER_AUTH_TOKEN,
  PUTER_TOKEN: process.env.PUTER_TOKEN,
  PUTER_API_KEY: process.env.PUTER_API_KEY,
  NEXT_PUBLIC_PUTER_AUTH_TOKEN: process.env.NEXT_PUBLIC_PUTER_AUTH_TOKEN,
  NEXT_PUBLIC_PUTER_APP_ID: process.env.NEXT_PUBLIC_PUTER_APP_ID,
  NODEMAILER_EMAIL: process.env.NODEMAILER_EMAIL,
  NODEMAILER_PASSWORD: process.env.NODEMAILER_PASSWORD,
});

export const env = parsed.success ? parsed.data : ({} as z.infer<typeof envSchema>);

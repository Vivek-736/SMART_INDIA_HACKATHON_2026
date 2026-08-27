# Extended Scope: PreConsult

## What this is

**PreConsult** is an AI-powered pre-consultation clinical intake platform for high-throughput Indian hospitals and AYUSH OPDs.

The product moves structured history-taking and prior-document preparation to **before the doctor consultation**.

The intended flow is:

```text
Patient
  ↓
Identify + language + consent (Kiosk / Patient app)
  ↓
Voice/touch clinical intake (AssemblyAI + Puter.js / Gemini)
  ↓
Adaptive questioning & structured JSON response (Zod validation)
  ↓
Upload previous medical documents (UploadThing)
  ↓
Background execution (Trigger.dev) → Gemini Vision Extraction → Medical Timeline
  ↓
Structured physician-ready history + Red Flags
  ↓
Doctor reviews / edits history
  ↓
Doctor diagnoses + prescribes

```

The system assists the doctor. It does not autonomously diagnose or prescribe.

---

## Technical Integration & API Specifications

### 1. Puter.js + Gemini (LLM & Adaptive Interview)

* **Integration Layer**: Executes client-side (via Puter.js) or server-side (via `@heyputer/puter.js`).
* **Model**: `google/gemini-3.7-flash` (or `google/gemini-3.5-flash-lite` for faster conversational turns).
* **Pattern**:
```ts
import { puter } from '@heyputer/puter.js';

const response = await puter.ai.chat(
  `You are a clinical intake assistant... Patient said: "${userTranscript}". Extract structured history based on this schema: ...`,
  { model: 'google/gemini-3.7-flash' }
);

```


* **Zod Validation**: Parse raw text output through `Zod` schemas (`ClinicalHistorySchema.parse(JSON.parse(rawText))`) to avoid prompt drift.

### 2. Speech-to-Text (AssemblyAI)

* **Integration Layer**: Server Action or Next.js Route Handler (`/api/interview/transcribe`).
* **Pattern**:
```ts
import { AssemblyAI } from 'assemblyai';

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! });
// Pass uploaded audio buffer or temporary UploadThing / public URL
const transcript = await client.transcripts.transcribe({ audio: audioUrl });

```



### 3. Text-to-Speech (Google Cloud TTS)

* **Integration Layer**: API Route Handler (`/api/interview/tts`).
* **Pattern**: Send generated next question string to `@google-cloud/text-to-speech` client, returning `audio/mp3` stream directly to the browser audio player for kiosk/patient playback.

### 4. Background Processing (Trigger.dev v3)

* **Integration Layer**: Decoupled async job processing in `/trigger`.
* **Pattern**:
```ts
import { task } from "@trigger.dev/sdk/v3";

export const finalizeIntakeTask = task({
  id: "finalize-patient-intake",
  run: async (payload: { visitId: string }) => {
    // 1. Process medical document via Gemini Vision
    // 2. Build chronological Medical Timeline
    // 3. Flag red flags & update DB state to READY_FOR_DOCTOR
  },
});

```



### 5. Document Intelligence (Gemini Vision + UploadThing)

* Direct upload via UploadThing (`/api/uploadthing`).
* Processing in background worker by passing the uploaded file URL directly to `puter.ai.chat` (with vision multimodal input) or `@google/genai` to extract structured JSON (diagnoses, dosages, test results, lab dates).

---

## Required Environment Variables

Create `.env.local` containing:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/patient/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/patient/login

# Database & Storage (Neon & Drizzle)
DATABASE_URL=postgresql://user:password@ep-xyz.neon.tech/preconsult?sslmode=require

# Document Upload (UploadThing)
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...

# AI & Speech Services
ASSEMBLYAI_API_KEY=...
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}

# Background Processing (Trigger.dev)
TRIGGER_SECRET_KEY=tr_dev_...

```

---

## Route Structure & Access Control

```text
/
├── /patient
│   ├── /login                     (🌐 Public)
│   ├── /dashboard                 (🔒 Role: Patient)
│   ├── /consent                   (🔒 Role: Patient / Kiosk)
│   ├── /interview                 (🔒 Role: Patient / Kiosk)
│   ├── /documents                 (🔒 Role: Patient / Kiosk)
│   └── /review                    (🔒 Role: Patient / Kiosk)
│
├── /doctor
│   ├── /login                     (🌐 Public)
│   ├── /dashboard                 (🔒 Role: Doctor)
│   └── /patients
│       └── /[patientId]           (🔒 Role: Doctor - Summary, Docs & Consultation)
│
├── /hospital
│   ├── /login                     (🌐 Public)
│   ├── /dashboard                 (🔒 Role: Hospital Admin - Operations)
│   └── /patients                  (🔒 Role: Hospital Admin - Search & Manage)
│
└── /api
    ├── /interview/*               (🔒 Auth Protected API)
    ├── /documents/*               (🔒 Auth Protected API)
    ├── /patients/*                (🔒 Role/Ownership Checked)
    └── /consultations/*           (🔒 Role: Doctor)

```

* Access control enforced via Clerk `auth()` middleware combined with `user.publicMetadata.role`.

---

# Stack

| Area | Decision |
| --- | --- |
| App | Next.js App Router |
| Language | TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Auth | Clerk (Role-based Metadata) |
| Database | Neon PostgreSQL |
| ORM | Drizzle ORM |
| AI | Puter.js + Gemini |
| Speech-to-text | AssemblyAI |
| Text-to-speech | Google Cloud Text-to-Speech |
| Document storage | UploadThing |
| Document AI | Gemini Vision initially |
| Validation | Zod |
| Background jobs | Trigger.dev v3 |
| Charts | Recharts |
| Deployment | Vercel |

---

# Product surfaces

## Patient & Kiosk Surface

* **Patient Dashboard**: Profile, current visit status, past records, uploaded files.
* **Kiosk Surface**: Identical API/route flow under `/patient/*` optimized with high-contrast UI, single-tap interactions, audio prompts, and voice input.

## Doctor Surface

* Priority OPD Queue (sorted by urgency/red flags).
* One-screen Patient Clinical Summary, Timeline, Source Documents, and Rx/Diagnosis Builder.

## Hospital / Admin Surface

* Live OPD intake metrics, turnaround rates, queue depth, and kiosk active status.

---

# Screen Inventory (14 Screens Total)

### 👤 Patient / Kiosk — 7 Screens

1. **Patient Sign In / Sign Up** (`/patient/login`)
2. **Patient Dashboard** (`/patient/dashboard`)
3. **Kiosk Welcome & Consent** (`/patient/consent`)
4. **Clinical Intake / Interview** (`/patient/interview`)
5. **Document Upload** (`/patient/documents`)
6. **Review & Confirm History** (`/patient/review`)
7. **Intake Processing / Complete** (`/patient/complete`)

### 👨‍⚕️ Doctor — 5 Screens

8. **Doctor Sign In** (`/doctor/login`)
9. **Doctor Dashboard / Queue** (`/doctor/dashboard`)
10. **Patient Clinical Summary** (`/doctor/patients/[patientId]`)
11. **Documents & Medical Timeline** (`/doctor/patients/[patientId]/documents`)
12. **Doctor Review & Consultation** (`/doctor/patients/[patientId]/consultation`)

### 🏥 Hospital / Admin — 2 Screens

13. **Hospital Overview** (`/hospital/dashboard`)
14. **Patient / Record Management** (`/hospital/patients`)

---

# Implementation Phases

* [x] **Phase 0 — Product Foundation**: Next.js, Drizzle schema, Clerk roles, base CSS/components.
* [ ] **Phase 1 — Patient Identity & Dashboard**: Auth flow, metadata routing, dashboard layout.
* [ ] **Phase 2 — Kiosk Entry & Consent**: Touch interface, audio guidance, consent logging.
* [ ] **Phase 3 — Adaptive Clinical Intake**: AssemblyAI voice input, Puter.js/Gemini adaptive state, Google TTS output.
* [ ] **Phase 4 — Review & Submit**: Patient verification UI & DB status transition.
* [ ] **Phase 5 & 6 — Document Upload & Intelligence**: UploadThing integration, Trigger.dev + Gemini Vision parsing to Drizzle DB timeline entries.
* [ ] **Phase 7 — Async Finalization Pipeline**: Trigger.dev aggregation job (summary + red flag evaluation).
* [ ] **Phase 8 to 11 — Doctor Experience**: Queue view, summary view, document viewer, treatment entry.
* [ ] **Phase 12 — AYUSH Mode**: Alternate clinical intake schema toggle for Ayurvedic OPD variables.
* [ ] **Phase 13 — Hospital Operations**: Recharts overview of OPD volume and turnaround.
* [ ] **Phase 14 & 15 — Interoperability, Security & Hardening**: Zod boundaries, role check verification, error boundary sanitization.

# AGENTS.md — PreConsult

## What this is

PreConsult is an AI-powered pre-consultation clinical intake platform for high-throughput Indian hospitals and AYUSH OPDs.

The core idea is simple:

> Let the patient complete a guided, multilingual clinical intake before meeting the doctor, digitize prior medical documents, and give the doctor a structured, reviewable clinical history instead of making the doctor spend the first part of the consultation collecting it.

The system is an **assistive clinical documentation and intake tool, not an autonomous diagnosis system**. The doctor always remains responsible for diagnosis, treatment, prescription, and final clinical decisions.

---

## How to work

Before building **every feature**, first write a short decision explaining:

- what is being built;
- why it is needed;
- what the smallest useful slice is;
- what is deliberately not being built yet.

Then stop and wait for approval before writing code.

When a build step starts:

- break it into a short checklist;
- update `scope.md` as each item is completed;
- actually run the application;
- typecheck;
- lint;
- run a production build;
- manually verify the real flow in a browser or with `curl`;
- fix failures before marking the feature done.

Do not install a test runner or browser automation framework. Manual verification is the project's chosen testing approach.

If implementation reveals that the plan contradicts the codebase or a previous decision:

1. say what contradicted;
2. update `scope.md`;
3. fix the implementation to match the corrected plan.

Do not silently work around contradictions.

---

## Product boundaries

### Core users

1. **Patient**
   - completes clinical intake;
   - speaks or taps answers;
   - receives multilingual audio prompts;
   - uploads previous medical documents;
   - reviews submitted information;
   - sees prescriptions/follow-up information after doctor review.

2. **Doctor**
   - sees patients awaiting consultation;
   - reads the structured clinical history;
   - reviews source documents and extracted information;
   - sees red-flag information;
   - edits/confirms the AI-generated draft;
   - records diagnosis, treatment and prescription.

3. **Hospital/Admin**
   - lightweight operational view only;
   - monitors today's intake/queue;
   - sees basic kiosk and workflow status.

The hospital/admin area is intentionally smaller than the patient and doctor products. It is not a full hospital ERP.

### Not building

Do not expand scope into:

- laboratory information management;
- sample collection or lab technician workflows;
- full hospital ERP/HIS replacement;
- autonomous diagnosis;
- autonomous prescribing;
- insurance processing;
- pharmacy management;
- radiology information systems;
- complete ABDM replacement;
- a separate AYUSH application;
- a generic chatbot detached from a clinical intake workflow.

---

## Screens

### Patient-facing screens — 7

1. **Patient Sign In / Sign Up**
   - Clerk authentication;
   - patient identity;
   - language selection.

2. **Patient Home / Dashboard**
   - current visit;
   - intake status;
   - documents;
   - previous history;
   - prescriptions/follow-up.

3. **Kiosk Welcome / Consent**
   - simplified first-time experience;
   - language selection;
   - audio guidance;
   - consent before clinical data capture.

4. **Clinical Intake / Conversation**
   - one question at a time;
   - voice input;
   - touch input;
   - spoken questions;
   - progress/state;
   - adaptive questioning.

5. **Review & Confirm History**
   - patient-friendly summary;
   - allow corrections;
   - confirmation before submission.

6. **Document Upload**
   - upload prescriptions;
   - lab reports;
   - discharge summaries;
   - image/PDF support;
   - processing status.

7. **Submission / Visit Complete**
   - intake completion;
   - processing state where needed;
   - clear next-step message.

The kiosk is **not a separate backend application**. It is a simplified, accessibility-first mode of the same patient experience.

### Doctor-facing screens — 5

8. **Doctor Sign In**
   - Clerk authentication;
   - doctor role.

9. **Doctor Queue / Dashboard**
   - today's patients;
   - waiting;
   - completed intake;
   - priority/red-flag cases.

10. **Patient Clinical View**
    - structured history;
    - chief complaint;
    - HPI;
    - past history;
    - medications/allergies;
    - family/personal history;
    - ROS;
    - AYUSH data when applicable.

11. **Documents & Medical Timeline**
    - original uploaded documents;
    - extracted entities;
    - chronological timeline;
    - abnormal-value highlighting;
    - source-document verification.

12. **Doctor Review & Treatment**
    - edit/confirm AI draft;
    - diagnosis;
    - doctor notes;
    - prescription/treatment;
    - follow-up;
    - final submission.

### Lightweight hospital/admin screens — 2

13. **Hospital Operations**
    - today's intake volume;
    - waiting/completed counts;
    - priority count.

14. **Kiosk / Staff Status**
    - active kiosk status;
    - basic workflow status;
    - minimal operational visibility.

### Total

**14 screens maximum for the complete prototype.**

Do not build all 14 immediately.

The first vertical slice should prove the patient intake → persistence → doctor review loop with the fewest screens possible.

---

## Stack

### Application

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zod

### Authentication

- Clerk
- Role-aware patient/doctor/admin access

### Database

- Neon PostgreSQL
- Drizzle ORM

### AI

- Puter.js
- Gemini

Gemini is used for:

- conversational history assistance;
- structured extraction;
- clinical history organization;
- summarization;
- document/image understanding.

The application must constrain AI output with schemas and clinical interview state rather than trusting free-form model output.

### Speech

**Speech-to-text**
- AssemblyAI

**Text-to-speech**
- Google Cloud Text-to-Speech

The spoken patient answer is transcribed, processed, stored as text, and used to advance the interview. Questions/responses displayed on screen can also be spoken aloud in the selected language.

### Documents

- UploadThing for file storage
- Gemini Vision/document understanding for the first prototype
- Zod for structured extraction validation

A specialized OCR provider may be introduced later if Gemini Vision is insufficient for handwriting/medical-document accuracy.

### Background processing

- Trigger.dev

Use Trigger.dev for longer-running workflows such as:

- document processing;
- conversation finalization;
- timeline construction;
- clinical summary generation.

Do not introduce background jobs merely because they are available. Keep synchronous interactions synchronous when they are fast enough.

### Visualization

- Recharts

Use only where a chart materially helps the doctor/admin understand information.

### Deployment

- Vercel

### Explicitly not using

- Prisma
- Cloudinary
- S3
- PostHog
- Sentry

unless a later decision explicitly changes this.

---

## Architecture principles

### Clinical interview

Never let the LLM freely control the entire interview.

Use:

```text
Clinical schema
    ↓
Interview state
    ↓
Required / optional fields
    ↓
Patient answer
    ↓
Gemini extraction
    ↓
Zod validation
    ↓
State update
    ↓
Next missing/appropriate question
    ↓
TTS
```

The model can phrase and adapt questions, but the application owns the interview state.

This is essential for preventing:

- loops;
- repeatedly asking answered questions;
- missing required history sections;
- uncontrolled conversations;
- hallucinated clinical facts.

### Example HPI branching

For a complaint such as chest pain, the interview engine can progressively cover:

- onset;
- location;
- character;
- duration;
- radiation;
- aggravating factors;
- relieving factors;
- severity;
- associated symptoms.

The exact branch should be represented as application data/schema, not buried entirely inside a prompt.

### Safety

AI output is a **draft**.

The doctor must be able to:

- inspect the source;
- edit extracted information;
- correct the summary;
- reject incorrect content;
- make the diagnosis;
- decide treatment.

Red flags can trigger prioritization/alerting, but the system must not claim to diagnose an emergency.

---

## AYUSH mode

AYUSH is not a separate application.

It is an additional clinical-history mode.

For an Ayurvedic OPD, the interview can include:

- Prakriti;
- Vikriti;
- Sara;
- Samhanana;
- Pramana;
- Satmya;
- Sattva;
- Ahara Shakti;
- Vyayama Shakti;
- Vaya;
- Ahara-Vihara;
- relevant Ayurvedic history fields.

The selected department/history mode determines which schema and questions are activated.

---

## Data principles

Keep raw and interpreted data separate.

For example:

```text
Patient
  └── Visit
       ├── InterviewSession
       │    └── InterviewMessage[]
       ├── ClinicalHistory
       ├── MedicalDocument[]
       │    └── DocumentExtraction
       ├── MedicalTimelineEntry[]
       ├── RedFlag[]
       └── DoctorReview
```

Never replace the original uploaded document with extracted AI content.

The doctor must be able to compare:

```text
Original document
        ↕
AI extraction
```

Store provenance wherever practical.

---

## Environment variables

Required environment variables must fail fast when missing.

Likely groups:

- Clerk keys
- Neon database URL
- Puter configuration
- Gemini/API configuration as required by the chosen integration
- AssemblyAI key
- Google Cloud TTS credentials/configuration
- UploadThing keys
- Trigger.dev configuration

Never expose server-only credentials to the browser.

---

## Coding standards

- Strict TypeScript.
- No `any`.
- Prefer `const`.
- Prefer readonly data.
- Prefer pure functions.
- Push side effects to application edges.
- Prefer `map`, `filter`, `reduce` and immutable transformations over mutation-heavy loops.
- Validate external input with Zod.
- Validate AI output before persistence.
- Feature-based folders, not layer-wide folders.
- Reusable UI belongs in shared components.
- Shared design tokens and repeated values belong in `globals.css` or shared components.
- Do not copy the same Tailwind class clusters across multiple files.
- User-facing errors must never expose raw exceptions, provider JSON, stack traces, or internal implementation details.

---

## Accessibility baseline

Every screen must have:

- real color contrast;
- visible keyboard focus;
- full keyboard operation;
- semantic controls;
- clear labels;
- usable touch targets;
- readable typography;
- audio guidance where the patient flow benefits from it.

The kiosk must assume:

- elderly users;
- low digital literacy;
- low literacy;
- regional-language users;
- noisy environments;
- first-time users.

Do not design the kiosk like a developer dashboard.

---

## Working order

Build in this order:

1. Foundation
2. Patient authentication/dashboard
3. Kiosk consent/language flow
4. Conversational clinical intake
5. Intake persistence and review
6. Document upload
7. Document AI/OCR
8. Trigger.dev finalization pipeline
9. Doctor dashboard
10. Doctor clinical view
11. Doctor review/prescription
12. AYUSH mode
13. Lightweight hospital/admin view
14. ABDM/FHIR integration demonstration
15. Hardening and final end-to-end demo

The first milestone is not "the whole application."

The first milestone is:

> A real patient can start an intake, answer questions by voice/touch, have the answers persisted, and a doctor can see the resulting structured history.

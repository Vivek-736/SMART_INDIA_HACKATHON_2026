# Scope: PreConsult

## What this is

**PreConsult** is an AI-powered pre-consultation clinical intake platform for high-throughput Indian hospitals and AYUSH OPDs.

The product moves structured history-taking and prior-document preparation to **before the doctor consultation**.

The intended flow is:

```text
Patient
  ↓
Identify + language + consent
  ↓
Voice/touch clinical intake
  ↓
Adaptive questioning
  ↓
Upload previous medical documents
  ↓
AI extraction + timeline
  ↓
Structured physician-ready history
  ↓
Doctor reviews/edits
  ↓
Doctor diagnoses + prescribes
```

The system assists the doctor. It does not autonomously diagnose or prescribe.

---

## How this scope is maintained

This file is the living implementation plan.

For every feature:

1. Decide what is being built and why.
2. State the smallest useful slice.
3. Stop and wait for approval before implementation.
4. When implementation starts, add a short build checklist.
5. Check items off as they are completed.
6. Run the app.
7. Typecheck.
8. Lint.
9. Run a production build.
10. Manually verify the real flow.
11. Fix failures before marking the feature done.

If implementation contradicts the plan, update the plan instead of silently working around it.

---

# Stack

| Area | Decision |
|---|---|
| App | Next.js App Router |
| Language | TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Auth | Clerk |
| Database | Neon PostgreSQL |
| ORM | Drizzle ORM |
| AI | Puter.js + Gemini |
| Speech-to-text | AssemblyAI |
| Text-to-speech | Google Cloud Text-to-Speech |
| Document storage | UploadThing |
| Document AI | Gemini Vision initially |
| Validation | Zod |
| Background jobs | Trigger.dev |
| Charts | Recharts |
| Deployment | Vercel |

Not using PostHog or Sentry for this project.

---

# Product surfaces

## Patient

The patient side has two closely related experiences:

### Patient Dashboard

Persistent authenticated experience containing:

- profile;
- current visit;
- intake status;
- medical history;
- uploaded documents;
- previous consultation information;
- prescriptions/follow-up where available.

### Kiosk

A simplified patient intake experience.

The kiosk is **not a separate backend product**. It uses the same patient APIs, database and clinical interview engine with a simplified UI.

---

## Doctor

The doctor experience contains:

- today's queue;
- patients awaiting review;
- structured clinical history;
- conversation-derived information;
- source documents;
- extracted data;
- medical timeline;
- red flags;
- doctor notes;
- diagnosis;
- prescription/treatment;
- follow-up.

---

## Hospital/Admin

Only a lightweight operational view is required for the prototype:

- today's patient/intake counts;
- waiting/completed counts;
- priority count;
- kiosk status.

This is not a hospital ERP or laboratory dashboard.

---

# Screen inventory

The complete prototype can contain **14 screens**.

### Patient — 7

1. Patient Sign In / Sign Up
2. Patient Home / Dashboard
3. Kiosk Welcome / Consent
4. Clinical Intake / Conversation
5. Review & Confirm History
6. Document Upload
7. Visit Complete / Processing

### Doctor — 5

8. Doctor Sign In
9. Doctor Queue / Dashboard
10. Patient Clinical View
11. Documents & Medical Timeline
12. Doctor Review & Treatment

### Hospital/Admin — 2

13. Hospital Operations
14. Kiosk / Staff Status

Do not build all screens at once.

---

# Phase 0 — Product foundation

## Goal

Create the application foundation without building a fake AI demo.

## Build

- [x] Create Next.js App Router project
- [x] TypeScript strictness
- [x] Tailwind
- [x] shadcn/ui
- [x] Clerk
- [x] Neon
- [x] Drizzle
- [x] UploadThing
- [x] Zod
- [x] base environment validation
- [x] feature-based folder structure
- [x] accessibility baseline
- [x] error-handling conventions

## Data foundation

Initial entities:

```text
User
Patient
Doctor

Visit
InterviewSession
InterviewMessage
ClinicalHistory

MedicalDocument
DocumentExtraction

MedicalTimelineEntry
RedFlag

DoctorReview
Prescription
FollowUp

Consent
AuditLog
```

Keep the schema minimal and expand only when a real feature needs a field.

---

# Phase 1 — Patient identity and dashboard

## Goal

A patient can authenticate and see their current state.

## Screens

- Patient Sign In / Sign Up
- Patient Dashboard

## Build

- [x] Clerk authentication
- [x] Patient role
- [x] Patient profile
- [x] Patient dashboard shell
- [x] Current visit card
- [x] Intake status
- [x] Document section
- [x] Previous history section
- [x] Accessible navigation

## Done when

A patient can sign in, reach their dashboard and start a new intake.

---

# Phase 2 — Kiosk entry, language and consent

## Goal

Make the first-time hospital experience usable without training.

## Screen

- Kiosk Welcome / Consent

## Build

- [ ] Kiosk mode
- [ ] Language selection
- [ ] Large touch targets
- [ ] Audio instructions
- [ ] Consent explanation
- [ ] Consent capture
- [ ] Continue to intake
- [ ] Session creation

## Design principle

The patient should not need to understand AI, prompts, forms or medical software.

The interface should simply guide them:

```text
Choose language
  ↓
Listen/read what will happen
  ↓
Give consent
  ↓
Start talking/tapping
```

---

# Phase 3 — Conversational clinical intake

## Goal

Build the core differentiator.

A patient answers questions naturally through voice or touch, and the system adapts without looping.

## Screen

- Clinical Intake / Conversation

## Core architecture

```text
Patient
  ↓
Speech-to-text / touch
  ↓
Interview state
  ↓
Gemini
  ↓
Structured answer
  ↓
Zod validation
  ↓
State update
  ↓
Find next required information
  ↓
Generate next question
  ↓
Google TTS
  ↓
Patient
```

## Build

- [ ] Clinical history schema
- [ ] Interview state machine
- [ ] Question/section definitions
- [ ] AssemblyAI integration
- [ ] Puter.js + Gemini integration
- [ ] Zod AI-output validation
- [ ] Google Cloud TTS
- [ ] Voice answer flow
- [ ] Touch answer flow
- [ ] Language-aware prompts
- [ ] Progress state
- [ ] Answer persistence
- [ ] Loop prevention
- [ ] Retry handling
- [ ] Completion detection

## Standard history

Capture:

- Chief complaint
- HPI
- Past medical history
- Past surgical history
- Medications
- Drug/allergy history
- Family history
- Personal history
- Review of systems
- Relevant prior investigations

## Adaptive questioning

The application owns the clinical structure.

Example:

```text
Chest pain
  ├── onset
  ├── location
  ├── character
  ├── duration
  ├── radiation
  ├── aggravating factors
  ├── relieving factors
  ├── severity
  └── associated symptoms
```

Gemini helps phrase the next question, but it does not own the state.

## Red flags

Prototype-level red-flag rules can identify cases needing immediate human triage.

The output should be:

> "Please wait. A staff member needs to speak with you."

Never:

> "You are having a heart attack."

---

# Phase 4 — Review and submit

## Goal

Let the patient confirm what was captured.

## Screen

- Review & Confirm History

## Build

- [ ] Human-readable summary
- [ ] Sectioned history
- [ ] Correction flow
- [ ] Confirmation
- [ ] Final submission
- [ ] Visit status transition

## Done when

A completed intake creates a persistent clinical history that the doctor can retrieve.

---

# Phase 5 — Medical document upload

## Goal

Let patients provide the physical history they already carry.

## Screen

- Document Upload

## Supported prototype documents

- prescriptions;
- laboratory reports;
- discharge summaries;
- medical report images/PDFs.

## Build

- [ ] UploadThing integration
- [ ] File type validation
- [ ] File size validation
- [ ] Upload progress
- [ ] Original file persistence
- [ ] Document metadata
- [ ] Processing status
- [ ] Patient document list

## Important rule

Never replace the original document with AI-extracted information.

---

# Phase 6 — Document intelligence

## Goal

Turn uploaded documents into useful structured information.

## Build

```text
UploadThing
  ↓
Document URL
  ↓
Trigger.dev
  ↓
Gemini Vision
  ↓
Structured extraction
  ↓
Zod
  ↓
Neon
```

## Extract where present

- document date;
- document type;
- diagnoses;
- medications;
- dosage;
- investigation names;
- investigation values;
- units;
- reference ranges;
- procedures/surgeries;
- relevant clinical notes.

## Timeline

Convert documents into chronological entries.

Example:

```text
2025-11-02
Lab report
Hb: 9.2 g/dL

2026-01-14
Prescription
Medication: ...

2026-03-03
Discharge summary
Procedure: ...
```

## Abnormal values

Highlight potentially abnormal laboratory values for physician attention.

Do not make an autonomous medical conclusion from the value.

---

# Phase 7 — Trigger.dev finalization pipeline

## Goal

Make completion reliable without forcing the browser to wait on multiple long AI operations.

## Trigger workflow

```text
Visit submitted
   ↓
Process conversation
   ↓
Validate clinical history
   ↓
Process documents
   ↓
Extract entities
   ↓
Build timeline
   ↓
Generate physician summary
   ↓
Generate red-flag result
   ↓
Mark visit READY_FOR_DOCTOR
```

## Build

- [ ] Trigger.dev project
- [ ] Submission trigger
- [ ] Conversation processing task
- [ ] Document processing task
- [ ] Timeline task
- [ ] Summary task
- [ ] Failure/retry handling
- [ ] Final visit status

---

# Phase 8 — Doctor dashboard

## Goal

Give the doctor immediate visibility into patients ready for consultation.

## Screens

- Doctor Sign In
- Doctor Queue / Dashboard

## Build

- [ ] Doctor authentication
- [ ] Doctor role
- [ ] Today's patients
- [ ] Waiting patients
- [ ] Completed intake
- [ ] Priority/red-flag indication
- [ ] Patient selection
- [ ] Accessible queue

---

# Phase 9 — Doctor clinical view

## Goal

Replace several minutes of manual history reconstruction with a physician-ready view.

## Screen

- Patient Clinical View

## Show

```text
Patient
  ↓
Chief complaint
  ↓
HPI
  ↓
Past history
  ↓
Medications/allergies
  ↓
Family/personal history
  ↓
ROS
  ↓
Prior investigations
  ↓
Red flags
```

Also show:

- source conversation;
- AI-generated summary;
- confidence/verification indicators where appropriate;
- editable fields.

The doctor should never have to trust a summary blindly.

---

# Phase 10 — Documents and timeline for doctor

## Screen

- Documents & Medical Timeline

## Build

- [ ] Original document viewer
- [ ] Extracted data
- [ ] Timeline
- [ ] Lab values
- [ ] Abnormal-value indicators
- [ ] Source-to-extraction comparison
- [ ] Document status
- [ ] Manual correction

## Core principle

Every important extracted clinical fact should be traceable back to the source document or patient response.

---

# Phase 11 — Doctor review and treatment

## Screen

- Doctor Review & Treatment

## Build

- [ ] Editable AI history
- [ ] Doctor notes
- [ ] Diagnosis field
- [ ] Prescription
- [ ] Follow-up instructions
- [ ] Final review
- [ ] Save consultation

## Safety boundary

The doctor makes the clinical decision.

AI prepares information; doctor confirms and acts.

---

# Phase 12 — AYUSH mode

## Goal

Support the additional history requirements of AYUSH/Ayurvedic OPDs without creating a second application.

## Build

Add an interview mode/schema for:

- Prakriti
- Vikriti
- Sara
- Samhanana
- Pramana
- Satmya
- Sattva
- Ahara Shakti
- Vyayama Shakti
- Vaya
- Ahara-Vihara
- other relevant Ayurvedic history fields

## Architecture

```text
Department
   ↓
History mode
   ├── General clinical
   └── Ayurveda / AYUSH
```

The same:

- kiosk;
- AI engine;
- database;
- doctor dashboard;
- document pipeline

are reused.

---

# Phase 13 — Lightweight hospital operations

## Screens

- Hospital Operations
- Kiosk / Staff Status

## Build

- [ ] Today's patient count
- [ ] Intake completion count
- [ ] Waiting count
- [ ] Priority count
- [ ] Kiosk online/offline status
- [ ] Basic throughput view

No full hospital ERP.

No laboratory dashboard.

---

# Phase 14 — ABDM/FHIR demonstration

## Goal

Demonstrate interoperability without attempting to recreate ABDM.

## Build

- [ ] Consent model
- [ ] ABHA identifier handling where permitted by the demo environment
- [ ] FHIR-compatible clinical structure
- [ ] Demonstration export/integration boundary
- [ ] Clear audit trail

Treat real ABDM integration as an integration surface, not the core application.

---

# Phase 15 — Security, privacy and hardening

## Build

- [ ] Server-only secrets
- [ ] Input validation
- [ ] File validation
- [ ] AI output validation
- [ ] Role-based access
- [ ] Consent records
- [ ] Audit events
- [ ] Safe error messages
- [ ] Session cleanup where appropriate
- [ ] No raw provider errors
- [ ] Accessibility pass
- [ ] Manual end-to-end verification

---

# End-to-end target demo

The strongest SIH demonstration should be:

```text
1. Patient arrives
        ↓
2. Selects language
        ↓
3. Gives consent
        ↓
4. Starts intake
        ↓
5. Speaks naturally
        ↓
6. AI asks adaptive follow-up
        ↓
7. Patient can answer by voice OR touch
        ↓
8. Intake completes
        ↓
9. Patient uploads old prescription/report
        ↓
10. Document is processed
        ↓
11. Structured history + timeline generated
        ↓
12. Doctor opens queue
        ↓
13. Doctor opens patient
        ↓
14. Reads history in seconds
        ↓
15. Opens original document
        ↓
16. Corrects/accepts AI draft
        ↓
17. Doctor diagnoses and prescribes
        ↓
18. Patient receives final treatment/follow-up
```

That is the product story.

---

# MVP priority

## P0 — absolutely prove

- [ ] Clerk patient authentication
- [ ] Patient/kiosk intake
- [ ] Multilingual question display
- [ ] AssemblyAI speech-to-text
- [ ] Google TTS
- [ ] Gemini adaptive questioning
- [ ] Zod structured history
- [ ] Neon persistence
- [ ] Patient review/submit
- [ ] Doctor queue
- [ ] Doctor clinical history
- [ ] Doctor review

## P1 — strong differentiators

- [ ] UploadThing
- [ ] Gemini Vision document extraction
- [ ] Medical timeline
- [ ] Red-flag detection
- [ ] Trigger.dev processing
- [ ] AYUSH mode
- [ ] Original-document verification

## P2 — polish/integration

- [ ] Lightweight hospital operations
- [ ] Kiosk monitoring
- [ ] ABDM/FHIR demonstration
- [ ] Advanced analytics
- [ ] Additional languages
- [ ] More sophisticated document OCR

---

# Not doing right now

Kept here so the plan remains honest.

- Full HIS/EMR replacement
- Laboratory management system
- Pharmacy system
- Autonomous diagnosis
- Autonomous prescribing
- Full ABDM ecosystem implementation
- Separate AYUSH application
- Complex hospital administration
- Sentry
- PostHog
- Automated browser testing
- Test runner
- Premature microservices
- Premature specialized OCR if Gemini Vision is sufficient for the prototype

---

# Definition of a successful prototype

PreConsult succeeds as an SIH prototype if a judge can see:

> **A real patient with limited technical literacy can complete a multilingual voice/touch clinical intake, upload old medical documents, have those inputs transformed into a structured and traceable physician-ready history, and have a doctor review that information and make the final clinical decision before completing the consultation.**

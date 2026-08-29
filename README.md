<div align="center">

  <img src="./public/icon.png" alt="PreConsult Logo" width="100" height="100" />

  # **PreConsult**
  ### **AI-Powered Multilingual Clinical Intake & ABDM-Interoperable EHR Platform**

  **Bridging the 7-Minute Doctor-Patient Gap in High-Throughput Indian OPDs & AYUSH Dispensaries**

  <p align="center">
    <a href="https://github.com/Vivek-736/SMART_INDIA_HACKATHON_2026"><img src="https://img.shields.io/badge/Status-100%25%20Production%20Ready-emerald?style=for-the-badge&logo=vercel" alt="Build Status"></a>
    <a href="https://github.com/Vivek-736/SMART_INDIA_HACKATHON_2026"><img src="https://img.shields.io/badge/ABDM-FHIR%20R4%20Compliant-4f46e5?style=for-the-badge&logo=blueprint" alt="ABDM Compliance"></a>
    <a href="https://github.com/Vivek-736/SMART_INDIA_HACKATHON_2026"><img src="https://img.shields.io/badge/Languages-5%20Indic%20Supported-amber?style=for-the-badge&logo=google-translate" alt="Languages Supported"></a>
    <a href="https://github.com/Vivek-736/SMART_INDIA_HACKATHON_2026"><img src="https://img.shields.io/badge/SIH-2026%20Edition-rose?style=for-the-badge" alt="SIH Edition"></a>
  </p>

</div>

---

## ⚡ Executive Summary

In overcrowded Indian Outpatient Departments (OPDs), doctors consult **60 to 100+ patients in a 3-hour shift** — leaving barely 2–3 minutes per patient. Over 70% of that critical time is wasted deciphering crumpled paper records and asking basic background history questions in noisy waiting rooms.

**PreConsult** flips this broken workflow:
1. **At the Waiting Room / Kiosk**: Patients complete an adaptive voice/touch intake in **Hindi, Telugu, Tamil, Kannada, or English**, guided by AI speech synthesis, and upload their past physical reports and prescriptions.
2. **AI Document & Clinical Intelligence Engine**: Transcribes answers, extracts clinical entities, calculates emergency **Red Flags**, extracts abnormal lab markers, and constructs a chronological **Medical Timeline**.
3. **At the Doctor Desk**: The physician opens a structured, reviewable clinical summary in seconds, verifies source documents side-by-side, edits the draft, generates a digital prescription, and exports an official **ABDM-compliant FHIR R4 Bundle**.

---

## 🛠️ Technology Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Framework** | **Next.js 16 (App Router)**, React 19, TypeScript | Server Components, Turbopack, Ultra-low latency |
| **Styling & UI** | **Tailwind CSS v4**, Radix UI / Shadcn, Lucide Icons | Responsive modern design & accessibility |
| **Authentication** | **Clerk** (Multi-role Patient, Doctor, Hospital Admin) | Session management & Whitelisted email guards |
| **Database & ORM** | **Neon PostgreSQL Serverless**, **Drizzle ORM** | Zero-cold-start relational persistence & Type-safety |
| **AI Extraction & Reasoning** | **Google Gemini Flash / Vision**, **Puter.js** | Multi-turn interview adaptation & OCR extraction |
| **Speech-to-Text (STT)** | **AssemblyAI** | Voice input transcription across noisy environments |
| **Text-to-Speech (TTS)** | **Google Cloud Neural Text-to-Speech** | Spoken regional language questions & guidance |
| **Document Storage** | **UploadThing** | High-throughput image & PDF report uploads |
| **Async Pipelines** | **Trigger.dev v3** | Asynchronous finalization, summary, & timeline jobs |
| **Analytics & Viz** | **Recharts** | Real-time OPD throughput & demographic analytics |
| **Interoperability** | **HL7 FHIR R4 Standard (ABDM)** | National health passport & 1-Click JSON export |

---

## 🌟 Core Architecture & Key Pillars

```mermaid
flowchart TD
    A[Patient / Kiosk] -->|Voice / Touch in 5 Languages| B(Adaptive Intake Engine)
    A -->|Upload Old Reports / PDFs| C(UploadThing)
    
    B --> D[Gemini + AssemblyAI Extraction]
    C --> E[Trigger.dev Vision OCR Pipeline]
    
    D --> F[(Neon PostgreSQL DB)]
    E --> F
    
    F --> G[Doctor OPD Dashboard / Queue]
    G --> H[Side-by-Side Clinical View & Timeline]
    H --> I[Digital Rx & Pathya Regimen Builder]
    
    I --> J[1-Click ABDM FHIR R4 JSON Export]
    I --> K[Patient Dashboard + Spoken Native Audio Reader]
    I --> L[Hospital Command Center Analytics]
```

---

## 📱 User Portals & Workflows

### 1. 🧑‍⚕️ Patient / Kiosk Experience (`/patient` & `/kiosk`)
* **Kiosk Welcome & Consent**: Simplified touch onboarding with spoken regional voice guidance (**English, Hindi, Telugu, Tamil, Kannada**).
* **Adaptive Clinical Interview**: 5-step conversational questioning with smart quick-tap chips and voice capture.
* **Document Scanner**: Upload past prescriptions, lab tests, and discharge summaries with instant preview.
* **Multilingual Audio Prescription**: Patients can listen to their finalized prescription read aloud in their native language with exact meal timings (**Morning after breakfast, Night before sleeping**).
* **ABDM Health Passport**: 1-click download of standard FHIR R4 records.

### 2. 🩺 Physician OPD Command Center (`/doctor`)
* **Live Queue Dashboard (`/doctor/dashboard`)**: Token-based live queue with active concurrency locking preventing multi-doctor collision.
* **Triage & Red-Flag Alerts**: Prioritizes emergency cases (**SpO2 drops, severe chest pressure**).
* **Structured Clinical History (`/doctor/patients/[id]`)**: Instant view of Chief Complaint, HPI Progression, Past Medical/Surgical History, and Medications with an expandable Q&A provenance inspector.
* **Document & Timeline Inspector (`/doctor/patients/[id]/timeline`)**: Split-screen original document viewer against AI-extracted entities with **ABNORMAL** lab values highlighted.
* **Digital Prescription Builder (`/doctor/patients/[id]/review`)**: Autocomplete Rx builder, custom instructions, follow-up scheduling, and automated HTML email dispatch.

### 3. 🌿 Dedicated AYUSH (Ayurvedic OPD) Mode
* **Tri-Dosha Assessment**: Visual percentage meters for **Vata**, **Pitta**, and **Kapha**.
* **Agni & Digestion Evaluation**: Detects **Mandagni, Tikshnagni, Vishamagni, and Samagni**.
* **Pathya-Apathya Regimen**: 1-tap dietary dos & don'ts (**Warm water, Moong dal khichdi, early sleep**) and Ayurvedic formulations (**Vatis, Churnas, Kwathas**).

### 4. 🏥 Hospital Operations Command Center (`/hospital/dashboard`)
* **Live OPD Velocity**: Hourly patient arrivals vs completed consultations.
* **Department Breakdown**: General Medicine vs AYUSH volume distribution.
* **Demographics & Age Trends**: Statistical bar breakdown across patient age cohorts.
* **Kiosk Fleet Health**: Online/offline status monitor for physical lobby devices.

---

## 🚀 Quickstart & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Vivek-736/SMART_INDIA_HACKATHON_2026.git
cd SMART_INDIA_HACKATHON_2026
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Neon Serverless Database
DATABASE_URL="postgresql://user:password@ep-project.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# AI & Speech Providers
ASSEMBLYAI_API_KEY="your_assemblyai_key"
GEMINI_API_KEY="your_gemini_key"
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}'

# Document Uploads (UploadThing)
UPLOADTHING_SECRET="your_uploadthing_secret"
UPLOADTHING_APP_ID="your_uploadthing_app_id"
UPLOADTHING_TOKEN="your_uploadthing_token"

# Background Execution (Trigger.dev)
TRIGGER_SECRET_KEY="tr_dev_..."

# Live Digital Prescription Emailer (Nodemailer)
NODEMAILER_EMAIL="your_email@gmail.com"
NODEMAILER_PASSWORD="your_gmail_app_password"
```

### 4. Run Database Migrations
```bash
npm run db:push
```

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏆 Smart India Hackathon 2026

<div align="center">

  **Built with 💖 by Team Apostles**

  [![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Vivek-736/SMART_INDIA_HACKATHON_2026)

  **© 2026 PreConsult. Designed for Ayushman Bharat Digital Mission (ABDM) & National Health Authority (NHA) Initiatives.**

</div>
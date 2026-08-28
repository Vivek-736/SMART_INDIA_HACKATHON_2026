import { pgTable, text, timestamp, boolean, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";

// ----------------------------------------------------
// ENUMS
// ----------------------------------------------------
export const userRoleEnum = pgEnum("user_role", ["patient", "doctor", "hospital_admin"]);
export const visitStatusEnum = pgEnum("visit_status", [
  "WAITING",
  "INTAKE_IN_PROGRESS",
  "READY_FOR_DOCTOR",
  "IN_CONSULTATION",
  "COMPLETED",
  "CANCELLED",
]);
export const priorityEnum = pgEnum("priority_level", ["ROUTINE", "URGENT", "EMERGENCY"]);
export const messageSenderEnum = pgEnum("message_sender", ["PATIENT", "SYSTEM", "AI"]);
export const documentProcessingStatusEnum = pgEnum("document_processing_status", [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);
export const timelineCategoryEnum = pgEnum("timeline_category", [
  "LAB",
  "PRESCRIPTION",
  "DISCHARGE",
  "SURGERY",
  "CLINICAL_NOTE",
  "AYUSH_ASSESSMENT",
]);
export const redFlagSeverityEnum = pgEnum("red_flag_severity", ["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export const reviewStatusEnum = pgEnum("review_status", ["DRAFT", "SIGNED"]);

// ----------------------------------------------------
// 1. USERS TABLE
// ----------------------------------------------------
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: userRoleEnum("role").default("patient").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ----------------------------------------------------
// 2. PATIENTS TABLE
// ----------------------------------------------------
export const patients = pgTable("patients", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  uhid: text("uhid").unique(), // Hospital Unique Health ID / ABHA
  dateOfBirth: text("date_of_birth"),
  age: integer("age"), // Patient age in years — collected on first visit at consent
  gender: text("gender"),
  phone: text("phone"),
  languagePreference: text("language_preference").default("en").notNull(),
  ayushModeEnabled: boolean("ayush_mode_enabled").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ----------------------------------------------------
// 3. DOCTORS TABLE
// ----------------------------------------------------
export const doctors = pgTable("doctors", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  licenseNumber: text("license_number"),
  department: text("department").notNull(),
  specialization: text("specialization"),
  roomNumber: text("room_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ----------------------------------------------------
// 4. VISITS TABLE
// ----------------------------------------------------
export const visits = pgTable("visits", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  patientId: text("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  doctorId: text("doctor_id").references(() => doctors.id, { onDelete: "set null" }),
  queueNumber: integer("queue_number"),
  status: visitStatusEnum("status").default("WAITING").notNull(),
  department: text("department").default("General Medicine").notNull(),
  isKiosk: boolean("is_kiosk").default(false).notNull(),
  priority: priorityEnum("priority").default("ROUTINE").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ----------------------------------------------------
// 5. INTERVIEW SESSIONS
// ----------------------------------------------------
export const interviewSessions = pgTable("interview_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  visitId: text("visit_id").references(() => visits.id, { onDelete: "cascade" }).notNull(),
  patientId: text("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  status: text("status").default("ACTIVE").notNull(), // ACTIVE, COMPLETED, ABORTED
  currentSection: text("current_section").default("CHIEF_COMPLAINT").notNull(),
  language: text("language").default("en").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ----------------------------------------------------
// 6. INTERVIEW MESSAGES
// ----------------------------------------------------
export const interviewMessages = pgTable("interview_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id").references(() => interviewSessions.id, { onDelete: "cascade" }).notNull(),
  sender: messageSenderEnum("sender").notNull(),
  textContent: text("text_content").notNull(),
  audioUrl: text("audio_url"),
  extractedData: jsonb("extracted_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ----------------------------------------------------
// 7. CLINICAL HISTORIES (Structured Output)
// ----------------------------------------------------
export const clinicalHistories = pgTable("clinical_histories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  visitId: text("visit_id").references(() => visits.id, { onDelete: "cascade" }).notNull().unique(),
  patientId: text("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  chiefComplaint: jsonb("chief_complaint"),
  hpi: jsonb("hpi"), // History of Present Illness (onset, location, severity, etc.)
  pastMedicalHistory: jsonb("past_medical_history"),
  pastSurgicalHistory: jsonb("past_surgical_history"),
  medications: jsonb("medications"),
  allergies: jsonb("allergies"),
  familyHistory: jsonb("family_history"),
  personalHistory: jsonb("personal_history"),
  reviewOfSystems: jsonb("review_of_systems"),
  ayushData: jsonb("ayush_data"), // Prakriti, Vikriti, Agni, etc.
  summaryText: text("summary_text"),
  rawExtraction: jsonb("raw_extraction"),
  isConfirmedByPatient: boolean("is_confirmed_by_patient").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ----------------------------------------------------
// 8. MEDICAL DOCUMENTS (UploadThing file reference)
// ----------------------------------------------------
export const medicalDocuments = pgTable("medical_documents", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  visitId: text("visit_id").references(() => visits.id, { onDelete: "cascade" }).notNull(),
  patientId: text("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileKey: text("file_key").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  processingStatus: documentProcessingStatusEnum("processing_status").default("PENDING").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// ----------------------------------------------------
// 9. DOCUMENT EXTRACTIONS (AI output per document)
// ----------------------------------------------------
export const documentExtractions = pgTable("document_extractions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  documentId: text("document_id").references(() => medicalDocuments.id, { onDelete: "cascade" }).notNull().unique(),
  rawText: text("raw_text"),
  extractedJson: jsonb("extracted_json"),
  diagnoses: jsonb("diagnoses"),
  medications: jsonb("medications"),
  labResults: jsonb("lab_results"),
  documentDate: text("document_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ----------------------------------------------------
// 10. MEDICAL TIMELINE ENTRIES
// ----------------------------------------------------
export const medicalTimelineEntries = pgTable("medical_timeline_entries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  visitId: text("visit_id").references(() => visits.id, { onDelete: "cascade" }).notNull(),
  patientId: text("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  documentId: text("document_id").references(() => medicalDocuments.id, { onDelete: "set null" }),
  date: text("date").notNull(),
  title: text("title").notNull(),
  category: timelineCategoryEnum("category").default("CLINICAL_NOTE").notNull(),
  details: jsonb("details"),
  isAbnormal: boolean("is_abnormal").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ----------------------------------------------------
// 11. RED FLAGS (Triage alerts)
// ----------------------------------------------------
export const redFlags = pgTable("red_flags", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  visitId: text("visit_id").references(() => visits.id, { onDelete: "cascade" }).notNull(),
  patientId: text("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  severity: redFlagSeverityEnum("severity").default("MEDIUM").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  detectedBy: text("detected_by").default("INTAKE_AI").notNull(), // INTAKE_AI, DOCUMENT_AI, DOCTOR
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ----------------------------------------------------
// 12. DOCTOR REVIEWS & CONSULTATION
// ----------------------------------------------------
export const doctorReviews = pgTable("doctor_reviews", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  visitId: text("visit_id").references(() => visits.id, { onDelete: "cascade" }).notNull().unique(),
  doctorId: text("doctor_id").references(() => doctors.id, { onDelete: "cascade" }).notNull(),
  clinicalSummaryNotes: text("clinical_summary_notes"),
  finalDiagnosis: jsonb("final_diagnosis"),
  doctorNotes: text("doctor_notes"),
  status: reviewStatusEnum("status").default("DRAFT").notNull(),
  signedAt: timestamp("signed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ----------------------------------------------------
// 13. PRESCRIPTIONS
// ----------------------------------------------------
export const prescriptions = pgTable("prescriptions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  visitId: text("visit_id").references(() => visits.id, { onDelete: "cascade" }).notNull(),
  doctorId: text("doctor_id").references(() => doctors.id, { onDelete: "cascade" }).notNull(),
  patientId: text("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  medicationName: text("medication_name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  duration: text("duration").notNull(),
  instructions: text("instructions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ----------------------------------------------------
// 14. CONSENTS
// ----------------------------------------------------
export const consents = pgTable("consents", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  visitId: text("visit_id").references(() => visits.id, { onDelete: "cascade" }),
  patientId: text("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  consentType: text("consent_type").notNull(), // DATA_COLLECTION, AI_PROCESSING, DOCUMENT_STORAGE
  isGranted: boolean("is_granted").default(true).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
});

// ----------------------------------------------------
// 15. AUDIT LOGS
// ----------------------------------------------------
export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  visitId: text("visit_id").references(() => visits.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
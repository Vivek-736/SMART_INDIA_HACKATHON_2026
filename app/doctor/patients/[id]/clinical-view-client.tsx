"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Stethoscope,
  AlertTriangle,
  FileText,
  Pill,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Lock,
  ArrowRight,
  Activity,
  Thermometer,
  Leaf,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ClinicalPatientViewData {
  visitId: string;
  queueNumber: number;
  department: string;
  priority: "ROUTINE" | "URGENT" | "EMERGENCY";
  status: "WAITING" | "INTAKE_IN_PROGRESS" | "READY_FOR_DOCTOR" | "IN_CONSULTATION" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  isLockedByOtherDoctor: boolean;
  attendingDoctorName: string | null;
  patient: {
    id: string;
    name: string;
    uhid: string | null;
    age: number | null;
    gender: string | null;
    phone: string | null;
    language: string;
    ayushModeEnabled: boolean;
  };
  clinicalHistory: {
    summaryText?: string | null;
    chiefComplaint?: unknown;
    hpi?: unknown;
    pastMedicalHistory?: unknown;
    medications?: unknown;
    allergies?: unknown;
    ayushData?: unknown;
    isConfirmedByPatient: boolean;
    updatedAt: string;
  } | null;
  redFlags: {
    description: string;
    severity: string;
    category?: string;
  }[];
  documentsCount: number;
  interviewMessages: {
    id: string;
    sender: "SYSTEM" | "PATIENT" | "AI";
    textContent: string;
    timestamp: string;
    extractedPills?: string[];
    isRedFlag?: boolean;
  }[];
}

interface ClinicalViewClientProps {
  data: ClinicalPatientViewData;
}

export default function ClinicalViewClient({ data }: ClinicalViewClientProps) {
  const router = useRouter();
  const [showTranscript, setShowTranscript] = useState(false);

  const {
    visitId,
    queueNumber,
    department,
    priority,
    status,
    isLockedByOtherDoctor,
    attendingDoctorName,
    patient,
    clinicalHistory,
    redFlags,
    documentsCount,
    interviewMessages,
  } = data;

  const isUrgent = priority === "URGENT" || priority === "EMERGENCY" || redFlags.length > 0;
  const isAyushDept = department.includes("AYUSH") || department.includes("Ayurveda") || patient.ayushModeEnabled;

  // Helper to parse string or JSON data safely
  const formatFieldText = (val: unknown): string => {
    if (!val) return "Not recorded during intake";
    if (typeof val === "string") return val;
    if (Array.isArray(val)) return val.join(", ");
    if (typeof val === "object") {
      const entries = Object.entries(val as Record<string, unknown>);
      if (entries.length === 0) return "Not recorded";
      return entries
        .map(([k, v]) => `${k.replace(/([A-Z])/g, " $1").toLowerCase()}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
        .join("; ");
    }
    return String(val);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      {/* Top Breadcrumb & Lock Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/doctor/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to OPD Queue</span>
        </Link>

        {isLockedByOtherDoctor && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>View-Only: Dr. {attendingDoctorName || "Physician"} is in session with this patient.</span>
          </div>
        )}
      </div>

      {/* Patient Header Identity Card */}
      <div className="p-5 sm:p-6 rounded-3xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Token Badge */}
            <div
              className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex flex-col items-center justify-center shrink-0 font-mono shadow-xs border ${
                isUrgent
                  ? "bg-rose-100 text-rose-900 border-rose-300"
                  : "bg-indigo-50 text-primary border-primary/20"
              }`}
            >
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">Token</span>
              <span className="text-2xl sm:text-3xl font-black">#{queueNumber}</span>
            </div>

            {/* Name & Demographic Details */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                  {patient.name}
                </h1>

                {/* Priority Badge */}
                {isUrgent ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 border border-rose-200 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                    URGENT TRIAGE
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    Routine Intake
                  </span>
                )}

                {/* Status Badge */}
                <span className="inline-flex items-center rounded-md bg-blue-50 border border-blue-200/60 px-2 py-0.5 text-[11px] font-bold text-blue-700 capitalize">
                  {status.replace(/_/g, " ").toLowerCase()}
                </span>
              </div>

              {/* Demographics row */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5">
                <span>
                  Age: <strong className="text-foreground">{patient.age ? `${patient.age} yrs` : "N/A"}</strong>
                </span>
                <span>&bull;</span>
                <span>
                  Gender: <strong className="text-foreground capitalize">{patient.gender || "N/A"}</strong>
                </span>
                <span>&bull;</span>
                <span>
                  UHID: <strong className="font-mono text-foreground">{patient.uhid || "PENDING"}</strong>
                </span>
                <span>&bull;</span>
                <span>
                  Dept: <strong className="text-primary font-semibold">{department}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation CTAs */}
          <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/doctor/patients/${visitId}/timeline`)}
              className="rounded-xl border-border hover:bg-secondary text-xs font-semibold gap-1.5 py-5 px-4 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-primary" />
              <span>Documents & Timeline ({documentsCount})</span>
            </Button>

            <Button
              size="sm"
              onClick={() => router.push(`/doctor/patients/${visitId}/review`)}
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 py-5 px-5 shadow-md cursor-pointer"
            >
              <span>Prescribe & Finalize</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1 border-t border-border pt-3">
          <button
            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Clinical Intake History</span>
          </button>

          <Link
            href={`/doctor/patients/${visitId}/timeline`}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-primary" />
            <span>Prior Documents ({documentsCount})</span>
          </Link>

          <Link
            href={`/doctor/patients/${visitId}/review`}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Diagnosis & Prescription</span>
          </Link>
        </div>
      </div>

      {/* Red Flag Alerts Banner (If present) */}
      {redFlags.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-950 shadow-xs space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Clinical Triage Alerts ({redFlags.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {redFlags.map((flag, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs font-medium flex items-start gap-2 text-rose-900"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{flag.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Executive 1-Page Physician Briefing Card */}
      {clinicalHistory?.summaryText && (
        <div className="p-5 sm:p-6 rounded-3xl border border-primary/20 bg-linear-to-br from-indigo-50/40 via-card to-card shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">
                AI Physician Intake Briefing
              </h2>
            </div>
            {clinicalHistory.isConfirmedByPatient && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Verified by Patient
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium">
            {clinicalHistory.summaryText}
          </p>
        </div>
      )}

      {/* Main Clinical History Structured Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Chief Complaint */}
        <div className="p-5 rounded-3xl border border-border bg-card shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Thermometer className="w-4 h-4" />
            <h3>Chief Presenting Complaint</h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60 text-xs text-foreground leading-relaxed font-medium">
            {formatFieldText(clinicalHistory?.chiefComplaint)}
          </div>
        </div>

        {/* Card 2: History of Present Illness (HPI) */}
        <div className="p-5 rounded-3xl border border-border bg-card shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Activity className="w-4 h-4" />
            <h3>History of Present Illness (HPI)</h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60 text-xs text-foreground leading-relaxed font-medium">
            {formatFieldText(clinicalHistory?.hpi)}
          </div>
        </div>

        {/* Card 3: Past Medical & Surgical History */}
        <div className="p-5 rounded-3xl border border-border bg-card shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Calendar className="w-4 h-4" />
            <h3>Past Medical & Surgical History</h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60 text-xs text-foreground leading-relaxed font-medium">
            {formatFieldText(clinicalHistory?.pastMedicalHistory)}
          </div>
        </div>

        {/* Card 4: Active Medications & Allergies */}
        <div className="p-5 rounded-3xl border border-border bg-card shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Pill className="w-4 h-4" />
            <h3>Current Medications & Known Allergies</h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60 text-xs text-foreground leading-relaxed font-medium">
            {formatFieldText(clinicalHistory?.medications)}
          </div>
        </div>
      </div>

      {/* AYUSH (Ayurveda) Clinical Evaluation Card (When in AYUSH mode) */}
      {isAyushDept && (
        <div className="p-5 sm:p-6 rounded-3xl border-2 border-emerald-300/80 bg-linear-to-br from-emerald-50/70 via-emerald-50/30 to-background shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/80 pb-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm sm:text-base">
              <Leaf className="w-5 h-5 text-emerald-600" />
              <h3>AYUSH & Ayurvedic Clinical Profile (आयुर्वेदिक निदान)</h3>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3 py-1 rounded-full">
              🌿 Ayurvedic Assessment
            </span>
          </div>

          {/* Tri-Dosha & Prakriti Meter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Vata Card */}
            <div className="p-3.5 rounded-2xl bg-white border border-emerald-200/70 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-blue-900">Vata (वात)</span>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  {typeof clinicalHistory?.ayushData === "object" && (clinicalHistory.ayushData as any)?.prakritiAssessment?.vataScore ? `${(clinicalHistory.ayushData as any).prakritiAssessment.vataScore}%` : "40%"}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-blue-100 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "40%" }} />
              </div>
              <p className="text-[11px] text-muted-foreground">Cold intolerance, dry skin, light frame</p>
            </div>

            {/* Pitta Card */}
            <div className="p-3.5 rounded-2xl bg-white border border-emerald-200/70 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-amber-900">Pitta (पित्त)</span>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  {typeof clinicalHistory?.ayushData === "object" && (clinicalHistory.ayushData as any)?.prakritiAssessment?.pittaScore ? `${(clinicalHistory.ayushData as any).prakritiAssessment.pittaScore}%` : "35%"}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-amber-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "35%" }} />
              </div>
              <p className="text-[11px] text-muted-foreground">Heat sensitivity, sharp appetite, acid tendency</p>
            </div>

            {/* Kapha Card */}
            <div className="p-3.5 rounded-2xl bg-white border border-emerald-200/70 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-emerald-900">Kapha (कफ)</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {typeof clinicalHistory?.ayushData === "object" && (clinicalHistory.ayushData as any)?.prakritiAssessment?.kaphaScore ? `${(clinicalHistory.ayushData as any).prakritiAssessment.kaphaScore}%` : "25%"}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-emerald-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "25%" }} />
              </div>
              <p className="text-[11px] text-muted-foreground">Heavy body build, slow digestion, calm nature</p>
            </div>
          </div>

          {/* Agni & Ahara-Vihara Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 text-xs space-y-1">
              <span className="font-extrabold text-emerald-950 block text-[11px] uppercase tracking-wide">
                Agni / Digestion Strength (अग्नि):
              </span>
              <p className="text-foreground/90 font-medium">
                {typeof clinicalHistory?.ayushData === "object" && (clinicalHistory.ayushData as any)?.agniAssessment
                  ? (clinicalHistory.ayushData as any).agniAssessment
                  : "Normal to Vishamagni (Irregular appetite & gas/bloating tendency)"}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 text-xs space-y-1">
              <span className="font-extrabold text-emerald-950 block text-[11px] uppercase tracking-wide">
                Ahara-Vihara / Lifestyle (आहार-विहार):
              </span>
              <p className="text-foreground/90 font-medium">
                {typeof clinicalHistory?.ayushData === "object" && (clinicalHistory.ayushData as any)?.aharaPrakriti
                  ? (clinicalHistory.ayushData as any).aharaPrakriti
                  : "Prefers warm cooked meals, cold climate aggravates symptoms"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Provocable Raw Interview Transcript (Provenance Verification) */}
      <div className="rounded-3xl border border-border bg-card shadow-2xs overflow-hidden">
        <button
          onClick={() => setShowTranscript((prev) => !prev)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-secondary/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-foreground">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span>Inspect Full Patient Intake Transcript ({interviewMessages.length} Turns)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{showTranscript ? "Hide Transcript" : "View Source Q&A"}</span>
            {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showTranscript && (
          <div className="p-4 sm:p-6 border-t border-border/80 space-y-3 bg-secondary/20 max-h-[480px] overflow-y-auto">
            {interviewMessages.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No conversational interview messages recorded for this session.
              </p>
            ) : (
              interviewMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "PATIENT" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-2xs space-y-1 ${
                      msg.sender === "PATIENT"
                        ? "bg-primary text-primary-foreground rounded-tr-xs"
                        : "bg-card border border-border text-foreground rounded-tl-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10.5px] opacity-75">
                      <span className="font-bold">{msg.sender === "PATIENT" ? "Patient Answer" : "Doctor AI Question"}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.textContent}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/doctor/dashboard">
          <Button variant="outline" className="rounded-xl border-border text-xs font-semibold cursor-pointer">
            &larr; Back to OPD Dashboard
          </Button>
        </Link>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => router.push(`/doctor/patients/${visitId}/timeline`)}
            className="w-full sm:w-auto rounded-xl border-border text-xs font-semibold gap-1.5 py-5 px-5 cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4 text-primary" />
            <span>Review Attached Documents ({documentsCount}) &rarr;</span>
          </Button>

          <Button
            onClick={() => router.push(`/doctor/patients/${visitId}/review`)}
            className="w-full sm:w-auto rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-2 py-5 px-6 shadow-md cursor-pointer"
          >
            <span>Proceed to Digital Prescription</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
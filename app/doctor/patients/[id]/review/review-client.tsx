"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Stethoscope,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Pill,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  Lock,
  Activity,
  FileCheck2,
  FileSignature,
  Loader2,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitDoctorReviewAction, PrescriptionItem } from "./actions";

export interface DoctorReviewViewData {
  visitId: string;
  queueNumber: number;
  department: string;
  priority: "ROUTINE" | "URGENT" | "EMERGENCY";
  status: string;
  isLockedByOtherDoctor: boolean;
  attendingDoctorName: string | null;
  patient: {
    id: string;
    name: string;
    uhid: string | null;
    age: number | null;
    gender: string | null;
    ayushModeEnabled: boolean;
  };
  initialSummaryText: string;
  initialDiagnosis: string;
  initialClinicalNotes: string;
  initialPrescriptions: PrescriptionItem[];
  initialFollowUpDate: string | null;
  isAlreadySigned: boolean;
}

interface DoctorReviewClientProps {
  data: DoctorReviewViewData;
}

const COMMON_DIAGNOSES = [
  "Acute Viral Bronchitis",
  "Upper Respiratory Tract Infection (URTI)",
  "Acute Gastroenteritis",
  "Essential Hypertension",
  "Type 2 Diabetes Mellitus",
  "Tension-Type Headache",
  "Lumbar Spondylosis / Low Back Pain",
  "Acid Peptic Disease / GERD",
  "Vata-Kaphaja Jwara (Ayurvedic)",
  "Amlapitta (Ayurvedic Hyperacidity)",
];

const DEFAULT_MEDICINES = [
  "Tab. Paracetamol 650mg",
  "Tab. Pantoprazole 40mg",
  "Tab. Amoxicillin-Clav 625mg",
  "Tab. Cetirizine 10mg",
  "Tab. Azithromycin 500mg",
  "Tab. Metformin 500mg",
  "Tab. Amlodipine 5mg",
  "Syp. Cough Relief 10ml",
  "ORS Hydration Sachet",
  "Mahasudarshan Vati 500mg",
  "Sudarshana Churna 3g",
  "Ashwagandha Capsule 500mg",
];

export default function DoctorReviewClient({ data }: DoctorReviewClientProps) {
  const router = useRouter();
  const {
    visitId,
    queueNumber,
    department,
    priority,
    isLockedByOtherDoctor,
    attendingDoctorName,
    patient,
    initialDiagnosis,
    initialClinicalNotes,
    initialPrescriptions,
    initialFollowUpDate,
    isAlreadySigned,
  } = data;

  const isUrgent = priority === "URGENT" || priority === "EMERGENCY";
  const isAyushDept = department.includes("AYUSH") || department.includes("Ayurveda") || patient.ayushModeEnabled;

  const [diagnosis, setDiagnosis] = useState(initialDiagnosis || "");
  const [clinicalNotes, setClinicalNotes] = useState(initialClinicalNotes || "");
  const [ayushRegimen, setAyushRegimen] = useState("");
  const [followUpDate, setFollowUpDate] = useState<string>(initialFollowUpDate || "");
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>(
    initialPrescriptions.length > 0
      ? initialPrescriptions
      : [
          {
            medicineName: "Tab. Paracetamol 650mg",
            form: "Tablet",
            dosage: "650mg",
            frequency: "1-0-1 After Food (BD)",
            duration: "3 Days",
            instructions: "Take with warm water after meals",
          },
        ]
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAddMedication = () => {
    setPrescriptions((prev) => [
      ...prev,
      {
        medicineName: "",
        form: "Tablet",
        dosage: "",
        frequency: "1-0-1 After Food (BD)",
        duration: "5 Days",
        instructions: "Take after meals",
      },
    ]);
  };

  const handleRemoveMedication = (index: number) => {
    setPrescriptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedChange = (index: number, field: keyof PrescriptionItem, val: string) => {
    setPrescriptions((prev) => {
      const cloned = [...prev];
      cloned[index] = { ...cloned[index], [field]: val };
      return cloned;
    });
  };

  const handleSetQuickFollowUp = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFollowUpDate(d.toISOString().split("T")[0]);
  };

  const handleSubmit = () => {
    setErrorMessage(null);
    if (!diagnosis.trim()) {
      setErrorMessage("Please enter or select a confirmed clinical diagnosis.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await submitDoctorReviewAction({
          visitId,
          diagnosis: diagnosis.trim(),
          clinicalNotes: clinicalNotes.trim(),
          prescriptions: prescriptions.filter((p) => p.medicineName.trim()),
          followUpDate: followUpDate || null,
          ayushRegimen: isAyushDept ? ayushRegimen.trim() : null,
        });

        if (res.success) {
          router.push("/doctor/dashboard");
        } else {
          setErrorMessage(res.error || "Failed to submit doctor review.");
        }
      } catch (err) {
        console.error("Submit review error:", err);
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      {/* Datalist for fast medicine autocomplete */}
      <datalist id="common-medicines">
        {DEFAULT_MEDICINES.map((m) => (
          <option key={m} value={m} />
        ))}
      </datalist>

      {/* Top Breadcrumb & Lock Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href={`/doctor/patients/${visitId}/timeline`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Documents & Timeline</span>
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
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 font-mono shadow-xs border ${
                isUrgent
                  ? "bg-rose-100 text-rose-900 border-rose-300"
                  : "bg-indigo-50 text-primary border-primary/20"
              }`}
            >
              <span className="text-[9.5px] uppercase font-bold tracking-wider opacity-75">Token</span>
              <span className="text-xl sm:text-2xl font-black">#{queueNumber}</span>
            </div>

            {/* Name & Demographics */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                  {patient.name}
                </h1>
                <span className="text-xs text-muted-foreground">
                  ({[patient.age ? `${patient.age} yrs` : null, patient.gender].filter(Boolean).join(", ")})
                </span>
                {isAlreadySigned && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Consultation Completed & Signed
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                UHID: <strong className="font-mono text-foreground">{patient.uhid || "PENDING"}</strong> &bull; Dept: <strong className="text-primary font-semibold">{department}</strong>
              </p>
            </div>
          </div>

          <Button
            size="sm"
            disabled={isPending || isLockedByOtherDoctor}
            onClick={handleSubmit}
            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-2 py-5 px-6 shadow-md cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing & Finalizing...</span>
              </>
            ) : (
              <>
                <FileSignature className="w-4 h-4" />
                <span>Sign & Finalize Consultation</span>
              </>
            )}
          </Button>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1 border-t border-border pt-3">
          <Link
            href={`/doctor/patients/${visitId}`}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Stethoscope className="w-3.5 h-3.5 text-primary" />
            <span>Clinical Intake History</span>
          </Link>

          <Link
            href={`/doctor/patients/${visitId}/timeline`}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-primary" />
            <span>Prior Documents & Timeline</span>
          </Link>

          <button
            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Diagnosis & Digital Prescription</span>
          </button>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-700 hover:text-rose-950 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Form Section 1: Clinical Diagnosis */}
      <div className="p-5 sm:p-6 rounded-3xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Activity className="w-4 h-4" />
            <h2>Clinical Diagnosis (Provisional / Confirmed)</h2>
          </div>
          <span className="text-xs text-muted-foreground">Required for prescription sign-off</span>
        </div>

        <input
          type="text"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          placeholder="e.g. Acute Viral Bronchitis & Upper Respiratory Infection..."
          disabled={isLockedByOtherDoctor}
          className="w-full px-4 py-3 rounded-2xl border border-input bg-background text-sm font-semibold text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
        />

        {/* Quick Diagnosis Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-muted-foreground">Quick Diagnosis Suggestions:</span>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_DIAGNOSES.map((diag) => (
              <button
                key={diag}
                type="button"
                disabled={isLockedByOtherDoctor}
                onClick={() => setDiagnosis(diag)}
                className="px-2.5 py-1 rounded-xl text-xs bg-secondary/80 hover:bg-secondary border border-border/80 font-medium text-foreground transition-colors cursor-pointer disabled:opacity-50"
              >
                + {diag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Section 2: Digital Prescription (Rx) Builder */}
      <div className="p-5 sm:p-6 rounded-3xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Pill className="w-4 h-4" />
            <h2>Prescribed Medications (Rx)</h2>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={isLockedByOtherDoctor}
            onClick={handleAddMedication}
            className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 py-4 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Medication</span>
          </Button>
        </div>

        <div className="space-y-3">
          {prescriptions.map((med, index) => (
            <div
              key={index}
              className="p-4 rounded-2xl border border-border/80 bg-secondary/20 shadow-2xs space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {/* Drug Name with Autocomplete */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                    Medicine / Brand Name
                  </label>
                  <input
                    type="text"
                    list="common-medicines"
                    value={med.medicineName}
                    onChange={(e) => handleMedChange(index, "medicineName", e.target.value)}
                    placeholder="e.g. Tab. Paracetamol 650mg"
                    disabled={isLockedByOtherDoctor}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Form Selector */}
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                    Form
                  </label>
                  <select
                    value={med.form}
                    onChange={(e) => handleMedChange(index, "form", e.target.value)}
                    disabled={isLockedByOtherDoctor}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:outline-hidden cursor-pointer"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Drops">Drops</option>
                    <option value="Injection">Injection</option>
                    <option value="Ointment">Ointment</option>
                    <option value="Churna">Churna (Powder)</option>
                    <option value="Vati">Vati (Ayur)</option>
                    <option value="Kwatha">Kwatha (Decoction)</option>
                  </select>
                </div>

                {/* Frequency */}
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                    Frequency / Timing
                  </label>
                  <select
                    value={med.frequency}
                    onChange={(e) => handleMedChange(index, "frequency", e.target.value)}
                    disabled={isLockedByOtherDoctor}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:outline-hidden cursor-pointer"
                  >
                    <option value="1-0-1 After Food (BD)">1-0-1 After Food (BD)</option>
                    <option value="1-0-0 Before Food (OD)">1-0-0 Before Food (OD)</option>
                    <option value="1-1-1 After Food (TDS)">1-1-1 After Food (TDS)</option>
                    <option value="0-0-1 Night (HS)">0-0-1 Night (HS)</option>
                    <option value="SOS (When needed)">SOS (When needed)</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={med.duration}
                    onChange={(e) => handleMedChange(index, "duration", e.target.value)}
                    placeholder="e.g. 5 Days"
                    disabled={isLockedByOtherDoctor}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:outline-hidden"
                  />
                </div>

                {/* Delete row button */}
                <div className="flex items-end justify-end">
                  <button
                    type="button"
                    disabled={isLockedByOtherDoctor || prescriptions.length === 1}
                    onClick={() => handleRemoveMedication(index)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer disabled:opacity-40"
                    title="Remove Medicine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Instructions row */}
              <div>
                <input
                  type="text"
                  value={med.instructions}
                  onChange={(e) => handleMedChange(index, "instructions", e.target.value)}
                  placeholder="Special instructions (e.g. Take with warm water, avoid dairy for 1 hour)"
                  disabled={isLockedByOtherDoctor}
                  className="w-full px-3 py-1.5 rounded-xl border border-border bg-background text-xs text-muted-foreground focus:outline-hidden"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Section 3: Clinical Notes & AYUSH Regimen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Doctor Advice & Clinical Notes */}
        <div className="p-5 sm:p-6 rounded-3xl border border-border bg-card shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <FileText className="w-4 h-4" />
            <h3>Doctor Notes & Patient Advice</h3>
          </div>
          <textarea
            rows={4}
            value={clinicalNotes}
            onChange={(e) => setClinicalNotes(e.target.value)}
            placeholder="Advice on rest, hydration, warning signs to watch for, or diagnostic tests to perform..."
            disabled={isLockedByOtherDoctor}
            className="w-full px-4 py-3 rounded-2xl border border-input bg-background text-xs leading-relaxed text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
        </div>

        {/* AYUSH Ahara-Vihara Regimen or Follow-up */}
        <div className="p-5 sm:p-6 rounded-3xl border border-border bg-card shadow-xs space-y-4 flex flex-col justify-between">
          {isAyushDept ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <Leaf className="w-4 h-4 text-emerald-600" />
                <h3>Ayurvedic Ahara-Vihara (Diet & Lifestyle Regimen)</h3>
              </div>
              <textarea
                rows={3}
                value={ayushRegimen}
                onChange={(e) => setAyushRegimen(e.target.value)}
                placeholder="Pathya / Apathya (Dietary recommendations, seasonal lifestyle advice)..."
                disabled={isLockedByOtherDoctor}
                className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/20 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <span className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Patient Dashboard Delivery</span>
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upon finalization, this prescription will instantly become accessible to the patient with multilingual spoken audio guidance in their preferred language.
              </p>
            </div>
          )}

          {/* Follow-Up Scheduler */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Recommended Follow-up Visit:</span>
              </span>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                disabled={isLockedByOtherDoctor}
                className="px-3 py-1 rounded-xl border border-border bg-background text-xs font-semibold text-foreground cursor-pointer focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleSetQuickFollowUp(3)}
                className="px-2.5 py-1 rounded-lg bg-secondary text-[11px] font-semibold text-foreground hover:bg-secondary/80 cursor-pointer"
              >
                In 3 Days
              </button>
              <button
                type="button"
                onClick={() => handleSetQuickFollowUp(5)}
                className="px-2.5 py-1 rounded-lg bg-secondary text-[11px] font-semibold text-foreground hover:bg-secondary/80 cursor-pointer"
              >
                In 5 Days
              </button>
              <button
                type="button"
                onClick={() => handleSetQuickFollowUp(7)}
                className="px-2.5 py-1 rounded-lg bg-secondary text-[11px] font-semibold text-foreground hover:bg-secondary/80 cursor-pointer"
              >
                In 1 Week
              </button>
              <button
                type="button"
                onClick={() => setFollowUpDate("")}
                className="px-2.5 py-1 rounded-lg text-muted-foreground text-[11px] font-semibold hover:text-foreground cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sign-off Footer */}
      <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href={`/doctor/patients/${visitId}/timeline`}>
          <Button variant="outline" className="rounded-xl border-border text-xs font-semibold cursor-pointer">
            &larr; Back to Documents
          </Button>
        </Link>

        <Button
          size="lg"
          disabled={isPending || isLockedByOtherDoctor}
          onClick={handleSubmit}
          className="w-full sm:w-auto px-8 py-6 rounded-xl font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Finalizing Consultation...</span>
            </>
          ) : (
            <>
              <FileSignature className="w-5 h-5" />
              <span>Sign & Issue Digital Prescription</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
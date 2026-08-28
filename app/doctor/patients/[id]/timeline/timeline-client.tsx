"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Stethoscope,
  FileText,
  Clock,
  AlertTriangle,
  ExternalLink,
  Pill,
  Sparkles,
  ArrowRight,
  FileCheck2,
  Lock,
  Activity,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TimelineEntryItem {
  id: string;
  date: string;
  title: string;
  category: "LAB" | "PRESCRIPTION" | "DISCHARGE" | "SURGERY" | "CLINICAL_NOTE" | "AYUSH_ASSESSMENT" | "INTAKE";
  details?: Record<string, unknown> | null;
  isAbnormal: boolean;
  documentId?: string | null;
  sourceDocName?: string | null;
}

export interface ExtractedDocItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  processingStatus: string;
  extracted?: {
    documentCategory?: string;
    documentDate?: string;
    summary?: string;
    diagnoses?: string[];
    medications?: {
      name: string;
      dosage?: string;
      frequency?: string;
      duration?: string;
      instructions?: string;
    }[];
    labResults?: {
      testName: string;
      value: string;
      unit?: string;
      referenceRange?: string;
      isAbnormal?: boolean;
      interpretation?: string;
    }[];
    redFlags?: { description: string; severity: string }[];
  } | null;
}

export interface DoctorTimelineViewData {
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
  };
  documents: ExtractedDocItem[];
  timelineEntries: TimelineEntryItem[];
}

interface DoctorTimelineClientProps {
  data: DoctorTimelineViewData;
}

export default function DoctorTimelineClient({ data }: DoctorTimelineClientProps) {
  const router = useRouter();
  const {
    visitId,
    queueNumber,
    department,
    priority,
    status,
    isLockedByOtherDoctor,
    attendingDoctorName,
    patient,
    documents,
    timelineEntries,
  } = data;

  const isUrgent = priority === "URGENT" || priority === "EMERGENCY";
  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    documents.length > 0 ? documents[0].id : null
  );

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0] || null;
  const isPdf = selectedDoc?.fileType?.includes("pdf") || selectedDoc?.fileName?.toLowerCase().endsWith(".pdf");

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      {/* Top Breadcrumb & Lock Warning */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href={`/doctor/patients/${visitId}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Clinical Intake History</span>
        </Link>

        {isLockedByOtherDoctor && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>View-Only: Dr. {attendingDoctorName || "Physician"} is managing this consultation.</span>
          </div>
        )}
      </div>

      {/* Patient Header Strip */}
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

            {/* Name & Metadata */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                  {patient.name}
                </h1>
                <span className="text-xs text-muted-foreground">
                  ({[patient.age ? `${patient.age} yrs` : null, patient.gender].filter(Boolean).join(", ")})
                </span>
                <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground">
                  UHID: {patient.uhid || "PENDING"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Reviewing <strong className="text-foreground">{documents.length} attached document(s)</strong> and chronological medical timeline.
              </p>
            </div>
          </div>

          {/* Action Button: Proceed to Prescription */}
          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              onClick={() => router.push(`/doctor/patients/${visitId}/review`)}
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-2 py-5 px-5 shadow-md cursor-pointer"
            >
              <span>Proceed to Prescription</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
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

          <button
            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Prior Documents ({documents.length}) & Timeline</span>
          </button>

          <Link
            href={`/doctor/patients/${visitId}/review`}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Diagnosis & Prescription</span>
          </Link>
        </div>
      </div>

      {/* Main Split Layout: Documents & AI Extractor (Top) + Medical Timeline (Bottom) */}
      <div className="space-y-6">
        {documents.length === 0 ? (
          /* Empty Documents State */
          <div className="p-10 rounded-3xl border-2 border-dashed border-border bg-card/60 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary text-muted-foreground flex items-center justify-center mx-auto">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-sm font-bold text-foreground">No Previous Documents Uploaded</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The patient did not attach prior prescriptions or lab reports for this visit. Pre-consultation history was recorded conversationally.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>Source Document Inspector & AI Extraction</span>
              </h2>
              <span className="text-xs text-muted-foreground">
                Click any document to inspect original image and extracted medical entities
              </span>
            </div>

            {/* Document Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {documents.map((doc, idx) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 cursor-pointer border ${
                    selectedDoc?.id === doc.id
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-card text-foreground border-border hover:bg-secondary"
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Doc {idx + 1}: {doc.fileName.slice(0, 24)}</span>
                </button>
              ))}
            </div>

            {/* Split Screen Container: Left (Original Document) | Right (AI Structured Extraction) */}
            {selectedDoc && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Pane: Original Document Preview */}
                <div className="p-4 sm:p-5 rounded-3xl border border-border bg-card shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground truncate max-w-[240px]">
                        {selectedDoc.fileName}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                        {isPdf ? "PDF Document" : "Image"}
                      </span>
                    </div>

                    <a
                      href={selectedDoc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Fullscreen</span>
                    </a>
                  </div>

                  {/* Document Display Window */}
                  <div className="w-full h-[380px] sm:h-[440px] rounded-2xl bg-secondary/40 border border-border/70 overflow-hidden relative flex items-center justify-center">
                    {isPdf ? (
                      <iframe
                        src={`${selectedDoc.fileUrl}#toolbar=0`}
                        title={selectedDoc.fileName}
                        className="w-full h-full border-none"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedDoc.fileUrl}
                        alt={selectedDoc.fileName}
                        className="w-full h-full object-contain p-2"
                      />
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground text-center">
                    Original encrypted file stored under ABDM health record guidelines.
                  </p>
                </div>

                {/* Right Pane: AI Extracted Clinical Entities */}
                <div className="p-4 sm:p-5 rounded-3xl border border-border bg-card shadow-2xs space-y-4 overflow-y-auto max-h-[540px]">
                  <div className="flex items-center justify-between border-b border-border pb-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h3 className="text-xs sm:text-sm font-bold text-foreground">
                        AI Entity Extraction & Provenance
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      Verified by OCR Engine
                    </span>
                  </div>

                  {/* Summary Snippet */}
                  {selectedDoc.extracted?.summary && (
                    <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-foreground leading-relaxed">
                      <strong className="text-primary block font-bold mb-0.5">Clinical Document Summary:</strong>
                      <span>{selectedDoc.extracted.summary}</span>
                    </div>
                  )}

                  {/* Extracted Medications */}
                  {selectedDoc.extracted?.medications && selectedDoc.extracted.medications.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-primary" />
                        <span>Extracted Past Medications ({selectedDoc.extracted.medications.length})</span>
                      </h4>
                      <div className="space-y-1.5">
                        {selectedDoc.extracted.medications.map((med, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-secondary/50 border border-border/60 text-xs flex items-center justify-between gap-2"
                          >
                            <div>
                              <p className="font-bold text-foreground">{med.name}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {[med.dosage, med.frequency, med.duration].filter(Boolean).join(" &bull; ")}
                              </p>
                            </div>
                            {med.instructions && (
                              <span className="text-[10px] text-muted-foreground max-w-[140px] truncate">
                                {med.instructions}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Extracted Lab Results */}
                  {selectedDoc.extracted?.labResults && selectedDoc.extracted.labResults.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Diagnostic Lab Values ({selectedDoc.extracted.labResults.length})</span>
                      </h4>
                      <div className="space-y-1.5">
                        {selectedDoc.extracted.labResults.map((lab, i) => (
                          <div
                            key={i}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                              lab.isAbnormal
                                ? "bg-rose-50 border-rose-200 text-rose-950"
                                : "bg-secondary/40 border-border/60 text-foreground"
                            }`}
                          >
                            <div>
                              <p className="font-bold flex items-center gap-1.5">
                                <span>{lab.testName}</span>
                                {lab.isAbnormal && (
                                  <span className="text-[9.5px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-md">
                                    ABNORMAL
                                  </span>
                                )}
                              </p>
                              {lab.referenceRange && (
                                <p className="text-[10.5px] text-muted-foreground">
                                  Ref: {lab.referenceRange}
                                </p>
                              )}
                            </div>
                            <span className="font-mono font-extrabold text-xs">
                              {lab.value} {lab.unit || ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Extracted Diagnoses */}
                  {selectedDoc.extracted?.diagnoses && selectedDoc.extracted.diagnoses.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-foreground">Documented Diagnoses</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedDoc.extracted.diagnoses.map((diag, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center rounded-lg bg-secondary px-2.5 py-1 text-xs font-semibold text-foreground"
                          >
                            {diag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section 2: Unified Chronological Medical Timeline */}
        <div className="p-5 sm:p-6 rounded-3xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Chronological Medical Timeline
              </h2>
            </div>
            <span className="text-xs text-muted-foreground">
              Synthesized from patient intake and prior clinical records
            </span>
          </div>

          {timelineEntries.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              No previous timeline milestones registered for this patient.
            </p>
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {timelineEntries.map((entry) => (
                <div key={entry.id} className="relative group">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full border-2 bg-background flex items-center justify-center transition-transform group-hover:scale-110 ${
                      entry.isAbnormal
                        ? "border-rose-500 text-rose-600"
                        : "border-primary text-primary"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        entry.isAbnormal ? "bg-rose-500" : "bg-primary"
                      }`}
                    />
                  </div>

                  {/* Timeline Card */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1.5 hover:border-primary/40 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">
                          {entry.title}
                        </span>
                        <span className="inline-flex items-center rounded-md bg-accent px-2 py-0.2 text-[10px] font-bold text-primary">
                          {entry.category}
                        </span>
                        {entry.isAbnormal && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 text-rose-700 px-2 py-0.2 text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Abnormal Finding
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {entry.date}
                      </span>
                    </div>

                    {entry.sourceDocName && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <FileText className="w-3 h-3 text-primary" />
                        <span>Source: {entry.sourceDocName}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation CTAs */}
      <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href={`/doctor/patients/${visitId}`}>
          <Button variant="outline" className="rounded-xl border-border text-xs font-semibold cursor-pointer">
            &larr; Back to Clinical Intake History
          </Button>
        </Link>
        <Button
          onClick={() => router.push(`/doctor/patients/${visitId}/review`)}
          className="w-full sm:w-auto rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-2 py-5 px-6 shadow-md cursor-pointer"
        >
          <span>Proceed to Prescription & Review</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
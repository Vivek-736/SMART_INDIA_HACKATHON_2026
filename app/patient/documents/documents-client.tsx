"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FileText,
  ImageIcon,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Sparkles,
  Stethoscope,
  ExternalLink,
  Loader2,
  Info,
  ShieldCheck,
  FileCheck2,
  PlusCircle,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadDropzone } from "@/lib/uploadthing";
import {
  recordUploadedDocumentAction,
  deleteUploadedDocumentAction,
} from "./actions";
import { getPatientTranslations } from "@/lib/i18n/patient-translations";

interface DocumentItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  processingStatus: string;
  uploadedAt: Date | string;
}

interface DocumentsClientProps {
  visitId: string;
  sessionId: string;
  department: string;
  queueNumber?: number | null;
  initialDocuments: DocumentItem[];
  language?: string;
}

export default function DocumentsClient({
  visitId,
  sessionId,
  department,
  queueNumber,
  initialDocuments,
  language = "en",
}: DocumentsClientProps) {
  const router = useRouter();
  const t = getPatientTranslations(language);
  
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingStatusText, setUploadingStatusText] = useState("");
  const [justUploadedCount, setJustUploadedCount] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const isPdf = (type: string, name: string) => {
    return type?.includes("pdf") || name?.toLowerCase().endsWith(".pdf");
  };

  const handleDelete = (docId: string) => {
    setDeletingId(docId);
    startTransition(async () => {
      try {
        await deleteUploadedDocumentAction(docId);
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
      } catch (err) {
        console.error("Failed to delete document:", err);
      } finally {
        setDeletingId(null);
      }
    });
  };

  const handleProceed = () => {
    setIsNavigating(true);
    router.push(`/patient/complete?visit=${visitId}&session=${sessionId}`);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-indigo-50/40 via-background to-background text-foreground flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border py-3 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/patient/dashboard" className="flex items-center gap-2.5 group">
            <Image
              src="/icon.png"
              alt="PreConsult Logo"
              width={28}
              height={28}
              className="rounded-lg bg-indigo-600 shadow-xs"
            />
            <span className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
              PreConsult
              <span className="inline-flex items-center rounded-md bg-accent px-1.5 py-0.2 text-[10.5px] font-semibold text-primary">
                Medical Records
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Stethoscope className="w-3.5 h-3.5 text-primary" />
            <span>{department}</span>
            {queueNumber && (
              <>
                <span className="text-border">·</span>
                <span className="font-semibold text-foreground">Queue #{queueNumber}</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Title & Step Tracker */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-accent px-3 py-0.5 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PreConsult Medical Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {t.uploadTitle}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {t.uploadSubtitle}
          </p>
        </div>

        {/* Helpful Document Types Hint */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl border border-border bg-card shadow-2xs flex flex-col items-center text-center gap-1.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-foreground">Doctor Rx</span>
            <span className="text-[11px] text-muted-foreground">Past prescriptions</span>
          </div>

          <div className="p-3 rounded-2xl border border-border bg-card shadow-2xs flex flex-col items-center text-center gap-1.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-foreground">Lab Tests</span>
            <span className="text-[11px] text-muted-foreground">Blood, urine, panels</span>
          </div>

          <div className="p-3 rounded-2xl border border-border bg-card shadow-2xs flex flex-col items-center text-center gap-1.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-foreground">Discharge Summary</span>
            <span className="text-[11px] text-muted-foreground">Hospital records</span>
          </div>

          <div className="p-3 rounded-2xl border border-border bg-card shadow-2xs flex flex-col items-center text-center gap-1.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ImageIcon className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-foreground">Scans & X-Rays</span>
            <span className="text-[11px] text-muted-foreground">Photos or PDFs</span>
          </div>
        </div>

        {/* Active Uploading / Processing Progress Card */}
        {isUploading && (
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-primary/40 bg-primary/5 shadow-md space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span>{uploadingStatusText || "Uploading medical files..."}</span>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Uploading in progress. You can add more documents right after.
                  </p>
                </div>
              </div>
              <span className="text-sm font-extrabold text-primary font-mono">
                {uploadProgress}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${Math.max(8, uploadProgress)}%` }}
              />
            </div>
          </div>
        )}

        {/* Success toast after upload */}
        {justUploadedCount && justUploadedCount > 0 && !isUploading && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {justUploadedCount === 1 ? "1 document successfully uploaded!" : `${justUploadedCount} documents successfully uploaded!`} You can upload another file below or proceed.
              </span>
            </div>
            <button
              onClick={() => setJustUploadedCount(null)}
              className="text-emerald-700 hover:text-emerald-950 text-xs underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* UploadDropzone Container */}
        <div className="bg-card border-2 border-dashed border-primary/30 rounded-3xl p-4 sm:p-6 shadow-xs relative overflow-hidden group hover:border-primary/60 transition-colors">
          <UploadDropzone
            endpoint="medicalDocumentUploader"
            appearance={{
              container: "w-full border-none p-2 sm:p-4 cursor-pointer bg-transparent",
              uploadIcon: "text-primary w-12 h-12 mb-2",
              label: "text-base font-bold text-foreground hover:text-primary transition-colors",
              allowedContent: "text-xs text-muted-foreground mt-1",
              button:
                "mt-4 px-6 py-2.5 rounded-xl font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-sm transition-transform active:scale-95",
            }}
            content={{
              label: documents.length > 0
                ? "Tap to add another file (or select multiple files together)"
                : "Tap to select 1 to 4 photos / PDFs or drag & drop here",
              allowedContent: "Supports multiple files · Images up to 16MB · PDFs up to 32MB",
              button({ ready }) {
                if (ready) {
                  return documents.length > 0 ? "+ Upload Another Document" : "Choose 1 to 4 Files";
                }
                return "Preparing Uploader...";
              },
            }}
            onUploadBegin={(fileName) => {
              setIsUploading(true);
              setUploadProgress(15);
              setJustUploadedCount(null);
              setUploadingStatusText(`Uploading "${fileName}"...`);
            }}
            onUploadProgress={(progress) => {
              setUploadProgress(progress);
              if (progress >= 100) {
                setUploadingStatusText("Finalizing upload & registering records...");
              }
            }}
            onClientUploadComplete={async (res) => {
              if (res && res.length > 0) {
                setUploadingStatusText(`Saving ${res.length} record(s) to clinical database...`);
                let savedCount = 0;
                for (const file of res) {
                  try {
                    const saved = await recordUploadedDocumentAction({
                      visitId,
                      fileUrl: file.ufsUrl || file.url,
                      fileKey: file.key,
                      fileName: file.name,
                      fileType: file.type || "application/octet-stream",
                      fileSize: file.size,
                    });
                    if (saved.success && saved.document) {
                      setDocuments((prev) => [saved.document, ...prev]);
                      savedCount++;
                    }
                  } catch (err) {
                    console.error("Error saving document to database:", err);
                  }
                }
                setJustUploadedCount(savedCount);
              }
              setIsUploading(false);
              setUploadProgress(0);
              setUploadingStatusText("");
            }}
            onUploadError={(error: Error) => {
              console.error("Upload error:", error);
              setIsUploading(false);
              setUploadProgress(0);
              setUploadingStatusText("");
              alert(`Upload error: ${error.message}`);
            }}
          />
        </div>

        {/* Uploaded Documents List */}
        {documents.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Uploaded Documents ({documents.length})</span>
              </h3>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5 text-primary" />
                <span>You can upload more above anytime</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* If actively uploading, show a shimmer placeholder in the list */}
              {isUploading && (
                <div className="p-3.5 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <UploadCloud className="w-5 h-5 animate-bounce" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-primary truncate">
                      Uploading new file...
                    </p>
                    <p className="text-[10.5px] text-muted-foreground">
                      Saving to visit records
                    </p>
                  </div>
                </div>
              )}

              {documents.map((doc) => {
                const pdf = isPdf(doc.fileType, doc.fileName);
                const isDeleting = deletingId === doc.id;
                return (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl border border-border bg-card shadow-2xs flex items-center justify-between gap-3 group hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          pdf ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"
                        }`}
                      >
                        {pdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate max-w-[180px] sm:max-w-[220px]">
                          {doc.fileName}
                        </p>
                        <div className="flex items-center gap-2 text-[10.5px] text-muted-foreground mt-0.5">
                          <span>{formatFileSize(doc.fileSize)}</span>
                          <span>·</span>
                          <span className="inline-flex items-center rounded-md bg-accent px-1.5 py-0.2 text-[9.5px] font-semibold text-primary">
                            {doc.processingStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Open Document"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={isDeleting}
                        className="p-1.5 rounded-lg border border-border hover:bg-rose-50 hover:border-rose-200 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-50"
                        title="Remove Document"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Notice Info Box */}
        <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 flex items-start gap-3 text-xs text-muted-foreground">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Your uploaded documents are securely encrypted. In the background, our AI system extracts medication dosages and past lab results to build your medical timeline for the physician.
          </p>
        </div>

        {/* Action Buttons: Submit / Skip */}
        <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={handleProceed}
            disabled={isNavigating || isUploading}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground underline underline-offset-4 cursor-pointer transition-colors disabled:opacity-50"
          >
            {t.skipForNow} &rarr;
          </button>

          <Button
            size="lg"
            onClick={handleProceed}
            disabled={isNavigating || isUploading}
            className="w-full sm:w-auto px-8 py-6 rounded-xl font-bold text-base cursor-pointer shadow-md bg-primary hover:bg-primary/90 text-primary-foreground gap-2 disabled:opacity-50"
          >
            {isNavigating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t.loading}</span>
              </>
            ) : isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t.uploadingText}</span>
              </>
            ) : (
              <>
                <span>{t.continue}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-muted-foreground py-3 border-t border-border/40">
        <span>PreConsult Clinical Intake · All medical files stored under ABDM health data guidelines</span>
      </footer>
    </div>
  );
}
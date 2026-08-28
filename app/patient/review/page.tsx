import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getOrSyncCurrentPatient } from "@/lib/auth/sync-user";
import { db } from "@/db";
import {
  clinicalHistories,
  redFlags,
  visits,
  interviewSessions,
  interviewMessages,
} from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import {
  ShieldAlert,
  Stethoscope,
  HeartPulse,
  ClipboardList,
  Pill,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  Bot,
  User,
  AlertTriangle,
} from "lucide-react";
import ConfirmReviewButton from "./confirm-button";

interface ReviewPageProps {
  searchParams: Promise<{ visit?: string; session?: string }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function asString(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function SectionCard({
  icon,
  title,
  content,
  accent = false,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  accent?: boolean;
}) {
  if (!content.trim()) return null;
  return (
    <div
      className={`rounded-2xl border p-5 space-y-2 shadow-xs ${
        accent
          ? "border-primary/20 bg-accent/40"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
        <span className="text-primary">{icon}</span>
        {title}
      </div>
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PatientReviewPage({ searchParams }: ReviewPageProps) {
  const { visit: visitId, session: sessionId } = await searchParams;

  if (!visitId || !sessionId) {
    redirect("/patient/dashboard");
  }

  const patientData = await getOrSyncCurrentPatient();
  if (!patientData) {
    redirect("/patient/login");
  }

  // ── Fetch all data in parallel ──
  const [visit, history, flags, session] = await Promise.all([
    db.query.visits.findFirst({ where: eq(visits.id, visitId) }),
    db.query.clinicalHistories.findFirst({ where: eq(clinicalHistories.visitId, visitId) }),
    db.query.redFlags.findMany({ where: eq(redFlags.visitId, visitId) }),
    db.query.interviewSessions.findFirst({ where: eq(interviewSessions.visitId, visitId) }),
  ]);

  if (!visit) redirect("/patient/dashboard");

  // Fetch Q&A messages if session exists
  const messages = session
    ? await db.query.interviewMessages.findMany({
        where: eq(interviewMessages.sessionId, session.id),
        orderBy: [asc(interviewMessages.createdAt)],
      })
    : [];

  // Pair SYSTEM questions with following PATIENT answers
  const qaPairs: { question: string; answer: string }[] = [];
  for (let i = 0; i < messages.length - 1; i++) {
    if (messages[i].sender === "SYSTEM" && messages[i + 1].sender === "PATIENT") {
      qaPairs.push({
        question: messages[i].textContent,
        answer: messages[i + 1].textContent,
      });
      i++; // skip the answer we just consumed
    }
  }

  const hasRedFlags = flags.length > 0;
  const highestSeverity = flags.reduce<string | null>((acc, f) => {
    const rank: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    if (!acc || (rank[f.severity] ?? 0) > (rank[acc] ?? 0)) return f.severity;
    return acc;
  }, null);

  // ── Summary section values ──
  const chiefComplaint = asString(history?.chiefComplaint);
  const hpi = asString(history?.hpi);
  const pastHistory = asString(history?.pastMedicalHistory);
  const medications = asString(history?.medications);
  const summaryText = history?.summaryText ?? "";

  const hasSections = [chiefComplaint, hpi, pastHistory, medications].some((s) => s.trim());

  return (
    <div className="min-h-screen bg-linear-to-b from-indigo-50/40 via-background to-background text-foreground flex flex-col">

      {/* ── Minimal Header ── */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border py-3 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/patient/dashboard" className="flex items-center gap-2.5 group">
            <Image
              src="/icon.png"
              alt="PreConsult"
              width={28}
              height={28}
              className="rounded-lg bg-indigo-600 shadow-xs"
            />
            <span className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
              PreConsult
              <span className="inline-flex items-center rounded-md bg-accent px-1.5 py-0.2 text-[10.5px] font-semibold text-primary">
                Review Summary
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Stethoscope className="w-3.5 h-3.5 text-primary" />
            <span>{visit.department}</span>
            {visit.queueNumber && (
              <>
                <span className="text-border">·</span>
                <span className="font-semibold text-foreground">Queue #{visit.queueNumber}</span>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Page heading ── */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-accent px-3 py-0.5 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step 3 of 4 · Review Your Clinical History</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Here's what was captured
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Please read through the summary below. If everything looks correct, confirm to proceed.
            If something is missing or wrong, use the link below to go back and correct it.
          </p>
        </div>

        {/* ── Red Flag Banner ── */}
        {hasRedFlags && (
          <div
            className={`rounded-2xl border p-4 flex items-start gap-3 shadow-xs ${
              highestSeverity === "CRITICAL" || highestSeverity === "HIGH"
                ? "border-rose-300 bg-rose-50/90 text-rose-950"
                : "border-amber-300 bg-amber-50/90 text-amber-950"
            }`}
          >
            <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${highestSeverity === "CRITICAL" || highestSeverity === "HIGH" ? "text-rose-600" : "text-amber-600"}`} />
            <div className="space-y-1">
              <p className="text-sm font-bold">Priority Clinical Symptom Noted</p>
              <p className="text-xs leading-relaxed">
                A high-priority symptom has been flagged in your intake. A staff member or doctor will review this promptly.
              </p>
              {flags.map((f) => (
                <p key={f.id} className="text-xs font-medium opacity-80">
                  · {f.description}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* ── Structured Summary Cards ── */}
        {hasSections ? (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              AI-Structured Clinical Summary
            </h2>

            <SectionCard
              icon={<HeartPulse className="w-4 h-4" />}
              title="Chief Complaint"
              content={chiefComplaint}
              accent
            />
            <SectionCard
              icon={<ClipboardList className="w-4 h-4" />}
              title="History of Present Illness"
              content={hpi}
            />
            <SectionCard
              icon={<AlertTriangle className="w-4 h-4" />}
              title="Past Medical History"
              content={pastHistory}
            />
            <SectionCard
              icon={<Pill className="w-4 h-4" />}
              title="Medications & Allergies"
              content={medications}
            />

            {summaryText && (
              <div className="rounded-2xl border border-border bg-secondary/30 p-5 space-y-1.5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Full Summary
                </p>
                <p className="text-sm text-foreground leading-relaxed">{summaryText}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/20 p-8 text-center space-y-2">
            <ClipboardList className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold text-foreground">Summary is being processed</p>
            <p className="text-xs text-muted-foreground">
              Your answers are being structured. You can still confirm and proceed.
            </p>
          </div>
        )}

        {/* ── Raw Q&A Transcript ── */}
        {qaPairs.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Your Full Conversation ({qaPairs.length} questions)
              </h2>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {qaPairs.map((pair, idx) => (
                <div key={idx} className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-2xs">
                  {/* Question */}
                  <div className="flex gap-2.5 items-start">
                    <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs sm:text-sm text-foreground leading-relaxed font-medium">
                      {pair.question}
                    </p>
                  </div>
                  {/* Answer */}
                  <div className="flex gap-2.5 items-start pl-3 border-l-2 border-primary/20 ml-3.5">
                    <div className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                      {pair.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Confirm / Correct Actions ── */}
        <div className="pt-2 border-t border-border/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
            {/* Disclaimer */}
            <div className="flex items-start gap-2 text-xs text-muted-foreground max-w-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                By confirming, you acknowledge that the above information represents your reported
                history. Your doctor will review and verify all clinical decisions.
              </span>
            </div>

            <ConfirmReviewButton visitId={visitId} sessionId={sessionId} />
          </div>
        </div>
      </main>

      <footer className="text-center text-[11px] text-muted-foreground py-3 border-t border-border/40">
        <span>PreConsult Clinical Intake · All diagnoses finalized by your attending doctor</span>
      </footer>
    </div>
  );
}
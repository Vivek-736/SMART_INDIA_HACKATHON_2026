import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getOrSyncCurrentPatient } from "@/lib/auth/sync-user";
import { db } from "@/db";
import { visits, redFlags, medicalDocuments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  CheckCircle2,
  ArrowRight,
  Clock,
  ShieldAlert,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompletePageProps {
  searchParams: Promise<{ visit?: string; session?: string }>;
}

export default async function PatientCompletePage({ searchParams }: CompletePageProps) {
  const { visit: visitId } = await searchParams;

  const patientData = await getOrSyncCurrentPatient();
  if (!patientData) {
    redirect("/patient/login");
  }

  const { user, patient } = patientData;

  // 1. Fetch active visit
  let visit = null;
  if (visitId) {
    visit = await db.query.visits.findFirst({
      where: eq(visits.id, visitId),
    });
  }

  if (!visit) {
    visit = await db.query.visits.findFirst({
      where: eq(visits.patientId, patient.id),
      orderBy: [desc(visits.createdAt)],
    });
  }

  if (!visit) {
    redirect("/patient/dashboard");
  }

  // 2. Fetch summary count & red flags
  const [flags, docs] = await Promise.all([
    db.query.redFlags.findMany({ where: eq(redFlags.visitId, visit.id) }),
    db.query.medicalDocuments.findMany({ where: eq(medicalDocuments.visitId, visit.id) }),
  ]);

  const hasRedFlags = flags.length > 0;

  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-50/50 via-background to-background text-foreground flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <header className="max-w-3xl mx-auto w-full flex items-center justify-between pb-6 border-b border-border/60">
        <Link href="/patient/dashboard" className="flex items-center gap-2.5 group">
          <Image
            src="/icon.png"
            alt="PreConsult Logo"
            width={32}
            height={32}
            className="rounded-lg bg-indigo-600 shadow-xs"
          />
          <span className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
            PreConsult
            <span className="inline-flex items-center rounded-md bg-emerald-100 px-1.5 py-0.2 text-[10.5px] font-semibold text-emerald-700">
              Intake Complete
            </span>
          </span>
        </Link>
      </header>

      {/* Main Success Container */}
      <main className="max-w-2xl mx-auto w-full my-auto py-8 space-y-6 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 border-2 border-emerald-500/30 text-emerald-600 flex items-center justify-center mx-auto shadow-lg animate-fade-in">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Registration & History Confirmed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            You&apos;re All Set for Consultation!
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Your clinical intake and uploaded records have been organized into a structured briefing for the attending physician.
          </p>
        </div>

        {/* Priority / Red Flag Alert Notice if applicable */}
        {hasRedFlags && (
          <div className="rounded-2xl border border-rose-300 bg-rose-50/90 text-rose-950 p-4 text-left flex items-start gap-3 shadow-xs">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-rose-900">Priority Clinical Triage Alert</p>
              <p className="text-rose-800">
                A high-risk symptom was recorded during intake. Your token has been flagged for prioritized physician attention.
              </p>
            </div>
          </div>
        )}

        {/* OPD Queue Pass Ticket */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-md text-left space-y-5 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Today&apos;s OPD Queue Token
              </span>
              <p className="text-xs font-semibold text-foreground">
                {visit.department} OPD
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary">
                #{visit.queueNumber || "A-12"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-secondary/40 rounded-2xl p-4 border border-border/50 text-xs">
            <div>
              <span className="text-[10.5px] text-muted-foreground block">Patient Name</span>
              <span className="font-bold text-foreground">
                {user.firstName || "Patient"}
              </span>
            </div>

            <div>
              <span className="text-[10.5px] text-muted-foreground block">UHID / ABHA</span>
              <span className="font-mono font-medium text-foreground">
                {patient.uhid || "ABHA-092"}
              </span>
            </div>

            <div>
              <span className="text-[10.5px] text-muted-foreground block">Priority Level</span>
              <span className="font-bold text-foreground capitalize">
                {visit.priority.toLowerCase()}
              </span>
            </div>

            <div>
              <span className="text-[10.5px] text-muted-foreground block">Documents</span>
              <span className="font-bold text-foreground">
                {docs.length} uploaded
              </span>
            </div>
          </div>

          {/* Next Steps Guidance */}
          <div className="space-y-2 pt-1 text-xs text-muted-foreground">
            <h4 className="font-bold text-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>What to do next:</span>
            </h4>
            <ul className="space-y-1.5 pl-5 list-disc text-muted-foreground">
              <li>Please proceed to the OPD waiting area outside the consultation rooms.</li>
              <li>Keep your mobile device available; the display screen will alert you when your queue token #{visit.queueNumber || "A-12"} is ready.</li>
              <li>Your doctor will have your entire structured history and uploaded documents pre-loaded.</li>
            </ul>
          </div>
        </div>

        {/* Action Button: Return to Dashboard */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/patient/dashboard" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto px-8 py-6 rounded-xl font-bold text-base cursor-pointer shadow-md bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Go to Patient Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-muted-foreground py-3 border-t border-border/40">
        <span>PreConsult Platform · High-Throughput Indian Hospital & AYUSH Intake Engine</span>
      </footer>
    </div>
  );
}
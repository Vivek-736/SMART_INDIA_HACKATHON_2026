import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { getOrSyncCurrentPatient } from "@/lib/auth/sync-user";
import { db } from "@/db";
import { visits, medicalDocuments, clinicalHistories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { 
  HeartPulse, 
  ArrowRight, 
  FileText, 
  UploadCloud, 
  Sparkles, 
  Clock, 
  ShieldCheck,
  UserCheck,
  Stethoscope,
  FolderOpen,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function PatientDashboardPage() {
  const patientData = await getOrSyncCurrentPatient();

  if (!patientData) {
    redirect("/patient/login");
  }

  const { user, patient } = patientData;

  // 1. Fetch current/latest visit
  const latestVisit = await db.query.visits.findFirst({
    where: eq(visits.patientId, patient.id),
    orderBy: [desc(visits.createdAt)],
  });

  // 2. Fetch uploaded documents count & recent files
  const patientDocs = await db.query.medicalDocuments.findMany({
    where: eq(medicalDocuments.patientId, patient.id),
    orderBy: [desc(medicalDocuments.uploadedAt)],
    limit: 4,
  });

  // 3. Fetch past completed histories
  const pastHistories = await db.query.clinicalHistories.findMany({
    where: eq(clinicalHistories.patientId, patient.id),
    orderBy: [desc(clinicalHistories.createdAt)],
    limit: 3,
  });

  // If the patient has no prior visits, no intake history, and no uploaded documents, redirect to /patient/consent
  if (!latestVisit && patientDocs.length === 0 && pastHistories.length === 0) {
    redirect("/patient/consent");
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "READY_FOR_DOCTOR":
        return { label: "Ready for Doctor", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "INTAKE_IN_PROGRESS":
        return { label: "Intake in Progress", color: "bg-amber-50 text-amber-700 border-amber-200" };
      case "IN_CONSULTATION":
        return { label: "In Consultation", color: "bg-indigo-50 text-indigo-700 border-indigo-200" };
      case "COMPLETED":
        return { label: "Visit Completed", color: "bg-slate-50 text-slate-700 border-slate-200" };
      default:
        return { label: "Waiting / Queued", color: "bg-blue-50 text-blue-700 border-blue-200" };
    }
  };

  return (
    <div className="flex flex-col">
      {/* ── Dashboard Header ── */}
      <header className="border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-40 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/patient/dashboard" className="flex items-center gap-3">
              <Image
                src="/icon.png"
                alt="PreConsult Logo"
                width={32}
                height={32}
                className="rounded-lg bg-indigo-600 shadow-xs"
                priority
              />
              <span className="text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
                PreConsult
                <span className="inline-flex items-center rounded-md bg-accent px-1.5 py-0.2 text-[11px] font-semibold text-primary">
                  Patient
                </span>
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/patient/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-primary transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-secondary text-xs text-secondary-foreground font-medium">
              <Stethoscope className="w-3.5 h-3.5 text-primary" />
              <span>OPD Active</span>
            </div>
            <UserButton
              afterSignOutUrl="/patient/login"
              appearance={{
                elements: { avatarBox: "w-9 h-9 ring-1 ring-border rounded-full" },
              }}
            />
          </div>
        </div>
      </header>

      {/* ── Dashboard Content ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Welcome, {user.firstName || "Patient"}
            </h1>
            <span className="inline-flex items-center rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-primary">
              Verified
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            UHID: <span className="font-mono font-medium text-foreground">{patient.uhid}</span> &bull; Preferred Language:{" "}
            <span className="capitalize font-medium text-foreground">{patient.languagePreference}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/patient/consent">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10 px-4 font-semibold shadow-xs">
              <Sparkles className="w-4 h-4" />
              <span>Start New Intake</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Active Visit & Stepper Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Active Visit Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-accent text-primary flex items-center justify-center">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Today&apos;s OPD Visit</h2>
                  <p className="text-xs text-muted-foreground">Current consultation queue & status</p>
                </div>
              </div>

              {latestVisit ? (
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    getStatusBadge(latestVisit.status).color
                  }`}
                >
                  {getStatusBadge(latestVisit.status).label}
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-secondary text-secondary-foreground">
                  No Active Visit
                </span>
              )}
            </div>

            {latestVisit ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-secondary/50 rounded-xl p-4 border border-border/50">
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Queue No.</span>
                    <span className="text-lg font-extrabold text-foreground">
                      #{latestVisit.queueNumber || 1}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Department</span>
                    <span className="text-sm font-semibold text-foreground">{latestVisit.department}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Priority</span>
                    <span className="text-sm font-semibold text-foreground capitalize">
                      {latestVisit.priority.toLowerCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Intake Mode</span>
                    <span className="text-sm font-semibold text-foreground">
                      {latestVisit.isKiosk ? "Kiosk Station" : "Online Mobile"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    Last updated {new Date(latestVisit.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <Link href="/patient/consent">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border hover:border-primary">
                      <span>Resume / Review Intake</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3 bg-secondary/30 rounded-xl border border-dashed border-border p-6">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto" />
                <h3 className="text-base font-bold text-foreground">No active consultation in progress</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Begin your guided clinical intake before meeting your doctor. Your responses will be structured into a clinical summary for the physician.
                </p>
                <div className="pt-2">
                  <Link href="/patient/consent">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-9">
                      Launch Clinical Intake
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 4-Step Intake Process Tracker */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>How PreConsult Intake Works</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl border border-border bg-background space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">01</span>
                  <ShieldCheck className="w-4 h-4 text-primary" />
                </div>
                <h4 className="text-xs font-bold text-foreground">Consent & Language</h4>
                <p className="text-[11px] text-muted-foreground">Choose regional language and audio prompts.</p>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">02</span>
                  <HeartPulse className="w-4 h-4 text-primary" />
                </div>
                <h4 className="text-xs font-bold text-foreground">Adaptive Questions</h4>
                <p className="text-[11px] text-muted-foreground">Answer symptoms via voice or touch.</p>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">03</span>
                  <UploadCloud className="w-4 h-4 text-primary" />
                </div>
                <h4 className="text-xs font-bold text-foreground">Upload Reports</h4>
                <p className="text-[11px] text-muted-foreground">Attach prior prescriptions and lab tests.</p>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">04</span>
                  <Stethoscope className="w-4 h-4 text-primary" />
                </div>
                <h4 className="text-xs font-bold text-foreground">Doctor Consultation</h4>
                <p className="text-[11px] text-muted-foreground">Doctor receives verified structured history.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Documents & Past Records */}
        <div className="space-y-6">
          {/* Medical Documents Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Medical Records</h3>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {patientDocs.length} files
                </span>
              </div>

              {patientDocs.length > 0 ? (
                <div className="space-y-2.5">
                  {patientDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-2.5 rounded-xl border border-border bg-secondary/30 flex items-center justify-between text-xs"
                    >
                      <div className="truncate mr-2">
                        <span className="font-medium text-foreground block truncate">{doc.fileName}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-accent text-primary">
                        {doc.processingStatus}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-border rounded-xl">
                  <FolderOpen className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                  <p className="text-xs text-muted-foreground">No documents uploaded yet</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border mt-4">
              <Link href="/patient/documents" className="w-full block">
                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 border-border hover:border-primary">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Prescriptions / Labs</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Past History Snippet */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Past Summaries</h3>
              </div>
            </div>
            {pastHistories.length > 0 ? (
              <div className="space-y-2.5">
                {pastHistories.map((hist) => (
                  <div key={hist.id} className="p-3 rounded-xl border border-border bg-secondary/20 space-y-1">
                    <span className="text-[11px] font-bold text-foreground block">
                      {hist.summaryText?.slice(0, 50) || "Intake Record"}...
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Confirmed: {new Date(hist.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-2 leading-relaxed">
                Completed intakes will appear here for you to reference before follow-ups.
              </p>
            )}
          </div>
        </div>
        </div>
      </div>
      </main>
    </div>
  );
}
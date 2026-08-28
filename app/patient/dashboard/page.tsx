import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { getOrSyncCurrentPatient } from "@/lib/auth/sync-user";
import { db } from "@/db";
import {
  visits,
  medicalDocuments,
  clinicalHistories,
  doctorReviews,
  prescriptions as prescriptionsTable,
  doctors,
  users,
} from "@/db/schema";
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
  LayoutDashboard,
  Pill,
  CheckCircle2,
  Calendar,
  FileSignature,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PrescriptionAudioPlayer from "@/components/patient/prescription-audio-player";

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

  // 2. Fetch Doctor Review if visit is completed
  let completedDoctorReview: typeof doctorReviews.$inferSelect | null = null;
  let attendingPhysicianName = "Attending Physician";
  let attendingDoctorRoom = "OPD Room 104";
  let reviewPrescriptions: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string | null;
  }> = [];
  let parsedDiagnosis = "";
  let parsedFollowUp = "";

  if (latestVisit) {
    const review = await db.query.doctorReviews.findFirst({
      where: eq(doctorReviews.visitId, latestVisit.id),
    });

    if (review) {
      completedDoctorReview = review;

      if (review.finalDiagnosis) {
        if (typeof review.finalDiagnosis === "string") {
          parsedDiagnosis = review.finalDiagnosis;
        } else if (typeof review.finalDiagnosis === "object") {
          const fd = review.finalDiagnosis as Record<string, string>;
          parsedDiagnosis = fd.primary || "";
          parsedFollowUp = fd.followUpDate || "";
        }
      }

      if (review.doctorId) {
        const docRow = await db.query.doctors.findFirst({
          where: eq(doctors.id, review.doctorId),
        });
        if (docRow) {
          attendingDoctorRoom = docRow.roomNumber || "OPD Room 104";
          const docUser = await db.query.users.findFirst({
            where: eq(users.id, docRow.userId),
          });
          if (docUser) {
            attendingPhysicianName = [docUser.firstName, docUser.lastName].filter(Boolean).join(" ") || "Physician";
          }
        }
      }

      const dbPrescriptions = await db.query.prescriptions.findMany({
        where: eq(prescriptionsTable.visitId, latestVisit.id),
      });

      reviewPrescriptions = dbPrescriptions.map((p) => ({
        medicineName: p.medicationName,
        dosage: p.dosage,
        frequency: p.frequency,
        duration: p.duration,
        instructions: p.instructions,
      }));
    }
  }

  // 3. Fetch uploaded documents count & recent files
  const patientDocs = await db.query.medicalDocuments.findMany({
    where: eq(medicalDocuments.patientId, patient.id),
    orderBy: [desc(medicalDocuments.uploadedAt)],
    limit: 4,
  });

  // 4. Fetch past completed histories
  const pastHistories = await db.query.clinicalHistories.findMany({
    where: eq(clinicalHistories.patientId, patient.id),
    orderBy: [desc(clinicalHistories.createdAt)],
    limit: 3,
  });

  // If patient has no prior visits, no intake history, and no uploaded documents, redirect to /patient/consent
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
        return { label: "In Active Consultation", color: "bg-indigo-50 text-indigo-700 border-indigo-200" };
      case "COMPLETED":
        return { label: "Consultation Completed", color: "bg-emerald-50 text-emerald-700 border-emerald-300" };
      default:
        return { label: "Waiting in Queue", color: "bg-blue-50 text-blue-700 border-blue-200" };
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
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
                  Patient Portal
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
              <span>OPD Online</span>
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
          {/* Greeting Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  Welcome, {user.firstName || "Patient"}
                </h1>
                <span className="inline-flex items-center rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-primary">
                  Verified Patient
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                UHID: <span className="font-mono font-medium text-foreground">{patient.uhid || "PENDING"}</span> &bull; Preferred Language:{" "}
                <span className="capitalize font-medium text-foreground">{patient.languagePreference}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/patient/consent">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10 px-5 font-semibold shadow-xs cursor-pointer">
                  <Sparkles className="w-4 h-4" />
                  <span>Start New Intake</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Active Visit Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (2 Cols): Active Visit or Finalized Prescription */}
            <div className="lg:col-span-2 space-y-6">
              {/* Doctor Review / Prescription Card if Visit is COMPLETED */}
              {latestVisit?.status === "COMPLETED" && completedDoctorReview ? (
                <div className="bg-card border-2 border-emerald-300 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5 bg-linear-to-br from-emerald-50/30 via-card to-card">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-2xs">
                        <FileSignature className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-foreground">
                            Doctor&apos;s Prescription & Advice
                          </h2>
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Signed by Dr. {attendingPhysicianName}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {attendingDoctorRoom} &bull; Consulted on {new Date(completedDoctorReview.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/api/fhir/export?visitId=${latestVisit.id}`}
                        download
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-bold text-xs shadow-2xs hover:bg-emerald-50 transition-colors cursor-pointer"
                        title="Download standard ABDM FHIR R4 interoperable health record"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Download ABDM / FHIR Record</span>
                      </a>
                    </div>
                  </div>

                  {/* Spoken Prescription & Audio Guidance with Language Selector */}
                  <PrescriptionAudioPlayer
                    diagnosis={parsedDiagnosis}
                    prescriptions={reviewPrescriptions}
                    doctorNotes={completedDoctorReview.doctorNotes}
                    followUpDate={parsedFollowUp || null}
                    defaultLanguage={patient.languagePreference || "en"}
                  />

                  {/* Confirmed Diagnosis */}
                  {parsedDiagnosis && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-xs">
                      <span className="text-emerald-900 font-bold block mb-0.5 text-[11px] uppercase tracking-wide">
                        Confirmed Clinical Diagnosis:
                      </span>
                      <p className="text-sm font-extrabold text-emerald-950">
                        {parsedDiagnosis}
                      </p>
                    </div>
                  )}

                  {/* Prescribed Medications Table */}
                  {reviewPrescriptions.length > 0 && (
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-primary" />
                        <span>Prescribed Medications (Rx)</span>
                      </h3>

                      <div className="space-y-2">
                        {reviewPrescriptions.map((med, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-secondary/40 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <div>
                              <span className="font-extrabold text-foreground text-sm">
                                {med.medicineName}
                              </span>
                              <p className="text-muted-foreground text-[11px] pt-0.5">
                                {[med.dosage, med.instructions].filter(Boolean).join(" &bull; ")}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold text-xs">
                                {med.frequency}
                              </span>
                              {med.duration && (
                                <span className="px-2.5 py-1 rounded-lg bg-secondary text-foreground font-semibold text-xs">
                                  {med.duration}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Doctor Notes & Advice */}
                  {completedDoctorReview.doctorNotes && (
                    <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/70 text-xs space-y-1">
                      <span className="font-bold text-foreground block">
                        Physician Advice & Lifestyle Notes:
                      </span>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {completedDoctorReview.doctorNotes}
                      </p>
                    </div>
                  )}

                  {/* Follow-up reminder */}
                  {parsedFollowUp && (
                    <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-indigo-900 font-semibold">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>Recommended Follow-up Visit:</span>
                      </div>
                      <span className="font-mono font-bold text-indigo-950">
                        {new Date(parsedFollowUp).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* Ongoing or Active Visit Card */
                <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-accent text-primary flex items-center justify-center">
                        <HeartPulse className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-foreground">Today&apos;s OPD Visit</h2>
                        <p className="text-xs text-muted-foreground">Current consultation queue & status</p>
                      </div>
                    </div>

                    {latestVisit ? (
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                          getStatusBadge(latestVisit.status).color
                        }`}
                      >
                        {getStatusBadge(latestVisit.status).label}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-secondary text-secondary-foreground">
                        No Active Visit
                      </span>
                    )}
                  </div>

                  {latestVisit ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-secondary/50 rounded-2xl p-4 border border-border/50">
                        <div>
                          <span className="text-[11px] text-muted-foreground block">Queue No.</span>
                          <span className="text-xl font-extrabold text-foreground font-mono">
                            #{latestVisit.queueNumber || 1}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-muted-foreground block">Department</span>
                          <span className="text-xs font-bold text-foreground">{latestVisit.department}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-muted-foreground block">Priority</span>
                          <span className="text-xs font-bold text-foreground capitalize">
                            {latestVisit.priority.toLowerCase()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-muted-foreground block">Intake Mode</span>
                          <span className="text-xs font-bold text-foreground">
                            {latestVisit.isKiosk ? "Kiosk Station" : "Online Intake"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <p className="text-xs text-muted-foreground">
                          Last updated {new Date(latestVisit.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <Link href="/patient/consent">
                          <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-xl border-border hover:border-primary cursor-pointer">
                            <span>Resume / Review Intake</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 space-y-3 bg-secondary/30 rounded-2xl border border-dashed border-border p-6">
                      <Clock className="w-8 h-8 text-muted-foreground mx-auto" />
                      <h3 className="text-base font-bold text-foreground">No active consultation in progress</h3>
                      <p className="text-xs text-muted-foreground max-w-md mx-auto">
                        Begin your guided clinical intake before meeting your doctor. Your responses will be structured into a clinical summary for the physician.
                      </p>
                      <div className="pt-2">
                        <Link href="/patient/consent">
                          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-9 rounded-xl cursor-pointer">
                            Launch Clinical Intake
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4-Step Intake Process Tracker */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-xs">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>How PreConsult Intake Works</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl border border-border bg-background space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">01</span>
                      <ShieldCheck className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="text-xs font-bold text-foreground">Consent & Language</h4>
                    <p className="text-[11px] text-muted-foreground">Choose regional language and audio prompts.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-border bg-background space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">02</span>
                      <HeartPulse className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="text-xs font-bold text-foreground">Adaptive Questions</h4>
                    <p className="text-[11px] text-muted-foreground">Answer symptoms via voice or touch.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-border bg-background space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">03</span>
                      <UploadCloud className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="text-xs font-bold text-foreground">Upload Reports</h4>
                    <p className="text-[11px] text-muted-foreground">Attach prior prescriptions and lab tests.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-border bg-background space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">04</span>
                      <Stethoscope className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="text-xs font-bold text-foreground">Doctor Consultation</h4>
                    <p className="text-[11px] text-muted-foreground">Doctor reviews history & issues digital Rx.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (1 Col): Documents & Past Records */}
            <div className="space-y-6">
              {/* Medical Documents Card */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col justify-between">
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
                          className="p-3 rounded-2xl border border-border bg-secondary/30 flex items-center justify-between text-xs"
                        >
                          <div className="truncate mr-2">
                            <span className="font-medium text-foreground block truncate">{doc.fileName}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-accent text-primary">
                            {doc.processingStatus}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed border-border rounded-2xl">
                      <FolderOpen className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                      <p className="text-xs text-muted-foreground">No documents uploaded yet</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border mt-4">
                  <Link href="/patient/documents" className="w-full block">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 rounded-xl border-border hover:border-primary cursor-pointer">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload Prescriptions / Labs</span>
                    </Button>
                  </Link>
                </div>
              </div>
              {/* Past History Snippet */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">Past Summaries</h3>
                  </div>
                </div>
                {pastHistories.length > 0 ? (
                  <div className="space-y-2.5">
                    {pastHistories.map((hist) => (
                      <div key={hist.id} className="p-3 rounded-2xl border border-border bg-secondary/20 space-y-1">
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
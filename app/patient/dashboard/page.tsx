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
  Stethoscope,
  LayoutDashboard,
  Pill,
  CheckCircle2,
  Calendar,
  FileSignature,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PrescriptionAudioPlayer from "@/components/patient/prescription-audio-player";
import PatientLanguageSwitcher from "@/components/patient/patient-language-switcher";
import { getPatientTranslations } from "@/lib/i18n/patient-translations";

export default async function PatientDashboardPage() {
  const patientData = await getOrSyncCurrentPatient();

  if (!patientData) {
    redirect("/patient/login");
  }

  const { user, patient } = patientData;
  const lang = patient.languagePreference || "en";
  const t = getPatientTranslations(lang);

  // 1. Fetch Current Active Visit
  const [latestVisit] = await db.query.visits.findMany({
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
        return { label: t.waitingForDoctor, color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "INTAKE_IN_PROGRESS":
        return { label: t.activeVisit, color: "bg-amber-50 text-amber-700 border-amber-200" };
      case "IN_CONSULTATION":
        return { label: t.inConsultation, color: "bg-indigo-50 text-indigo-700 border-indigo-200" };
      case "COMPLETED":
        return { label: t.prescriptionReady, color: "bg-emerald-50 text-emerald-700 border-emerald-300" };
      default:
        return { label: t.waitingForDoctor, color: "bg-blue-50 text-blue-700 border-blue-200" };
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
                  {t.patientPortal}
                </span>
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/patient/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-primary transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{t.myHealthDashboard}</span>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Switcher Dropdown */}
            <PatientLanguageSwitcher currentLanguage={lang} />

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
                  {t.welcomeBack}, {user.firstName || "Patient"}
                </h1>
                <span className="inline-flex items-center rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-primary">
                  Verified Patient
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t.uhid}: <span className="font-mono font-medium text-foreground">{patient.uhid || "PENDING"}</span> &bull; {t.language}:{" "}
                <span className="capitalize font-medium text-foreground">{lang.toUpperCase()}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/patient/consent">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10 px-5 font-semibold shadow-xs cursor-pointer">
                  <Sparkles className="w-4 h-4" />
                  <span>{t.startNewIntake}</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (2 Cols): Active Visit & Medical History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Completed Consultation Prescription Card */}
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
                            {t.doctorPrescriptionAndAdvice}
                          </h2>
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {t.signedBy} Dr. {attendingPhysicianName}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {attendingDoctorRoom} &bull; {new Date(completedDoctorReview.createdAt).toLocaleDateString()}
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
                        <span>{t.downloadFhir}</span>
                      </a>
                    </div>
                  </div>

                  {/* Spoken Prescription & Audio Guidance with Language Selector */}
                  <PrescriptionAudioPlayer
                    diagnosis={parsedDiagnosis}
                    prescriptions={reviewPrescriptions}
                    doctorNotes={completedDoctorReview.doctorNotes}
                    followUpDate={parsedFollowUp || null}
                    defaultLanguage={lang}
                  />

                  {/* Confirmed Diagnosis */}
                  {parsedDiagnosis && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-xs">
                      <span className="text-emerald-900 font-bold block mb-0.5 text-[11px] uppercase tracking-wide">
                        {t.confirmedDiagnosis}:
                      </span>
                      <p className="text-sm font-extrabold text-emerald-950">
                        {parsedDiagnosis}
                      </p>
                    </div>
                  )}

                  {/* Prescribed Medications Table */}
                  {reviewPrescriptions.length > 0 && (
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                        <Pill className="w-3.5 h-3.5 text-primary" />
                        <span>{t.prescribedMedications}</span>
                      </h3>
                      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-secondary/60 text-muted-foreground font-semibold text-[11px] uppercase border-b border-border">
                            <tr>
                              <th className="py-2.5 px-3.5">Medicine</th>
                              <th className="py-2.5 px-3">Frequency</th>
                              <th className="py-2.5 px-3">Duration</th>
                              <th className="py-2.5 px-3">Instructions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {reviewPrescriptions.map((p, idx) => (
                              <tr key={idx} className="hover:bg-secondary/30 transition-colors">
                                <td className="py-2.5 px-3.5 font-bold text-foreground">
                                  {p.medicineName}
                                  {p.dosage && (
                                    <span className="text-[11px] font-normal text-muted-foreground ml-1.5">
                                      ({p.dosage})
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 font-semibold text-primary">{p.frequency}</td>
                                <td className="py-2.5 px-3 text-muted-foreground">{p.duration}</td>
                                <td className="py-2.5 px-3 text-muted-foreground">{p.instructions || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Doctor Notes & Advice */}
                  {completedDoctorReview.doctorNotes && (
                    <div className="p-4 rounded-2xl bg-secondary/40 border border-border text-xs space-y-1">
                      <span className="font-bold text-foreground block text-[11px] uppercase tracking-wide">
                        {t.doctorAdviceNotes}:
                      </span>
                      <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {completedDoctorReview.doctorNotes}
                      </p>
                    </div>
                  )}

                  {/* Follow-up Note */}
                  {parsedFollowUp && (
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 px-3.5 py-2.5 rounded-xl border border-emerald-200">
                      <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {t.followUpVisit}: <strong>{new Date(parsedFollowUp).toLocaleDateString()}</strong>
                      </span>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Ongoing Active Visit Card (If not completed) */}
              {latestVisit && latestVisit.status !== "COMPLETED" && (
                <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-foreground">
                          {t.activeVisit}
                        </h2>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${getStatusBadge(latestVisit.status).color}`}
                        >
                          {getStatusBadge(latestVisit.status).label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t.tokenNumber}: <strong className="text-foreground">#{latestVisit.queueNumber || 1}</strong> &bull; Dept:{" "}
                        <strong className="text-foreground">{latestVisit.department}</strong>
                      </p>
                    </div>

                    <div>
                      {latestVisit.status === "INTAKE_IN_PROGRESS" && (
                        <Link href="/patient/interview">
                          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 h-9 rounded-xl font-semibold cursor-pointer">
                            <span>{t.resumeIntake}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Step Progress Tracker */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                      {t.visitTimeline}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {/* Step 1: Consent */}
                      <div className="p-3.5 rounded-2xl bg-secondary/70 border border-border/80 text-left space-y-1">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold mb-1">
                          ✓
                        </div>
                        <span className="text-xs font-bold text-foreground block">1. Consent</span>
                        <p className="text-[11px] text-muted-foreground">Language & terms agreed</p>
                      </div>

                      {/* Step 2: Intake */}
                      <div className={`p-3.5 rounded-2xl border text-left space-y-1 ${latestVisit.status !== "INTAKE_IN_PROGRESS" ? "bg-secondary/70 border-border/80" : "bg-primary/5 border-primary/30"}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${latestVisit.status !== "INTAKE_IN_PROGRESS" ? "bg-emerald-100 text-emerald-800" : "bg-primary text-primary-foreground"}`}>
                          {latestVisit.status !== "INTAKE_IN_PROGRESS" ? "✓" : "2"}
                        </div>
                        <span className="text-xs font-bold text-foreground block">2. Intake</span>
                        <p className="text-[11px] text-muted-foreground">Symptoms & history</p>
                      </div>

                      {/* Step 3: Documents */}
                      <div className={`p-3.5 rounded-2xl border text-left space-y-1 ${latestVisit.status === "READY_FOR_DOCTOR" || latestVisit.status === "IN_CONSULTATION" ? "bg-secondary/70 border-border/80" : "bg-card border-border/50 opacity-75"}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${patientDocs.length > 0 ? "bg-emerald-100 text-emerald-800" : "bg-secondary text-foreground"}`}>
                          {patientDocs.length > 0 ? "✓" : "3"}
                        </div>
                        <span className="text-xs font-bold text-foreground block">3. Documents</span>
                        <p className="text-[11px] text-muted-foreground">{patientDocs.length} files attached</p>
                      </div>

                      {/* Step 4: Doctor */}
                      <div className={`p-3.5 rounded-2xl border text-left space-y-1 ${latestVisit.status === "IN_CONSULTATION" ? "bg-secondary/70 border-border/80" : "bg-card border-border/50 opacity-75"}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${latestVisit.status === "IN_CONSULTATION" ? "bg-emerald-100 text-emerald-800" : "bg-secondary text-foreground"}`}>
                          {latestVisit.status === "IN_CONSULTATION" ? "✓" : "4"}
                        </div>
                        <span className="text-xs font-bold text-foreground block">4. Doctor</span>
                        <p className="text-[11px] text-muted-foreground">Consultation & Rx</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Steps Prompt */}
              <div className="bg-secondary/40 border border-border/80 rounded-3xl p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">How PreConsult Works</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Completing your pre-consultation intake allows the doctor to review your medical history and previous reports in structured form before you step into the consultation room, saving you valuable time.
                </p>
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
                      <h3 className="text-sm font-bold text-foreground">{t.medicalRecords}</h3>
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
                          className="flex items-center justify-between p-3 rounded-2xl bg-secondary/50 border border-border/70 text-xs"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <FileText className="w-4 h-4 text-primary shrink-0" />
                            <span className="truncate font-medium text-foreground">{doc.fileName}</span>
                          </div>
                          <span className="text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                            {doc.processingStatus}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground py-4 text-center">
                      {t.noRecordsYet}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-border mt-4">
                  <Link href="/patient/documents">
                    <Button variant="outline" size="sm" className="w-full justify-center gap-2 rounded-xl text-xs font-semibold cursor-pointer">
                      <UploadCloud className="w-4 h-4 text-primary" />
                      <span>{t.uploadNewRecord}</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Past History Snippet */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">{t.pastConsultations}</h3>
                  </div>
                </div>

                {pastHistories.length > 0 ? (
                  <div className="space-y-3">
                    {pastHistories.map((h) => (
                      <div key={h.id} className="p-3 rounded-2xl bg-secondary/40 border border-border/60 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">
                            {typeof h.chiefComplaint === "string" ? h.chiefComplaint : "Consultation Intake"}
                          </span>
                          <span className="text-[10.5px] text-muted-foreground">
                            {new Date(h.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {h.summaryText || "Structured pre-consultation summary recorded."}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No past consultation records.
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
import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrSyncCurrentPatient } from "@/lib/auth/sync-user";
import { db } from "@/db";
import {
  visits,
  clinicalHistories,
  doctorReviews,
  medicalDocuments,
  prescriptions as prescriptionsTable,
  doctors,
  users,
} from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import {
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Pill,
  ArrowRight,
  Sparkles,
  Download,
  Building2,
  Stethoscope,
  Activity,
  History,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PrescriptionAudioPlayer from "@/components/patient/prescription-audio-player";
import { getPatientTranslations, SupportedLanguage } from "@/lib/i18n/patient-translations";
import PatientLanguageSwitcher from "@/components/patient/patient-language-switcher";

export default async function PatientDashboardPage() {
  const patientData = await getOrSyncCurrentPatient();

  if (!patientData) {
    redirect("/patient/login");
  }

  const { patient, user } = patientData;
  const lang = (patient.languagePreference || "en") as SupportedLanguage;
  const t = getPatientTranslations(lang);

  // 1. Fetch latest visit & all patient visits
  const patientVisits = await db.query.visits.findMany({
    where: eq(visits.patientId, patient.id),
    orderBy: [desc(visits.createdAt)],
  });

  const latestVisit = patientVisits[0] || null;

  // 2. Fetch Doctor Review if latest visit or any prior visit is completed
  let completedDoctorReview: typeof doctorReviews.$inferSelect | null = null;
  let reviewVisitId: string | null = null;
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
      reviewVisitId = latestVisit.id;
    }
  }

  // Fallback: check if there is any completed doctor review across patient's past visits
  if (!completedDoctorReview && patientVisits.length > 0) {
    const pastVisitIds = patientVisits.map((v) => v.id);
    const pastReview = await db.query.doctorReviews.findFirst({
      where: inArray(doctorReviews.visitId, pastVisitIds),
      orderBy: [desc(doctorReviews.signedAt)],
    });
    if (pastReview) {
      completedDoctorReview = pastReview;
      reviewVisitId = pastReview.visitId;
    }
  }

  if (completedDoctorReview && reviewVisitId) {
    if (completedDoctorReview.finalDiagnosis) {
      if (typeof completedDoctorReview.finalDiagnosis === "string") {
        parsedDiagnosis = completedDoctorReview.finalDiagnosis;
      } else if (typeof completedDoctorReview.finalDiagnosis === "object") {
        const fd = completedDoctorReview.finalDiagnosis as Record<string, string>;
        parsedDiagnosis = fd.primary || "";
        parsedFollowUp = fd.followUpDate || "";
      }
    }

    if (completedDoctorReview.doctorId) {
      const docRow = await db.query.doctors.findFirst({
        where: eq(doctors.id, completedDoctorReview.doctorId),
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
      where: eq(prescriptionsTable.visitId, reviewVisitId),
    });

    reviewPrescriptions = dbPrescriptions.map((p) => ({
      medicineName: p.medicationName,
      dosage: p.dosage,
      frequency: p.frequency,
      duration: p.duration,
      instructions: p.instructions,
    }));
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
      case "WAITING":
        return { label: t.statusWaiting, color: "bg-blue-100 text-blue-800 border-blue-200" };
      case "INTAKE_IN_PROGRESS":
        return { label: t.statusIntakeInProgress, color: "bg-amber-100 text-amber-800 border-amber-200" };
      case "READY_FOR_DOCTOR":
        return { label: t.statusReadyForDoctor, color: "bg-purple-100 text-purple-800 border-purple-200" };
      case "IN_CONSULTATION":
        return { label: t.statusInConsultation, color: "bg-indigo-100 text-indigo-800 border-indigo-200" };
      case "COMPLETED":
        return { label: t.statusCompleted, color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      default:
        return { label: status, color: "bg-secondary text-secondary-foreground border-border" };
    }
  };

  const isIntakeIncomplete = latestVisit?.status === "WAITING" || latestVisit?.status === "INTAKE_IN_PROGRESS";

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-fade-in">
      {/* Top Welcome Header Banner with Language Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {t.welcomeBack}, {user.firstName || t.patient}!
            </h1>
            {patient.ayushModeEnabled && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AYUSH Mode
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            UHID: <strong className="font-mono text-foreground">{patient.uhid || "PENDING"}</strong> &bull;{" "}
            {t.registeredFor} {latestVisit?.department || "General Medicine"} OPD
          </p>
        </div>

        {/* Action Button & Language Switcher in Header */}
        <div className="flex flex-wrap items-center gap-3">
          <PatientLanguageSwitcher currentLanguage={lang} />

          {isIntakeIncomplete ? (
            <Link href={`/patient/interview?lang=${lang}&visit=${latestVisit?.id || ""}&dept=${encodeURIComponent(latestVisit?.department || "General Medicine")}`}>
              <Button className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-2 cursor-pointer text-xs sm:text-sm py-5 px-5">
                <Sparkles className="w-4 h-4" />
                <span>{t.resumeIntake}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/patient/consent">
              <Button variant="outline" className="rounded-xl border-border hover:bg-secondary gap-2 text-xs sm:text-sm cursor-pointer py-5 px-4 font-semibold">
                <Building2 className="w-4 h-4 text-primary" />
                <span>{t.startNewVisit}</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: Active Visit, Prescription & Clinical Timeline (2 Columns) */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Digital Prescription & Follow-up Card (If Doctor has Signed) */}
          {completedDoctorReview && reviewVisitId ? (
            <div className="bg-linear-to-br from-emerald-50/70 via-background to-card border-2 border-emerald-300/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 pb-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-foreground">
                      {t.digitalPrescription}
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t.issuedBy} <strong className="text-foreground">Dr. {attendingPhysicianName}</strong> &bull; {attendingDoctorRoom}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.signedPrescription}</span>
                  </span>

                  <a
                    href={`/api/fhir/export?visitId=${reviewVisitId}`}
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
                    {t.registeredOn}: {new Date(latestVisit.createdAt).toLocaleDateString()} &bull; {latestVisit.department} OPD
                  </p>
                </div>

                {latestVisit.queueNumber && (
                  <div className="flex items-center gap-2 bg-indigo-50 border border-primary/20 text-primary px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t.token} #{latestVisit.queueNumber}</span>
                  </div>
                )}
              </div>

              {/* Next Steps Prompt */}
              {isIntakeIncomplete ? (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold block">{t.clinicalIntakePending}</strong>
                      <span className="text-amber-800/90">{t.completeIntakeDesc}</span>
                    </div>
                  </div>
                  <Link href={`/patient/interview?lang=${lang}&visit=${latestVisit?.id || ""}&dept=${encodeURIComponent(latestVisit?.department || "General Medicine")}`} className="shrink-0">
                    <Button size="sm" className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer shadow-2xs">
                      {t.continueIntake}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-indigo-900 flex items-start gap-2.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block">{t.intakeVerified}</strong>
                    <span className="text-indigo-900/80">{t.intakeVerifiedDesc}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Past Clinical Histories & Summaries */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  {t.pastClinicalHistories}
                </h3>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {pastHistories.length} {t.recordsFound}
              </span>
            </div>

            {pastHistories.length > 0 ? (
              <div className="space-y-3">
                {pastHistories.map((hist, idx) => (
                  <div key={hist.id || idx} className="p-4 rounded-2xl bg-secondary/30 border border-border text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-semibold text-muted-foreground text-[11px]">
                      <span>{t.consultationRecord} #{idx + 1}</span>
                      <span>{new Date(hist.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-foreground/90 leading-relaxed font-medium line-clamp-3">
                      {hist.summaryText || t.noDetailedSummary}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic py-3 text-center">
                {t.noPastHistories}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Uploaded Documents & Quick Actions (1 Column) */}
        <div className="space-y-6 sm:space-y-8">
          {/* Upload Documents Card */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  {t.uploadedDocuments}
                </h3>
              </div>
              <span className="text-xs font-semibold text-primary">
                {patientDocs.length} {t.files}
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.digitizedRecordsDesc}
            </p>

            {patientDocs.length > 0 ? (
              <div className="space-y-2 pt-1">
                {patientDocs.map((doc) => (
                  <div key={doc.id} className="p-3 rounded-xl bg-secondary/40 border border-border text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-semibold text-foreground truncate max-w-[140px]">{doc.fileName}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 uppercase shrink-0">
                      {doc.processingStatus}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic py-2">
                {t.noDocumentsUploaded}
              </p>
            )}

            <Link href="/patient/documents" className="block pt-2">
              <Button variant="outline" className="w-full rounded-xl border-border hover:bg-secondary text-xs font-bold gap-1.5 cursor-pointer">
                <span>{t.uploadViewDocuments}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Quick Support & Clinic Notice */}
          <div className="bg-secondary/40 border border-border rounded-3xl p-6 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Activity className="w-3.5 h-3.5 text-primary" />
              <span>{t.preconsultNoticeTitle}</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {t.preconsultNoticeDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  Search,
  Filter,
  FileText,
  Lock,
  ArrowRight,
  Loader2,
  RefreshCw,
  FolderOpen,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { startConsultationAction } from "./actions";

export interface QueueItem {
  visitId: string;
  queueNumber: number;
  department: string;
  status: "WAITING" | "INTAKE_IN_PROGRESS" | "READY_FOR_DOCTOR" | "IN_CONSULTATION" | "COMPLETED" | "CANCELLED";
  priority: "ROUTINE" | "URGENT" | "EMERGENCY";
  createdAt: string | Date;
  patient: {
    id: string;
    uhid: string | null;
    age: number | null;
    gender: string | null;
    name: string;
  };
  attendingDoctor: {
    id: string;
    name: string;
    roomNumber: string | null;
  } | null;
  chiefComplaint?: string;
  summaryText?: string;
  redFlags: { description: string; severity: string }[];
  documentsCount: number;
}

interface DoctorDashboardClientProps {
  currentDoctorId: string;
  currentDoctorName: string;
  initialQueue: QueueItem[];
}

export default function DoctorDashboardClient({
  currentDoctorId,
  initialQueue,
}: DoctorDashboardClientProps) {
  const router = useRouter();
  const [queue] = useState<QueueItem[]>(initialQueue);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "READY" | "URGENT" | "ACTIVE" | "COMPLETED">("ALL");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [startingVisitId, setStartingVisitId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Calculate KPI Counts
  const totalCount = queue.length;
  const waitingCount = queue.filter(
    (q) => q.status === "READY_FOR_DOCTOR" || q.status === "WAITING" || q.status === "INTAKE_IN_PROGRESS"
  ).length;
  const inConsultCount = queue.filter((q) => q.status === "IN_CONSULTATION").length;
  const urgentCount = queue.filter(
    (q) => q.priority === "URGENT" || q.priority === "EMERGENCY" || q.redFlags.length > 0
  ).length;
  const completedCount = queue.filter((q) => q.status === "COMPLETED").length;

  // Filter queue items
  const filteredQueue = queue.filter((item) => {
    // Status filter
    if (statusFilter === "READY") {
      if (item.status !== "READY_FOR_DOCTOR" && item.status !== "WAITING") return false;
    } else if (statusFilter === "URGENT") {
      if (item.priority !== "URGENT" && item.priority !== "EMERGENCY" && item.redFlags.length === 0) return false;
    } else if (statusFilter === "ACTIVE") {
      if (item.status !== "IN_CONSULTATION") return false;
    } else if (statusFilter === "COMPLETED") {
      if (item.status !== "COMPLETED") return false;
    }

    // Department filter
    if (deptFilter !== "ALL" && item.department !== deptFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.patient.name.toLowerCase().includes(q);
      const matchUhid = (item.patient.uhid || "").toLowerCase().includes(q);
      const matchToken = `#${item.queueNumber}`.includes(q) || String(item.queueNumber).includes(q);
      const matchComplaint = (item.chiefComplaint || "").toLowerCase().includes(q);
      if (!matchName && !matchUhid && !matchToken && !matchComplaint) return false;
    }

    return true;
  });

  const handleStartConsultation = (visitId: string) => {
    setErrorMessage(null);
    setStartingVisitId(visitId);
    startTransition(async () => {
      try {
        const res = await startConsultationAction(visitId);
        if (res.success) {
          router.push(`/doctor/patients/${visitId}`);
        } else {
          setErrorMessage(res.error || "Failed to start consultation.");
          setStartingVisitId(null);
        }
      } catch (err) {
        console.error("Consultation error:", err);
        setErrorMessage("An unexpected error occurred. Please try again.");
        setStartingVisitId(null);
      }
    });
  };

  const handleViewPatient = (visitId: string) => {
    router.push(`/doctor/patients/${visitId}`);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-accent px-3 py-0.5 text-xs font-semibold text-primary mb-1">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Today&apos;s OPD Dashboard &bull; Live Clinical Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Doctor OPD Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Patients are listed in sequential arrival order with pre-consultation AI history & document insights.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.refresh()}
            className="rounded-xl border-border text-xs font-semibold gap-1.5 cursor-pointer hover:bg-secondary"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Dashboard</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Today */}
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs ${
            statusFilter === "ALL"
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : "border-border bg-card hover:border-primary/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Total Today</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <span className="text-2xl font-extrabold text-foreground mt-2 block font-mono">
            {totalCount}
          </span>
        </button>

        {/* Waiting */}
        <button
          onClick={() => setStatusFilter("READY")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs ${
            statusFilter === "READY"
              ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20"
              : "border-border bg-card hover:border-blue-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700">Waiting for Doctor</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-extrabold text-blue-900 mt-2 block font-mono">
            {waitingCount}
          </span>
        </button>

        {/* Urgent Priority / Red Flags */}
        <button
          onClick={() => setStatusFilter("URGENT")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs ${
            statusFilter === "URGENT"
              ? "border-rose-500 bg-rose-50/70 ring-2 ring-rose-500/20"
              : "border-border bg-card hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700">Priority / Red Flags</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-900 mt-2 flex items-center gap-2 font-mono">
            <span>{urgentCount}</span>
            {urgentCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
            )}
          </div>
        </button>

        {/* In Active Consultation */}
        <button
          onClick={() => setStatusFilter("ACTIVE")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs ${
            statusFilter === "ACTIVE"
              ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20"
              : "border-border bg-card hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700">In Consultation</span>
            <Stethoscope className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-extrabold text-amber-900 mt-2 block font-mono">
            {inConsultCount}
          </span>
        </button>

        {/* Completed */}
        <button
          onClick={() => setStatusFilter("COMPLETED")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs ${
            statusFilter === "COMPLETED"
              ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20"
              : "border-border bg-card hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-extrabold text-emerald-900 mt-2 block font-mono">
            {completedCount}
          </span>
        </button>
      </div>

      {/* Error alert if another doctor is holding session */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-600 shrink-0" />
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

      {/* Search & Department Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border shadow-2xs">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient name, UHID (#ABHA), token (#1), or symptoms..."
            className="w-full pl-9.5 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Department Filter Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs font-semibold rounded-xl border border-border bg-background text-foreground px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            <option value="General Medicine">General Medicine OPD</option>
            <option value="AYUSH (Ayurveda)">AYUSH (Ayurveda) OPD</option>
          </select>
        </div>
      </div>

      {/* Patient Queue Cards List */}
      <div className="space-y-3">
        {filteredQueue.length === 0 ? (
          /* Empty State */
          <div className="p-12 rounded-3xl border-2 border-dashed border-border bg-card/60 text-center space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-secondary text-muted-foreground flex items-center justify-center mx-auto">
              <FolderOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-foreground">No Patients Found</h3>
              <p className="text-xs text-muted-foreground">
                {searchQuery
                  ? `No patient in the queue matches "${searchQuery}".`
                  : `There are currently no patients in the selected category.`}
              </p>
            </div>
            {(statusFilter !== "ALL" || deptFilter !== "ALL" || searchQuery) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter("ALL");
                  setDeptFilter("ALL");
                  setSearchQuery("");
                }}
                className="rounded-xl text-xs font-semibold cursor-pointer"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          filteredQueue.map((item) => {
            const isCurrentDoctorHandling =
              item.status === "IN_CONSULTATION" && item.attendingDoctor?.id === currentDoctorId;
            const isOtherDoctorHandling =
              item.status === "IN_CONSULTATION" && item.attendingDoctor && item.attendingDoctor.id !== currentDoctorId;
            const isUrgent = item.priority === "URGENT" || item.priority === "EMERGENCY" || item.redFlags.length > 0;
            const isStartingThis = startingVisitId === item.visitId;

            return (
              <div
                key={item.visitId}
                className={`p-4 sm:p-5 rounded-3xl border transition-all bg-card shadow-2xs hover:shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isUrgent
                    ? "border-rose-300/80 bg-linear-to-r from-rose-50/40 via-card to-card"
                    : isCurrentDoctorHandling
                    ? "border-emerald-300/80 bg-linear-to-r from-emerald-50/30 via-card to-card"
                    : "border-border"
                }`}
              >
                {/* Left: Token & Patient Details */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {/* Token Number Box */}
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 font-mono shadow-2xs border ${
                      isUrgent
                        ? "bg-rose-100/90 text-rose-900 border-rose-300"
                        : isCurrentDoctorHandling
                        ? "bg-emerald-100/90 text-emerald-900 border-emerald-300"
                        : "bg-indigo-50 text-primary border-primary/20"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">Token</span>
                    <span className="text-xl sm:text-2xl font-black">#{item.queueNumber}</span>
                  </div>

                  {/* Patient Info & Chief Complaint */}
                  <div className="min-w-0 space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">
                        {item.patient.name}
                      </h3>

                      {/* Age & Gender */}
                      {(item.patient.age || item.patient.gender) && (
                        <span className="text-xs text-muted-foreground">
                          ({[item.patient.age ? `${item.patient.age}y` : null, item.patient.gender].filter(Boolean).join(", ")})
                        </span>
                      )}

                      {/* Priority Badge */}
                      {isUrgent ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 border border-rose-200 px-2 py-0.5 text-[10.5px] font-bold text-rose-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                          URGENT TRIAGE
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground">
                          Routine
                        </span>
                      )}

                      {/* Status Badge */}
                      {item.status === "READY_FOR_DOCTOR" && (
                        <span className="inline-flex items-center rounded-md bg-blue-50 border border-blue-200/60 px-2 py-0.5 text-[10.5px] font-bold text-blue-700">
                          Ready for Doctor
                        </span>
                      )}
                      {item.status === "IN_CONSULTATION" && (
                        <span className="inline-flex items-center rounded-md bg-amber-50 border border-amber-200/60 px-2 py-0.5 text-[10.5px] font-bold text-amber-700">
                          In Consultation
                        </span>
                      )}
                      {item.status === "COMPLETED" && (
                        <span className="inline-flex items-center rounded-md bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700">
                          Consultation Completed
                        </span>
                      )}
                    </div>

                    {/* Chief Complaint / Symptoms */}
                    <p className="text-xs sm:text-sm text-foreground/90 font-medium leading-snug line-clamp-2">
                      <span className="text-muted-foreground font-normal">Presenting with: </span>
                      {item.chiefComplaint || item.summaryText || "Intake in progress"}
                    </p>

                    {/* Red Flag Alerts Banner */}
                    {item.redFlags.length > 0 && (
                      <div className="p-2 rounded-xl bg-rose-50/80 border border-rose-200 text-[11px] text-rose-900 flex items-center gap-1.5 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span className="truncate">
                          Alert: {item.redFlags.map((r) => r.description).join(" &bull; ")}
                        </span>
                      </div>
                    )}

                    {/* Metadata line: UHID, Department, Documents */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                      <span className="font-mono">{item.patient.uhid || "UHID-PENDING"}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-primary" />
                        <span>{item.department}</span>
                      </span>
                      {item.documentsCount > 0 && (
                        <>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1 text-primary font-semibold">
                            <FileText className="w-3 h-3" />
                            <span>{item.documentsCount} Doc(s) Attached</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Doctor Action Button with Concurrency Lock */}
                <div className="flex sm:items-center justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
                  {isOtherDoctorHandling ? (
                    /* Locked by another doctor */
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-muted-foreground font-semibold">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>In Session (Dr. {item.attendingDoctor?.name || "Physician"})</span>
                    </div>
                  ) : isCurrentDoctorHandling ? (
                    /* Current doctor active session */
                    <Button
                      size="sm"
                      onClick={() => handleViewPatient(item.visitId)}
                      className="px-5 py-5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-xs cursor-pointer"
                    >
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span>Resume Consultation</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : item.status === "COMPLETED" ? (
                    /* Completed consultation view */
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPatient(item.visitId)}
                      className="px-4 py-4 rounded-xl text-xs font-semibold border-border hover:bg-secondary text-foreground gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>View Record</span>
                    </Button>
                  ) : (
                    /* Ready for doctor to start */
                    <Button
                      size="sm"
                      disabled={isPending && isStartingThis}
                      onClick={() => handleStartConsultation(item.visitId)}
                      className="px-6 py-5 rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isPending && isStartingThis ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Opening Case...</span>
                        </>
                      ) : (
                        <>
                          <span>Start Consultation</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
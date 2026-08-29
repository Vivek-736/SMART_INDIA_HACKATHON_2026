"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Activity,
  Building2,
  BarChart3,
  Search,
  Monitor,
  TrendingUp,
  FolderOpen,
  HeartPulse,
  ShieldCheck,
  Zap,
  Sparkles,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";

export interface HospitalPatientRow {
  visitId: string;
  queueNumber: number;
  patientName: string;
  uhid: string | null;
  age: number | null;
  gender: string | null;
  department: string;
  status: string;
  priority: string;
  hasRedFlag: boolean;
  attendingDoctorName: string | null;
  createdAt: string;
}

export interface AgeDiseaseTrendPoint {
  ageGroup: string;
  Respiratory: number;
  Gastrointestinal: number;
  Metabolic: number;
  Musculoskeletal: number;
  ViralFebrile: number;
}

export interface RootCauseDistributionPoint {
  name: string;
  value: number;
  color: string;
}

export interface DiseaseEtiologyInsight {
  conditionName: string;
  dominantAgeBand: string;
  caseCount: number;
  extractedRootCause: string;
  aggravatingFactors: string[];
  severityDistribution: string;
  clinicalRecommendation: string;
}

export interface HospitalDashboardData {
  totalPatients: number;
  waitingCount: number;
  inConsultationCount: number;
  completedCount: number;
  urgentCount: number;
  generalDeptCount: number;
  ayushDeptCount: number;
  hourlyThroughput: { hour: string; arrivals: number; completed: number }[];
  ageDistribution: { ageGroup: string; count: number }[];
  priorityDistribution: { name: string; value: number; color: string }[];
  patientList: HospitalPatientRow[];
  ageDiseaseTrends: AgeDiseaseTrendPoint[];
  diseaseEtiologyInsights: DiseaseEtiologyInsight[];
  rootCauseDistribution: RootCauseDistributionPoint[];
}

interface HospitalDashboardClientProps {
  data: HospitalDashboardData;
}

const DEPT_COLORS = ["#4f46e5", "#10b981"];

export default function HospitalDashboardClient({ data }: HospitalDashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredPatients = data.patientList.filter((p) => {
    if (deptFilter !== "ALL" && p.department !== deptFilter) return false;
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.patientName.toLowerCase().includes(q);
      const matchUhid = (p.uhid || "").toLowerCase().includes(q);
      const matchToken = `#${p.queueNumber}`.includes(q) || String(p.queueNumber).includes(q);
      if (!matchName && !matchUhid && !matchToken) return false;
    }
    return true;
  });

  const deptChartData = [
    { name: "General Medicine", value: data.generalDeptCount || 0 },
    { name: "AYUSH (Ayurveda)", value: data.ayushDeptCount || 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Top Welcome & KPI Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-accent px-3 py-0.5 text-xs font-semibold text-primary mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Hospital Operations Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Hospital OPD Operations & Epidemiological Analytics
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Real-time intake velocity, age-to-disease correlations, and interview-extracted etiology trends
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/doctor/dashboard">
            <Button variant="outline" size="sm" className="rounded-xl gap-2 font-bold cursor-pointer text-xs">
              <Stethoscope className="w-4 h-4 text-primary" />
              <span>Doctor Queue</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 5 Real-Time KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Today */}
        <div className="p-4 sm:p-5 rounded-3xl border border-border bg-card shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Total Today
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-primary flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground">{data.totalPatients}</div>
          <p className="text-[11px] text-muted-foreground">Registered OPD intakes</p>
        </div>

        {/* Waiting in Queue */}
        <div className="p-4 sm:p-5 rounded-3xl border border-border bg-card shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Waiting
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-900">{data.waitingCount}</div>
          <p className="text-[11px] text-muted-foreground">Ready for consultation</p>
        </div>

        {/* In Consultation */}
        <div className="p-4 sm:p-5 rounded-3xl border border-border bg-card shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              In Session
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-900">{data.inConsultationCount}</div>
          <p className="text-[11px] text-muted-foreground">With doctor currently</p>
        </div>

        {/* Completed */}
        <div className="p-4 sm:p-5 rounded-3xl border border-border bg-card shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Completed
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-900">{data.completedCount}</div>
          <p className="text-[11px] text-muted-foreground">Discharged / Prescribed</p>
        </div>

        {/* Priority Red Flags */}
        <div className="p-4 sm:p-5 rounded-3xl border border-rose-200/80 bg-rose-50/40 shadow-2xs space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wide">
              Priority Triage
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-950">{data.urgentCount}</div>
          <p className="text-[11px] text-rose-700 font-medium">Active emergency alerts</p>
        </div>
      </div>

      {/* ── NEW: Age-to-Disease Trends & Interview Etiology Extraction Section ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-600" />
              <h2 className="text-lg font-bold text-foreground">
                Disease Trends vs. Age & Extracted Root Causes
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Cross-correlated demographic disease prevalence with underlying etiologies synthesized from patient intake interviews
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            AI Intake Synthesis
          </span>
        </div>

        {/* 2-Column Epidemiological Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Age to Disease Trends (2 Columns) */}
          <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl border border-border bg-card shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span>Age Bracket vs. Disease Category Prevalence</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Distribution of condition clusters across age groups
                </p>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                Multi-Condition Matrix
              </span>
            </div>

            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.ageDiseaseTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="ageGroup" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="Respiratory" name="Respiratory (Cough/Asthma)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Gastrointestinal" name="Gastrointestinal (Acid/GERD)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Metabolic" name="Cardio / Metabolic (BP/Sugar)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Musculoskeletal" name="Musculoskeletal (Joints/Back)" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ViralFebrile" name="Viral / Febrile Illness" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Extracted Root Cause Distribution Donut (1 Column) */}
          <div className="p-5 sm:p-6 rounded-3xl border border-border bg-card shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-primary" />
                <span>Extracted Etiology Distribution</span>
              </h3>
              <p className="text-xs text-muted-foreground">Underlying causes extracted from interviews</p>
            </div>

            <div className="h-[200px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.rootCauseDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {data.rootCauseDistribution.map((entry, index) => (
                      <Cell key={`cell-root-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Root Cause Color Legend */}
            <div className="space-y-1.5 pt-1 border-t border-border text-xs">
              {data.rootCauseDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[11.5px] font-medium text-foreground truncate max-w-[170px]">{item.name}</span>
                  </div>
                  <span className="font-bold text-foreground">{item.value} cases</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Disease-to-Cause Intelligence Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {data.diseaseEtiologyInsights.map((insight, idx) => (
            <div
              key={idx}
              className="p-5 rounded-3xl border border-border bg-card shadow-2xs space-y-3 flex flex-col justify-between hover:border-primary/40 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2 border-b border-border pb-2.5">
                  <div>
                    <h4 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary shrink-0" />
                      <span>{insight.conditionName}</span>
                    </h4>
                    <span className="text-[11px] text-muted-foreground">
                      Dominant Age: <strong className="text-foreground">{insight.dominantAgeBand}</strong>
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary font-bold text-xs shrink-0">
                    {insight.caseCount} Cases
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-foreground block text-[11px] uppercase tracking-wide">
                      Synthesized Root Cause (Interview Analysis):
                    </span>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed font-medium">
                      {insight.extractedRootCause}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-foreground block text-[11px] uppercase tracking-wide">
                      Key Aggravating Triggers:
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {insight.aggravatingFactors.map((f, fIdx) => (
                        <span
                          key={fIdx}
                          className="px-2 py-0.5 rounded-md bg-secondary text-foreground text-[10.5px] font-semibold border border-border"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-secondary/40 border border-border/70 text-xs flex items-start gap-2 text-muted-foreground mt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-foreground text-[11px] block">
                    Protocol & OPD Guidance:
                  </span>
                  <span className="text-[11px] leading-relaxed">{insight.clinicalRecommendation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Analytics Section (Turnaround & Department) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Chart: Hourly Intake & Completed Velocity (2 Columns) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>Hourly Patient Flow & Turnaround Velocity</span>
              </h3>
              <p className="text-xs text-muted-foreground">Patient arrivals vs completed doctor consultations</p>
            </div>
            <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
              Today&apos;s Velocity
            </span>
          </div>

          <div className="h-[240px] sm:h-[260px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.hourlyThroughput} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorArrivals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Area
                  type="monotone"
                  dataKey="arrivals"
                  name="Patient Arrivals"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorArrivals)"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Doctor Consulted"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart: Department Split (General vs AYUSH) */}
        <div className="p-5 sm:p-6 rounded-3xl border border-border bg-card shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span>Department Distribution</span>
            </h3>
            <p className="text-xs text-muted-foreground">General Medicine vs AYUSH (Ayurveda)</p>
          </div>

          <div className="h-[180px] w-full relative flex items-center justify-center">
            {data.totalPatients === 0 ? (
              <p className="text-xs text-muted-foreground">No department data yet today</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {deptChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Department Legend & Metrics */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
            <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs">
              <span className="font-bold text-indigo-900 block text-[11px]">General Medicine</span>
              <span className="text-lg font-black text-indigo-950">{data.generalDeptCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs">
              <span className="font-bold text-emerald-900 block text-[11px]">AYUSH (Ayurveda)</span>
              <span className="text-lg font-black text-emerald-950">{data.ayushDeptCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Kiosk Fleet & Terminal Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-2xl border border-border bg-card flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Kiosk #01 (Main Lobby)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[11px] text-muted-foreground">Active · Audio & Regional Input OK</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Kiosk #02 (AYUSH Wing)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[11px] text-muted-foreground">Active · Prakriti & Agni Module OK</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Kiosk #03 (Emergency Wing)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[11px] text-muted-foreground">Active · Priority Triage Auto-Alert OK</span>
          </div>
        </div>
      </div>

      {/* Real-Time Patient Intake Stream & Queue Table */}
      <div className="p-5 sm:p-6 rounded-3xl border border-border bg-card shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-primary" />
              <span>Live Patient Intake Stream</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Showing {filteredPatients.length} of {data.patientList.length} total registered patients today
            </p>
          </div>

          {/* Filters & Search Input */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search name, token or UHID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-border bg-secondary/50 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary w-48 sm:w-56"
              />
            </div>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-border bg-secondary/50 text-xs font-medium text-foreground focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              <option value="General Medicine">General Medicine</option>
              <option value="AYUSH (Ayurveda)">AYUSH (Ayurveda)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-border bg-secondary/50 text-xs font-medium text-foreground focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="READY_FOR_DOCTOR">Waiting</option>
              <option value="IN_CONSULTATION">In Consultation</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Patient Table */}
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/60 text-muted-foreground font-semibold text-[11px] uppercase border-b border-border">
              <tr>
                <th className="py-3 px-4">Token #</th>
                <th className="py-3 px-4">Patient Name & Demographics</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Triage Priority</th>
                <th className="py-3 px-4">Visit Status</th>
                <th className="py-3 px-4">Attending Doctor</th>
                <th className="py-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.visitId} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      #{patient.queueNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-foreground">{patient.patientName}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {patient.age ? `${patient.age}y` : "Age N/A"} &bull; {patient.gender || "Gender N/A"} &bull; UHID:{" "}
                        <span className="font-mono">{patient.uhid || "PENDING"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-foreground">{patient.department}</span>
                    </td>
                    <td className="py-3 px-4">
                      {patient.hasRedFlag ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10.5px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                          URGENT
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary text-muted-foreground font-semibold text-[10.5px]">
                          Routine
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-[10.5px] capitalize ${
                          patient.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700"
                            : patient.status === "IN_CONSULTATION"
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {patient.status.replace(/_/g, " ").toLowerCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {patient.attendingDoctorName ? `Dr. ${patient.attendingDoctorName}` : "—"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">
                      {patient.createdAt}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-muted-foreground">
                    No matching patient intakes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
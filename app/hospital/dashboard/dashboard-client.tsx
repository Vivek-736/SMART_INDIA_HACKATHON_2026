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
  Leaf,
  Layers,
  BarChart3,
  Search,
  Monitor,
  TrendingUp,
  FolderOpen,
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
}

interface HospitalDashboardClientProps {
  data: HospitalDashboardData;
}

const DEPT_COLORS = ["#4f46e5", "#10b981"];
const TRIAGE_COLORS = ["#4338ca", "#f43f5e", "#f59e0b"];

export default function HospitalDashboardClient({ data }: HospitalDashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Filter patient flow table
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
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-7">
      {/* Top Welcome & KPI Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-accent px-3 py-0.5 text-xs font-semibold text-primary mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Hospital Operations Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Hospital OPD Operations & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Real-time patient intake velocity, department volume, and triage distribution
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

      {/* Visual Analytics Section (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Hourly Intake & Completed Velocity (2 Columns) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>Hourly Patient Flow & Turnaround</span>
              </h3>
              <p className="text-xs text-muted-foreground">Patient arrivals vs completed consultations</p>
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

        {/* Chart 2: Department Split (General vs AYUSH) */}
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

      {/* Secondary Metrics: Age Trends & Kiosk Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Age Demographics Bar Chart */}
        <div className="p-5 sm:p-6 rounded-3xl border border-border bg-card shadow-xs space-y-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span>Patient Age Demographics</span>
            </h3>
            <p className="text-xs text-muted-foreground">Distribution across age groups</p>
          </div>

          <div className="h-[170px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ageDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="ageGroup" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" name="Patients" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Kiosk Operational Health Status */}
        <div className="p-5 sm:p-6 rounded-3xl border border-border bg-card shadow-xs space-y-3.5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <Monitor className="w-4 h-4 text-primary" />
                <span>Kiosks & Intake Pipeline Health</span>
              </h3>
              <p className="text-xs text-muted-foreground">Real-time status of on-premise intake devices</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              All Systems Normal
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Kiosk 1 */}
            <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/80 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-foreground">OPD Lobby Kiosk #1</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-muted-foreground">Touch & Voice Mode &bull; Online</p>
              <div className="text-[10.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block">
                Active &bull; Multilingual
              </div>
            </div>

            {/* Kiosk 2 */}
            <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/80 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-foreground">AYUSH Wing Kiosk #2</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-muted-foreground">Ayurvedic Mode &bull; Online</p>
              <div className="text-[10.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block">
                Active &bull; Multilingual
              </div>
            </div>

            {/* AI Speech Engine */}
            <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/80 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-foreground">AI Speech & Extraction</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-muted-foreground">AssemblyAI + Google TTS</p>
              <div className="text-[10.5px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md inline-block">
                Low Latency (&lt;1.2s)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Flow Queue Table */}
      <div className="p-5 sm:p-6 rounded-3xl border border-border bg-card shadow-xs space-y-4">
        {/* Table Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="space-y-0.5">
            <h3 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>Today&apos;s Live Patient Intake Stream ({filteredPatients.length})</span>
            </h3>
            <p className="text-xs text-muted-foreground">Detailed view of recent hospital arrivals</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, UHID, #token..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs font-semibold text-foreground focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              <option value="General Medicine">General Medicine</option>
              <option value="AYUSH (Ayurveda)">AYUSH (Ayurveda)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs font-semibold text-foreground focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="WAITING">Waiting</option>
              <option value="READY_FOR_DOCTOR">Ready for Doctor</option>
              <option value="IN_CONSULTATION">In Consultation</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Table Rows */}
        {filteredPatients.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <FolderOpen className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground">No patients matched the current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/80 text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                  <th className="py-2.5 px-3">Token</th>
                  <th className="py-2.5 px-3">Patient Name</th>
                  <th className="py-2.5 px-3">UHID</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Priority / Triage</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Attending Doctor</th>
                  <th className="py-2.5 px-3">Registered At</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-border/60">
                {filteredPatients.map((p) => (
                  <tr key={p.visitId} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-primary">#{p.queueNumber}</td>
                    <td className="py-3 px-3 font-bold text-foreground">
                      {p.patientName}
                      {(p.age || p.gender) && (
                        <span className="text-[11px] font-normal text-muted-foreground ml-1.5">
                          ({[p.age ? `${p.age}y` : null, p.gender].filter(Boolean).join(", ")})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-muted-foreground">{p.uhid || "PENDING"}</td>
                    <td className="py-3 px-3 font-medium text-foreground">
                      <span className="flex items-center gap-1.5">
                        {p.department.includes("AYUSH") ? (
                          <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        )}
                        <span>{p.department}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {p.hasRedFlag && p.status !== "COMPLETED" ? (
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-3 h-3" />
                          URGENT
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10.5px] font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                          Routine
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      {p.status === "COMPLETED" && (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[10.5px] font-bold">
                          Completed
                        </span>
                      )}
                      {p.status === "IN_CONSULTATION" && (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md text-[10.5px] font-bold">
                          In Session
                        </span>
                      )}
                      {p.status === "READY_FOR_DOCTOR" && (
                        <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md text-[10.5px] font-bold">
                          Ready for Doctor
                        </span>
                      )}
                      {p.status === "WAITING" && (
                        <span className="text-muted-foreground bg-secondary px-2 py-0.5 rounded-md text-[10.5px]">
                          Waiting
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-medium text-muted-foreground">
                      {p.attendingDoctorName ? `Dr. ${p.attendingDoctorName}` : "—"}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-muted-foreground">
                      {p.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
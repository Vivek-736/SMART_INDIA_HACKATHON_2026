import { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { getOrSyncCurrentPatient } from "@/lib/auth/sync-user";
import PatientHeader from "@/components/patient/patient-header";

export default async function PatientLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const isLoggedIn = !!session.userId;

  // Not logged in (e.g. /patient/login) — render children directly
  if (!isLoggedIn) {
    return <>{children}</>;
  }

  const patientData = await getOrSyncCurrentPatient();

  const patientName = patientData?.user
    ? [patientData.user.firstName, patientData.user.lastName].filter(Boolean).join(" ") || "Patient"
    : "Patient";

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50/50 via-background to-background text-foreground flex flex-col justify-between">
      {/* Top Patient Portal Header Bar */}
      {patientData && (
        <PatientHeader
          patientName={patientName}
          uhid={patientData.patient.uhid}
          language={patientData.patient.languagePreference}
          ayushModeEnabled={patientData.patient.ayushModeEnabled}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1">{children}</div>

      {/* Bottom Footer */}
      <footer className="text-center text-[11px] text-muted-foreground py-4 border-t border-border/40 max-w-7xl mx-auto w-full px-4">
        <span>PreConsult Patient Portal &bull; Assistive Clinical Documentation &bull; Built with 💖 by Team Apostles</span>
      </footer>
    </div>
  );
}
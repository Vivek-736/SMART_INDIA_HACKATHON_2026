import { ReactNode } from "react";
import { getOrSyncCurrentDoctor } from "@/lib/auth/sync-doctor";
import UnauthorizedDoctor from "@/components/doctor/unauthorized-doctor";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Stethoscope, Activity, Sparkles, Building2 } from "lucide-react";

export default async function DoctorLayout({ children }: { children: ReactNode }) {
  const docAuth = await getOrSyncCurrentDoctor();

  // If not logged in, pass through so Clerk middleware / login page handles it
  if (!docAuth.isAuthorized) {
    if (docAuth.reason === "UNAUTHORIZED_EMAIL") {
      return <UnauthorizedDoctor email={docAuth.userEmail} />;
    }
    return <>{children}</>;
  }

  const doctor = docAuth.doctor;
  const user = docAuth.user;
  const doctorName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") || "Doctor" : "Doctor";

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50/50 via-background to-background text-foreground flex flex-col justify-between">
      {/* Top Doctor Portal Navigation Bar */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/doctor/dashboard" className="flex items-center gap-2.5 group">
              <Image
                src="/icon.png"
                alt="PreConsult Doctor"
                width={30}
                height={30}
                className="rounded-lg bg-indigo-600 shadow-xs transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                  PreConsult
                  <span className="inline-flex items-center rounded-md bg-indigo-100 border border-indigo-200/60 px-1.5 py-0.2 text-[10.5px] font-bold text-indigo-700">
                    OPD Doctor Portal
                  </span>
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground border-l border-border/80 pl-3">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>{doctor?.department || "General Medicine"}</span>
              <span className="text-border">&bull;</span>
              <span className="font-semibold text-foreground">{doctor?.roomNumber || "OPD Room 104"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5 justify-end">
                <Stethoscope className="w-3.5 h-3.5 text-primary" />
                <span>Dr. {doctorName}</span>
              </span>
              <span className="text-[10.5px] text-muted-foreground">
                {doctor?.specialization || "Clinical Physician"}
              </span>
            </div>

            <UserButton
              afterSignOutUrl="/doctor/login"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-xl ring-2 ring-primary/20",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1">{children}</div>

      {/* Bottom Footer */}
      <footer className="text-center text-[11px] text-muted-foreground py-3 border-t border-border/40 max-w-7xl mx-auto w-full px-4">
        <span>PreConsult OPD System &bull; Physician Clinical Documentation Platform &bull; Allopathy & AYUSH</span>
      </footer>
    </div>
  );
}
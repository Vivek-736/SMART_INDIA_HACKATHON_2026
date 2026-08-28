import { ReactNode } from "react";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { getOrSyncCurrentHospitalAdmin } from "@/lib/auth/sync-hospital";
import { 
  BarChart3, 
  Stethoscope, 
  ShieldCheck 
} from "lucide-react";

export default async function HospitalLayout({ children }: { children: ReactNode }) {
  const authResult = await getOrSyncCurrentHospitalAdmin();

  if (!authResult.isAuthorized) {
    return <>{children}</>;
  }

  const user = authResult.user;
  const adminName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") || "Admin" : "Admin";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Hospital Command Center Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-6">
            <Link href="/hospital/dashboard" className="flex items-center gap-2.5 group">
              <Image
                src="/icon.png"
                alt="PreConsult Logo"
                width={30}
                height={30}
                className="rounded-lg bg-indigo-600 shadow-xs transition-transform group-hover:scale-105"
              />
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-foreground">
                  PreConsult
                </span>
                <span className="hidden sm:inline-flex items-center rounded-md bg-indigo-50 border border-primary/20 px-2 py-0.5 text-xs font-bold text-primary">
                  Operations & OPD
                </span>
              </div>
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-2 text-xs font-bold">
              <Link
                href="/hospital/dashboard"
                className="px-3.5 py-1.5 rounded-xl bg-accent text-primary transition-colors flex items-center gap-1.5"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>OPD Dashboard</span>
              </Link>
              <Link
                href="/doctor/dashboard"
                className="px-3.5 py-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-1.5"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor Portal</span>
              </Link>
            </nav>
          </div>

          {/* Right: Hospital Admin User Menu & Live Badge */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live OPD Stream</span>
            </div>

            <UserButton
              afterSignOutUrl="/hospital/login"
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8 rounded-full border border-border shadow-2xs",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-12">{children}</main>

      {/* Minimal Footer */}
      <footer className="border-t border-border bg-card/40 py-4 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PreConsult Hospital Operations & OPD Command Center</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            ABDM & NABH Healthcare Analytics Compliant
          </span>
        </div>
      </footer>
    </div>
  );
}
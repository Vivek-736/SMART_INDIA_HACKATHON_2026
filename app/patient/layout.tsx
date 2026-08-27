import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { 
  LayoutDashboard, 
  FileText, 
  History, 
  Stethoscope 
} from "lucide-react";

export default async function PatientLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const isLoggedIn = !!session.userId;

  // If user is not logged in (e.g. on /patient/login), render children directly without any layout wrapper
  if (!isLoggedIn) {
    return <>{children}</>;
  }

  // If user is logged in, render the patient portal layout with top navigation header and no footer
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header for logged-in patient */}
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

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/patient/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-primary transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/patient/documents"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Documents</span>
              </Link>
              <Link
                href="/patient/history"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <History className="w-4 h-4" />
                <span>Medical History</span>
              </Link>
            </nav>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-secondary text-xs text-secondary-foreground font-medium">
              <Stethoscope className="w-3.5 h-3.5 text-primary" />
              <span>OPD Active</span>
            </div>

            <UserButton
              afterSignOutUrl="/patient/login"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 ring-1 ring-border rounded-full",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
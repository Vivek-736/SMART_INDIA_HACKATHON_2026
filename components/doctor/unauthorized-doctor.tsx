"use client";

import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { ShieldAlert, LogOut, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnauthorizedDoctorProps {
  email?: string;
}

export default function UnauthorizedDoctor({ email }: UnauthorizedDoctorProps) {
  return (
    <div className="min-h-screen bg-linear-to-b from-rose-50/50 via-background to-background text-foreground flex flex-col justify-between p-4 sm:p-6">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <Image
            src="/icon.png"
            alt="PreConsult Logo"
            width={28}
            height={28}
            className="rounded-lg bg-indigo-600 shadow-xs"
          />
          <span className="text-base font-bold tracking-tight text-foreground">
            PreConsult
          </span>
        </div>
      </header>

      {/* Main Alert Card */}
      <main className="max-w-md mx-auto w-full text-center space-y-6 my-auto">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center rounded-full bg-rose-100/80 px-3 py-1 text-xs font-bold text-rose-700">
            Unauthorized Access
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Physician Verification Required
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            The account <strong className="text-foreground">{email || "you logged in with"}</strong> is not registered as an authorized medical practitioner on PreConsult.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs text-xs text-left text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground">Authorized Doctor Access Only</p>
          <p className="leading-relaxed">
            For patient confidentiality and clinical safety under NABH guidelines, only pre-approved medical staff may access OPD clinical queues.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <SignOutButton redirectUrl="/doctor/login">
            <Button
              size="lg"
              className="w-full py-6 rounded-xl font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground gap-2 cursor-pointer shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out & Try Another Account</span>
            </Button>
          </SignOutButton>

          <Link href="/patient/dashboard" className="block w-full">
            <Button
              variant="outline"
              size="lg"
              className="w-full py-6 rounded-xl font-semibold text-xs border-border hover:bg-secondary gap-2 cursor-pointer"
            >
              <span>Go to Patient Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-muted-foreground py-3 border-t border-border/40 max-w-4xl mx-auto w-full">
        <span>PreConsult Hospital Security &bull; Role-Based Clinical Access</span>
      </footer>
    </div>
  );
}
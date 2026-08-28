import Image from "next/image";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";

export default function PatientLoginPage() {
  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden bg-linear-to-br from-white via-indigo-50/30 to-indigo-50 text-foreground flex flex-col justify-between px-4 sm:px-8 lg:px-12 py-4 sm:py-6">
      {/* Top Header Spanning Across Whole Page Above Image & Component */}
      <header className="flex flex-col items-center text-center space-y-1.5 shrink-0">
        <div className="flex items-center justify-between w-full max-w-6xl px-2">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <Image
              src="/icon.png"
              alt="PreConsult Logo"
              width={32}
              height={32}
              className="rounded-lg bg-indigo-600 shadow-xs transition-transform group-hover:scale-105"
            />
            <span className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              PreConsult
              <span className="inline-flex items-center rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-primary">
                Patient Portal
              </span>
            </span>
          </Link>

          <Link
            href="/doctor/login"
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors bg-accent/60 hover:bg-accent border border-primary/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <span>Doctor Sign In &rarr;</span>
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground pt-1">
          Welcome to PreConsult
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg">
          Complete your guided clinical intake before meeting your doctor.
        </p>
      </header>

      {/* Center Body: Image on the Left, Clerk Sign-In on the Right */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-16 xl:gap-24 overflow-hidden max-w-6xl w-full mx-auto my-auto">
        {/* Left: Illustration Image */}
        <div className="hidden lg:flex lg:w-1/2 h-full items-center justify-center">
          <div className="relative w-full max-w-md aspect-square">
            <Image
              src="/patient-login.jpg"
              alt="Patient Clinical Intake"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Right: Clerk Sign In Component */}
        <div className="w-full lg:w-1/2 flex justify-center items-center">
          <div className="w-full max-w-[420px]">
            <SignIn
              path="/patient/login"
              routing="path"
              fallbackRedirectUrl="/patient/dashboard"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-md border border-border rounded-2xl p-6 sm:p-7 bg-card",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  formButtonPrimary:
                    "bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold py-2.5 rounded-xl cursor-pointer shadow-xs transition-colors",
                  formFieldLabel: "text-xs font-semibold text-foreground mb-1",
                  formFieldInput:
                    "rounded-xl border border-input bg-background text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 py-2 px-3.5 transition-all",
                  socialButtonsBlockButton:
                    "rounded-xl border border-border hover:bg-secondary text-foreground text-xs sm:text-sm font-medium py-2 transition-colors",
                  socialButtonsBlockButtonText: "font-medium text-xs sm:text-sm text-foreground",
                  dividerLine: "bg-border",
                  dividerText: "text-xs text-muted-foreground uppercase font-medium",
                  footer: "hidden",
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Footer Spanning Across Whole Page Below Image & Component */}
      <footer className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-center text-xs sm:text-sm text-muted-foreground shrink-0 pt-2 border-t border-border/50 max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-1.5 text-primary font-medium">
          <Sparkles className="w-4 h-4" />
          <span>Voice & touch multilingual intake &bull; Document digitization</span>
        </div>
        <div className="hidden sm:block text-muted-foreground/40">&bull;</div>
        <div className="flex items-center gap-1 text-xs sm:text-sm">
          <ShieldCheck className="w-4 h-4 text-muted-foreground" />
          <span>Doctor retains final clinical authority &bull; Secure & Encrypted</span>
        </div>
      </footer>
    </div>
  );
}
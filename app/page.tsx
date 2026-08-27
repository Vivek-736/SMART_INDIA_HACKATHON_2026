import Image from "next/image";
import Link from "next/link";
import { 
  User, 
  Stethoscope, 
  Building2, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const portals = [
    {
      title: "Patient & Kiosk Intake",
      role: "Patient Portal",
      description:
        "Complete guided, multilingual voice or touch clinical intake, upload previous medical records, and generate pre-consult summaries.",
      icon: User,
      href: "/patient/login",
      badge: "Multilingual & Voice",
      cta: "Patient Login / Start Intake",
      buttonVariant: "default" as const,
      highlight: true,
    },
    {
      title: "Doctor Clinical Desk",
      role: "Physician Portal",
      description:
        "Review AI-structured clinical histories, abnormal lab highlights, original source documents, and finalize diagnosis & prescriptions.",
      icon: Stethoscope,
      href: "/doctor/login",
      badge: "History & Triage",
      cta: "Doctor Sign In",
      buttonVariant: "outline" as const,
      highlight: false,
    },
    {
      title: "Hospital Operations",
      role: "Operations & Admin",
      description:
        "Monitor live patient throughput, queue status, active kiosk health, and high-level OPD intake metrics in real time.",
      icon: Building2,
      href: "/hospital/login",
      badge: "Queue & Kiosks",
      cta: "Hospital Admin Sign In",
      buttonVariant: "outline" as const,
      highlight: false,
    },
  ];

  return (
    <main className="h-screen max-h-screen overflow-hidden bg-background text-foreground flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/icon.png"
              alt="PreConsult Logo"
              width={32}
              height={32}
              className="rounded-lg bg-indigo-600 shadow-xs"
              priority
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
                PreConsult
                <span className="inline-flex items-center rounded-md bg-accent px-1.5 py-0.2 text-[11px] font-semibold text-primary">
                  AI
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/patient/login">
              <Button variant="default" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 text-xs">
                Patient Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero & Selection */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-hidden">
        <div className="max-w-4xl text-center mb-6 space-y-2.5 shrink-0">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-accent px-3 py-0.5 text-xs font-medium text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Throughput Clinical Intake Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Converting messy patient stories into{" "}
            <span className="text-primary underline decoration-primary/30 underline-offset-4">
              coherent clinical cases
            </span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Select your role to access the intelligent clinical intake system, OPD queue management, or hospital operations.
          </p>
        </div>

        {/* 3 Role Portals */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-5">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.title}
                className={`relative group rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 border ${
                  portal.highlight
                    ? "bg-card border-primary shadow-md hover:shadow-lg hover:border-primary ring-1 ring-primary/20"
                    : "bg-card border-border hover:border-primary/50 shadow-xs hover:shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        portal.highlight
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {portal.badge}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-foreground mb-0.5">{portal.title}</h2>
                  <p className="text-xs font-medium text-primary mb-2">{portal.role}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">{portal.description}</p>
                </div>

                <div className="pt-3 border-t border-border/60">
                  <Link href={portal.href} className="w-full block">
                    <Button
                      variant={portal.buttonVariant}
                      size="sm"
                      className={`w-full justify-between font-medium group/btn text-xs sm:text-sm h-9 ${
                        portal.highlight
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border-border hover:border-primary hover:text-primary"
                      }`}
                    >
                      <span>{portal.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Regulatory Note */}
        <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>Assistive clinical documentation system &bull; Doctor retains final clinical authority</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-2.5 bg-background shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-1.5">
          <span>&copy; {new Date().getFullYear()} PreConsult. All rights reserved.</span>
          <div className="flex items-center gap-3">
            <span>High-Throughput OPD Intake</span>
            <span>&bull;</span>
            <span>AYUSH Compatible</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
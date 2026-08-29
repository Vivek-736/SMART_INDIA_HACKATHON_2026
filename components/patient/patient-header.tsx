import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { FileText, LayoutDashboard } from "lucide-react";
import PatientLanguageSwitcher from "./patient-language-switcher";
import { getPatientTranslations, SupportedLanguage } from "@/lib/i18n/patient-translations";

interface PatientHeaderProps {
  patientName: string;
  uhid: string | null;
  language: string;
  ayushModeEnabled?: boolean;
}

export default function PatientHeader({
  patientName,
  uhid,
  language,
  ayushModeEnabled,
}: PatientHeaderProps) {
  const lang = (language || "en") as SupportedLanguage;
  const t = getPatientTranslations(lang);

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: PreConsult Patient Brand */}
        <div className="flex items-center gap-3">
          <Link href="/patient/dashboard" className="flex items-center gap-2.5 group">
            <Image
              src="/icon.png"
              alt="PreConsult"
              width={30}
              height={30}
              className="rounded-lg bg-indigo-600 shadow-xs transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                PreConsult
                <span className="inline-flex items-center rounded-md bg-indigo-50 border border-primary/20 px-1.5 py-0.2 text-[10.5px] font-bold text-primary">
                  {t.patientPortal}
                </span>
              </span>
            </div>
          </Link>

          {uhid && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground border-l border-border/80 pl-3">
              <span>UHID:</span>
              <span className="font-mono font-bold text-foreground">{uhid}</span>
            </div>
          )}
        </div>

        {/* Center/Right Nav Links & Controls */}
        <div className="flex items-center gap-3">
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/patient/dashboard"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-foreground hover:bg-secondary transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
              <span>{t.myHealthDashboard}</span>
            </Link>

            <Link
              href="/patient/documents"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>{t.medicalRecords}</span>
            </Link>
          </nav>

          {/* Language Switcher */}
          <PatientLanguageSwitcher currentLanguage={lang} />

          {/* Clerk User Button Profile Avatar */}
          <UserButton
            afterSignOutUrl="/patient/login"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 rounded-xl ring-2 ring-primary/20",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
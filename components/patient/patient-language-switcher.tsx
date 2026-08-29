"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { updatePatientLanguageAction } from "@/app/patient/actions";

interface PatientLanguageSwitcherProps {
  currentLanguage: string;
}

const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ" },
];

export default function PatientLanguageSwitcher({ currentLanguage }: PatientLanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLanguageChange = (newLang: string) => {
    if (newLang === currentLanguage) return;

    startTransition(async () => {
      await updatePatientLanguageAction(newLang);
      router.refresh();
    });
  };

  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-secondary/80 hover:bg-secondary border border-border text-xs font-semibold text-foreground transition-colors shadow-2xs">
        <Globe className={`w-3.5 h-3.5 text-primary ${isPending ? "animate-spin" : ""}`} />
        <select
          value={currentLanguage || "en"}
          onChange={(e) => handleLanguageChange(e.target.value)}
          disabled={isPending}
          className="bg-transparent text-xs font-bold text-foreground focus:outline-hidden cursor-pointer pr-1"
          aria-label="Select Language"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-card text-foreground py-1">
              {lang.nativeLabel} ({lang.label})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
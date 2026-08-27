"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Stethoscope, 
  Leaf, 
  ArrowRight, 
  Loader2,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitConsentAndCreateSessionAction } from "./actions";

type LanguageCode = "en" | "hi" | "te" | "ta" | "kn";
type Department = "General Medicine" | "AYUSH (Ayurveda)";

interface LanguageOption {
  code: LanguageCode;
  locale: "en-IN" | "hi-IN" | "te-IN" | "ta-IN" | "kn-IN";
  name: string;
  nativeName: string;
  sampleAudioText: string;
  consentSpokenText: string;
}

const LANGUAGES: LanguageOption[] = [
  {
    code: "en",
    locale: "en-IN",
    name: "English",
    nativeName: "English",
    sampleAudioText: "Welcome to PreConsult. Please select your language and department to begin.",
    consentSpokenText: "PreConsult assists you in preparing your medical history before you meet the doctor. The doctor retains full clinical authority. Your data is private and secure.",
  },
  {
    code: "hi",
    locale: "hi-IN",
    name: "Hindi",
    nativeName: "हिंदी",
    sampleAudioText: "प्री-कंसल्ट में आपका स्वागत है। डॉक्टर से मिलने से पहले अपनी जानकारी दर्ज करें।",
    consentSpokenText: "प्री-कंसल्ट डॉक्टर से मिलने से पहले आपका स्वास्थ्य विवरण तैयार करने में सहायता करता है। डॉक्टर ही आपके इलाज और दवा का अंतिम निर्णय लेंगे। आपका डेटा पूरी तरह सुरक्षित है।",
  },
  {
    code: "te",
    locale: "te-IN",
    name: "Telugu",
    nativeName: "తెలుగు",
    sampleAudioText: "ప్రీ-కన్సల్ట్‌కు స్వాగతం. డాక్టర్‌ని కలవడానికి ముందు మీ ఆరోగ్య వివరాలను నమోదు చేయండి.",
    consentSpokenText: "ప్రీ-కన్సల్ట్ డాక్టర్‌ను కలవడానికి ముందు మీ ఆరోగ్య చరిత్రను సిద్ధం చేయడంలో సహాయపడుతుంది. డాక్టర్ మాత్రమే మీ చికిత్స మరియు మందులను నిర్ణయిస్తారు. మీ సమాచారం పూర్తిగా సురక్షితం.",
  },
  {
    code: "ta",
    locale: "ta-IN",
    name: "Tamil",
    nativeName: "தமிழ்",
    sampleAudioText: "ப்ரீ-கன்சல்ட்டுக்கு வருக. மருத்துவரை சந்திப்பதற்கு முன் உங்கள் விவரங்களை பதிவு செய்யவும்.",
    consentSpokenText: "ப்ரீ-கன்சல்ட் மருத்துவரைச் சந்திப்பதற்கு முன் உங்கள் மருத்துவ விவரங்களைத் தயாரிக்க உதவுகிறது. சிகிச்சையை மருத்துவர் மட்டுமே முடிவு செய்வார். உங்கள் தகவல் பாதுகாப்பானது.",
  },
  {
    code: "kn",
    locale: "kn-IN",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    sampleAudioText: "ಪ್ರೀ-ಕನ್ಸಲ್ಟ್‌ಗೆ ಸುಸ್ವಾಗತ. ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡುವ ಮುನ್ನ ನಿಮ್ಮ ಆರೋಗ್ಯ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.",
    consentSpokenText: "ಪ್ರೀ-ಕನ್ಸಲ್ಟ್ ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡುವ ಮೊದಲು ನಿಮ್ಮ ಆರೋಗ್ಯ ವಿವರವನ್ನು ಸಿದ್ಧಪಡಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ. ವೈದ್ಯರು ಮಾತ್ರ ಚಿಕಿತ್ಸೆಯನ್ನು ನಿರ್ಧರಿಸುತ್ತಾರೆ. ನಿಮ್ಮ ಡೇಟಾ ಸುರಕ್ಷಿತವಾಗಿದೆ.",
  },
];

export default function PatientConsentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isKioskMode = searchParams.get("mode") === "kiosk";

  const [selectedLang, setSelectedLang] = useState<LanguageCode>("en");
  const [selectedDept, setSelectedDept] = useState<Department>("General Medicine");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(true);
  const [isPending, startTransition] = useTransition();

  const currentLangConfig = LANGUAGES.find((l) => l.code === selectedLang) || LANGUAGES[0];

  // Play spoken guidance using /api/speech/tts (Google Cloud TTS) with Web Speech API fallback
  const playSpokenGuidance = async (text: string, locale: "en-IN" | "hi-IN" | "te-IN" | "ta-IN" | "kn-IN") => {
    if (isPlayingAudio) {
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);

    try {
      // 1. Try Google Cloud TTS via server API
      const res = await fetch("/api/speech/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, languageCode: locale }),
      });

      const data = await res.json();

      if (data.audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => fallbackBrowserSpeech(text, locale);
        await audio.play();
        return;
      }
    } catch {
      // Fallback
    }

    fallbackBrowserSpeech(text, locale);
  };

  const fallbackBrowserSpeech = (text: string, locale: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale;
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(false);
    }
  };

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        const res = await submitConsentAndCreateSessionAction({
          language: selectedLang,
          department: selectedDept,
          isKiosk: isKioskMode,
        });

        if (res.success) {
          router.push(`/patient/interview?session=${res.sessionId}&visit=${res.visitId}`);
        }
      } catch (err) {
        console.error("Consent error:", err);
      }
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-indigo-50/40 via-background to-background text-foreground flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-border/60">
        <Link href="/patient/dashboard" className="inline-flex items-center gap-3 group">
          <Image
            src="/icon.png"
            alt="PreConsult Logo"
            width={34}
            height={34}
            className="rounded-lg bg-indigo-600 shadow-xs transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
              PreConsult
              <span className="inline-flex items-center rounded-md bg-accent px-1.5 py-0.2 text-[11px] font-semibold text-primary">
                {isKioskMode ? "OPD Kiosk Terminal" : "Patient Intake"}
              </span>
            </span>
          </div>
        </Link>

        {/* Audio Guidance Quick Toggle */}
        <button
          onClick={() => playSpokenGuidance(currentLangConfig.consentSpokenText, currentLangConfig.locale)}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
            isPlayingAudio
              ? "bg-primary text-primary-foreground border-primary animate-pulse"
              : "bg-card text-foreground border-border hover:bg-secondary"
          }`}
        >
          {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-primary" />}
          <span>{isPlayingAudio ? "Stop Audio" : "Listen in " + currentLangConfig.nativeName}</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full my-auto py-6 space-y-8">
        {/* Title Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-accent px-3 py-0.5 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step 1 of 4 &bull; Language & Clinical Consent</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Welcome to Clinical Intake
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Choose your language and department. Your answers will help the doctor review your case accurately.
          </p>
        </div>

        {/* 1. Language Selection Cards */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block text-center sm:text-left">
            1. Select Your Preferred Language / భాషను ఎంచుకోండి / भाषा चुनें
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {LANGUAGES.map((lang) => {
              const isSelected = selectedLang === lang.code;
              return (
                <div
                  key={lang.code}
                  onClick={() => {
                    setSelectedLang(lang.code);
                    playSpokenGuidance(lang.sampleAudioText, lang.locale);
                  }}
                  className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer text-center flex flex-col items-center justify-between gap-2 shadow-2xs hover:shadow-md ${
                    isSelected
                      ? "border-primary bg-accent/60 shadow-xs ring-1 ring-primary/30"
                      : "border-border bg-card hover:bg-secondary/60"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <span className="text-xl sm:text-2xl font-bold text-foreground">{lang.nativeName}</span>
                  <span className="text-xs font-medium text-muted-foreground">{lang.name}</span>
                  <span className="text-[11px] text-primary flex items-center gap-1 font-medium mt-1">
                    <Volume2 className="w-3 h-3" /> Tap to hear
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Department Selection Cards */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block text-center sm:text-left">
            2. Choose Consultation Department
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* General Medicine */}
            <div
              onClick={() => setSelectedDept("General Medicine")}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 shadow-2xs hover:shadow-md ${
                selectedDept === "General Medicine"
                  ? "border-primary bg-accent/60 ring-1 ring-primary/30"
                  : "border-border bg-card hover:bg-secondary/60"
              }`}
            >
              <div className={`p-3 rounded-xl ${selectedDept === "General Medicine" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                <Stethoscope className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">General Medicine OPD</h3>
                  {selectedDept === "General Medicine" && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  General symptoms, fever, cough, chest pain, chronic illness & medical history.
                </p>
              </div>
            </div>

            {/* AYUSH / Ayurveda */}
            <div
              onClick={() => setSelectedDept("AYUSH (Ayurveda)")}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 shadow-2xs hover:shadow-md ${
                selectedDept === "AYUSH (Ayurveda)"
                  ? "border-primary bg-accent/60 ring-1 ring-primary/30"
                  : "border-border bg-card hover:bg-secondary/60"
              }`}
            >
              <div className={`p-3 rounded-xl ${selectedDept === "AYUSH (Ayurveda)" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                <Leaf className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">AYUSH / Ayurveda OPD</h3>
                  {selectedDept === "AYUSH (Ayurveda)" && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Holistic Ayurvedic intake, Prakriti, Vikriti, Agni, Ahara-Vihara & lifestyle analysis.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Informed Clinical Consent Box */}
        <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Informed Clinical & AI Consent</h3>
            </div>
            <button
              onClick={() => playSpokenGuidance(currentLangConfig.consentSpokenText, currentLangConfig.locale)}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen in {currentLangConfig.nativeName}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
            <div className="p-3 rounded-xl bg-secondary/50 border border-border/50 space-y-1">
              <span className="font-semibold text-foreground block">1. Assistive Documentation</span>
              <p>PreConsult organizes your symptoms and documents to save time during consultation.</p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50 border border-border/50 space-y-1">
              <span className="font-semibold text-foreground block">2. Doctor Decision</span>
              <p>Your doctor reviews all drafts and remains solely responsible for diagnosis and prescriptions.</p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50 border border-border/50 space-y-1">
              <span className="font-semibold text-foreground block">3. Private & Encrypted</span>
              <p>Protected by health data encryption in compliance with ABDM guidelines.</p>
            </div>
          </div>

          <label className="flex items-center gap-3 pt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-indigo-600 cursor-pointer"
            />
            <span className="text-xs font-medium text-foreground">
              I understand and consent to AI-assisted clinical intake under physician supervision.
            </span>
          </label>
        </div>

        {/* 4. Start Intake Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Link
            href="/patient/dashboard"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel & Return to Dashboard
          </Link>

          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!hasAgreed || isPending}
            className="w-full sm:w-auto px-8 py-6 rounded-xl font-bold text-base cursor-pointer shadow-md bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Initializing Intake...</span>
              </>
            ) : (
              <>
                <span>I Agree & Begin Intake</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground pt-4 border-t border-border/40">
        <span>PreConsult Platform &bull; High-Throughput Hospital & AYUSH OPD Intake</span>
      </footer>
    </div>
  );
}
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Languages,
  Loader2,
  Sparkles,
  Clock,
  Pill,
  Calendar,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PrescriptionAudioItem {
  medicineName: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string | null;
}

interface PrescriptionAudioPlayerProps {
  diagnosis: string;
  prescriptions: PrescriptionAudioItem[];
  doctorNotes?: string | null;
  followUpDate?: string | null;
  defaultLanguage?: string;
}

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", ttsCode: "en-IN", flag: "🇬🇧" },
  { code: "hi", name: "हिन्दी (Hindi)", ttsCode: "hi-IN", flag: "🇮🇳" },
  { code: "te", name: "తెలుగు (Telugu)", ttsCode: "te-IN", flag: "🇮🇳" },
  { code: "ta", name: "தமிழ் (Tamil)", ttsCode: "ta-IN", flag: "🇮🇳" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)", ttsCode: "kn-IN", flag: "🇮🇳" },
];

/**
 * Translates clinical frequency codes into explicit, detailed meal timings.
 */
function getDetailedTiming(frequency: string | undefined, lang: string): string {
  const f = (frequency || "").toLowerCase();

  // 1-0-1 (BD - Morning + Night)
  if (f.includes("1-0-1") || f.includes("bd") || f.includes("twice")) {
    switch (lang) {
      case "hi":
        return "दिन में दो बार: सुबह नाश्ते के बाद 1 खुराक, और रात को खाने के बाद 1 खुराक";
      case "te":
        return "రోజుకు రెండు సార్లు: ఉదయం అల్పాహారం తర్వాత 1 మోతాదు, మరియు రాత్రి భోజనం తర్వాత 1 మోతాదు";
      case "ta":
        return "தினமும் இரண்டு வேளை: காலை உணவுக்குப் பிறகு ஒரு முறை, மற்றும் இரவு உணவுக்குப் பிறகு ஒரு முறை";
      case "kn":
        return "ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ: ಬೆಳಗಿನ ಉಪಾಹಾರದ ನಂತರ 1 ಡೋಸ್, ಮತ್ತು ರಾತ್ರಿಯ ಊಟದ ನಂತರ 1 ಡೋಸ್";
      default:
        return "Twice daily: 1 dose in the morning after breakfast, and 1 dose at night after dinner";
    }
  }

  // 1-0-0 Before Food (Empty Stomach)
  if (f.includes("before") || f.includes("empty stomach") || (f.includes("1-0-0") && f.includes("before"))) {
    switch (lang) {
      case "hi":
        return "सुबह खाली पेट, नाश्ते से आधा घंटा पहले 1 खुराक";
      case "te":
        return "ఉదయం పరిగడుపున, అల్పాహారానికి 30 నిమిషాల ముందు 1 మోతాదు";
      case "ta":
        return "காலை வெறும் வயிற்றில், உணவுக்கு 30 நிமிடங்களுக்கு முன் ஒரு முறை";
      case "kn":
        return "ಬೆಳಿಗ್ಗೆ ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ, ಉಪಾಹಾರಕ್ಕಿಂತ 30 ನಿಮಿಷ ಮುಂಚಿತವಾಗಿ 1 ಡೋಸ್";
      default:
        return "Once daily in the morning on an empty stomach, 30 minutes before breakfast";
    }
  }

  // 1-0-0 (OD - Morning After Breakfast)
  if (f.includes("1-0-0") || f.includes("od") || f.includes("once")) {
    switch (lang) {
      case "hi":
        return "दिन में एक बार: सुबह नाश्ते के बाद 1 खुराक";
      case "te":
        return "రోజుకు ఒకసారి: ఉదయం అల్పాహారం తర్వాత 1 మోతాదు";
      case "ta":
        return "தினமும் ஒரு வேளை: காலை உணவுக்குப் பிறகு ஒரு முறை";
      case "kn":
        return "ದಿನಕ್ಕೆ ಒಂದು ಬಾರಿ: ಬೆಳಗಿನ ಉಪಾಹಾರದ ನಂತರ 1 ಡೋಸ್";
      default:
        return "Once daily in the morning after breakfast";
    }
  }

  // 1-1-1 (TDS - Morning + Afternoon + Night)
  if (f.includes("1-1-1") || f.includes("tds") || f.includes("thrice") || f.includes("three times")) {
    switch (lang) {
      case "hi":
        return "दिन में तीन बार: सुबह नाश्ते के बाद 1 खुराक, दोपहर के भोजन के बाद 1 खुराक, और रात के खाने के बाद 1 खुराक";
      case "te":
        return "రోజుకు మూడు సార్లు: ఉదయం అల్పాహారం తర్వాత 1 మోతాదు, మధ్యాహ్నం భోజనం తర్వాత 1 మోతాదు, మరియు రాత్రి భోజనం తర్వాత 1 మోతాదు";
      case "ta":
        return "தினமும் மூன்று வேளை: காலை உணவுக்குப் பிறகு, மதிய உணவுக்குப் பிறகு, மற்றும் இரவு உணவுக்குப் பிறகு ஒரு முறை";
      case "kn":
        return "ದಿನಕ್ಕೆ ಮೂರು ಬಾರಿ: ಬೆಳಗಿನ ಉಪಾಹಾರದ ನಂತರ 1 ಡೋಸ್, ಮಧ್ಯಾಹ್ನದ ಊಟದ ನಂತರ 1 ಡೋಸ್, ಮತ್ತು ರಾತ್ರಿಯ ಊಟದ ನಂತರ 1 ಡೋಸ್";
      default:
        return "Three times daily: 1 dose in the morning after breakfast, 1 dose in the afternoon after lunch, and 1 dose at night after dinner";
    }
  }

  // 0-0-1 (HS - Night / Bedtime)
  if (f.includes("0-0-1") || f.includes("night") || f.includes("bedtime") || f.includes("hs")) {
    switch (lang) {
      case "hi":
        return "दिन में एक बार: रात को सोने से पहले / रात के खाने के बाद 1 खुराक";
      case "te":
        return "రోజుకు ఒకసారి: రాత్రి పడుకునే ముందు / రాత్రి భోజనం తర్వాత 1 మోతాదు";
      case "ta":
        return "தினமும் ஒரு முறை: இரவு தூங்குவதற்கு முன் / இரவு உணவுக்குப் பிறகு ஒரு முறை";
      case "kn":
        return "ದಿನಕ್ಕೆ ಒಂದು ಬಾರಿ: ರಾತ್ರಿ ಮಲಗುವ ಮುನ್ನ / ರಾತ್ರಿಯ ಊಟದ ನಂತರ 1 ಡೋಸ್";
      default:
        return "Once daily at night, before going to bed after dinner";
    }
  }

  // SOS (As Needed)
  if (f.includes("sos") || f.includes("needed") || f.includes("prn")) {
    switch (lang) {
      case "hi":
        return "केवल आवश्यकता पड़ने पर लें (जैसे तेज बुखार या दर्द होने पर)";
      case "te":
        return "అవసరమైనప్పుడు మాత్రమే తీసుకోండి (ఉదాహరణకు తీవ్రమైన జ్వరం లేదా నొప్పి వచ్చినప్పుడు)";
      case "ta":
        return "தேவைப்படும் போது மட்டும் எடுக்கவும் (காய்ச்சல் அல்லது தீவிர வலி ஏற்பட்டால்)";
      case "kn":
        return "ಅಗತ್ಯವಿದ್ದಾಗ ಮಾತ್ರ ತೆಗೆದುಕೊಳ್ಳಿ (ಜ್ವರ ಅಥವಾ ನೋವು ಕಾಣಿಸಿಕೊಂಡಾಗ)";
      default:
        return "Take only when needed (for example, if high fever or severe pain occurs)";
    }
  }

  // Fallback
  return frequency || "As directed by your doctor";
}

/**
 * Builds the complete spoken audio script in the chosen language.
 */
function buildPrescriptionSpeechText(
  lang: string,
  diagnosis: string,
  prescriptions: PrescriptionAudioItem[],
  doctorNotes?: string | null,
  followUpDate?: string | null
): string {
  const formattedDate = followUpDate ? new Date(followUpDate).toLocaleDateString() : "";

  if (lang === "hi") {
    const medList = prescriptions
      .map((m, i) => {
        const timing = getDetailedTiming(m.frequency, "hi");
        return `दवाई ${i + 1}: ${m.medicineName}। सेवन का समय: ${timing}। यह दवाई ${
          m.duration || "5 दिनों"
        } तक लगातार लेनी है। ${m.instructions ? `विशेष निर्देश: ${m.instructions}।` : ""}`;
      })
      .join(" ");

    return `नमस्ते। डॉक्टर द्वारा आपकी जांच के बाद निश्चित निदान है: ${diagnosis}। आपकी दवाइयां और समय सारणी इस प्रकार है: ${medList}। ${
      doctorNotes ? `डॉक्टर की आवश्यक सलाह: ${doctorNotes}।` : ""
    } ${formattedDate ? `कृपया अपने स्वास्थ्य की दोबारा जांच हेतु ${formattedDate} को अस्पताल आएं।` : ""} इन दवाइयों को समय पर लें और अपना ध्यान रखें। धन्यवाद।`;
  }

  if (lang === "te") {
    const medList = prescriptions
      .map((m, i) => {
        const timing = getDetailedTiming(m.frequency, "te");
        return `మందు సంఖ్య ${i + 1}: ${m.medicineName}. వాడవలసిన సమయం: ${timing}. ఈ మందును ${
          m.duration || "5 రోజులు"
        } పాటు క్రమం తప్పకుండా వాడాలి. ${m.instructions ? `ముఖ్య సూచన: ${m.instructions}.` : ""}`;
      })
      .join(" ");

    return `నమస్కారం. డాక్టర్ పరిశీలించిన తర్వాత మీ వ్యాధి నిర్ధారణ: ${diagnosis}. మీరు తీసుకోవలసిన మందులు మరియు సమయాలు: ${medList}. ${
      doctorNotes ? `డాక్టర్ ఇచ్చిన సలహా: ${doctorNotes}.` : ""
    } ${formattedDate ? `దయచేసి మీ తదుపరి చెకప్ కోసం ${formattedDate} నాడు మళ్లీ రండి.` : ""} మందులను సమయానికి వాడి త్వరగా కోలుకోండి. ధన్యవాదాలు.`;
  }

  if (lang === "ta") {
    const medList = prescriptions
      .map((m, i) => {
        const timing = getDetailedTiming(m.frequency, "ta");
        return `மருந்து ${i + 1}: ${m.medicineName}. உட்கொள்ளும் நேரம்: ${timing}. இந்த மருந்தை ${
          m.duration || "5 நாட்கள்"
        } வரை தொடர்ந்து எடுக்கவும். ${m.instructions ? `சிறப்பு குறிப்பு: ${m.instructions}.` : ""}`;
      })
      .join(" ");

    return `வணக்கம். மருத்துவரின் நோயறிதல்: ${diagnosis}. நீங்கள் சாப்பிட வேண்டிய மருந்துகள் மற்றும் நேர அட்டவணை: ${medList}. ${
      doctorNotes ? `மருத்துவரின் ஆலோசனை: ${doctorNotes}.` : ""
    } ${formattedDate ? `தயவுசெய்து ${formattedDate} அன்று மறுபரிசோதனைக்கு வரவும்.` : ""} மருந்துகளை சரியான நேரத்தில் உட்கொள்ளுங்கள். நன்றி.`;
  }

  if (lang === "kn") {
    const medList = prescriptions
      .map((m, i) => {
        const timing = getDetailedTiming(m.frequency, "kn");
        return `ಔಷಧಿ ${i + 1}: ${m.medicineName}. ತೆಗೆದುಕೊಳ್ಳುವ ಸಮಯ: ${timing}. ಈ ಔಷಧಿಯನ್ನು ${
          m.duration || "5 ದಿನಗಳವರೆಗೆ"
        } ತೆಗೆದುಕೊಳ್ಳಬೇಕು. ${m.instructions ? `ವಿಶೇಷ ಸೂಚನೆ: ${m.instructions}.` : ""}`;
      })
      .join(" ");

    return `ನಮಸ್ಕಾರ. ವೈದ್ಯರ ತಪಾಸಣೆಯ ನಂತರ ನಿಮ್ಮ ರೋಗನಿರ್ಣಯ: ${diagnosis}. ನಿಮ್ಮ ಔಷಧಿಗಳು ಮತ್ತು ಸೇವನೆಯ ಸಮಯ: ${medList}. ${
      doctorNotes ? `ವೈದ್ಯರ ಸಲಹೆ: ${doctorNotes}.` : ""
    } ${formattedDate ? `ದಯವಿಟ್ಟು ${formattedDate} ರಂದು ಮುಂದಿನ ತಪಾಸಣೆಗೆ ಭೇಟಿ ನೀಡಿ.` : ""} ಔಷಧಿಗಳನ್ನು ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ತೆಗೆದುಕೊಳ್ಳಿ. ಧನ್ಯವಾದಗಳು.`;
  }

  // English Spoken Script
  const medList = prescriptions
    .map((m, i) => {
      const timing = getDetailedTiming(m.frequency, "en");
      return `Medicine ${i + 1}: ${m.medicineName}. Daily Schedule: ${timing}, for ${
        m.duration || "the prescribed duration"
      }. ${m.instructions ? `Special advice: ${m.instructions}.` : ""}`;
    })
    .join(" ");

  return `Hello. Following your doctor's consultation, the confirmed diagnosis is ${diagnosis}. Here is your detailed medication schedule: ${medList}. ${
    doctorNotes ? `Doctor's general advice: ${doctorNotes}.` : ""
  } ${formattedDate ? `Your scheduled follow-up appointment is on ${formattedDate}.` : ""} Please adhere to these timings for a fast recovery.`;
}

export default function PrescriptionAudioPlayer({
  diagnosis,
  prescriptions,
  doctorNotes,
  followUpDate,
  defaultLanguage = "en",
}: PrescriptionAudioPlayerProps) {
  const [selectedLang, setSelectedLang] = useState<string>(
    SUPPORTED_LANGUAGES.some((l) => l.code === defaultLanguage) ? defaultLanguage : "en"
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speechScript, setSpeechScript] = useState("");
  const [englishScript, setEnglishScript] = useState("");
  const [showScript, setShowScript] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeLangConfig =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

  // Re-generate speech text when language or details change
  useEffect(() => {
    const text = buildPrescriptionSpeechText(
      selectedLang,
      diagnosis,
      prescriptions,
      doctorNotes,
      followUpDate
    );
    setSpeechScript(text);

    // Also build the English detailed script for reference
    const eng = buildPrescriptionSpeechText(
      "en",
      diagnosis,
      prescriptions,
      doctorNotes,
      followUpDate
    );
    setEnglishScript(eng);

    // Stop any ongoing audio when language changes
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [selectedLang, diagnosis, prescriptions, doctorNotes, followUpDate]);

  const handlePlayAudio = async () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Attempt Google Cloud TTS synthesis via /api/speech/tts
      const res = await fetch("/api/speech/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: speechScript,
          languageCode: activeLangConfig.ttsCode,
        }),
      });

      const data = await res.json();

      if (data.success && data.audioBase64) {
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        audioRef.current.src = `data:${data.mimeType || "audio/mp3"};base64,${data.audioBase64}`;
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => {
          fallbackWebSpeech();
        };

        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);
        return;
      }

      // 2. Fallback to Browser Web Speech API
      fallbackWebSpeech();
    } catch (err) {
      console.warn("Server TTS failed, falling back to Web Speech API:", err);
      fallbackWebSpeech();
    } finally {
      setIsLoading(false);
    }
  };

  const fallbackWebSpeech = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechScript);
    utterance.lang = activeLangConfig.ttsCode;
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-indigo-50/70 via-indigo-50/40 to-blue-50/60 border border-primary/20 space-y-4 shadow-2xs">
      {/* Top Header & Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-2xs shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-foreground flex items-center gap-1.5">
              <span>Spoken Prescription & Meal-Time Schedule</span>
              <span className="inline-flex items-center rounded-md bg-accent px-1.5 py-0.2 text-[10px] font-bold text-primary">
                Voice AI
              </span>
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Listen to exact timings (Breakfast, Lunch, Dinner, Empty Stomach) in your language
            </p>
          </div>
        </div>

        {/* Language Selector Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0 bg-background/90 p-1 rounded-xl border border-border shadow-2xs">
          <Languages className="w-3.5 h-3.5 text-primary ml-1.5 shrink-0" />
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="text-xs font-bold text-foreground bg-transparent pr-2 py-1 focus:outline-hidden cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audio Playback Controls Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-primary/10">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            disabled={isLoading}
            onClick={handlePlayAudio}
            className={`rounded-xl text-xs font-bold gap-2 px-5 py-4.5 cursor-pointer shadow-xs transition-all ${
              isPlaying
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Preparing Spoken Schedule...</span>
              </>
            ) : isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Spoken Audio</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Listen in {activeLangConfig.name.split(" ")[0]}</span>
              </>
            )}
          </Button>

          {isPlaying && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStop}
              className="rounded-xl border-border text-xs font-semibold gap-1.5 cursor-pointer hover:bg-secondary"
            >
              <VolumeX className="w-3.5 h-3.5 text-rose-600" />
              <span>Stop</span>
            </Button>
          )}

          {/* Animated Wave Indicator during playback */}
          {isPlaying && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold">
              <span className="w-1.5 h-3 bg-primary rounded-full animate-pulse" />
              <span className="w-1.5 h-5 bg-primary rounded-full animate-pulse delay-75" />
              <span className="w-1.5 h-4 bg-primary rounded-full animate-pulse delay-150" />
              <span className="text-[11px] font-bold ml-1.5">Speaking ({activeLangConfig.name.split(" ")[0]})...</span>
            </div>
          )}
        </div>

        {/* Toggle Detailed Medication Timetable Button */}
        <button
          onClick={() => setShowScript((prev) => !prev)}
          className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{showScript ? "Hide Spoken Text & English Breakdown" : "View Detailed Schedule & English Breakdown"}</span>
        </button>
      </div>

      {/* Structured Spoken Transcript & English Breakdown Table */}
      {showScript && (
        <div className="p-4 sm:p-5 rounded-2xl bg-background border border-primary/20 space-y-4 animate-fade-in">
          {/* Section A: Selected Language Transcript */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground pb-1 border-b border-border">
              <span className="flex items-center gap-1.5 text-foreground font-bold">
                <span>{activeLangConfig.flag} Spoken Script in {activeLangConfig.name}</span>
              </span>
              <span className="text-primary flex items-center gap-1 text-[10.5px]">
                <Sparkles className="w-3 h-3" />
                Spoken Audio
              </span>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap pt-0.5">
              {speechScript}
            </p>
          </div>

          {/* Section B: Clear English Medication Breakdown with Explicit Meal Timings */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <Pill className="w-4 h-4" />
              <span>English Daily Medication Timings & Instructions:</span>
            </div>

            <div className="space-y-2">
              {prescriptions.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-secondary/40 border border-border/70 text-xs space-y-1"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-extrabold text-foreground text-xs sm:text-sm">
                      {idx + 1}. {p.medicineName}
                    </span>
                    <span className="text-[11px] font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10">
                      {p.duration || "5 Days"}
                    </span>
                  </div>

                  <div className="text-xs text-foreground/90 font-medium flex items-start gap-1.5 pt-0.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-emerald-800 font-bold">Daily Time: </strong>
                      {getDetailedTiming(p.frequency, "en")}
                    </span>
                  </div>

                  {p.instructions && (
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 pt-0.5">
                      <Info className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span>{p.instructions}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* English Doctor Notes & Follow-up */}
            {(doctorNotes || followUpDate) && (
              <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs space-y-1 text-indigo-950 font-medium">
                {doctorNotes && (
                  <p>
                    <strong>Doctor&apos;s Advice: </strong> {doctorNotes}
                  </p>
                )}
                
                {followUpDate && (
                  <p className="flex items-center gap-1.5 pt-0.5 text-primary font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Follow-up Appointment: {new Date(followUpDate).toLocaleDateString()}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
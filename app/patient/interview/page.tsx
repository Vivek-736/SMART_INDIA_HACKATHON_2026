"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Stethoscope,
  Bot,
  User,
  Hand,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInterviewStages, QuestionData } from "@/lib/clinical/interview-engine";
import { 
  recordInterviewTurnAction, 
  finalizeInterviewSessionAction 
} from "./actions";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  sender: "SYSTEM" | "PATIENT";
  text: string;
  timestamp: string;
  extractedPills?: string[];
  isRedFlag?: boolean;
}

type SessionMode = "pending" | "speak" | "tap";

const SESSION_MODE_HEADLINE: Record<string, string> = {
  en: "How would you like to answer questions throughout this session?",
  hi: "इस सत्र में आप प्रश्नों का उत्तर कैसे देना चाहेंगे?",
  te: "ఈ సెషన్‌లో మీరు ప్రశ్నలకు ఎలా సమాధానం ఇవ్వాలనుకుంటున్నారు?",
  ta: "இந்த அமர்வில் கேள்விகளுக்கு நீங்கள் எவ்வாறு பதில் அளிக்க விரும்புகிறீர்கள்?",
  kn: "ಈ ಸೆಷನ್‌ನಲ್ಲಿ ನೀವು ಪ್ರಶ್ನೆಗಳಿಗೆ ಹೇಗೆ ಉತ್ತರಿಸಲು ಬಯಸುತ್ತೀರಿ?",
};

const SESSION_MODE_SUB: Record<string, string> = {
  en: "You can switch at any time during the intake.",
  hi: "आप इंटेक के दौरान कभी भी बदल सकते हैं।",
  te: "ఇంటేక్ సమయంలో మీరు ఎప్పుడైనా మార్చవచ్చు.",
  ta: "உட்கொள்ளும் போது எந்த நேரத்திலும் மாற்றலாம்.",
  kn: "ಇಂಟೇಕ್ ಸಮಯದಲ್ಲಿ ನೀವು ಯಾವಾಗ ಬೇಕಾದರೂ ಬದಲಾಯಿಸಬಹುದು.",
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: VoiceInputPanel
// Fully self-contained — owns MediaRecorder lifecycle, processing state,
// and final transcribed-answer callback. No shared mutation with TapInputPanel.
// ─────────────────────────────────────────────────────────────────────────────

interface VoiceInputPanelProps {
  language: string;
  isProcessingTurn: boolean;
  onTranscribed: (text: string) => void;
  onSwitchMode: () => void;
}

function VoiceInputPanel({ language, isProcessingTurn, onTranscribed, onSwitchMode }: VoiceInputPanelProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setIsTranscribing(true);
        try {
          const formData = new FormData();
          formData.append("audio", blob, "recording.webm");
          formData.append("language", language);
          const res = await fetch("/api/speech/stt", { method: "POST", body: formData });
          const data = await res.json();
          if (data.text?.trim()) {
            onTranscribed(data.text.trim());
          }
        } catch (err) {
          console.error("Transcription failed:", err);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setIsRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      alert("Please allow microphone access to record your answer.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const isBusy = isProcessingTurn || isTranscribing;

  return (
    <div className="flex flex-col items-center gap-5 py-4 animate-fade-in">
      {/* Giant mic button */}
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isBusy}
        className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1.5 font-bold text-sm cursor-pointer transition-all shadow-xl
          ${isRecording
            ? "bg-rose-600 text-white animate-pulse shadow-rose-500/40"
            : "bg-primary text-primary-foreground hover:scale-105 shadow-primary/30"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isBusy ? (
          <Loader2 className="w-9 h-9 animate-spin" />
        ) : isRecording ? (
          <MicOff className="w-9 h-9" />
        ) : (
          <Mic className="w-9 h-9" />
        )}
        <span className="text-[11px] font-semibold leading-tight">
          {isBusy ? "Processing…" : isRecording ? `${seconds}s — Stop` : "Tap to Speak"}
        </span>
        {isRecording && (
          <span className="absolute inset-0 rounded-full border-4 border-rose-400 animate-ping opacity-60 pointer-events-none" />
        )}
      </button>

      <p className="text-xs text-muted-foreground">
        {isRecording ? "Listening… tap the button when done." : "Tap the mic and speak your answer clearly."}
      </p>

      {/* Back to mode chooser */}
      <button
        onClick={onSwitchMode}
        disabled={isRecording || isBusy}
        className="text-[11px] text-muted-foreground underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors disabled:opacity-40"
      >
        ← Switch to tap mode
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: TapInputPanel
// Fully self-contained — owns text state and chip selection.
// Calls onSubmit with the final answer string. No shared mutation with VoiceInputPanel.
// ─────────────────────────────────────────────────────────────────────────────

interface TapInputPanelProps {
  chips: string[];
  isProcessingTurn: boolean;
  onSubmit: (text: string) => void;
  onSwitchMode: () => void;
}

function TapInputPanel({ chips, isProcessingTurn, onSubmit, onSwitchMode }: TapInputPanelProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isProcessingTurn) return;
    setText("");
    onSubmit(trimmed);
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Quick-tap chips */}
      {chips.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            Quick-Tap Answers:
          </span>
          <div className="flex flex-wrap gap-2">
            {chips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => onSubmit(chip)}
                disabled={isProcessingTurn}
                className="px-4 py-2 rounded-full text-sm font-medium border border-border bg-card hover:bg-accent hover:border-primary/50 text-foreground transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text input */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-2xl p-2 sm:p-2.5 shadow-xs">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
          disabled={isProcessingTurn}
          placeholder="Type your answer here…"
          autoFocus
          className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none disabled:opacity-60"
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!text.trim() || isProcessingTurn}
          className="h-10 px-4 rounded-xl font-semibold gap-1.5 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </Button>
      </div>

      {/* Back to mode chooser */}
      <button
        onClick={onSwitchMode}
        disabled={isProcessingTurn}
        className="text-[11px] text-muted-foreground underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors self-start disabled:opacity-40"
      >
        ← Switch to speak mode
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: SessionModeSelect
// Full-screen one-time selection shown BEFORE the first question.
// Once chosen, the mode persists for the entire session (switchable via header).
// ─────────────────────────────────────────────────────────────────────────────

interface SessionModeSelectProps {
  language: string;
  onChoose: (mode: "speak" | "tap") => void;
}

function SessionModeSelect({ language, onChoose }: SessionModeSelectProps) {
  const headline = SESSION_MODE_HEADLINE[language] || SESSION_MODE_HEADLINE.en;
  const sub = SESSION_MODE_SUB[language] || SESSION_MODE_SUB.en;
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 py-12 animate-fade-in">
      <div className="text-center space-y-2 max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Stethoscope className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground leading-snug">
          {headline}
        </h2>
        <p className="text-sm text-muted-foreground">{sub}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <button
          onClick={() => onChoose("speak")}
          className="flex-1 flex flex-col items-center gap-3 py-8 px-6 rounded-3xl bg-primary text-primary-foreground font-bold text-base shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Mic className="w-10 h-10" />
          <div className="text-center">
            <div className="font-extrabold">Speak</div>
            <div className="text-xs font-normal opacity-80 mt-0.5">Use your voice</div>
          </div>
        </button>
        <button
          onClick={() => onChoose("tap")}
          className="flex-1 flex flex-col items-center gap-3 py-8 px-6 rounded-3xl bg-card border-2 border-border text-foreground font-bold text-base shadow-xl hover:bg-accent hover:border-primary/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Hand className="w-10 h-10 text-primary" />
          <div className="text-center">
            <div className="font-extrabold">Tap / Type</div>
            <div className="text-xs font-normal text-muted-foreground mt-0.5">Quick options or keyboard</div>
          </div>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function PatientInterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sessionId = searchParams.get("session") || "session-demo";
  const visitId = searchParams.get("visit") || "visit-demo";
  const language = (searchParams.get("lang") || "en") as "en" | "hi" | "te" | "ta" | "kn";
  const department = searchParams.get("dept") || "General Medicine";
  const isAyushMode = department.includes("AYUSH") || department.includes("Ayurveda");

  const [stages, setStages] = useState<QuestionData[]>(() => getInterviewStages(isAyushMode));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionMode, setSessionMode] = useState<SessionMode>("pending");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  const [isFinalizing, startFinalizingTransition] = useTransition();
  const [hasRedFlag, setHasRedFlag] = useState(false);

  const [intakeSummary, setIntakeSummary] = useState<{
    chiefComplaint?: string;
    hpi?: string;
    pastHistory?: string;
    medicationsAllergies?: string;
    ayushAgni?: string;
    ayushPrakriti?: string;
    ayushData?: Record<string, unknown>;
  }>({});

  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const currentStage = stages[currentStepIndex] || stages[stages.length - 1];
  const isInterviewComplete = currentStepIndex >= stages.length;
  const currentQuestionText = currentStage?.question[language] || currentStage?.question.en || "";
  const currentChips = currentStage?.suggestions
    ? (currentStage.suggestions[language] || currentStage.suggestions.en || [])
    : [];

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isProcessingTurn]);

  // When stage changes: push system message and play TTS.
  // Only runs once sessionMode is chosen (not pending).
  useEffect(() => {
    if (isInterviewComplete || !currentStage || sessionMode === "pending") return;

    const questionText = currentStage.question[language] || currentStage.question.en;

    setMessages((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].sender === "SYSTEM") return prev;
      return [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: "SYSTEM",
          text: questionText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ];
    });

    if (autoPlayAudio) {
      speakText(questionText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepIndex, autoPlayAudio, language, isInterviewComplete, sessionMode]);

  // ─── TTS helpers ────────────────────────────────────────────────────────────

  const localeMap: Record<string, "en-IN" | "hi-IN" | "te-IN" | "ta-IN" | "kn-IN"> = {
    en: "en-IN",
    hi: "hi-IN",
    te: "te-IN",
    ta: "ta-IN",
    kn: "kn-IN",
  };

  const playAudio = (text: string, locale: string): Promise<void> => {
    return new Promise(async (resolve) => {
      setIsPlayingAudio(true);
      try {
        const res = await fetch("/api/speech/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, languageCode: locale }),
        });
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
          audio.onended = () => { setIsPlayingAudio(false); resolve(); };
          audio.onerror = () => { setIsPlayingAudio(false); fallbackSpeak(text, locale, resolve); };
          await audio.play();
          return;
        }
      } catch { /* fallthrough */ }
      fallbackSpeak(text, locale, resolve);
    });
  };

  const fallbackSpeak = (text: string, locale: string, onDone?: () => void) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale;
      utterance.rate = 0.95;
      utterance.onend = () => { setIsPlayingAudio(false); onDone?.(); };
      utterance.onerror = () => { setIsPlayingAudio(false); onDone?.(); };
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(false);
      onDone?.();
    }
  };

  /** Plays a single piece of text aloud. */
  const speakText = (text: string) => {
    const locale = localeMap[language] || "en-IN";
    playAudio(text, locale).catch(() => {});
  };

  const manualReplayQuestion = () => {
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
      return;
    }
    speakText(currentQuestionText);
  };

  /** Called when user picks their mode at the start of the session. */
  const handleSessionModeChosen = (mode: "speak" | "tap") => {
    setSessionMode(mode);
    // Now kick off the first question TTS
    const questionText = currentStage?.question[language] || currentStage?.question.en || "";
    if (autoPlayAudio && questionText) {
      const locale = localeMap[language] || "en-IN";
      playAudio(questionText, locale).catch(() => {});
    }
  };

  // ─── Answer submission ───────────────────────────────────────────────────────

  const handleAnswerSubmit = async (answerText: string) => {
    if (!answerText.trim() || isProcessingTurn) return;

    const trimmed = answerText.trim();
    setIsProcessingTurn(true);

    const userMessage: ChatMessage = {
      id: `pat-${Date.now()}`,
      sender: "PATIENT",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMessage]);

    const nextStage = stages[currentStepIndex + 1];
    const nextBaseQuestion = nextStage?.question[language] || nextStage?.question.en;
    const previousAnswersList = Object.entries(intakeSummary).map(([k, v]) => ({
      section: k,
      answer: String(v),
    }));

    try {
      const result = await recordInterviewTurnAction({
        sessionId,
        visitId,
        section: currentStage.section,
        doctorQuestion: currentQuestionText,
        patientAnswer: trimmed,
        language,
        nextSection: nextStage?.section,
        nextBaseQuestion,
        previousAnswers: previousAnswersList,
      });

      if (result?.extraction) {
        const { redFlagDetected, summarySnippet } = result.extraction;
        if (redFlagDetected) setHasRedFlag(true);

        setIntakeSummary((prev) => {
          const updated = { ...prev };
          if (currentStage.section === "CHIEF_COMPLAINT") updated.chiefComplaint = trimmed;
          else if (currentStage.section === "HPI_DETAILS") updated.hpi = trimmed;
          else if (currentStage.section === "PAST_HISTORY") updated.pastHistory = trimmed;
          else if (currentStage.section === "MEDICATIONS_ALLERGIES") updated.medicationsAllergies = trimmed;
          else if (currentStage.section === "AYUSH_AGNI_DIGESTION") updated.ayushAgni = trimmed;
          else if (currentStage.section === "AYUSH_AHARA_PRAKRITI") updated.ayushPrakriti = trimmed;
          return updated;
        });

        userMessage.extractedPills = [summarySnippet];
        userMessage.isRedFlag = redFlagDetected;
      }

      if (result?.adaptiveNext?.adaptedQuestion) {
        const adaptedQ = result.adaptiveNext.adaptedQuestion;
        const adaptedOptions = result.adaptiveNext.suggestedOptions || [];
        setStages((prevStages) => {
          const nextIdx = currentStepIndex + 1;
          if (!prevStages[nextIdx]) return prevStages;
          const cloned = [...prevStages];
          cloned[nextIdx] = {
            ...cloned[nextIdx],
            question: {
              ...cloned[nextIdx].question,
              [language]: adaptedQ,
            },
            suggestions: {
              ...cloned[nextIdx].suggestions,
              [language]: adaptedOptions.length > 0 ? adaptedOptions : cloned[nextIdx].suggestions[language],
            },
          };
          return cloned;
        });
      }

      setCurrentStepIndex((prev) => prev + 1);
    } catch (err) {
      console.error("Turn submission error:", err);
    } finally {
      setIsProcessingTurn(false);
    }
  };

  const handleFinalize = () => {
    startFinalizingTransition(async () => {
      try {
        const finalAyushData = isAyushMode
          ? {
              department,
              agniAssessment: intakeSummary.ayushAgni || "Normal Agni",
              aharaPrakriti: intakeSummary.ayushPrakriti || "Balanced Ahara-Vihara",
              prakritiAssessment: {
                dominantDosha: intakeSummary.ayushPrakriti?.toLowerCase().includes("vata")
                  ? "VATA"
                  : intakeSummary.ayushPrakriti?.toLowerCase().includes("pitta")
                  ? "PITTA"
                  : intakeSummary.ayushPrakriti?.toLowerCase().includes("kapha")
                  ? "KAPHA"
                  : "TRIDOSHA",
                vataScore: 40,
                pittaScore: 35,
                kaphaScore: 25,
              },
            }
          : null;

        await finalizeInterviewSessionAction(sessionId, visitId, {
          ...intakeSummary,
          ayushData: finalAyushData,
        });
        router.push(`/patient/review?session=${sessionId}&visit=${visitId}`);
      } catch (err) {
        console.error("Finalization error:", err);
      }
    });
  };

  const progressPercent = Math.min(100, Math.round(((currentStepIndex) / stages.length) * 100));

  // ─── Render ─────────────────────────────────────────────────────────────────

  // Before the first question: show the full-screen session mode selection
  if (sessionMode === "pending") {
    return (
      <div className="min-h-screen bg-linear-to-b from-indigo-50/40 via-background to-background text-foreground flex flex-col">
        {/* Minimal header */}
        <header className="py-4 px-6 border-b border-border/60 bg-background/90 backdrop-blur-md">
          <div className="max-w-4xl mx-auto flex items-center gap-2.5">
            <Image src="/icon.png" alt="PreConsult Logo" width={26} height={26} className="rounded-lg bg-indigo-600 shadow-xs" />
            <span className="text-base font-bold tracking-tight text-foreground">
              PreConsult{" "}
              <span className="text-[11px] font-semibold text-primary bg-accent rounded px-1.5 py-0.5">Clinical Intake</span>
            </span>
          </div>
        </header>
        <SessionModeSelect language={language} onChoose={handleSessionModeChosen} />
        <footer className="text-center text-[11px] text-muted-foreground py-2 border-t border-border/40">
          <span>PreConsult Assistive Intake Engine &bull; All diagnoses finalized by attending doctor</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-indigo-50/40 via-background to-background text-foreground flex flex-col justify-between">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border py-3 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <Link href="/patient/dashboard" className="flex items-center gap-2.5 group">
              <Image src="/icon.png" alt="PreConsult Logo" width={28} height={28} className="rounded-lg bg-indigo-600 shadow-xs" />
              <span className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
                PreConsult
                <span className="inline-flex items-center rounded-md bg-accent px-1.5 py-0.2 text-[10.5px] font-semibold text-primary">
                  Clinical Intake
                </span>
              </span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-secondary text-xs font-semibold text-foreground">
                <Stethoscope className="w-3.5 h-3.5 text-primary" />
                <span>{department}</span>
              </div>

              <button
                onClick={manualReplayQuestion}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                  isPlayingAudio
                    ? "bg-primary text-primary-foreground border-primary animate-pulse"
                    : "bg-card text-foreground border-border hover:bg-secondary"
                }`}
              >
                {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-primary" />}
                <span>{isPlayingAudio ? "Stop Audio" : "Replay Question"}</span>
              </button>

              <button
                onClick={() => setAutoPlayAudio(!autoPlayAudio)}
                title="Toggle Auto-Speech"
                className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  autoPlayAudio ? "border-primary/40 bg-accent text-primary" : "border-border text-muted-foreground"
                }`}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
              <span>
                {isInterviewComplete
                  ? "Intake Completed"
                  : `Step ${currentStepIndex + 1} of ${stages.length}: ${currentStage?.title}`}
              </span>
              <span className="text-primary font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
      </header>

      {/* Main conversation canvas */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between gap-6 overflow-hidden">
        {hasRedFlag && (
          <div className="rounded-2xl border border-rose-300 bg-rose-50/90 text-rose-950 p-3.5 flex items-center gap-3 shadow-xs animate-fade-in">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-rose-900">Priority Clinical Symptom Noted</p>
              <p className="text-rose-800">Your high-risk symptom has been highlighted for prioritized review by your attending doctor.</p>
            </div>
          </div>
        )}

        {/* Chat Timeline */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[45vh] sm:max-h-[50vh]">
          {messages.map((msg) => {
            const isDoctor = msg.sender === "SYSTEM";
            return (
              <div key={msg.id} className={`flex gap-3 items-start ${isDoctor ? "justify-start" : "justify-end"}`}>
                {isDoctor && (
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-xl rounded-2xl p-4 shadow-2xs space-y-2 ${
                  isDoctor ? "bg-card border border-border text-foreground" : "bg-primary text-primary-foreground"
                }`}>
                  <div className="flex items-center justify-between gap-4 text-[11px] opacity-80">
                    <span className="font-semibold">{isDoctor ? "PreConsult Intake Doctor" : "You (Patient)"}</span>
                    <span className="font-mono text-[10px]">{msg.timestamp}</span>
                  </div>

                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>

                  {msg.extractedPills && msg.extractedPills.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      {msg.extractedPills.map((pill, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 text-[11px] rounded-md px-2 py-0.5 bg-white/20 text-white font-medium backdrop-blur-xs">
                          <Sparkles className="w-3 h-3 text-indigo-200" />
                          <span>{pill}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {!isDoctor && (
                  <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isProcessingTurn && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-secondary/50 rounded-xl max-w-xs animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Analyzing response & updating clinical draft…</span>
            </div>
          )}
        </div>

        {/* ── Input Area ───────────────────────────────────────────────────────── */}
        {!isInterviewComplete ? (
          <div className="space-y-3 pt-2 border-t border-border/60">
            {/* Voice Input Panel */}
            {sessionMode === "speak" && (
              <VoiceInputPanel
                language={language}
                isProcessingTurn={isProcessingTurn}
                onTranscribed={(text) => handleAnswerSubmit(text)}
                onSwitchMode={() => setSessionMode("tap")}
              />
            )}

            {/* Tap / Text Input Panel */}
            {sessionMode === "tap" && (
              <TapInputPanel
                chips={currentChips}
                isProcessingTurn={isProcessingTurn}
                onSubmit={(text) => handleAnswerSubmit(text)}
                onSwitchMode={() => setSessionMode("speak")}
              />
            )}

            {/* Mode badge */}
            {!isProcessingTurn && (
              <div className="flex items-center gap-2 justify-center pt-1">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                  sessionMode === "speak" ? "bg-primary/10 border-primary/30 text-primary" : "bg-accent border-border text-foreground"
                }`}>
                  {sessionMode === "speak" ? <Mic className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                  {sessionMode === "speak" ? "Voice mode" : "Tap / type mode"}
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Intake Completed */
          <div className="p-6 sm:p-8 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/70 text-emerald-950 shadow-md space-y-5 text-center my-auto animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-emerald-950">
                Clinical Intake Questions Completed!
              </h2>
              <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                Your answers have been synthesized into a structured clinical draft. You can now review your summary and upload any previous prescription reports.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={handleFinalize}
                disabled={isFinalizing}
                className="w-full sm:w-auto px-8 py-6 rounded-xl font-bold text-base cursor-pointer shadow-md bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                {isFinalizing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /><span>Preparing Review Summary…</span></>
                ) : (
                  <><span>Review & Confirm History</span><ArrowRight className="w-5 h-5" /></>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center text-[11px] text-muted-foreground py-2 border-t border-border/40">
        <span>PreConsult Assistive Intake Engine &bull; All diagnoses finalized by attending doctor</span>
      </footer>
    </div>
  );
}
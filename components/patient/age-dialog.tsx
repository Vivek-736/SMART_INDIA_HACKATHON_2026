"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, UserCheck } from "lucide-react";
import { savePatientAgeAction } from "@/app/patient/consent/age-actions";

interface AgeDialogProps {
  /** Dialog is uncontrolled and self-manages open state based on this flag */
  required: boolean;
  /** Called once age is successfully saved so the parent can proceed */
  onComplete: () => void;
}

/**
 * AgeDialog
 *
 * Shown once at the start of the first consent visit when the patient's age
 * is not yet recorded in the database. Completely self-contained — manages
 * its own input state, validation, and server action call.
 *
 * Stays open until a valid age is submitted. Cannot be dismissed without
 * completing it (no close button, no outside-click dismiss).
 */
export default function AgeDialog({ required, onComplete }: AgeDialogProps) {
  const [ageInput, setAgeInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    const age = parseInt(ageInput, 10);

    if (!ageInput.trim() || isNaN(age)) {
      setError("Please enter your age.");
      return;
    }
    if (age < 1 || age > 120) {
      setError("Please enter a valid age between 1 and 120.");
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await savePatientAgeAction(age);
      if (result.success) {
        onComplete();
      } else {
        setError(result.error ?? "Something went wrong. Please try again.");
      }
    });
  };

  return (
    <Dialog open={required} onOpenChange={() => { /* intentionally locked — cannot dismiss */ }}>
      <DialogContent
        className="max-w-sm rounded-2xl"
        showCloseButton={false}
      >
        <DialogHeader className="space-y-2 text-center items-center pb-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <UserCheck className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-extrabold tracking-tight">
            One quick detail
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            To help the clinical team, please enter your age in years.
            You only need to do this once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Age input */}
          <div className="space-y-1.5">
            <label htmlFor="age-input" className="text-xs font-semibold text-foreground">
              Your Age (years)
            </label>
            <input
              id="age-input"
              type="number"
              min={1}
              max={120}
              value={ageInput}
              onChange={(e) => {
                setAgeInput(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              placeholder="e.g. 42"
              autoFocus
              className={`w-full rounded-xl border px-4 py-3 text-base font-semibold text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all
                ${error ? "border-rose-400 bg-rose-50/40" : "border-border"}`}
            />
            {error && (
              <p className="text-xs text-rose-600 font-medium">{error}</p>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full h-11 rounded-xl font-bold text-sm gap-2 cursor-pointer"
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              "Continue to Consent"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
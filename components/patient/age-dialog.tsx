"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, UserCheck } from "lucide-react";
import { savePatientProfileAction } from "@/app/patient/consent/age-actions";

interface AgeDialogProps {
  /** Dialog shows when true; cannot be dismissed without completing */
  required: boolean;
  onComplete: () => void;
}

/**
 * AgeDialog (now a full Patient Profile dialog)
 *
 * Collects age (number input) and gender (dropdown) on the patient's very
 * first visit. Both are required. Cannot be dismissed without submitting.
 * Stays open until both fields are saved to the database successfully.
 */
export default function AgeDialog({ required, onComplete }: AgeDialogProps) {
  const [ageInput, setAgeInput] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
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
    if (!gender) {
      setError("Please select your gender.");
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await savePatientProfileAction(age, gender);
      if (result.success) {
        onComplete();
      } else {
        setError(result.error ?? "Something went wrong. Please try again.");
      }
    });
  };

  return (
    <Dialog open={required} onOpenChange={() => { /* locked — must complete */ }}>
      <DialogContent
        className="max-w-sm rounded-2xl"
        showCloseButton={false}
      >
        <DialogHeader className="space-y-2 text-center items-center pb-1">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <UserCheck className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-extrabold tracking-tight">
            A couple of quick details
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            This helps your clinical team provide better care. You only need to do this once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Age */}
          <div className="space-y-1.5">
            <Label htmlFor="age-input" className="text-xs font-semibold text-foreground">
              Your Age (years)
            </Label>
            <Input
              id="age-input"
              type="number"
              min={1}
              max={120}
              value={ageInput}
              onChange={(e) => { setAgeInput(e.target.value); setError(null); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              placeholder="e.g. 42"
              autoFocus
              className="rounded-xl text-base font-semibold"
            />
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <Label htmlFor="gender-select" className="text-xs font-semibold text-foreground">
              Gender
            </Label>
            <Select
              value={gender}
              onValueChange={(val) => { setGender(val as "male" | "female"); setError(null); }}
            >
              <SelectTrigger id="gender-select" className="rounded-xl w-full">
                <SelectValue placeholder="Select gender…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-rose-600 font-medium">{error}</p>
          )}

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
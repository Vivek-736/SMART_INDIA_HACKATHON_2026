"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirmReviewAction } from "./actions";

interface ConfirmReviewButtonProps {
  visitId: string;
  sessionId: string;
}

/**
 * ConfirmReviewButton
 *
 * Client component — owns the transition state for the confirm server action.
 * On success redirects to /patient/documents; on error shows inline message.
 */
export default function ConfirmReviewButton({ visitId, sessionId }: ConfirmReviewButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await confirmReviewAction(visitId, sessionId);
      if (result.success) {
        router.push(`/patient/documents?visit=${visitId}&session=${sessionId}`);
      } else {
        setError(result.error ?? "Something went wrong. Please try again.");
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {error && (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      )}
      <div className="flex items-center gap-3">
        <a
          href={`/patient/interview?session=${sessionId}&visit=${visitId}`}
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Something looks wrong
        </a>
        <Button
          onClick={handleConfirm}
          disabled={isPending}
          className="px-8 py-6 rounded-xl font-bold text-base cursor-pointer shadow-md bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          {isPending ? (
            <><Loader2 className="w-5 h-5 animate-spin" /><span>Confirming…</span></>
          ) : (
            <><span>Looks Correct — Proceed</span><ArrowRight className="w-5 h-5" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
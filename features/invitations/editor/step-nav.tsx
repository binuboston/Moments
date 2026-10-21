"use client";

import { ArrowLeftIcon, ArrowRightIcon, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EDITOR_STEPS, STEP_DEFINITIONS } from "@/features/invitations/editor/steps";
import { cn } from "@/lib/utils/cn";
import { useEditorStore } from "@/stores/editor-store";

/**
 * Back / Skip / Next for the editor's steps. "card": the footer of the step
 * card on wider screens. "bar": the top row of the fixed bottom bar on phones,
 * always within thumb reach, with Next as a soft full-width button. Only one
 * is rendered at a time (see EditorStepper and InvitationEditor).
 */
export function StepNav({ variant, className }: { variant: "card" | "bar"; className?: string }) {
  const draft = useEditorStore((s) => s.draft)!;
  const step = useEditorStore((s) => s.step);
  const setStep = useEditorStore((s) => s.setStep);
  const setPublishOpen = useEditorStore((s) => s.setPublishOpen);

  const index = EDITOR_STEPS.indexOf(step);
  const def = STEP_DEFINITIONS[step];
  const prev = EDITOR_STEPS[index - 1];
  const next = EDITOR_STEPS[index + 1];
  const canSkip = Boolean(next) && def.optional && !def.complete(draft);
  const finish = draft.status === "published" ? "Review & share" : "Review & publish";
  const onNext = () => (next ? setStep(next) : setPublishOpen(true));

  if (variant === "card") {
    return (
      <div className={cn("flex items-center justify-between gap-3", className)}>
        {prev ? (
          <Button type="button" variant="ghost" onClick={() => setStep(prev)} data-testid="step-back">
            <ArrowLeftIcon aria-hidden /> Back
          </Button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          {canSkip ? (
            <Button type="button" variant="ghost" onClick={onNext}>
              Skip
            </Button>
          ) : null}
          <Button type="button" onClick={onNext} data-testid={next ? "step-next" : "step-review"}>
            {next ? (
              <>
                Next: {STEP_DEFINITIONS[next].short} <ArrowRightIcon aria-hidden />
              </>
            ) : (
              <>
                <SendIcon aria-hidden /> {finish}
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <nav aria-label="Step navigation" className={cn("flex items-center gap-1.5", className)}>
      {prev ? (
        <Button type="button" variant="ghost" size="icon" className="size-11 shrink-0 rounded-2xl" onClick={() => setStep(prev)} aria-label={`Back to ${STEP_DEFINITIONS[prev].short}`} data-testid="step-back">
          <ArrowLeftIcon />
        </Button>
      ) : null}
      {canSkip ? (
        <Button type="button" variant="ghost" className="h-11 shrink-0 rounded-2xl px-3" onClick={onNext}>
          Skip
        </Button>
      ) : null}
      <Button
        type="button"
        variant="soft"
        onClick={onNext}
        className="h-11 min-w-0 flex-1 justify-between rounded-2xl px-4 text-[0.95rem] font-semibold"
        data-testid={next ? "step-next" : "step-review"}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {index + 1}/{EDITOR_STEPS.length}
          </span>
          <span className="truncate">{next ? `Next: ${STEP_DEFINITIONS[next].short}` : finish}</span>
        </span>
        {next ? <ArrowRightIcon aria-hidden /> : <SendIcon aria-hidden />}
      </Button>
    </nav>
  );
}

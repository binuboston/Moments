"use client";

import { CheckIcon } from "lucide-react";
import { useEffect, useRef, type ComponentType } from "react";
import { useFormContext } from "react-hook-form";
import { IconTile } from "@/components/ui/icon-tile";
import { DesignPanel } from "@/features/invitations/editor/panels/design-panel";
import { MusicPanel } from "@/features/invitations/editor/panels/music-panel";
import { PhotosPanel } from "@/features/invitations/editor/panels/photos-panel";
import { SchedulePanel } from "@/features/invitations/editor/panels/schedule-panel";
import { StepNav } from "@/features/invitations/editor/step-nav";
import { EDITOR_STEPS, STEP_DEFINITIONS, type EditorStep } from "@/features/invitations/editor/steps";
import { useMediaQuery, WIDE_SCREEN } from "@/hooks/use-media-query";
import { ExtrasStep } from "@/features/invitations/editor/steps/extras-step";
import { NamesStep } from "@/features/invitations/editor/steps/names-step";
import { WhenStep } from "@/features/invitations/editor/steps/when-step";
import { WhereStep } from "@/features/invitations/editor/steps/where-step";
import { WordsStep } from "@/features/invitations/editor/steps/words-step";
import { categoryStyle } from "@/lib/design/tones";
import { prefersReducedMotion } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils/cn";
import { useEditorStore } from "@/stores/editor-store";

const VIEWS: Record<EditorStep, ComponentType> = {
  names: NamesStep,
  when: WhenStep,
  where: WhereStep,
  words: WordsStep,
  schedule: SchedulePanel,
  photos: PhotosPanel,
  design: DesignPanel,
  music: MusicPanel,
  extras: ExtrasStep,
};

/**
 * The Edit view as one step at a time: a step bar (progress, ticks for done
 * steps, a warning for steps with errors; every step reachable directly), the
 * current step, and Back / Next. Everything autosaves, so moving on never
 * loses anything and optional steps can be skipped. ⌘/Ctrl+Enter goes to the
 * next step. Focus moves to the step's title when the step changes.
 */
export function EditorStepper() {
  const draft = useEditorStore((s) => s.draft)!;
  const step = useEditorStore((s) => s.step);
  const setStep = useEditorStore((s) => s.setStep);
  const direction = useEditorStore((s) => s.stepDirection);
  const { formState } = useFormContext();
  // Phones get Back / Next in the fixed bottom bar instead (InvitationEditor).
  const wide = useMediaQuery(WIDE_SCREEN);
  const heading = useRef<HTMLHeadingElement>(null);
  const shown = useRef(step);

  const index = EDITOR_STEPS.indexOf(step);
  const def = STEP_DEFINITIONS[step];
  const next = EDITOR_STEPS[index + 1];
  const View = VIEWS[step];
  const icon = step === "names" ? categoryStyle(draft.categorySlug) : { icon: def.icon, tone: def.tone };
  const hasErrors = (key: EditorStep) => Boolean(STEP_DEFINITIONS[key].fields?.some((f) => (formState.errors as Record<string, unknown>)[f]));


  // A new step (from Next, the bar, or a publish check): bring it into view and announce its title.
  useEffect(() => {
    if (shown.current === step) return;
    shown.current = step;
    document.getElementById("editor-steps")?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    document.querySelector(`[data-step-chip="${step}"]`)?.scrollIntoView({ inline: "center", block: "nearest" });
    heading.current?.focus({ preventScroll: true });
  }, [step]);

  // ⌘/Ctrl+Enter: next step.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || !(e.metaKey || e.ctrlKey) || !next) return;
      e.preventDefault();
      setStep(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, setStep]);

  const done = EDITOR_STEPS.filter((s) => STEP_DEFINITIONS[s].complete(draft)).length;

  return (
    // minmax(0, 1fr): the step bar scrolls inside its row instead of widening the page.
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
      <nav id="editor-steps" aria-label="Invitation steps" className="scroll-mt-24">
        <div className="mb-3 hidden items-center justify-between gap-3 px-1 text-xs text-muted-foreground sm:flex">
          <span>
            Step {index + 1} of {EDITOR_STEPS.length}
          </span>
          <span>{done} done</span>
        </div>
        <div className="mx-1 mb-3 h-1 overflow-hidden rounded-full bg-fill" aria-hidden>
          <div className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out" style={{ width: `${((index + 1) / EDITOR_STEPS.length) * 100}%` }} />
        </div>
        {/* relative: the chips' screen-reader labels (absolutely positioned) stay inside this scroller instead of widening the page. */}
        <ol className="relative -mx-1 flex gap-1.5 overflow-x-auto px-1 py-1 no-scrollbar">
          {EDITOR_STEPS.map((key, i) => {
            const d = STEP_DEFINITIONS[key];
            const complete = d.complete(draft);
            const current = key === step;
            const error = hasErrors(key);
            return (
              <li key={key} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setStep(key)}
                  aria-current={current ? "step" : undefined}
                  data-step-chip={key}
                  data-testid={`step-${key}`}
                  className={cn(
                    "flex items-center gap-2 rounded-full py-1.5 pr-4 pl-1.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    current ? "bg-foreground text-background" : "bg-surface shadow-card hover:bg-fill",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-6 place-items-center rounded-full text-xs tabular-nums",
                      error ? "bg-destructive text-white" : complete ? "bg-success text-white" : current ? "bg-background/20" : "bg-fill text-muted-foreground",
                    )}
                    aria-hidden
                  >
                    {error ? "!" : complete ? <CheckIcon className="size-3.5" /> : i + 1}
                  </span>
                  {d.short}
                  <span className="sr-only">{error ? " (needs attention)" : complete ? " (done)" : d.optional ? " (optional)" : " (to do)"}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <section aria-labelledby="editor-step-title" className="overflow-hidden sm:surface-card" data-testid={`editor-step-${step}`}>
        <div key={step} className={cn("px-1 pt-2 pb-4 sm:p-8", direction === "next" ? "motion-safe:animate-[step-in-next_0.35s_var(--ease-out-quart)]" : "motion-safe:animate-[step-in-prev_0.35s_var(--ease-out-quart)]")}>
          <header className="mb-6 flex items-start gap-3 sm:mb-7 sm:gap-4">
            <IconTile icon={icon.icon} tone={icon.tone} size={wide ? "lg" : "md"} />
            <div className="min-w-0">
              {/* Phones already show "4/9" in the bottom bar: only "Optional" here. */}
              <p className={cn("text-xs font-medium text-muted-foreground", !def.optional && "hidden sm:block")}>
                <span className="hidden sm:inline">
                  Step {index + 1}
                  {def.optional ? " · " : ""}
                </span>
                {def.optional ? "Optional" : ""}
              </p>
              <h2 id="editor-step-title" ref={heading} tabIndex={-1} className="text-xl font-semibold tracking-tight text-balance outline-none sm:text-2xl">
                {def.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">{def.description}</p>
            </div>
          </header>
          <View />
        </div>
        {wide ? (
          <footer className="border-t border-border bg-fill/40 px-8 py-4">
            <StepNav variant="card" />
          </footer>
        ) : null}
      </section>
    </div>
  );
}

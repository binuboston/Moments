"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2Icon } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { formatEventDate } from "@/lib/utils/dates";
import { rsvpSubmissionSchema, type RsvpSubmissionInput, type RsvpSubmission } from "@/lib/validation/rsvp";
import type { InvitationSettings } from "@/lib/validation/settings";
import { canSubmit, type RenderMode } from "@/features/templates/types";
import { useNow } from "@/hooks/use-now";

interface RsvpFormProps {
  slug: string;
  settings: InvitationSettings["rsvp"];
  timezone: string;
  mode: RenderMode;
  className?: string;
}

const fieldClass =
  "w-full rounded-lg border border-(--inv-border) bg-(--inv-surface) px-3 py-2.5 text-sm text-(--inv-text) outline-none placeholder:text-(--inv-muted)/70 focus-visible:border-(--inv-accent) focus-visible:ring-2 focus-visible:ring-(--inv-accent)/30 aria-invalid:border-red-500";
const labelClass = "mb-1.5 block text-xs font-medium tracking-wide text-(--inv-muted)";

export function RsvpForm({ slug, settings, timezone, mode, className }: RsvpFormProps) {
  const [done, setDone] = useState<{ updated: boolean } | null>(null);
  const now = useNow();
  const closed = now !== null && Boolean(settings.deadline) && new Date(settings.deadline).getTime() < now;

  const form = useForm<RsvpSubmissionInput, unknown, RsvpSubmission>({
    resolver: zodResolver(rsvpSubmissionSchema),
    defaultValues: { slug, guestName: "", attendance: "yes", guestCount: 1, message: "", dietaryNotes: "", contact: "", website: "" },
  });

  const attendance = useWatch({ control: form.control, name: "attendance" });

  const onSubmit = async (values: RsvpSubmission) => {
    if (!canSubmit(mode)) {
      toast.info("This is a preview. Guest responses are saved only on the published invitation.");
      return;
    }
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string; updated?: boolean };
      if (!res.ok) {
        toast.error(json.error ?? "We couldn't save your response. Please try again.");
        return;
      }
      setDone({ updated: Boolean(json.updated) });
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    }
  };

  if (closed) {
    return (
      <p className={cn("mx-auto max-w-md text-(--inv-muted)", className)} role="status">
        RSVPs closed on {formatEventDate(settings.deadline, timezone)}. Please contact the hosts directly.
      </p>
    );
  }

  if (done) {
    return (
      <div className={cn("mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-(--inv-border) bg-(--inv-surface) p-8", className)} role="status">
        <CheckCircle2Icon className="size-8 text-(--inv-accent)" aria-hidden />
        <p className="inv-display text-2xl">{done.updated ? "Response updated" : "Thank you!"}</p>
        <p className="text-sm text-(--inv-muted)">
          {done.updated ? "We've updated your earlier response." : "Your response has been sent to the hosts."}
        </p>
        <button type="button" onClick={() => setDone(null)} className="text-sm underline underline-offset-4">
          Change my response
        </button>
      </div>
    );
  }

  const errors = form.formState.errors;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("mx-auto grid max-w-md gap-4 text-left", className)}
      noValidate
      aria-describedby={!canSubmit(mode) ? "rsvp-preview-note" : undefined}
    >
      {!canSubmit(mode) ? (
        <p id="rsvp-preview-note" className="rounded-lg bg-(--inv-surface) px-3 py-2 text-xs text-(--inv-muted)">
          Preview: guests will be able to respond here once you publish.
        </p>
      ) : null}
      {settings.deadline ? (
        <p className="text-xs text-(--inv-muted)">Please respond by {formatEventDate(settings.deadline, timezone)}.</p>
      ) : null}

      <input type="hidden" {...form.register("slug")} />
      {/* Honeypot: hidden from humans, filled by naive bots */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor={`rsvp-website-${slug}`}>Website</label>
        <input id={`rsvp-website-${slug}`} type="text" tabIndex={-1} autoComplete="off" {...form.register("website")} />
      </div>

      <div>
        <label htmlFor={`rsvp-name-${slug}`} className={labelClass}>
          Your name
        </label>
        <input
          id={`rsvp-name-${slug}`}
          className={fieldClass}
          autoComplete="name"
          aria-invalid={errors.guestName ? true : undefined}
          aria-describedby={errors.guestName ? `rsvp-name-error-${slug}` : undefined}
          {...form.register("guestName")}
        />
        {errors.guestName ? (
          <p id={`rsvp-name-error-${slug}`} className="mt-1 text-xs text-red-600" role="alert">
            {errors.guestName.message}
          </p>
        ) : null}
      </div>

      <fieldset>
        <legend className={labelClass}>Will you attend?</legend>
        <div className="grid grid-cols-3 gap-2">
          {(["yes", "no", "maybe"] as const).map((value) => (
            <label
              key={value}
              className={cn(
                "cursor-pointer rounded-lg border px-3 py-2.5 text-center text-sm font-medium capitalize transition-colors",
                attendance === value
                  ? "border-(--inv-accent) bg-(--inv-accent) text-(--inv-accent-contrast)"
                  : "border-(--inv-border) bg-(--inv-surface) hover:border-(--inv-accent)",
              )}
            >
              <input type="radio" value={value} className="sr-only" {...form.register("attendance")} />
              {value === "yes" ? "Joyfully yes" : value === "no" ? "Regretfully no" : "Maybe"}
            </label>
          ))}
        </div>
      </fieldset>

      {settings.allowGuestCount && attendance !== "no" ? (
        <div>
          <label htmlFor={`rsvp-count-${slug}`} className={labelClass}>
            Number of guests (including you)
          </label>
          <select id={`rsvp-count-${slug}`} className={fieldClass} {...form.register("guestCount")}>
            {Array.from({ length: settings.maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {settings.askContact ? (
        <div>
          <label htmlFor={`rsvp-contact-${slug}`} className={labelClass}>
            Phone or email (optional)
          </label>
          <input id={`rsvp-contact-${slug}`} className={fieldClass} autoComplete="email" {...form.register("contact")} />
        </div>
      ) : null}

      {settings.askDietary && attendance !== "no" ? (
        <div>
          <label htmlFor={`rsvp-dietary-${slug}`} className={labelClass}>
            Dietary or accessibility needs (optional)
          </label>
          <input id={`rsvp-dietary-${slug}`} className={fieldClass} {...form.register("dietaryNotes")} />
        </div>
      ) : null}

      <div>
        <label htmlFor={`rsvp-message-${slug}`} className={labelClass}>
          A message for the hosts (optional)
        </label>
        <textarea id={`rsvp-message-${slug}`} rows={3} className={fieldClass} {...form.register("message")} />
      </div>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-(--inv-accent) px-6 text-sm font-semibold text-(--inv-accent-contrast) transition hover:brightness-95 disabled:opacity-60"
      >
        {form.formState.isSubmitting ? "Sending…" : "Send response"}
      </button>
    </form>
  );
}

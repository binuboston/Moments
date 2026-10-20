"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Field, fieldAria } from "@/components/forms/field";
import { DateTimeField } from "@/features/invitations/editor/fields";
import { invitationsApi } from "@/features/invitations/api";
import { errorMessage } from "@/features/invitations/hooks";
import { publicEnv } from "@/lib/env";
import { slugSchema } from "@/lib/utils/slug";
import { useEditorStore } from "@/stores/editor-store";

function SlugEditor() {
  const draft = useEditorStore((s) => s.draft)!;
  const syncStatus = useEditorStore((s) => s.syncStatus);
  const [value, setValue] = useState(draft.slug);
  const [debounced, setDebounced] = useState(draft.slug);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value.trim().toLowerCase()), 400);
    return () => clearTimeout(t);
  }, [value]);

  const parsed = slugSchema.safeParse(debounced);
  const changed = debounced !== draft.slug;
  const availability = useQuery({
    queryKey: ["slug-availability", debounced, draft.id],
    queryFn: () => invitationsApi.slugAvailable(debounced, draft.id),
    enabled: changed && parsed.success,
    staleTime: 10_000,
  });

  const save = useMutation({
    mutationFn: () => invitationsApi.update(draft.id, { slug: debounced }),
    onSuccess: (saved) => {
      syncStatus({ status: saved.status, publishedAt: saved.publishedAt, slug: saved.slug });
      toast.success("Address updated");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const base = publicEnv().NEXT_PUBLIC_SITE_URL.replace(/^https?:\/\//, "");
  const error = changed && !parsed.success ? parsed.error.issues[0]?.message : changed && availability.data && !availability.data.available ? (availability.data.reason ?? "That address is taken") : undefined;
  const canSave = changed && parsed.success && availability.data?.available === true && !save.isPending;

  return (
    <Field id="slug" label="Invitation address" hint="Lowercase letters, numbers and hyphens. Changing it breaks links you've already shared." error={error}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 items-center overflow-hidden rounded-lg border border-input bg-surface focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25">
          <span className="hidden shrink-0 border-r border-input bg-subtle px-3 py-2 text-xs text-muted-foreground sm:block">{base}/e/</span>
          <Input value={value} onChange={(e) => setValue(e.target.value)} className="border-0 shadow-none focus-visible:ring-0" {...fieldAria("slug", { error })} data-testid="field-slug" />
          <span className="pr-3" aria-live="polite">
            {changed && parsed.success ? (
              availability.isFetching ? null : availability.data?.available ? (
                <CheckCircle2Icon className="size-4 text-success" aria-label="Available" />
              ) : availability.data ? (
                <XCircleIcon className="size-4 text-destructive" aria-label="Unavailable" />
              ) : null
            ) : null}
          </span>
        </div>
        <Button type="button" variant="outline" disabled={!canSave} loading={save.isPending} onClick={() => save.mutate()}>
          Save address
        </Button>
      </div>
    </Field>
  );
}

export function SettingsPanel() {
  const draft = useEditorStore((s) => s.draft)!;
  const setTitle = useEditorStore((s) => s.setTitle);
  const setSettings = useEditorStore((s) => s.setSettings);
  const setRsvp = useEditorStore((s) => s.setRsvpSettings);
  const rsvp = draft.settings.rsvp;
  const timezone = (draft.content as { timezone?: string }).timezone ?? "UTC";

  return (
    <div className="grid gap-8">
      <section className="grid gap-5">
        <h2 className="text-base font-semibold">Invitation</h2>
        <Field id="title" label="Internal title" hint="Only you see this, in your dashboard. Defaults to the headline when you publish.">
          <Input id="title" value={draft.title} onChange={(e) => setTitle(e.target.value)} placeholder={(draft.content as { headline?: string }).headline || "e.g. Aisha & Rohan's wedding"} />
        </Field>
        <SlugEditor />
      </section>

      <section className="grid gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">RSVP</h2>
            <p className="mt-1 text-sm text-muted-foreground">Let guests respond on the invitation. Responses are private to you.</p>
          </div>
          <Switch checked={rsvp.enabled} onCheckedChange={(v) => setRsvp({ enabled: v })} aria-label="Enable RSVP" data-testid="rsvp-toggle" />
        </div>
        {rsvp.enabled ? (
          <div className="grid gap-4 rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="rsvp-count" className="text-sm font-normal">
                Ask how many guests are coming
              </Label>
              <Switch id="rsvp-count" checked={rsvp.allowGuestCount} onCheckedChange={(v) => setRsvp({ allowGuestCount: v })} />
            </div>
            {rsvp.allowGuestCount ? (
              <Field id="rsvp-max" label="Maximum guests per response">
                <Input id="rsvp-max" type="number" min={1} max={20} value={rsvp.maxGuests} onChange={(e) => setRsvp({ maxGuests: Math.min(20, Math.max(1, Number(e.target.value) || 1)) })} className="w-28" />
              </Field>
            ) : null}
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="rsvp-dietary" className="text-sm font-normal">
                Ask about dietary or accessibility needs
              </Label>
              <Switch id="rsvp-dietary" checked={rsvp.askDietary} onCheckedChange={(v) => setRsvp({ askDietary: v })} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="rsvp-contact" className="text-sm font-normal">
                Ask for a phone or email
              </Label>
              <Switch id="rsvp-contact" checked={rsvp.askContact} onCheckedChange={(v) => setRsvp({ askContact: v })} />
            </div>
            <DateTimeField id="rsvp-deadline" label="RSVP deadline" optional value={rsvp.deadline} timezone={timezone} onChange={(iso) => setRsvp({ deadline: iso })} />
          </div>
        ) : null}
      </section>

      <section className="grid gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Calendar buttons</h2>
            <p className="mt-1 text-sm text-muted-foreground">Show “Add to Google Calendar” and “.ics” buttons.</p>
          </div>
          <Switch checked={draft.settings.showCalendarActions} onCheckedChange={(v) => setSettings({ showCalendarActions: v })} aria-label="Show calendar buttons" />
        </div>
      </section>

      <section className="grid gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Opening envelope</h2>
            <p className="mt-1 text-sm text-muted-foreground">Guests tap a sealed envelope to open your invitation. Links to a section (such as #rsvp) skip it.</p>
          </div>
          <Switch checked={draft.settings.openingCover} onCheckedChange={(v) => setSettings({ openingCover: v })} aria-label="Show opening envelope" />
        </div>
      </section>
    </div>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownIcon, ArrowUpIcon, CalendarPlusIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { DateTimeField, TextField, TextareaField, TimezoneField } from "@/features/invitations/editor/fields";
import { formatEventDate, formatTimeRange, nextRoundHourIso } from "@/lib/utils/dates";
import { functionSchema, type InvitationFunctionInput } from "@/lib/validation/functions";
import { useEditorStore } from "@/stores/editor-store";

type FormValues = Required<Omit<InvitationFunctionInput, "id">> & { id?: string };

function FunctionDialog({ open, onOpenChange, initial, onSave, defaultTimezone }: { open: boolean; onOpenChange: (o: boolean) => void; initial: InvitationFunctionInput | null; onSave: (fn: InvitationFunctionInput) => void; defaultTimezone: string }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(functionSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      id: initial?.id,
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      startsAt: initial?.startsAt ?? nextRoundHourIso(defaultTimezone),
      endsAt: initial?.endsAt ?? "",
      timezone: initial?.timezone ?? defaultTimezone,
      venueName: initial?.venueName ?? "",
      address: initial?.address ?? "",
      mapsUrl: initial?.mapsUrl ?? "",
      dressCode: initial?.dressCode ?? "",
      sortOrder: initial?.sortOrder ?? 0,
    },
  });
  const { errors, isSubmitting } = form.formState;
  const timezone = useWatch({ control: form.control, name: "timezone" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit event" : "Add an event"}</DialogTitle>
          <DialogDescription>Each function appears in the schedule with its own time and place.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          noValidate
          onSubmit={form.handleSubmit((values) => {
            onSave(values);
            onOpenChange(false);
          })}
        >
          <TextField id="fn-name" label="Name" hint="e.g. Mehendi, Ceremony, Reception" error={errors.name?.message} inputProps={form.register("name")} />
          <TimezoneField id="fn-timezone" label="Time zone" value={timezone} onChange={(tz) => form.setValue("timezone", tz)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller control={form.control} name="startsAt" render={({ field }) => <DateTimeField id="fn-starts" label="Starts" value={field.value} timezone={timezone} onChange={field.onChange} error={errors.startsAt?.message} />} />
            <Controller control={form.control} name="endsAt" render={({ field }) => <DateTimeField id="fn-ends" label="Ends" optional value={field.value} timezone={timezone} onChange={field.onChange} error={errors.endsAt?.message} />} />
          </div>
          <TextField id="fn-venue" label="Venue" optional error={errors.venueName?.message} inputProps={form.register("venueName")} />
          <TextField id="fn-address" label="Address" optional error={errors.address?.message} inputProps={form.register("address")} />
          <TextField id="fn-maps" label="Directions link" optional error={errors.mapsUrl?.message} inputProps={{ type: "url", placeholder: "https://…", ...form.register("mapsUrl") }} />
          <TextField id="fn-dress" label="Dress code" optional error={errors.dressCode?.message} inputProps={form.register("dressCode")} />
          <TextareaField id="fn-description" label="Notes" optional error={errors.description?.message} textareaProps={{ rows: 3, ...form.register("description") }} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {initial ? "Save changes" : "Add event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SchedulePanel() {
  const functions = useEditorStore((s) => s.draft?.functions ?? []);
  const timezone = useEditorStore((s) => (s.draft?.content as { timezone?: string } | undefined)?.timezone ?? "UTC");
  const setFunctions = useEditorStore((s) => s.setFunctions);
  const [editing, setEditing] = useState<{ index: number | null } | null>(null);

  const sorted = functions.map((f, i) => ({ ...f, sortOrder: i }));

  const save = (fn: InvitationFunctionInput) => {
    if (editing?.index === null || editing?.index === undefined) {
      setFunctions([...sorted, { ...fn, sortOrder: sorted.length }]);
    } else {
      setFunctions(sorted.map((f, i) => (i === editing.index ? { ...fn, id: f.id, sortOrder: i } : f)));
    }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= sorted.length) return;
    const next = [...sorted];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setFunctions(next.map((f, i) => ({ ...f, sortOrder: i })));
  };

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-base font-semibold">Schedule</h2>
        <p className="mt-1 text-sm text-muted-foreground">Optional. Add separate functions such as a mehendi, ceremony and reception. They appear as a timeline on the invitation.</p>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={CalendarPlusIcon}
          title="No events in the schedule yet"
          description="For a single-event invitation you can skip this. Add functions if your celebration spans several events."
          action={
            <Button onClick={() => setEditing({ index: null })}>
              <CalendarPlusIcon aria-hidden /> Add an event
            </Button>
          }
        />
      ) : (
        <>
          <ol className="grid gap-3">
            {sorted.map((fn, i) => (
              <li key={fn.id ?? i} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface p-4">
                <div className="min-w-0">
                  <p className="font-medium">{fn.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatEventDate(fn.startsAt, fn.timezone ?? timezone)} · {formatTimeRange(fn.startsAt, fn.endsAt, fn.timezone ?? timezone)}
                  </p>
                  {fn.venueName ? <p className="mt-1 truncate text-xs text-muted-foreground">{fn.venueName}</p> : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move up">
                    <ArrowUpIcon />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => move(i, i + 1)} disabled={i === sorted.length - 1} aria-label="Move down">
                    <ArrowDownIcon />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setEditing({ index: i })} aria-label={`Edit ${fn.name}`}>
                    <PencilIcon />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setFunctions(sorted.filter((_, j) => j !== i))} aria-label={`Remove ${fn.name}`}>
                    <Trash2Icon className="text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ol>
          {sorted.length < 12 ? (
            <div>
              <Button variant="outline" onClick={() => setEditing({ index: null })}>
                <CalendarPlusIcon aria-hidden /> Add another event
              </Button>
            </div>
          ) : null}
        </>
      )}

      {editing ? (
        <FunctionDialog key={editing.index ?? "new"} open onOpenChange={(o) => !o && setEditing(null)} initial={editing.index === null ? null : sorted[editing.index]} onSave={save} defaultTimezone={timezone} />
      ) : null}
    </div>
  );
}

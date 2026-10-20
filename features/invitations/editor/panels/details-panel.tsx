"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, SparklesIcon, Trash2Icon } from "lucide-react";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm, useWatch, type Resolver } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DateTimeField, TextField, TextareaField, TimezoneField } from "@/features/invitations/editor/fields";
import { contentSchemaByKind, suggestHeadline, type ContentKind, type InvitationContentInput } from "@/lib/validation/content";
import { fromLocalInputValue, toLocalInputValue } from "@/lib/utils/dates";
import { useEditorStore } from "@/stores/editor-store";

/** Flat form shape covering every category; the resolver enforces the active category's schema. */
export interface ContentFormValues {
  kind: ContentKind;
  headline: string;
  subheading: string;
  intro: string;
  hosts: string;
  message: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  venue: { name: string; address: string; mapsUrl: string };
  contacts: { name: string; phone: string; email: string }[];
  gifts: { note: string; url: string };
  dressCode: string;
  partnerOne?: string;
  partnerTwo?: string;
  familyOne?: string;
  familyTwo?: string;
  celebrantName?: string;
  age?: number | "";
  years?: number | "";
  parentNames?: string;
  babyName?: string;
  reveal?: "surprise" | "boy" | "girl";
  hostNames?: string;
  occasion?: string;
  organisation?: string;
  agenda?: string;
}

interface KindField {
  name: keyof ContentFormValues;
  label: string;
  hint?: string;
  optional?: boolean;
  type?: "text" | "number";
}

const KIND_FIELDS: Record<ContentKind, KindField[]> = {
  wedding: [
    { name: "partnerOne", label: "Partner one" },
    { name: "partnerTwo", label: "Partner two" },
    { name: "familyOne", label: "Family of partner one", hint: "e.g. Daughter of Farah & Imran Khan", optional: true },
    { name: "familyTwo", label: "Family of partner two", optional: true },
  ],
  engagement: [
    { name: "partnerOne", label: "Partner one" },
    { name: "partnerTwo", label: "Partner two" },
  ],
  birthday: [
    { name: "celebrantName", label: "Who's celebrating?" },
    { name: "age", label: "Age", type: "number", optional: true },
  ],
  anniversary: [
    { name: "partnerOne", label: "Partner one" },
    { name: "partnerTwo", label: "Partner two" },
    { name: "years", label: "Years together", type: "number", optional: true },
  ],
  "baby-shower": [
    { name: "parentNames", label: "Parents-to-be", hint: "e.g. Elena & Marco" },
    { name: "babyName", label: "Baby's name", optional: true },
  ],
  housewarming: [{ name: "hostNames", label: "Hosts" }],
  party: [
    { name: "occasion", label: "Occasion", hint: "e.g. Midsummer Soirée", optional: true },
    { name: "hostNames", label: "Hosts", optional: true },
  ],
  corporate: [
    { name: "organisation", label: "Organisation" },
    { name: "agenda", label: "Agenda", hint: "Separate items with · or new lines", optional: true },
  ],
};

export function DetailsPanel() {
  const draft = useEditorStore((s) => s.draft);
  const setContent = useEditorStore((s) => s.setContent);
  const kind = draft!.categorySlug;

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchemaByKind[kind]) as unknown as Resolver<ContentFormValues>,
    defaultValues: draft!.content as unknown as ContentFormValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    const unsubscribe = form.subscribe({
      formState: { values: true },
      callback: ({ values }) => setContent(values as unknown as InvitationContentInput),
    });
    return unsubscribe;
  }, [form, setContent]);

  const contacts = useFieldArray({ control: form.control, name: "contacts" });
  const { errors } = form.formState;
  const err = (path: string) => {
    const parts = path.split(".");
    let cur: unknown = errors;
    for (const p of parts) cur = (cur as Record<string, unknown> | undefined)?.[p];
    return (cur as { message?: string } | undefined)?.message;
  };

  const changeTimezone = (tz: string) => {
    const prev = form.getValues("timezone");
    const starts = form.getValues("startsAt");
    const ends = form.getValues("endsAt");
    form.setValue("timezone", tz, { shouldDirty: true });
    if (starts) form.setValue("startsAt", fromLocalInputValue(toLocalInputValue(starts, prev), tz), { shouldDirty: true });
    if (ends) form.setValue("endsAt", fromLocalInputValue(toLocalInputValue(ends, prev), tz), { shouldDirty: true });
  };

  const suggest = () => {
    const values = form.getValues();
    const suggestion = suggestHeadline({ ...values, kind } as Partial<InvitationContentInput> & { kind: ContentKind });
    if (suggestion) form.setValue("headline", suggestion, { shouldDirty: true, shouldValidate: true });
  };

  const timezone = useWatch({ control: form.control, name: "timezone" });

  return (
    <form className="grid gap-8" noValidate onSubmit={(e) => e.preventDefault()}>
      <fieldset className="grid gap-5">
        <legend className="mb-1 text-sm font-semibold">Who</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          {KIND_FIELDS[kind].map((f) => (
            <TextField
              key={f.name}
              id={`content-${f.name}`}
              label={f.label}
              hint={f.hint}
              optional={f.optional}
              error={err(f.name)}
              inputProps={
                f.type === "number"
                  ? { type: "number", inputMode: "numeric", min: 1, ...form.register(f.name as "age", { setValueAs: (v) => (v === "" || v === null ? "" : Number(v)) }) }
                  : { ...form.register(f.name as "partnerOne") }
              }
            />
          ))}
        </div>
        {kind === "baby-shower" ? (
          <div className="grid gap-2">
            <Label>Reveal</Label>
            <Controller
              control={form.control}
              name="reveal"
              render={({ field }) => (
                <RadioGroup value={field.value ?? "surprise"} onValueChange={field.onChange} className="flex flex-wrap gap-4">
                  {(["surprise", "boy", "girl"] as const).map((v) => (
                    <label key={v} className="flex items-center gap-2 text-sm capitalize">
                      <RadioGroupItem value={v} /> {v === "surprise" ? "Keep it a surprise" : `It's a ${v}`}
                    </label>
                  ))}
                </RadioGroup>
              )}
            />
          </div>
        ) : null}
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="mb-1 text-sm font-semibold">Headline</legend>
        <div className="grid gap-2">
          <TextField
            id="content-headline"
            label="Invitation headline"
            hint={
              kind === "wedding" || kind === "engagement" || kind === "anniversary"
                ? "Shown as its own line above your names, e.g. “Together with their families” or “We're getting married”."
                : "The big title on the invitation, e.g. “Maya turns five”."
            }
            error={err("headline")}
            inputProps={{ ...form.register("headline"), "data-testid": "field-headline" } as React.ComponentProps<"input">}
          />
          <div>
            <Button type="button" variant="ghost" size="sm" onClick={suggest}>
              <SparklesIcon aria-hidden /> Suggest from names
            </Button>
          </div>
        </div>
        <TextField id="content-subheading" label="Subheading" optional hint="e.g. “are getting married”, “A garden party”" error={err("subheading")} inputProps={form.register("subheading")} />
        <TextareaField id="content-intro" label="Introduction" optional hint="A short welcome. Two or three sentences work best." error={err("intro")} textareaProps={{ rows: 4, ...form.register("intro") }} />
        <TextField id="content-hosts" label="Hosted by" optional hint="e.g. “With the blessings of the Khan and Mehta families”" error={err("hosts")} inputProps={form.register("hosts")} />
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="mb-1 text-sm font-semibold">When</legend>
        <TimezoneField id="content-timezone" label="Time zone" value={timezone} onChange={changeTimezone} error={err("timezone")} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="startsAt"
            render={({ field }) => <DateTimeField id="content-startsAt" label="Starts" value={field.value} timezone={timezone} onChange={field.onChange} error={err("startsAt")} />}
          />
          <Controller
            control={form.control}
            name="endsAt"
            render={({ field }) => <DateTimeField id="content-endsAt" label="Ends" optional value={field.value} timezone={timezone} onChange={field.onChange} error={err("endsAt")} />}
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="mb-1 text-sm font-semibold">Where</legend>
        <TextField id="content-venue-name" label="Venue name" optional error={err("venue.name")} inputProps={{ ...form.register("venue.name"), "data-testid": "field-venue-name" } as React.ComponentProps<"input">} />
        <TextareaField id="content-venue-address" label="Address" optional error={err("venue.address")} textareaProps={{ rows: 2, ...form.register("venue.address") }} />
        <TextField id="content-venue-maps" label="Directions link" optional hint="Paste a Google Maps or Apple Maps link (https://…)" error={err("venue.mapsUrl")} inputProps={{ type: "url", inputMode: "url", placeholder: "https://maps.google.com/…", ...form.register("venue.mapsUrl") }} />
        <TextField id="content-dressCode" label="Dress code" optional error={err("dressCode")} inputProps={form.register("dressCode")} />
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="mb-1 text-sm font-semibold">Contacts</legend>
        <p className="-mt-3 text-xs text-muted-foreground">Who can guests reach with questions? Up to four people.</p>
        {contacts.fields.map((field, i) => (
          <div key={field.id} className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
            <TextField id={`contact-${i}-name`} label="Name" error={err(`contacts.${i}.name`)} inputProps={form.register(`contacts.${i}.name` as const)} />
            <TextField id={`contact-${i}-phone`} label="Phone" optional error={err(`contacts.${i}.phone`)} inputProps={{ type: "tel", ...form.register(`contacts.${i}.phone` as const) }} />
            <TextField id={`contact-${i}-email`} label="Email" optional error={err(`contacts.${i}.email`)} inputProps={{ type: "email", ...form.register(`contacts.${i}.email` as const) }} />
            <Button type="button" variant="ghost" size="icon" onClick={() => contacts.remove(i)} aria-label={`Remove contact ${i + 1}`}>
              <Trash2Icon />
            </Button>
          </div>
        ))}
        {contacts.fields.length < 4 ? (
          <div>
            <Button type="button" variant="outline" size="sm" onClick={() => contacts.append({ name: "", phone: "", email: "" })}>
              <PlusIcon aria-hidden /> Add contact
            </Button>
          </div>
        ) : null}
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="mb-1 text-sm font-semibold">Gifts & closing</legend>
        <TextareaField id="content-gifts-note" label="Gift note" optional hint="e.g. “Your presence is the greatest gift…”" error={err("gifts.note")} textareaProps={{ rows: 3, ...form.register("gifts.note") }} />
        <TextField id="content-gifts-url" label="Registry link" optional error={err("gifts.url")} inputProps={{ type: "url", placeholder: "https://…", ...form.register("gifts.url") }} />
        <TextareaField id="content-message" label="Closing message" optional hint="Shown at the end of the invitation." error={err("message")} textareaProps={{ rows: 3, ...form.register("message") }} />
      </fieldset>
    </form>
  );
}

"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useContentForm } from "@/features/invitations/editor/content-form";
import { TextareaField, TextField } from "@/features/invitations/editor/fields";

/** Contacts, gifts, the closing message and a hashtag: all optional finishing touches. */
export function ExtrasStep() {
  const { form, err } = useContentForm();
  const contacts = useFieldArray({ control: form.control, name: "contacts" });

  return (
    <div className="grid gap-8">
      <fieldset className="grid gap-4">
        <legend className="mb-1 text-sm font-semibold">Contacts</legend>
        <p className="-mt-2 text-xs text-muted-foreground">Who can guests reach with questions? Up to four people.</p>
        {contacts.fields.map((field, i) => (
          <div key={field.id} className="grid gap-3 rounded-2xl bg-fill/60 p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
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
            <Button type="button" variant="soft" size="sm" onClick={() => contacts.append({ name: "", phone: "", email: "" })}>
              <PlusIcon aria-hidden /> Add contact
            </Button>
          </div>
        ) : null}
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="mb-1 text-sm font-semibold">Gifts</legend>
        <TextareaField id="content-gifts-note" label="Gift note" optional hint="e.g. “Your presence is the greatest gift…”" error={err("gifts.note")} textareaProps={{ rows: 3, ...form.register("gifts.note") }} />
        <TextField id="content-gifts-url" label="Registry link" optional error={err("gifts.url")} inputProps={{ type: "url", placeholder: "https://…", ...form.register("gifts.url") }} />
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="mb-1 text-sm font-semibold">Closing</legend>
        <TextareaField id="content-message" label="Closing message" optional hint="Shown at the end of the invitation." error={err("message")} textareaProps={{ rows: 3, ...form.register("message") }} />
        <TextField id="content-hashtag" label="Hashtag" optional hint="Guests can copy it to tag their photos, e.g. AishaWedsRohan." error={err("hashtag")} inputProps={{ autoCapitalize: "off", spellCheck: false, ...form.register("hashtag") }} />
      </fieldset>
    </div>
  );
}

"use client";

import { Controller, useWatch } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { KIND_FIELDS, useContentForm } from "@/features/invitations/editor/content-form";
import { TextField } from "@/features/invitations/editor/fields";
import { suggestHeadline, type InvitationContentInput } from "@/lib/validation/content";

/** Names first: the part people care about most, and what the headline is built from. */
export function NamesStep() {
  const { form, err, kind } = useContentForm();
  const values = useWatch({ control: form.control });
  const preview = suggestHeadline({ ...values, kind } as Partial<InvitationContentInput> & { kind: typeof kind });

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {KIND_FIELDS[kind].map((f) => (
          <TextField
            key={f.name}
            id={`content-${f.name}`}
            label={f.label}
            hint={f.hint}
            optional={f.optional}
            error={err(f.name)}
            inputProps={{
              autoComplete: "off",
              ...(f.type === "number"
                ? { type: "number", inputMode: "numeric", min: 1, ...form.register(f.name as "age", { setValueAs: (v) => (v === "" || v === null ? "" : Number(v)) }) }
                : form.register(f.name as "partnerOne")),
            }}
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
              <RadioGroup value={field.value ?? "surprise"} onValueChange={field.onChange} className="flex flex-wrap gap-2">
                {(["surprise", "boy", "girl"] as const).map((v) => (
                  <label key={v} className="flex cursor-pointer items-center gap-2 rounded-full bg-fill px-4 py-2 text-sm has-[[data-state=checked]]:bg-foreground has-[[data-state=checked]]:text-background">
                    <RadioGroupItem value={v} className="sr-only" /> {v === "surprise" ? "Keep it a surprise" : `It's a ${v}`}
                  </label>
                ))}
              </RadioGroup>
            )}
          />
        </div>
      ) : null}
      {preview ? (
        <p className="rounded-2xl bg-fill px-4 py-3 text-sm text-muted-foreground" aria-live="polite" data-testid="names-preview">
          Guests will see <span className="font-semibold text-foreground">{preview}</span>
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { MapIcon } from "lucide-react";
import { useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useContentForm } from "@/features/invitations/editor/content-form";
import { TextareaField, TextField } from "@/features/invitations/editor/fields";

/** Venue, address and directions; a Maps link can be made from the address in one tap. */
export function WhereStep() {
  const { form, err } = useContentForm();
  const [name, address, mapsUrl] = useWatch({ control: form.control, name: ["venue.name", "venue.address", "venue.mapsUrl"] });
  const place = [name, address].filter(Boolean).join(", ");

  return (
    <div className="grid gap-5">
      <TextField id="content-venue-name" label="Venue name" hint="e.g. The Orangery, Taj Lands End, Our home" error={err("venue.name")} inputProps={{ ...form.register("venue.name"), "data-testid": "field-venue-name" } as React.ComponentProps<"input">} />
      <TextareaField id="content-venue-address" label="Address" optional error={err("venue.address")} textareaProps={{ rows: 2, ...form.register("venue.address") }} />
      <div className="grid gap-2">
        <TextField id="content-venue-maps" label="Directions link" optional hint="Paste a Google Maps or Apple Maps link." error={err("venue.mapsUrl")} inputProps={{ type: "url", inputMode: "url", placeholder: "https://maps.google.com/…", ...form.register("venue.mapsUrl") }} />
        {!mapsUrl && place ? (
          <div>
            <Button
              type="button"
              variant="soft"
              size="sm"
              onClick={() => form.setValue("venue.mapsUrl", `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`, { shouldDirty: true, shouldValidate: true })}
            >
              <MapIcon aria-hidden /> Use a Google Maps link for this address
            </Button>
          </div>
        ) : null}
      </div>
      <TextField id="content-dressCode" label="Dress code" optional hint="e.g. Festive Indian, Black tie, Smart casual" error={err("dressCode")} inputProps={form.register("dressCode")} />
    </div>
  );
}

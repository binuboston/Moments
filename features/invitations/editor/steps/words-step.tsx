"use client";

import { SparklesIcon } from "lucide-react";
import { useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useContentForm } from "@/features/invitations/editor/content-form";
import { TextareaField, TextField } from "@/features/invitations/editor/fields";
import { suggestHeadline, type ContentKind, type InvitationContentInput } from "@/lib/validation/content";

const COUPLE: ContentKind[] = ["wedding", "engagement", "anniversary"];

/** Ready-made lines per occasion: tap one, then edit it. */
const IDEAS: Partial<Record<ContentKind, { headline: string[]; subheading: string[] }>> = {
  wedding: { headline: ["Together with their families", "We're getting married", "Save the date"], subheading: ["are getting married", "request the pleasure of your company"] },
  engagement: { headline: ["We said yes!", "Join us to celebrate"], subheading: ["are engaged", "are getting engaged"] },
  anniversary: { headline: ["Still choosing each other", "Celebrate with us"], subheading: ["celebrate their anniversary"] },
  birthday: { headline: [], subheading: ["A garden party", "Cake, games and good friends"] },
  "baby-shower": { headline: ["Oh baby!", "A little one is on the way"], subheading: ["An afternoon shower"] },
  housewarming: { headline: ["Home sweet home", "Griha Pravesh"], subheading: ["Come see our new place"] },
  party: { headline: ["You're invited", "Let's celebrate"], subheading: ["Drinks, dinner and dancing"] },
  corporate: { headline: ["You're invited"], subheading: ["An evening of ideas and conversation"] },
};

const INTRO_MAX = 600;

/** Headline, welcome and the extras around them, with suggestions instead of a blank page. */
export function WordsStep() {
  const { form, err, kind } = useContentForm();
  const values = useWatch({ control: form.control });
  const suggestion = suggestHeadline({ ...values, kind } as Partial<InvitationContentInput> & { kind: ContentKind });
  const ideas = IDEAS[kind];
  const set = (name: "headline" | "subheading", value: string) => form.setValue(name, value, { shouldDirty: true, shouldValidate: true });
  const chip = "rounded-full bg-fill px-3 py-1.5 text-sm transition-colors hover:bg-fill-hover";

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <TextField
          id="content-headline"
          label="Headline"
          hint={COUPLE.includes(kind) ? "A line above your names, e.g. “Together with their families”." : "The big title on the invitation, e.g. “Maya turns five”."}
          error={err("headline")}
          inputProps={{ ...form.register("headline"), "data-testid": "field-headline" } as React.ComponentProps<"input">}
        />
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Headline ideas">
          {suggestion && suggestion !== values.headline ? (
            <Button type="button" variant="soft" size="sm" onClick={() => set("headline", suggestion)}>
              <SparklesIcon aria-hidden /> {suggestion}
            </Button>
          ) : null}
          {ideas?.headline.filter((h) => h !== values.headline).map((h) => (
            <button key={h} type="button" className={chip} onClick={() => set("headline", h)}>
              {h}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <TextField id="content-subheading" label="Subheading" optional error={err("subheading")} inputProps={form.register("subheading")} />
        {ideas?.subheading.length ? (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Subheading ideas">
            {ideas.subheading.filter((h) => h !== values.subheading).map((h) => (
              <button key={h} type="button" className={chip} onClick={() => set("subheading", h)}>
                {h}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-1">
        <TextareaField id="content-intro" label="Welcome message" optional hint="Two or three warm sentences work best." error={err("intro")} textareaProps={{ rows: 4, maxLength: INTRO_MAX, ...form.register("intro") }} />
        <p className="text-right text-xs text-muted-foreground tabular-nums" aria-hidden>
          {(values.intro ?? "").length} / {INTRO_MAX}
        </p>
      </div>

      <details className="group rounded-2xl bg-fill/60 px-4 py-3 [&_summary::-webkit-details-marker]:hidden">
        <summary className="cursor-pointer list-none text-sm font-semibold">
          More lines <span className="font-normal text-muted-foreground">· hosts and a blessing</span>
        </summary>
        <div className="mt-4 grid gap-5">
          <TextField id="content-hosts" label="Hosted by" optional hint="e.g. “With the blessings of the Khan and Mehta families”" error={err("hosts")} inputProps={form.register("hosts")} />
          <TextField id="content-invocation" label="Blessing line" optional hint="Shown above everything else, in any language, e.g. “ॐ श्री गणेशाय नमः” or “Bismillah”." error={err("invocation")} inputProps={form.register("invocation")} />
        </div>
      </details>
    </div>
  );
}

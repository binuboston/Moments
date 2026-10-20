import { ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { DeviceFrame } from "@/features/templates/components/device-frame";
import { getPublishedTemplates } from "@/features/templates/queries";
import { InvitationRenderer } from "@/features/templates/renderer";
import { sampleView } from "@/features/templates/sample-data";

export const metadata: Metadata = {
  title: "How it works",
  description: "From choosing a template to sharing on WhatsApp: how to create a digital invitation with Mirth in minutes.",
  alternates: { canonical: "/how-it-works" },
};

const steps = [
  { n: "01", title: "Pick the occasion", body: "Tell us what you're celebrating. We only ask for the details that matter for that event, so a birthday never asks for ceremony times." },
  { n: "02", title: "Choose a template", body: "Browse live previews filtered by occasion. Free and premium designs are clearly labelled." },
  { n: "03", title: "Add your details", body: "Names, date and time in your time zone, venue with directions, a cover photo and gallery. Add multiple functions if you need a schedule." },
  { n: "04", title: "Personalise", body: "Choose a palette and type pairing curated for the template. Toggle sections like countdown, gifts or RSVP. The preview updates as you type." },
  { n: "05", title: "Preview on phone and desktop", body: "What you see is exactly what guests see. The editor and the published page share one renderer." },
  { n: "06", title: "Publish and share", body: "Publish to a unique link. Share it on WhatsApp with a message that includes a rich preview. Edit or unpublish any time." },
];

export default async function HowItWorksPage() {
  const templates = await getPublishedTemplates();
  const t = templates.find((x) => x.def.key === "soft-pastel") ?? templates[0];

  return (
    <Container className="py-14 sm:py-20">
      <SectionHeading as="h1" eyebrow="How it works" title="From blank page to beautiful invitation in minutes" description="No design skills required. Mirth guides you step by step and keeps your invitation looking polished." />

      <div className="mt-16 grid gap-16 lg:grid-cols-[1fr_22rem] lg:items-start">
        <Reveal className="grid gap-10" stagger={0.1}>
          {steps.map((s) => (
            <div key={s.n} data-reveal className="grid gap-4 sm:grid-cols-[4rem_1fr]">
              <span className="font-display text-3xl font-semibold text-primary/40">{s.n}</span>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">{s.title}</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground text-pretty">{s.body}</p>
              </div>
            </div>
          ))}
        </Reveal>
        <div className="mx-auto w-full max-w-[20rem] lg:sticky lg:top-24">
          {t ? (
            <DeviceFrame label="Example invitation">
              <InvitationRenderer view={sampleView("baby-shower", { key: t.def.key, name: t.def.name, tier: t.row.tier })} mode="preview" />
            </DeviceFrame>
          ) : null}
        </div>
      </div>

      <div className="mt-20 text-center">
        <Button asChild size="xl">
          <Link href="/signup">
            Create your invitation <ArrowRightIcon aria-hidden />
          </Link>
        </Button>
      </div>
    </Container>
  );
}

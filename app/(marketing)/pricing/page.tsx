import { CheckIcon, MinusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Faq } from "@/components/marketing/faq";
import { SectionHeading } from "@/components/marketing/section-heading";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Mirth is free to start. Upgrade to Pro for no badge, larger galleries and more live invitations.",
  alternates: { canonical: "/pricing" },
};

const rows: { feature: string; free: boolean | string; pro: boolean | string }[] = [
  { feature: "Every template", free: true, pro: true },
  { feature: "Live invitations", free: "3", pro: "50" },
  { feature: "Gallery photos per invitation", free: "8", pro: "40" },
  { feature: "Multiple functions and schedule", free: true, pro: true },
  { feature: "RSVP collection and export", free: true, pro: true },
  { feature: "WhatsApp and link sharing", free: true, pro: true },
  { feature: "Mirth badge removed", free: false, pro: true },
  { feature: "Priority support", free: false, pro: true },
];

const faqs = [
  { question: "How does Pro billing work?", answer: "Pro is priced per event and removes the Mirth badge and raises limits for that invitation. Payments are not yet live in this release; accounts can be upgraded by the Mirth team." },
  { question: "Can I switch templates after publishing?", answer: "Yes. Your content is independent of the design, so you can switch between templates that support your occasion at any time." },
  { question: "What happens after my event?", answer: "Your invitation stays online so guests can revisit photos and details. You can unpublish whenever you like." },
];

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === "string") return <span className="font-medium">{value}</span>;
  return value ? <CheckIcon className="mx-auto size-5 text-success" aria-label="Included" /> : <MinusIcon className="mx-auto size-5 text-muted-foreground/50" aria-label="Not included" />;
}

export default function PricingPage() {
  return (
    <Container className="py-14 sm:py-20">
      <SectionHeading as="h1" eyebrow="Pricing" title="Simple, honest pricing" description="Create and share a beautiful invitation for free. Go Pro when you want a fully branded page and larger galleries." />

      <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-surface p-8 shadow-soft">
          <p className="eyebrow">Free</p>
          <p className="mt-3 font-display text-5xl font-semibold">£0</p>
          <p className="mt-2 text-sm text-muted-foreground">Forever free for personal celebrations.</p>
          <Button asChild variant="outline" className="mt-8 w-full" size="lg">
            <Link href="/signup">Start for free</Link>
          </Button>
        </div>
        <div className="relative rounded-3xl border border-primary bg-surface p-8 shadow-lift">
          <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Most popular</span>
          <p className="eyebrow">Pro</p>
          <p className="mt-3 font-display text-5xl font-semibold">
            £19 <span className="text-base font-normal text-muted-foreground">/ event</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">One payment per invitation. No subscription.</p>
          <Button asChild className="mt-8 w-full" size="lg">
            <Link href="/signup">Create your invitation</Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <caption className="sr-only">Plan comparison</caption>
          <thead className="bg-subtle text-left">
            <tr>
              <th scope="col" className="px-5 py-3 font-medium">
                Feature
              </th>
              <th scope="col" className="px-5 py-3 text-center font-medium">
                Free
              </th>
              <th scope="col" className="px-5 py-3 text-center font-medium">
                Pro
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.feature}>
                <th scope="row" className="px-5 py-3 text-left font-normal">
                  {r.feature}
                </th>
                <td className="px-5 py-3 text-center">
                  <Cell value={r.free} />
                </td>
                <td className="px-5 py-3 text-center">
                  <Cell value={r.pro} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mx-auto mt-20 max-w-3xl">
        <SectionHeading title="Pricing questions" />
        <Faq items={faqs} className="mt-10" />
      </div>
    </Container>
  );
}

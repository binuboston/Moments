import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Faq } from "@/components/marketing/faq";
import { SectionHeading } from "@/components/marketing/section-heading";

export const metadata: Metadata = {
  title: "Help centre",
  description: "Answers to common questions about creating, publishing and sharing Mirth invitations, plus our privacy and terms summaries.",
  alternates: { canonical: "/help" },
};

const gettingStarted = [
  { question: "How do I create my first invitation?", answer: "Sign up, go to your dashboard and choose New invitation. Pick the occasion and a template, fill in your details and publish when you're ready. Drafts save automatically." },
  { question: "Can I change the template later?", answer: "Yes. In the editor, open the Template step and choose another design that supports your occasion. Your content carries over." },
  { question: "Which time zone is used?", answer: "You choose the event's time zone when entering the date. Guests see the time exactly as you set it, with the zone shown next to it." },
];

const sharing = [
  { question: "How do I share on WhatsApp?", answer: "After publishing, use Share on WhatsApp from your dashboard or the publish screen. WhatsApp opens with your invitation link and a short message ready to send." },
  { question: "Why does the link preview look different in some apps?", answer: "Messaging apps cache previews. If you edit your invitation after sharing, the preview may take time to refresh. The page itself always shows the latest version." },
  { question: "Can I stop people from viewing the invitation?", answer: "Yes. Unpublish from your dashboard and the link stops working immediately. You can republish later." },
];

const rsvp = [
  { question: "Where do I see responses?", answer: "Open the invitation in your dashboard and select RSVPs. You'll see totals, individual responses and can export a CSV." },
  { question: "Can guests change their answer?", answer: "Yes. If a guest submits again with the same name, their earlier response is updated rather than duplicated." },
  { question: "Is guest information public?", answer: "Never. Responses are visible only to the invitation owner." },
];

export default function HelpPage() {
  return (
    <Container size="narrow" className="py-14 sm:py-20">
      <SectionHeading as="h1" eyebrow="Help centre" title="How can we help?" description="Quick answers to common questions. Can't find what you need? Email support@mirth.example and we'll get back to you." />

      <section className="mt-14" aria-labelledby="getting-started">
        <h2 id="getting-started" className="mb-4 text-lg font-semibold">
          Getting started
        </h2>
        <Faq items={gettingStarted} />
      </section>

      <section className="mt-12" aria-labelledby="sharing">
        <h2 id="sharing" className="mb-4 text-lg font-semibold">
          Publishing and sharing
        </h2>
        <Faq items={sharing} />
      </section>

      <section className="mt-12" aria-labelledby="rsvp">
        <h2 id="rsvp" className="mb-4 text-lg font-semibold">
          RSVPs and guests
        </h2>
        <Faq items={rsvp} />
      </section>

      <section id="privacy" className="mt-16 scroll-mt-24 rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold">Privacy summary</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          We store the details you enter to render your invitation and the responses your guests submit. Draft invitations and guest responses are private to your account. Published invitations are
          public to anyone with the link and are not listed in search engines by default. You can delete an invitation and its responses at any time.
        </p>
      </section>

      <section id="terms" className="mt-6 scroll-mt-24 rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold">Terms summary</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          Use Mirth for genuine events. Don't upload content you don't have the right to share. We may remove invitations that violate these terms. Full terms will be published before public launch.
        </p>
      </section>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        Ready to begin?{" "}
        <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
          Create your first invitation
        </Link>
      </p>
    </Container>
  );
}

import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Faq } from "@/components/marketing/faq";
import { HELP_SECTIONS } from "@/features/help/content";
import { SectionHeading } from "@/components/marketing/section-heading";
import { BRAND } from "@/lib/brand";
import { ROUTES } from "@/lib/routes";
import { AppLink } from "@/components/layout/app-link";

export const metadata: Metadata = {
  title: "Help centre",
  description: `Answers to common questions about creating, publishing and sharing ${BRAND.name} invitations, plus our privacy and terms summaries.`,
  alternates: { canonical: ROUTES.help },
};

export default function HelpPage() {
  return (
    <Container size="narrow" className="py-14 sm:py-20">
      <SectionHeading as="h1" eyebrow="Help centre" title="How can we help?" description="Quick answers to common questions. Can't find what you need? Email support@mirth.example and we'll get back to you." />

      {HELP_SECTIONS.map((section, i) => (
        <section key={section.id} className={i === 0 ? "mt-14" : "mt-12"} aria-labelledby={section.id}>
          <h2 id={section.id} className="mb-4 scroll-mt-24 text-lg font-semibold">
            {section.title}
          </h2>
          <Faq items={section.items} />
        </section>
      ))}

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
          Use {BRAND.name} for genuine events. Don't upload content you don't have the right to share. We may remove invitations that violate these terms. Full terms will be published before public launch.
        </p>
      </section>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        Ready to begin?{" "}
        <AppLink href={ROUTES.newInvitation} className="font-medium text-primary underline-offset-4 hover:underline">
          Create your first invitation
        </AppLink>
      </p>
    </Container>
  );
}

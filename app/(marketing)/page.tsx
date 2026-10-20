import { ArrowRightIcon, CheckIcon, ImageIcon, LockIcon, MessageCircleIcon, PaletteIcon, Share2Icon, SmartphoneIcon, SparklesIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { CategoryGrid } from "@/components/marketing/category-grid";
import { Faq } from "@/components/marketing/faq";
import { HeroMotion } from "@/components/marketing/hero-motion";
import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { DeviceFrame } from "@/features/templates/components/device-frame";
import { TemplateCard } from "@/features/templates/components/template-card";
import { getActiveCategories, getFeaturedTemplates, getPublishedTemplates } from "@/features/templates/queries";
import { InvitationRenderer } from "@/features/templates/renderer";
import { sampleView } from "@/features/templates/sample-data";

const steps = [
  { title: "Choose a design", body: "Browse templates made for weddings, birthdays, showers and more. Every one is designed to look beautiful on a phone." },
  { title: "Make it yours", body: "Add your names, date, venue and photos. Pick a palette and typography that fit the occasion. See every change live." },
  { title: "Share with everyone", body: "Publish to your own link and send it on WhatsApp in one tap. Guests open it instantly, no app or account needed." },
];

const features = [
  { icon: SmartphoneIcon, title: "Made for mobile", body: "Guests open invitations on their phones. Every template is designed mobile-first and loads in a blink." },
  { icon: PaletteIcon, title: "Personal, not generic", body: "Choose from curated palettes and type pairings. Your invitation looks considered, never templated." },
  { icon: ImageIcon, title: "Your photos, beautifully", body: "Add a cover photo and a gallery. Images are optimised automatically for fast loading everywhere." },
  { icon: UsersIcon, title: "RSVPs in one place", body: "Collect responses, guest counts and notes. Export the list whenever you need it." },
  { icon: Share2Icon, title: "Share anywhere", body: "WhatsApp, Messages, email or a QR code. Links show a rich preview with your event details." },
  { icon: LockIcon, title: "Private by design", body: "Drafts stay private. Guest responses are visible only to you. Nothing is indexed until you publish." },
];

const faqs = [
  { question: "Is Mirth free to use?", answer: "Yes. You can create and publish invitations with any free template at no cost. Free invitations include a small Mirth badge. Premium templates and extras are part of the Pro plan." },
  { question: "Do my guests need an account?", answer: "No. Guests simply open your link in any browser. If you enable RSVP, they answer right on the page without signing up." },
  { question: "Can I edit my invitation after publishing?", answer: "Of course. Change any detail and the live page updates within minutes. You can also unpublish at any time and the link stops working." },
  { question: "How do I share on WhatsApp?", answer: "After publishing, tap Share on WhatsApp. It opens WhatsApp with a message containing your invitation link and event details, ready to send to any chat or group." },
  { question: "Can I add multiple functions, like a mehendi and reception?", answer: "Yes. Add as many events as you need with their own time, venue and directions. They appear as a schedule on the invitation." },
  { question: "What happens to guest data?", answer: "RSVP responses are stored privately and are visible only to you. We never show a guest list publicly and never sell data." },
];

export default async function HomePage() {
  const [featured, categories, allTemplates] = await Promise.all([getFeaturedTemplates(4), getActiveCategories(), getPublishedTemplates()]);
  const heroTemplate = allTemplates.find((t) => t.def.key === "eternal-grace") ?? allTemplates[0];
  const mobileTemplate = allTemplates.find((t) => t.def.key === "confetti-pop") ?? allTemplates[0];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden paper-grain">
        <HeroMotion>
          <Container className="grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-24">
            <div className="max-w-xl">
              <p data-hero="eyebrow" className="eyebrow">
                Digital invitations, beautifully done
              </p>
              <h1 data-hero="title" className="mt-4 font-display text-[2.75rem] leading-[1.02] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
                <span className="block">Choose a design.</span>
                <span className="block">Make it yours.</span>
                <span className="block text-primary">Share your event.</span>
              </h1>
              <p data-hero="copy" className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
                Create an elegant invitation for your wedding, birthday or celebration in minutes. Publish to your own link and send it to everyone on WhatsApp.
              </p>
              <div data-hero="cta" className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="xl">
                  <Link href="/signup">
                    Create an invitation <ArrowRightIcon aria-hidden />
                  </Link>
                </Button>
                <Button asChild size="xl" variant="outline">
                  <Link href="/templates">Browse templates</Link>
                </Button>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {["Free to start", "No app for guests", "Ready in minutes"].map((item) => (
                  <li key={item} className="inline-flex items-center gap-2">
                    <CheckIcon className="size-4 text-success" aria-hidden /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mx-auto w-full max-w-[22rem] lg:max-w-[24rem]">
              <div data-hero="device">
                {heroTemplate ? (
                  <DeviceFrame label="Live invitation preview">
                    <InvitationRenderer view={sampleView("wedding", { key: heroTemplate.def.key, name: heroTemplate.def.name, tier: heroTemplate.row.tier })} mode="preview" />
                  </DeviceFrame>
                ) : null}
              </div>
              <div data-hero="float" className="absolute -left-6 top-24 hidden rounded-2xl border border-border bg-surface p-3 shadow-lift sm:block">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-success/10 text-success">
                    <CheckIcon className="size-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-medium">Priya is attending</p>
                    <p className="text-xs text-muted-foreground">RSVP · 2 guests</p>
                  </div>
                </div>
              </div>
              <div data-hero="float" className="absolute -right-4 bottom-28 hidden rounded-2xl border border-border bg-surface p-3 shadow-lift sm:block">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-[#25D366]/15 text-[#128C7E]">
                    <MessageCircleIcon className="size-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-medium">Shared on WhatsApp</p>
                    <p className="text-xs text-muted-foreground">Family group · 48 members</p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </HeroMotion>
      </section>

      {/* Featured templates */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading align="left" eyebrow="Templates" title="Designs that feel like the occasion" description="Every template is a complete, responsive invitation. These previews are live renders, not mockups." />
            <Button asChild variant="outline">
              <Link href="/templates">
                All templates <ArrowRightIcon aria-hidden />
              </Link>
            </Button>
          </div>
          <Reveal className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
            {featured.map((t) => (
              <div key={t.row.id} data-reveal>
                <TemplateCard template={t} />
              </div>
            ))}
          </Reveal>
        </Container>
      </section>

      {/* Categories */}
      <section className="border-y border-border bg-subtle/60 py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow="Occasions" title="For every kind of celebration" description="Each occasion has its own fields, so a birthday never asks for wedding details." />
          <Reveal className="mt-12" stagger={0.05}>
            <CategoryGrid categories={categories} />
          </Reveal>
        </Container>
      </section>

      {/* Steps */}
      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow="How it works" title="Three steps to a beautiful invitation" />
          <Reveal className="mt-14 grid gap-10 md:grid-cols-3" stagger={0.12}>
            {steps.map((step, i) => (
              <div key={step.title} data-reveal className="relative">
                <span className="font-display text-6xl font-semibold text-primary/15">0{i + 1}</span>
                <h3 className="-mt-6 text-xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">{step.body}</p>
              </div>
            ))}
          </Reveal>
          <div className="mt-12 text-center">
            <Button asChild variant="link">
              <Link href="/how-it-works">
                See the full walkthrough <ArrowRightIcon aria-hidden />
              </Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-foreground py-20 text-background sm:py-28">
        <Container>
          <SectionHeading eyebrow="Why Mirth" title="Everything an invitation should do" className="[&_p]:text-background/70 [&_.eyebrow]:text-accent" />
          <Reveal className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {features.map((f) => (
              <div key={f.title} data-reveal className="rounded-2xl border border-background/10 bg-background/5 p-6">
                <f.icon className="size-5 text-accent" aria-hidden />
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-background/70 text-pretty">{f.body}</p>
              </div>
            ))}
          </Reveal>
        </Container>
      </section>

      {/* Mobile preview */}
      <section className="py-20 sm:py-28">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="order-2 mx-auto w-full max-w-[20rem] lg:order-1">
            <div data-reveal>
              {mobileTemplate ? (
                <DeviceFrame label="Mobile invitation preview">
                  <InvitationRenderer view={sampleView("birthday", { key: mobileTemplate.def.key, name: mobileTemplate.def.name, tier: mobileTemplate.row.tier })} mode="preview" />
                </DeviceFrame>
              ) : null}
            </div>
          </Reveal>
          <Reveal className="order-1 lg:order-2">
            <div data-reveal>
              <SectionHeading align="left" eyebrow="Built for phones" title="Opens instantly where your guests already are" description="Most invitations are opened from a WhatsApp message on a phone. Mirth invitations load fast on mobile data, with a rich link preview that shows your event before anyone taps." />
            </div>
            <ul data-reveal className="mt-8 space-y-3">
              {["Rich previews in WhatsApp, iMessage and email", "Add to Google Calendar or Apple Calendar in one tap", "One-tap directions to the venue", "Live countdown to the big day"].map((item) => (
                <li key={item} className="flex items-start gap-3 text-muted-foreground">
                  <SparklesIcon className="mt-1 size-4 shrink-0 text-primary" aria-hidden /> {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>

      {/* Pricing teaser */}
      <section className="border-y border-border bg-subtle/60 py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow="Pricing" title="Start free. Upgrade when you need more." />
          <Reveal className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2" stagger={0.1}>
            <div data-reveal className="rounded-3xl border border-border bg-surface p-8 shadow-soft">
              <p className="eyebrow">Free</p>
              <p className="mt-3 font-display text-4xl font-semibold">£0</p>
              <p className="mt-2 text-sm text-muted-foreground">Everything you need for a beautiful invitation.</p>
              <ul className="mt-6 space-y-2 text-sm">
                {["All free templates", "Up to 3 live invitations", "RSVP collection", "WhatsApp sharing", "Mirth badge on the page"].map((i) => (
                  <li key={i} className="flex gap-2">
                    <CheckIcon className="size-4 text-success" aria-hidden /> {i}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8 w-full" variant="outline">
                <Link href="/signup">Get started</Link>
              </Button>
            </div>
            <div data-reveal className="rounded-3xl border border-primary bg-surface p-8 shadow-lift">
              <p className="eyebrow">Pro</p>
              <p className="mt-3 font-display text-4xl font-semibold">
                £19 <span className="text-base font-normal text-muted-foreground">/ event</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">For premium designs and a fully branded experience.</p>
              <ul className="mt-6 space-y-2 text-sm">
                {["All premium templates", "No Mirth badge", "Larger photo galleries", "Priority support"].map((i) => (
                  <li key={i} className="flex gap-2">
                    <CheckIcon className="size-4 text-success" aria-hidden /> {i}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8 w-full">
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28">
        <Container size="narrow">
          <SectionHeading eyebrow="FAQ" title="Questions, answered" />
          <Faq items={faqs} className="mt-12" />
        </Container>
      </section>

      {/* Final CTA */}
      <section className="pb-24">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground shadow-lift sm:px-16">
            <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 20% 20%, white 0, transparent 40%), radial-gradient(circle at 80% 80%, white 0, transparent 40%)" }} aria-hidden />
            <h2 className="relative font-display text-3xl font-semibold tracking-tight text-balance sm:text-5xl">Your celebration deserves a beautiful first impression.</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-primary-foreground/80 text-pretty">Create your invitation now. It takes a few minutes and your first one is free.</p>
            <Button asChild size="xl" variant="accent" className="relative mt-8">
              <Link href="/signup">
                Create an invitation <ArrowRightIcon aria-hidden />
              </Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

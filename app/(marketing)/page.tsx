import { ArrowRightIcon, CheckIcon, ImageIcon, LockIcon, MessageCircleIcon, PaletteIcon, Share2Icon, SmartphoneIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { categoryIcon } from "@/components/marketing/category-grid";
import { Faq } from "@/components/marketing/faq";
import { HorizontalScroller } from "@/components/marketing/horizontal-scroller";
import { PinnedShowcase, type ShowcaseSlide } from "@/components/marketing/pinned-showcase";
import { SectionNav } from "@/components/marketing/section-nav";
import { HeroEntrance } from "@/components/motion/hero-entrance";
import { LazyMount } from "@/components/motion/lazy-mount";
import { DeviceFrame } from "@/features/templates/components/device-frame";
import { getActiveCategories, getPublishedTemplates } from "@/features/templates/queries";
import { InvitationRenderer } from "@/features/templates/renderer";
import { sampleView } from "@/features/templates/sample-data";
import type { CategorySlug } from "@/types/domain";
import { BRAND } from "@/lib/brand";
import { ROUTES, routes } from "@/lib/routes";
import { AppLink } from "@/components/layout/app-link";

const SECTIONS = [
  { id: "designs", label: "Designs" },
  { id: "occasions", label: "Occasions" },
  { id: "how", label: "How it works" },
  { id: "features", label: "Features" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
];

const steps = [
  { title: "Choose a design", body: "Live templates for weddings, birthdays, showers and more, each built for the phone your guests will open it on." },
  { title: "Make it yours", body: "Names, date, venue and photos. Curated colours and type keep it beautiful. Every change shows instantly." },
  { title: "Share it everywhere", body: "Publish to your own link and send it on WhatsApp in one tap. Guests open it instantly, no app needed." },
];

const features = [
  { icon: SmartphoneIcon, title: "Made for mobile", body: "Designed phone-first and fast on mobile data, because that's where every invitation is opened." },
  { icon: PaletteIcon, title: "Personal, not generic", body: "Curated palettes and type pairings per design. It looks considered, never templated." },
  { icon: ImageIcon, title: "Your photos, beautifully", body: "A cover photo and a gallery, optimised automatically and shown full screen with a tap." },
  { icon: UsersIcon, title: "RSVPs in one place", body: "Responses, guest counts and notes collected for you. Export the list whenever you need it." },
  { icon: Share2Icon, title: "Share anywhere", body: "WhatsApp, Messages, email or a link. Every share shows a rich preview with your details." },
  { icon: LockIcon, title: "Private by design", body: "Drafts stay private and guest responses are visible only to you. Nothing is indexed." },
];

const faqs = [
  { question: `Is ${BRAND.name} free to use?`, answer: `Yes. Every template is free to use and publish. Free invitations include a small ${BRAND.badge}; Pro removes it and adds larger galleries.` },
  { question: "Do my guests need an account?", answer: "No. Guests open your link in any browser and can RSVP right on the page without signing up." },
  { question: "Can I edit my invitation after publishing?", answer: "Of course. Change any detail and the live page updates within minutes. You can unpublish at any time." },
  { question: "How do I share on WhatsApp?", answer: "After publishing, tap Share on WhatsApp. It opens with your invitation link and details, ready to send to any chat or group." },
  { question: "Can I add several functions, like a mehendi and a reception?", answer: "Yes. Add as many events as you need, each with its own time, venue and directions, shown as a schedule." },
  { question: "What happens to guest data?", answer: "RSVP responses are stored privately and visible only to you. We never show guest lists publicly and never sell data." },
];

/** Desktop positions for occasion tiles floating around the headline (percent of the stage). */
const FLOAT_POSITIONS = [
  { left: "4%", top: "8%", speed: 0.18 },
  { left: "72%", top: "4%", speed: 0.28 },
  { left: "12%", top: "62%", speed: 0.1 },
  { left: "74%", top: "54%", speed: 0.22 },
  { left: "36%", top: "-4%", speed: 0.32 },
  { left: "58%", top: "78%", speed: 0.14 },
  { left: "2%", top: "34%", speed: 0.26 },
  { left: "76%", top: "28%", speed: 0.12 },
];

function PhonePlaceholder({ gradient }: { gradient: string }) {
  return <div className="aspect-[9/19] w-full rounded-[2.75rem]" style={{ background: gradient }} />;
}

export default async function HomePage() {
  const [templates, categories] = await Promise.all([getPublishedTemplates(), getActiveCategories()]);
  const hero = templates.find((t) => t.def.key === "eternal-grace") ?? templates[0];

  const slides: ShowcaseSlide[] = templates.slice(0, 6).map((t) => ({
    key: t.def.key,
    name: t.def.name,
    description: t.row.description ?? t.def.description,
    href: routes.template(t.row.slug),
    tier: t.row.tier,
    gradient: t.def.previewGradient,
    preview: (
      <LazyMount placeholder={<PhonePlaceholder gradient={t.def.previewGradient} />}>
        <DeviceFrame label={`${t.def.name} preview`}>
          <InvitationRenderer view={sampleView((t.row.category_slugs[0] ?? t.def.categories[0]) as CategorySlug, { key: t.def.key, name: t.def.name, tier: t.row.tier })} mode="preview" />
        </DeviceFrame>
      </LazyMount>
    ),
  }));

  return (
    <>
      <SectionNav sections={SECTIONS} />

      {/* 1 · Hero: oversized display type anchored bottom-left, live invitation on the right. */}
      <section className="relative overflow-hidden">
        <HeroEntrance>
          <Container className="grid min-h-[calc(100svh-4rem)] grid-cols-1 gap-12 pt-10 pb-12 lg:grid-cols-[1fr_auto] lg:gap-16 lg:pt-16 lg:pb-16">
            <div className="flex flex-col justify-between gap-12">
              <div className="max-w-md">
                <p data-hero className="lead">
                  {BRAND.name} turns the details of your celebration into an invitation guests actually open: designed for phones, shared on WhatsApp, ready in minutes.
                </p>
                <div data-hero className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg">
                    <AppLink href={ROUTES.newInvitation}>
                      Create an invitation <ArrowRightIcon aria-hidden />
                    </AppLink>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href={ROUTES.templates}>Browse designs</Link>
                  </Button>
                </div>
              </div>
              <h1 className="display-1 order-first max-w-[12ch] text-balance lg:order-none">
                <span data-hero className="block">
                  Invitations,
                </span>
                <span data-hero className="block text-primary">
                  beautifully yours.
                </span>
              </h1>
            </div>
            <div className="relative mx-auto w-full max-w-[18rem] self-center sm:max-w-[20rem] lg:w-[22rem] lg:max-w-none">
              <div data-hero="device">
                {hero ? (
                  <DeviceFrame label="Live invitation preview">
                    <InvitationRenderer view={sampleView("wedding", { key: hero.def.key, name: hero.def.name, tier: hero.row.tier })} mode="preview" />
                  </DeviceFrame>
                ) : null}
              </div>
              <div data-speed="0.25" className="absolute top-24 -left-14 hidden rounded-2xl border border-border bg-surface/95 p-3 shadow-lift backdrop-blur sm:block">
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
              <div data-speed="0.4" className="absolute -right-10 bottom-28 hidden rounded-2xl border border-border bg-surface/95 p-3 shadow-lift backdrop-blur sm:block">
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
        </HeroEntrance>
      </section>

      {/* 2 · Statement on the dark stage: words brighten as you scroll. */}
      <section className="relative overflow-hidden bg-stage py-32 text-stage-foreground sm:py-44">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(rgb(255 255 255 / 0.14) 1px, transparent 1px)", backgroundSize: "28px 28px", maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)" }} />
        <Container size="narrow" className="relative">
          <p data-scrub-words className="display-3 text-center text-balance">
            Most invitations get lost in a group chat. Yours should feel like opening an envelope: personal, beautiful and impossible to scroll past.
          </p>
        </Container>
      </section>

      {/* 3 · Meet the designs (pinned on desktop). */}
      <section id="designs" className="scroll-mt-0 pt-24 sm:pt-32 lg:pt-0">
        <Container className="lg:hidden">
          <h2 data-reveal="split" className="display-2">
            Meet the designs
          </h2>
          <p data-reveal className="lead mt-4 max-w-xl">
            Every design is a complete, responsive invitation. These are live renders, not mockups.
          </p>
        </Container>
        <div className="mt-10 lg:mt-0">
          <PinnedShowcase slides={slides} heading={<p aria-hidden className="display-2">Meet the designs</p>} />
        </div>
        <Container className="mt-6 lg:-mt-8 lg:pb-8">
          <Button asChild variant="outline">
            <Link href={ROUTES.templates}>
              See all designs <ArrowRightIcon aria-hidden />
            </Link>
          </Button>
        </Container>
      </section>

      {/* 4 · Occasions floating around a big headline. */}
      <section id="occasions" className="relative overflow-x-clip py-28 sm:py-40">
        <Container>
          <div className="relative lg:h-[38rem]">
            <div className="relative z-10 flex flex-col items-center text-center lg:absolute lg:inset-0 lg:justify-center">
              <h2 data-reveal="split" className="display-2 max-w-[12ch] text-balance">
                For every kind of celebration
              </h2>
              <p data-reveal className="lead mt-5 max-w-md">
                Each occasion has its own details, so a birthday never asks for wedding fields.
              </p>
            </div>
            <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:mt-0 lg:block">
              {categories.slice(0, 8).map((c, i) => {
                const Icon = categoryIcon(c.icon);
                const pos = FLOAT_POSITIONS[i % FLOAT_POSITIONS.length];
                return (
                  <li key={c.id} data-reveal className="lg:absolute" style={{ left: pos.left, top: pos.top }}>
                    <div data-speed={pos.speed}>
                      <Link
                        href={routes.templatesFor(c.slug)}
                        className="interactive-lift flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-52"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
                          <Icon className="size-5" aria-hidden />
                        </span>
                        <span className="font-medium">{c.name}</span>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
      </section>

      {/* 5 · How it works: three large numbered steps. */}
      <section id="how" className="border-t border-border py-28 sm:py-36">
        <Container>
          <h2 data-reveal="split" className="display-2 max-w-[14ch]">
            Ready in three steps
          </h2>
          <ol className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10">
            {steps.map((s, i) => (
              <li key={s.title} data-reveal className="border-t border-foreground/15 pt-6">
                <span className="block text-7xl leading-none font-medium tracking-tighter text-foreground/12 tabular-nums sm:text-8xl">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 text-2xl font-medium tracking-tight">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">{s.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* 6 · Features on the dark stage, sliding horizontally while pinned. */}
      <section id="features" className="bg-stage text-stage-foreground">
        <HorizontalScroller
          header={
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <h2 className="display-2 max-w-[13ch]">Everything an invitation should do</h2>
              <p className="max-w-sm text-stage-muted">Thoughtful by default, from the first tap on WhatsApp to the last RSVP.</p>
            </div>
          }
        >
          {features.map((f) => (
            <article key={f.title} className="flex h-[22rem] w-[78vw] max-w-[24rem] shrink-0 snap-start flex-col justify-between rounded-3xl border border-stage-border bg-white/[0.03] p-7 sm:w-[24rem]">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white/[0.06] text-accent">
                <f.icon className="size-6" aria-hidden />
              </span>
              <div>
                <h3 className="text-2xl font-medium tracking-tight">{f.title}</h3>
                <p className="mt-3 leading-relaxed text-stage-muted text-pretty">{f.body}</p>
              </div>
            </article>
          ))}
        </HorizontalScroller>
      </section>

      {/* 7 · Pricing. */}
      <section id="pricing" className="py-28 sm:py-36">
        <Container>
          <h2 data-reveal="split" className="display-2 max-w-[14ch]">
            Start free. Upgrade when you need more.
          </h2>
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            <div data-reveal className="flex flex-col rounded-3xl border border-border p-8 sm:p-10">
              <p className="font-medium">Free</p>
              <p className="mt-6 text-6xl font-medium tracking-tighter">£0</p>
              <p className="mt-2 text-muted-foreground">Everything you need for a beautiful invitation.</p>
              <ul className="mt-8 space-y-3 text-sm">
                {["Every template", "Up to 3 live invitations", "RSVP collection", "WhatsApp sharing", `${BRAND.badge} on the page`].map((i) => (
                  <li key={i} className="flex gap-2.5">
                    <CheckIcon className="size-4 shrink-0 text-success" aria-hidden /> {i}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-10 self-start" variant="outline" size="lg">
                <AppLink href={ROUTES.newInvitation}>Get started</AppLink>
              </Button>
            </div>
            <div data-reveal className="flex flex-col rounded-3xl bg-stage p-8 text-stage-foreground sm:p-10">
              <p className="font-medium">Pro</p>
              <p className="mt-6 text-6xl font-medium tracking-tighter">
                £19 <span className="text-lg font-normal tracking-normal text-stage-muted">/ event</span>
              </p>
              <p className="mt-2 text-stage-muted">For a fully branded experience.</p>
              <ul className="mt-8 space-y-3 text-sm">
                {[`No ${BRAND.badge}`, "Larger photo galleries", "More live invitations", "Priority support"].map((i) => (
                  <li key={i} className="flex gap-2.5">
                    <CheckIcon className="size-4 shrink-0 text-accent" aria-hidden /> {i}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-10 self-start" size="lg">
                <Link href={ROUTES.pricing}>See pricing</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* 8 · FAQ with a sticky heading. */}
      <section id="faq" className="border-t border-border py-28 sm:py-36">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 data-reveal="split" className="display-2">
              Questions, answered
            </h2>
          </div>
          <div data-reveal>
            <Faq items={faqs} />
          </div>
        </Container>
      </section>

      {/* 9 · Closing call to action. */}
      <section className="bg-stage py-28 text-stage-foreground sm:py-40">
        <Container className="flex flex-col items-start gap-10">
          <h2 data-reveal="split" className="display-1 max-w-[10ch]">
            Make it yours.
          </h2>
          <div data-reveal className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="xl">
              <AppLink href={ROUTES.newInvitation}>
                Create an invitation <ArrowRightIcon aria-hidden />
              </AppLink>
            </Button>
            <p className="text-stage-muted">Free to start. Ready in minutes.</p>
          </div>
        </Container>
      </section>
    </>
  );
}

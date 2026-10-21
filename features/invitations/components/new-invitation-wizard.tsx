"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon, CheckIcon, LockIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useCelebrate } from "@/components/brand/celebrate";
import { SwapTransition } from "@/components/motion/swap-transition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { categoryStyle } from "@/lib/design/tones";
import { DeviceFrame } from "@/features/templates/components/device-frame";
import { InvitationRenderer } from "@/features/templates/renderer";
import { sampleView } from "@/features/templates/sample-data";
import { invitationsApi } from "@/features/invitations/api";
import { errorMessage } from "@/features/invitations/hooks";
import { canUseTemplate } from "@/lib/entitlements";
import { cn } from "@/lib/utils/cn";
import { detectTimeZone } from "@/lib/utils/dates";
import type { CategorySlug, PlanTier, TemplateTier } from "@/types/domain";
import { routes } from "@/lib/routes";

interface CategoryOption {
  slug: CategorySlug;
  name: string;
  description: string | null;
  icon: string | null;
}
interface TemplateOption {
  slug: string;
  key: string;
  name: string;
  description: string;
  tier: TemplateTier;
  categories: CategorySlug[];
  gradient: string;
}

interface Props {
  categories: CategoryOption[];
  templates: TemplateOption[];
  plan: PlanTier;
  preselectedTemplate?: string;
  preselectedCategory?: CategorySlug;
}

export function NewInvitationWizard({ categories, templates, plan, preselectedTemplate, preselectedCategory }: Props) {
  const router = useRouter();
  const celebrate = useCelebrate();
  const presetTemplate = templates.find((t) => t.slug === preselectedTemplate);
  const initialCategory = preselectedCategory && categories.some((c) => c.slug === preselectedCategory) ? preselectedCategory : presetTemplate?.categories[0];
  const [category, setCategory] = useState<CategorySlug | undefined>(initialCategory);
  const [templateSlug, setTemplateSlug] = useState<string | undefined>(presetTemplate?.slug);
  const [step, setStep] = useState<1 | 2>(initialCategory ? 2 : 1);

  const create = useMutation({
    mutationFn: invitationsApi.create,
    onSuccess: (data) => router.push(routes.editInvitation(data.id)),
    onError: (err) => toast.error(errorMessage(err)),
  });

  const available = category ? templates.filter((t) => t.categories.includes(category)) : [];
  const selected = available.find((t) => t.slug === templateSlug);

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 pb-24 sm:gap-8 sm:pb-0">
      {/* Phones: one-line progress with a segmented bar. */}
      <div className="sm:hidden" aria-hidden>
        <p className="text-xs font-medium text-muted-foreground">
          Step {step} of 3 · <span className="text-foreground">{step === 1 ? "Event type" : "Template"}</span>
        </p>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {[1, 2, 3].map((n) => (
            <span key={n} className="relative h-1 overflow-hidden rounded-full bg-border">
              <span className={cn("absolute inset-0 origin-left rounded-full bg-primary transition-[scale] duration-700 ease-(--ease-out-quart)", n <= step ? "scale-x-100" : "scale-x-0")} />
            </span>
          ))}
        </div>
      </div>
      <ol className="hidden items-center gap-3 text-sm sm:flex" aria-label="Progress">
        {[
          { n: 1, label: "Event type" },
          { n: 2, label: "Template" },
          { n: 3, label: "Details & design" },
        ].map((s, i) => (
          <li key={s.n} className="flex items-center gap-3">
            <span className={cn("flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-(--duration-slow)", step >= s.n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
              {step > s.n ? <CheckIcon className="size-3.5" /> : s.n}
            </span>
            <span className={cn(step === s.n ? "font-medium" : "text-muted-foreground")}>{s.label}</span>
            {i < 2 ? (
              <span className="relative h-px w-10 overflow-hidden bg-border" aria-hidden>
                <span className={cn("absolute inset-0 origin-left bg-primary transition-[scale] duration-700 ease-(--ease-out-quart)", step > s.n ? "scale-x-100" : "scale-x-0")} />
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      <SwapTransition swapKey={step}>
      {step === 1 ? (
        <section aria-labelledby="step-category">
          <h2 id="step-category" className="text-base font-semibold sm:text-lg">
            What are you celebrating?
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => {
              const style = categoryStyle(c.slug);
              const active = category === c.slug;
              return (
                <li key={c.slug}>
                  <button
                    type="button"
                    data-testid={`category-${c.slug}`}
                    onClick={(e) => {
                      // A small blossom flourish from the chosen occasion as the step changes.
                      celebrate(e.currentTarget, { count: 18, scale: 0.45 });
                      setCategory(c.slug);
                      setTemplateSlug(undefined);
                      setStep(2);
                    }}
                    aria-pressed={active}
                    className={cn(
                      // Phones: a compact tile (icon and name); the description and arrow join on wider screens.
                      "group surface-card surface-hover flex h-full w-full items-center gap-3 p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-col sm:items-stretch sm:gap-2 sm:p-5",
                      active && "ring-2 ring-primary",
                    )}
                  >
                    <span className="flex shrink-0 items-start justify-between sm:mb-2">
                      <IconTile icon={style.icon} tone={style.tone} className="transition-[rotate,scale] duration-(--duration-slow) ease-(--ease-out-quart) group-hover:-rotate-6 group-hover:scale-110 max-sm:size-9 max-sm:[&>svg]:size-4" />
                      <span aria-hidden className="flex size-8 items-center justify-center rounded-full bg-fill max-sm:hidden transition-[background-color,rotate] duration-(--duration-slow) ease-(--ease-out-quart) group-hover:rotate-45 group-hover:bg-fill-hover">
                        <ArrowUpRightIcon className="size-4" />
                      </span>
                    </span>
                    <span className="min-w-0 truncate text-sm leading-snug font-semibold tracking-tight sm:text-lg">{c.name}</span>
                    {c.description ? <span className="line-clamp-2 text-xs text-muted-foreground max-sm:hidden">{c.description}</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <section aria-labelledby="step-template" className="grid min-w-0 grid-cols-1 gap-5 sm:gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="step-template" className="text-base font-semibold sm:text-lg">
                Choose a template
              </h2>
              <p className="text-sm text-muted-foreground max-sm:hidden">
                Showing designs for <span className="font-medium text-foreground">{categories.find((c) => c.slug === category)?.name}</span>. You can switch later.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="max-sm:bg-fill">
              <ArrowLeftIcon aria-hidden />
              <span className="sm:hidden">{categories.find((c) => c.slug === category)?.name} · Change</span>
              <span className="max-sm:hidden">Change event type</span>
            </Button>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
            {available.map((t) => {
              const allowed = canUseTemplate(plan, t.tier);
              const active = templateSlug === t.slug;
              return (
                <li key={t.slug}>
                  <div className="group relative">
                    <div className={cn("relative rounded-2xl p-1.5 transition-shadow sm:rounded-3xl sm:p-3", active ? "ring-2 ring-primary shadow-lift" : "ring-1 ring-border")} style={{ background: t.gradient }}>
                      <DeviceFrame variant="card" scrollable={false} className="pointer-events-none" label={`${t.name} preview`}>
                        <InvitationRenderer view={sampleView(category!, { key: t.key, name: t.name, tier: t.tier })} mode="preview" />
                      </DeviceFrame>
                      <div className="absolute top-3 left-3 origin-top-left scale-90 sm:top-5 sm:left-5 sm:scale-100">
                        {t.tier === "premium" ? (
                          <Badge variant="dark">
                            <LockIcon aria-hidden /> Premium
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-surface/90">
                            Free
                          </Badge>
                        )}
                      </div>
                      {active ? (
                        <span className="absolute top-3 right-3 flex size-6 sm:top-5 sm:right-5 sm:size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <CheckIcon className="size-4" />
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 px-1 sm:mt-3">
                      <h3 className="text-sm font-semibold sm:text-base">
                        {/* Stretched button: previews contain buttons and links, so they must not sit inside this button. */}
                        <button
                          type="button"
                          data-testid={`template-${t.slug}`}
                          onClick={() => setTemplateSlug(t.slug)}
                          aria-pressed={active}
                          className="text-left outline-none after:absolute after:inset-0 after:rounded-3xl focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-offset-4 focus-visible:after:ring-offset-background"
                        >
                          {t.name}
                        </button>
                      </h3>
                      <p className="mt-0.5 hidden line-clamp-2 text-xs text-muted-foreground sm:block">{t.description}</p>
                      {!allowed ? <p className="mt-1 text-xs text-warning">Pro plan needed to publish with this design.</p> : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>


        </section>
      )}
      </SwapTransition>

      {/* Outside the animated region: a transformed ancestor would break position: fixed mid-transition. */}
      {step === 2 ? (
          // Phones: docked just above the tab bar (4rem + safe area); it stays visible here because this is the Create tab.
          <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur-md sm:sticky sm:bottom-[calc(5rem+env(safe-area-inset-bottom))] sm:flex sm:justify-end sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none md:bottom-4 [&>button]:w-full sm:[&>button]:w-auto">
          <Button
            size="lg"
            disabled={!selected}
            loading={create.isPending}
            data-testid="create-invitation"
            onClick={() => category && selected && create.mutate({ categorySlug: category, templateSlug: selected.slug, timezone: detectTimeZone() })}
          >
            Continue with {selected?.name ?? "a template"} <ArrowRightIcon aria-hidden />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

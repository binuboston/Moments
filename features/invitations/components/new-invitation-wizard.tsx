"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, LockIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryIcon } from "@/components/marketing/category-grid";
import { DeviceFrame } from "@/features/templates/components/device-frame";
import { InvitationRenderer } from "@/features/templates/renderer";
import { sampleView } from "@/features/templates/sample-data";
import { invitationsApi } from "@/features/invitations/api";
import { errorMessage } from "@/features/invitations/hooks";
import { canUseTemplate } from "@/lib/entitlements";
import { cn } from "@/lib/utils/cn";
import { detectTimeZone } from "@/lib/utils/dates";
import type { CategorySlug, PlanTier, TemplateTier } from "@/types/domain";

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
  const presetTemplate = templates.find((t) => t.slug === preselectedTemplate);
  const initialCategory = preselectedCategory && categories.some((c) => c.slug === preselectedCategory) ? preselectedCategory : presetTemplate?.categories[0];
  const [category, setCategory] = useState<CategorySlug | undefined>(initialCategory);
  const [templateSlug, setTemplateSlug] = useState<string | undefined>(presetTemplate?.slug);
  const [step, setStep] = useState<1 | 2>(initialCategory ? 2 : 1);

  const create = useMutation({
    mutationFn: invitationsApi.create,
    onSuccess: (data) => router.push(`/dashboard/invitations/${data.id}/edit`),
    onError: (err) => toast.error(errorMessage(err)),
  });

  const available = category ? templates.filter((t) => t.categories.includes(category)) : [];
  const selected = available.find((t) => t.slug === templateSlug);

  return (
    <div className="grid gap-8">
      <ol className="flex items-center gap-3 text-sm" aria-label="Progress">
        {[
          { n: 1, label: "Event type" },
          { n: 2, label: "Template" },
          { n: 3, label: "Details & design" },
        ].map((s, i) => (
          <li key={s.n} className="flex items-center gap-3">
            <span className={cn("flex size-7 items-center justify-center rounded-full text-xs font-semibold", step >= s.n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
              {step > s.n ? <CheckIcon className="size-3.5" /> : s.n}
            </span>
            <span className={cn(step === s.n ? "font-medium" : "text-muted-foreground")}>{s.label}</span>
            {i < 2 ? <span className="h-px w-8 bg-border" aria-hidden /> : null}
          </li>
        ))}
      </ol>

      {step === 1 ? (
        <section aria-labelledby="step-category">
          <h2 id="step-category" className="text-lg font-semibold">
            What are you celebrating?
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => {
              const Icon = categoryIcon(c.icon);
              const active = category === c.slug;
              return (
                <li key={c.slug}>
                  <button
                    type="button"
                    data-testid={`category-${c.slug}`}
                    onClick={() => {
                      setCategory(c.slug);
                      setTemplateSlug(undefined);
                      setStep(2);
                    }}
                    aria-pressed={active}
                    className={cn(
                      "flex h-full w-full flex-col gap-3 rounded-2xl border bg-surface p-5 text-left transition-[border-color,box-shadow] hover:border-primary/50 hover:shadow-soft focus-visible:ring-2 focus-visible:ring-ring",
                      active ? "border-primary ring-1 ring-primary" : "border-border",
                    )}
                  >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="font-medium">{c.name}</span>
                    {c.description ? <span className="text-xs text-muted-foreground">{c.description}</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <section aria-labelledby="step-template" className="grid gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="step-template" className="text-lg font-semibold">
                Choose a template
              </h2>
              <p className="text-sm text-muted-foreground">
                Showing designs for <span className="font-medium text-foreground">{categories.find((c) => c.slug === category)?.name}</span>. You can switch later.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
              <ArrowLeftIcon aria-hidden /> Change event type
            </Button>
          </div>

          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((t) => {
              const allowed = canUseTemplate(plan, t.tier);
              const active = templateSlug === t.slug;
              return (
                <li key={t.slug}>
                  <button
                    type="button"
                    data-testid={`template-${t.slug}`}
                    onClick={() => setTemplateSlug(t.slug)}
                    aria-pressed={active}
                    className={cn(
                      "group block w-full rounded-3xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
                    )}
                  >
                    <div className={cn("relative rounded-3xl p-3 transition-shadow", active ? "ring-2 ring-primary shadow-lift" : "ring-1 ring-border")} style={{ background: t.gradient }}>
                      <DeviceFrame variant="card" scrollable={false} className="pointer-events-none" label={`${t.name} preview`}>
                        <InvitationRenderer view={sampleView(category!, { key: t.key, name: t.name, tier: t.tier })} mode="preview" />
                      </DeviceFrame>
                      <div className="absolute top-5 left-5">
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
                        <span className="absolute top-5 right-5 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <CheckIcon className="size-4" />
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3 px-1">
                      <h3 className="font-semibold">{t.name}</h3>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{t.description}</p>
                      {!allowed ? <p className="mt-1 text-xs text-warning">Pro plan needed to publish with this design.</p> : null}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="sticky bottom-4 flex justify-end">
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
        </section>
      )}
    </div>
  );
}

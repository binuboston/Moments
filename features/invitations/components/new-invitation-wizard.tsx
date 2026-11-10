"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowRightIcon, CheckIcon, EyeIcon, LockIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SwapTransition } from "@/components/motion/swap-transition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categoryStyle, TONES } from "@/lib/design/tones";
import { DeviceFrame } from "@/features/templates/components/device-frame";
import { InvitationRenderer } from "@/features/templates/renderer";
import { sampleView } from "@/features/templates/sample-data";
import { AccountGate } from "@/features/auth/account-gate";
import { useAccount } from "@/features/auth/account-context";
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
  /** Set when coming back from sign-up or log-in (?key=): create this draft straight away. */
  resumeKey?: string;
}

/** The occasion shown first when the URL names none: most invitations are for weddings. */
const DEFAULT_OCCASION: CategorySlug = "wedding";

type OccasionPickerProps = { categories: CategoryOption[]; value?: CategorySlug; onChange: (slug: CategorySlug) => void };

/**
 * Switches the occasion whose designs are shown. Phones: a compact select
 * (one line, native-feeling list). Wider screens: every occasion as a
 * selectable chip with its icon and colour, so the choice is visible at once.
 */
function OccasionPicker(props: OccasionPickerProps) {
  return (
    <>
      <div className="w-full sm:hidden">
        <OccasionSelect {...props} />
      </div>
      <OccasionChips {...props} />
    </>
  );
}

function OccasionSelect({ categories, value, onChange }: OccasionPickerProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as CategorySlug)}>
      <SelectTrigger aria-label="Occasion" className="h-11 w-full" data-testid="occasion-select">
        <SelectValue placeholder="Choose an occasion" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((c) => {
          const style = categoryStyle(c.slug);
          return (
            <SelectItem key={c.slug} value={c.slug} data-testid={`occasion-option-${c.slug}`}>
              <span className="flex items-center gap-2">
                <style.icon className="size-4" aria-hidden />
                {c.name}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

function OccasionChips({ categories, value, onChange }: OccasionPickerProps) {
  return (
    <div role="radiogroup" aria-label="Occasion" className="hidden flex-wrap gap-2 sm:flex">
      {categories.map((c) => {
        const style = categoryStyle(c.slug);
        const active = value === c.slug;
        return (
          <button
            key={c.slug}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(c.slug)}
            data-testid={`occasion-chip-${c.slug}`}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-2xl pr-4 pl-3 text-sm font-semibold transition-[filter,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-ring",
              TONES[style.tone],
              active ? "ring-2 ring-foreground" : "hover:brightness-95",
            )}
          >
            <style.icon className="size-5" aria-hidden />
            <span className="text-foreground">{c.name}</span>
            {active ? <CheckIcon className="size-4 text-foreground" aria-hidden /> : null}
          </button>
        );
      })}
    </div>
  );
}

/** One key per chosen design (crypto.randomUUID needs a secure context; LAN testing over http does not have one). */
function newCreationKey(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/**
 * Pick an occasion and a design (open to everyone), then continue to the
 * editor. Continuing needs an account: signed-out visitors sign up or log in
 * in a dialog, and the choice is kept through sign-up, email confirmation (on
 * any device) and log-in via `?category&template&key`. Every attempt carries
 * the same creation key, so retries, refreshes and returns never make a second
 * draft.
 */
export function NewInvitationWizard({ categories, templates, plan, resumeKey }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const account = useAccount();

  // The URL holds the choice (?category=, ?template=; shareable, refresh-safe). Without one, the designs
  // for the primary occasion (weddings) show straight away; the occasion select switches them.
  const fromUrl = templates.find((t) => t.slug === searchParams.get("template"));
  const urlCategory = searchParams.get("category");
  const fallback = categories.some((c) => c.slug === DEFAULT_OCCASION) ? DEFAULT_OCCASION : categories[0]?.slug;
  const category = categories.some((c) => c.slug === urlCategory) ? (urlCategory as CategorySlug) : (fromUrl?.categories[0] ?? fallback);
  const templateSlug = fromUrl && category && fromUrl.categories.includes(category) ? fromUrl.slug : undefined;
  // The ref is the source of truth (a second click can arrive before a re-render); the state renders the dialog's link.
  const keyRef = useRef(resumeKey ?? "");
  const [creationKey, setCreationKey] = useState(() => resumeKey ?? "");
  const [gateOpen, setGateOpen] = useState(false);

  const create = useMutation({
    mutationFn: invitationsApi.create,
    // Replace: Back must not return to a URL that would continue again.
    onSuccess: (data) => router.replace(routes.editInvitation(data.id)),
    onError: (err) => toast.error(errorMessage(err)),
  });

  const available = category ? templates.filter((t) => t.categories.includes(category)) : [];
  const selected = available.find((t) => t.slug === templateSlug);

  /** Writes the choice to the URL (replacing the entry, no server round trip). A new choice gets a new key. */
  const choose = (next: { category?: CategorySlug; template?: string }) => {
    const params = new URLSearchParams(window.location.search);
    for (const [name, value] of [["category", next.category], ["template", next.template]] as const) {
      if (value) params.set(name, value);
      else params.delete(name);
    }
    params.delete("key");
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
    keyRef.current = "";
  };
  const keyForChoice = () => {
    keyRef.current ||= newCreationKey();
    setCreationKey(keyRef.current);
    return keyRef.current;
  };
  const startDraft = (key: string) => {
    if (!category || !selected) return;
    create.mutate({ categorySlug: category, templateSlug: selected.slug, timezone: detectTimeZone(), creationKey: key });
  };
  const onContinue = () => {
    if (!category || !selected || create.isPending) return;
    const key = keyForChoice();
    if (account) startDraft(key);
    else setGateOpen(true);
  };

  // Back from sign-up, log-in or an email confirmation: continue once, without another click.
  const resuming = Boolean(resumeKey && account && category && selected);
  const resumed = useRef(false);
  useEffect(() => {
    if (!resuming || resumed.current || !resumeKey) return;
    resumed.current = true;
    startDraft(resumeKey);
    // startDraft only reads values fixed while resuming.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resuming, resumeKey]);

  if (resuming && !create.isError) {
    return (
      <div role="status" aria-live="polite" className="grid min-h-[50vh] place-items-center text-center" data-testid="resuming-draft">
        <div>
          <span className="mx-auto block size-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary motion-reduce:animate-none" aria-hidden />
          <p className="mt-5 text-lg font-semibold tracking-tight">Setting up your {selected?.name} invitation…</p>
          <p className="mt-1 text-sm text-muted-foreground">Just a moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 pb-24 sm:gap-8 sm:pb-0">
      <section aria-labelledby="step-template" className="grid min-w-0 grid-cols-1 gap-5 sm:gap-6">
          {/* No visible title or stepper: the designs are the screen. The heading stays for screen readers. */}
          <h2 id="step-template" className="sr-only">
            Choose a design
          </h2>
          <div className="flex flex-wrap items-end gap-3">
            <OccasionPicker categories={categories} value={category} onChange={(slug) => choose({ category: slug })} />
          </div>

          <SwapTransition swapKey={category ?? ""}>
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
                      {/* Above the stretched select button: opens the full-screen demo with sample content. */}
                      <Link
                        href={routes.demo(t.slug, category)}
                        className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-neutral-900 shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:bottom-5 sm:left-5 sm:px-3.5 sm:py-2 sm:text-sm"
                        aria-label={`Preview ${t.name}`}
                        data-testid={`preview-${t.slug}`}
                      >
                        <EyeIcon className="size-3.5 sm:size-4" aria-hidden /> Preview
                      </Link>
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
                          onClick={() => choose({ category, template: t.slug })}
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
          </SwapTransition>
      </section>

      {/* Outside the animated region: a transformed ancestor would break position: fixed mid-transition. */}
      {category ? (
          // Phones: docked just above the tab bar (4rem + safe area); it stays visible here because this is the Create tab.
          <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur-md sm:sticky sm:bottom-[calc(5rem+env(safe-area-inset-bottom))] sm:flex sm:justify-end sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none md:bottom-4 [&>button]:w-full sm:[&>button]:w-auto">
          <Button
            size="lg"
            disabled={!selected}
            loading={create.isPending}
            data-testid="create-invitation"
            onClick={onContinue}
          >
            Continue with {selected?.name ?? "a template"} <ArrowRightIcon aria-hidden />
          </Button>
        </div>
      ) : null}

      <Dialog open={gateOpen} onOpenChange={setGateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="sr-only">
            <DialogTitle>Create your free account</DialogTitle>
            <DialogDescription>Sign up or log in to continue with your design.</DialogDescription>
          </DialogHeader>
          {gateOpen && category && selected ? (
            <AccountGate
              title="Create your free account to continue"
              description={`We'll set up your ${selected.name} invitation right after. It's free.`}
              next={`${pathname}?${new URLSearchParams({ category, template: selected.slug, key: creationKey })}`}
              onSuccess={() => {
                setGateOpen(false);
                startDraft(keyRef.current);
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

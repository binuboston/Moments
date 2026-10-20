import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { AppLink } from "@/components/layout/app-link";
import { TemplateCard } from "@/features/templates/components/template-card";
import type { CatalogueTemplate } from "@/features/templates/queries";
import { categoryStyle, TONES } from "@/lib/design/tones";
import { ROUTES, routes } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import type { EventCategory } from "@/types/domain";

/** Occasion tile heights alternate so the masonry has rhythm. */
const TILE_ASPECTS = ["aspect-square", "aspect-[4/5]", "aspect-[5/4]"];

/**
 * Masonry feed of designs to start from, interleaved with occasion tiles, and
 * (for people without invitations yet) a "Create" tile first.
 */
export function DesignFeed({ templates, categories, showCreate }: { templates: CatalogueTemplate[]; categories: EventCategory[]; showCreate: boolean }) {
  const items: React.ReactNode[] = [];
  if (showCreate) {
    items.push(
      <AppLink
        key="create"
        href={ROUTES.newInvitation}
        className="group flex aspect-[3/4] flex-col justify-between rounded-2xl bg-primary p-5 text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        data-testid="home-create"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-white/20 transition-transform duration-(--duration-slow) group-hover:rotate-90">
          <PlusIcon className="size-6" aria-hidden />
        </span>
        <span>
          <span className="block text-xl leading-tight font-semibold">Create an invitation</span>
          <span className="mt-1 block text-sm text-primary-foreground/80">Pick an occasion and a design. No account needed to start.</span>
        </span>
      </AppLink>,
    );
  }
  templates.forEach((t, i) => {
    items.push(<TemplateCard key={t.row.id} template={t} />);
    const c = categories[i];
    if (c) {
      const style = categoryStyle(c.slug);
      items.push(
        <Link
          key={`occasion-${c.id}`}
          href={routes.templatesFor(c.slug)}
          className={cn("flex flex-col justify-between rounded-2xl p-5 transition-[filter] hover:brightness-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", TONES[style.tone], TILE_ASPECTS[i % TILE_ASPECTS.length])}
        >
          <style.icon className="size-8" aria-hidden />
          <span>
            <span className="block text-lg leading-tight font-semibold text-foreground">{c.name}</span>
            <span className="mt-0.5 block text-sm">See designs</span>
          </span>
        </Link>,
      );
    }
  });

  return (
    <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 [&>*]:mb-5 [&>*]:break-inside-avoid">
      {items.map((node, i) => (
        <div key={i}>{node}</div>
      ))}
    </div>
  );
}

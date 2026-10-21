import { EyeIcon, LockIcon } from "lucide-react";
import Link from "next/link";
import { AppLink } from "@/components/layout/app-link";
import { LazyMount } from "@/components/motion/lazy-mount";
import { Badge } from "@/components/ui/badge";
import { DeviceFrame } from "@/features/templates/components/device-frame";
import type { CatalogueTemplate } from "@/features/templates/queries";
import { primaryCategory } from "@/features/templates/queries";
import { InvitationRenderer } from "@/features/templates/renderer";
import { sampleView } from "@/features/templates/sample-data";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import type { CategorySlug } from "@/types/domain";

interface TemplateCardProps {
  template: CatalogueTemplate;
  category?: CategorySlug;
  href?: string;
}

/** Action pills on the card: shown on hover or focus, and always on touch screens (no hover there). */
const PILL =
  "absolute z-10 inline-flex items-center rounded-full py-2.5 text-sm font-semibold opacity-0 transition-[opacity,background-color] duration-(--duration-base) group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [@media(hover:none)]:opacity-100";

/**
 * A design as a "pin": the live preview first, a scrim with "Use" and
 * "Preview" pills on hover, the name underneath. The whole card opens the
 * template page; "Use" starts an invitation with it straight away and
 * "Preview" opens the full live demo (opening card, motion, music).
 */
export function TemplateCard({ template, category, href }: TemplateCardProps) {
  const { row, def } = template;
  const cat = category && def.categories.includes(category) ? category : primaryCategory(template);
  const view = sampleView(cat, { key: def.key, name: def.name, tier: row.tier });
  const target = href ?? routes.template(row.slug);
  // The live demo, for the occasion being browsed when there is one.
  const demo = category && def.categories.includes(category) ? `${routes.demo(row.slug)}?occasion=${category}` : routes.demo(row.slug);

  // Stretched link: the preview is a sibling of the link (previews contain their own links).
  return (
    <article className="group relative">
      <div className="relative overflow-hidden rounded-2xl" style={{ background: def.previewGradient }}>
        {/* Live preview mounts near the viewport; the same-shape placeholder prevents layout shift. */}
        <LazyMount placeholder={<div className="aspect-[3/4]" />}>
          <DeviceFrame variant="card" scrollable={false} label={`${def.name} preview`} className="pointer-events-none rounded-none border-0 shadow-none">
            <InvitationRenderer view={view} mode="preview" />
          </DeviceFrame>
        </LazyMount>
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-(--duration-base) group-hover:bg-black/25" />
        {row.tier === "premium" ? (
          <Badge variant="dark" className="absolute top-3 left-3">
            <LockIcon aria-hidden /> Premium
          </Badge>
        ) : null}
        <AppLink
          href={routes.newInvitation({ template: row.slug })}
          className={cn(PILL, "top-3 right-3 bg-primary px-4 text-primary-foreground hover:bg-primary-hover")}
          aria-label={`Use ${def.name}`}
        >
          Use
        </AppLink>
        <Link href={demo} className={cn(PILL, "bottom-3 left-3 gap-1.5 bg-white/95 px-3.5 text-neutral-900 shadow-sm backdrop-blur hover:bg-white")} aria-label={`Preview ${def.name}`} data-testid={`preview-${row.slug}`}>
          <EyeIcon className="size-4" aria-hidden />
          Preview
        </Link>
      </div>
      <h3 className="mt-2 truncate px-1 text-sm font-semibold">
        <Link href={target} className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-ring">
          {def.name}
        </Link>
      </h3>
    </article>
  );
}

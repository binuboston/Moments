import { LockIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { LazyMount } from "@/components/motion/lazy-mount";
import { DeviceFrame } from "@/features/templates/components/device-frame";
import type { CatalogueTemplate } from "@/features/templates/queries";
import { primaryCategory } from "@/features/templates/queries";
import { InvitationRenderer } from "@/features/templates/renderer";
import { sampleView } from "@/features/templates/sample-data";
import type { CategorySlug } from "@/types/domain";

interface TemplateCardProps {
  template: CatalogueTemplate;
  category?: CategorySlug;
  href?: string;
}

/** Catalogue card with a live, scaled render of the template using sample data. */
export function TemplateCard({ template, category, href }: TemplateCardProps) {
  const { row, def } = template;
  const cat = category && def.categories.includes(category) ? category : primaryCategory(template);
  const view = sampleView(cat, { key: def.key, name: def.name, tier: row.tier });
  const target = href ?? `/templates/${row.slug}`;

  // Stretched-link card: the preview is a sibling of the link (never inside it),
  // because previews contain their own links and buttons (nested <a> breaks hydration).
  return (
    <article className="group relative">
      <div className="relative overflow-hidden rounded-3xl p-3 transition-transform duration-(--duration-slow) ease-(--ease-out-quart) group-hover:-translate-y-1" style={{ background: def.previewGradient }}>
        {/* Live preview mounts near the viewport; the frame-shaped placeholder prevents layout shift. */}
        <LazyMount placeholder={<div className="aspect-[3/4] rounded-2xl bg-surface/60" />}>
          <DeviceFrame variant="card" scrollable={false} label={`${def.name} preview`} className="pointer-events-none">
            <InvitationRenderer view={view} mode="preview" />
          </DeviceFrame>
        </LazyMount>
        <div className="absolute top-5 left-5 flex gap-2">
          {row.tier === "premium" ? (
            <Badge variant="dark">
              <LockIcon aria-hidden /> Premium
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-surface/90">
              Free
            </Badge>
          )}
        </div>
      </div>
      <div className="mt-4 px-1">
        <h3 className="text-lg font-medium tracking-tight">
          <Link
            href={target}
            className="rounded-sm outline-none after:absolute after:inset-0 after:rounded-3xl group-hover:text-primary focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-offset-4 focus-visible:after:ring-offset-background"
          >
            {def.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{row.description ?? def.description}</p>
      </div>
    </article>
  );
}

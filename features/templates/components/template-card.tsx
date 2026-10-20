import { LockIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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

  return (
    <Link
      href={target}
      className="group block rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <div className="relative overflow-hidden rounded-3xl bg-muted p-3 transition-transform duration-500 ease-out-expo group-hover:-translate-y-1" style={{ background: def.previewGradient }}>
        <DeviceFrame variant="card" scrollable={false} label={`${def.name} preview`} className="pointer-events-none">
          <InvitationRenderer view={view} mode="preview" />
        </DeviceFrame>
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
      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight group-hover:text-primary">{def.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{row.description ?? def.description}</p>
        </div>
      </div>
    </Link>
  );
}

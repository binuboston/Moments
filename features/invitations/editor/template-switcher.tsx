"use client";

import { CheckIcon, ChevronDownIcon, LockIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { TemplateOption } from "@/features/invitations/editor/panels/design-panel";
import { canUseTemplate } from "@/lib/entitlements";
import { cn } from "@/lib/utils/cn";
import { useEditorStore } from "@/stores/editor-store";

/**
 * Quick design switcher in the editor toolbar. Content is kept; the preview
 * updates instantly and the toast offers a one-tap undo.
 */
export function TemplateSwitcher({ templates }: { templates: TemplateOption[] }) {
  const draft = useEditorStore((s) => s.draft)!;
  const setTemplate = useEditorStore((s) => s.setTemplate);
  const current = templates.find((t) => t.key === draft.templateKey);

  const choose = (t: TemplateOption) => {
    if (t.key === draft.templateKey) return;
    const previous = current;
    setTemplate({ key: t.key, slug: t.slug, tier: t.tier });
    toast.success(`Switched to ${t.name}`, {
      description: "Your content and photos are unchanged.",
      action: previous ? { label: "Undo", onClick: () => setTemplate({ key: previous.key, slug: previous.slug, tier: previous.tier }) } : undefined,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group flex h-10 min-w-0 items-center gap-2 rounded-full bg-fill py-1 pr-3 pl-1 text-sm font-medium transition-colors hover:bg-fill-hover focus-visible:ring-2 focus-visible:ring-ring outline-none data-[state=open]:bg-fill-hover"
        aria-label={`Design: ${current?.name ?? "Template"}. Change design`}
        data-testid="template-switcher"
      >
        <span className="size-8 shrink-0 rounded-full ring-1 ring-black/5" style={{ background: current?.gradient }} aria-hidden />
        <span className="hidden max-w-36 truncate sm:block">{current?.name ?? "Template"}</span>
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-(--duration-base) group-data-[state=open]:rotate-180" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl border-0 p-2 shadow-float">
        <DropdownMenuLabel className="px-2 pt-1 pb-2 text-xs font-medium text-muted-foreground">Switch design · content stays the same</DropdownMenuLabel>
        <div className="max-h-[min(26rem,60dvh)] overflow-y-auto">
          {templates.map((t) => {
            const active = t.key === draft.templateKey;
            const allowed = canUseTemplate(draft.plan, t.tier);
            return (
              <DropdownMenuItem key={t.slug} onSelect={() => choose(t)} className={cn("gap-3 rounded-xl p-2", active && "bg-fill")} data-testid={`switch-template-${t.slug}`}>
                <span className="h-11 w-16 shrink-0 rounded-lg ring-1 ring-black/5" style={{ background: t.gradient }} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {t.name}
                    {t.tier === "premium" ? (
                      <Badge variant={allowed ? "accent" : "dark"} className="h-5 px-1.5 text-[0.65rem]">
                        {allowed ? "Pro" : <LockIcon className="size-3" aria-label="Pro plan" />}
                      </Badge>
                    ) : null}
                  </span>
                  <span className="line-clamp-1 text-xs text-muted-foreground">{t.description}</span>
                </span>
                {active ? <CheckIcon className="size-4 shrink-0 text-primary" aria-hidden /> : null}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

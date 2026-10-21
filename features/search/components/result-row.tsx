import { CircleHelpIcon, FileTextIcon, LayoutTemplateIcon, LogInIcon, MailIcon, PlusIcon, SettingsIcon, UserRoundIcon, type LucideIcon } from "lucide-react";
import { IconTile } from "@/components/ui/icon-tile";
import { highlightParts } from "@/features/search/score";
import type { SearchIconKey } from "@/features/search/types";
import { categoryStyle, type Tone } from "@/lib/design/tones";
import { cn } from "@/lib/utils/cn";

const ICONS: Record<Exclude<SearchIconKey, `category:${string}`>, { icon: LucideIcon; tone: Tone }> = {
  plus: { icon: PlusIcon, tone: "rose" },
  mail: { icon: MailIcon, tone: "violet" },
  user: { icon: UserRoundIcon, tone: "blue" },
  layout: { icon: LayoutTemplateIcon, tone: "amber" },
  help: { icon: CircleHelpIcon, tone: "teal" },
  page: { icon: FileTextIcon, tone: "slate" },
  settings: { icon: SettingsIcon, tone: "slate" },
  login: { icon: LogInIcon, tone: "green" },
};

export function iconFor(key: SearchIconKey): { icon: LucideIcon; tone: Tone } {
  return key.startsWith("category:") ? categoryStyle(key.slice("category:".length)) : ICONS[key as keyof typeof ICONS];
}

/** Text with the matched part emphasised. */
export function Highlight({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlightParts(text, query).map((p, i) =>
        p.match ? (
          <mark key={i} className="rounded-sm bg-transparent font-semibold text-foreground">
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}

/** One search result: icon tile, title (match emphasised) and a muted detail line. Presentational, server-safe. */
export function ResultRow({ icon, title, subtitle, query, size = "sm", className }: { icon: SearchIconKey; title: string; subtitle?: string; query: string; size?: "sm" | "md"; className?: string }) {
  const { icon: Icon, tone } = iconFor(icon);
  return (
    <span className={cn("flex min-w-0 items-center gap-3", className)}>
      <IconTile icon={Icon} tone={tone} size={size} />
      <span className="min-w-0">
        <span className="block truncate text-sm text-foreground/85">
          <Highlight text={title} query={query} />
        </span>
        {subtitle ? <span className="block truncate text-xs text-muted-foreground">{subtitle}</span> : null}
      </span>
    </span>
  );
}

"use client";

import { EyeIcon, PencilLineIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useEditorStore, type EditorView } from "@/stores/editor-store";

const OPTIONS: { value: EditorView; label: string; icon: typeof EyeIcon }[] = [
  { value: "edit", label: "Edit", icon: PencilLineIcon },
  { value: "preview", label: "Preview", icon: EyeIcon },
];

/** Segmented Edit / Preview switch with a sliding thumb. */
export function ViewToggle({ className }: { className?: string }) {
  const view = useEditorStore((s) => s.view);
  const setView = useEditorStore((s) => s.setView);

  return (
    <div role="tablist" aria-label="Editor view" className={cn("relative grid h-10 grid-cols-2 rounded-full bg-fill p-1", className)}>
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-surface shadow-card transition-transform duration-(--duration-slow) ease-(--ease-out-quart) motion-reduce:transition-none",
          view === "preview" && "translate-x-full",
        )}
      />
      {OPTIONS.map((o) => {
        const active = view === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setView(o.value)}
            data-testid={`view-${o.value}`}
            className={cn(
              "relative z-10 flex items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors duration-(--duration-base) outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <o.icon className="size-4" aria-hidden />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

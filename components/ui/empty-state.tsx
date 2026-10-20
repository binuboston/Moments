import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps extends React.ComponentProps<"div"> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function EmptyState({ icon: Icon, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-subtle/60 px-6 py-14 text-center",
        className,
      )}
      {...props}
    >
      {Icon ? (
        <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-surface text-primary shadow-soft">
          <Icon className="size-5" aria-hidden />
        </span>
      ) : null}
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-muted-foreground text-pretty">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export { EmptyState };

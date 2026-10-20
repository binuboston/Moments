import { cn } from "@/lib/utils/cn";

/**
 * Page title block. On phones actions sit under the title at full width
 * (or are hidden with hideActionsOnMobile when the tab bar already offers them).
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
  hideActionsOnMobile = false,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  hideActionsOnMobile?: boolean;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground text-pretty">{description}</p> : null}
      </div>
      {actions ? <div className={cn("flex flex-wrap items-center gap-2 [&>*]:flex-1 sm:[&>*]:flex-none", hideActionsOnMobile && "hidden lg:flex")}>{actions}</div> : null}
    </div>
  );
}

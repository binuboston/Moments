import { cn } from "@/lib/utils/cn";

/**
 * Page title block. On phones the title and description are visually hidden
 * (kept for screen readers and the document outline) to keep the app minimal:
 * the tab bar already says where you are. Actions, if any, stay at full width
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
  const mobileActions = Boolean(actions) && !hideActionsOnMobile;
  return (
    // Nothing visible on phones: hide the whole block so it leaves no gap.
    <div className={cn("flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", !mobileActions && "max-sm:sr-only", className)}>
      <div className="min-w-0 max-sm:sr-only">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground text-pretty">{description}</p> : null}
      </div>
      {actions ? <div className={cn("flex flex-wrap items-center gap-2 [&>*]:flex-1 sm:[&>*]:flex-none", hideActionsOnMobile && "hidden lg:flex")}>{actions}</div> : null}
    </div>
  );
}

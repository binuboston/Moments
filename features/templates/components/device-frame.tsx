import { cn } from "@/lib/utils/cn";
import { ScaledPreview } from "@/features/templates/components/scaled-preview";

interface DeviceFrameProps {
  variant?: "phone" | "card";
  className?: string;
  children: React.ReactNode;
  scrollable?: boolean;
  label?: string;
  /**
   * Decorative previews (catalogue, marketing, auth) are hidden from assistive
   * technology and made inert so their headings and form fields never leak
   * into the host page. The editor preview sets this to false.
   */
  decorative?: boolean;
}

/** Phone frame (9:19) or flat card frame (3:4) around a scaled invitation preview. */
export function DeviceFrame({ variant = "phone", className, children, scrollable = true, label, decorative = true }: DeviceFrameProps) {
  const a11y = decorative ? { "aria-hidden": true as const, inert: true } : { "aria-label": label, role: "region" as const };
  if (variant === "card") {
    return (
      <div className={cn("relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-surface shadow-soft", className)} {...a11y} data-preview-label={label}>
        <ScaledPreview contentWidth={420} scrollable={scrollable}>
          {children}
        </ScaledPreview>
      </div>
    );
  }
  return (
    <div className={cn("relative aspect-[9/19] w-full rounded-[2.75rem] border-[6px] border-foreground bg-foreground p-1 shadow-lift", className)} {...a11y} data-preview-label={label}>
      <div className="absolute top-3 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-foreground" aria-hidden />
      <div className="h-full w-full overflow-hidden rounded-[2.2rem] bg-surface">
        <ScaledPreview contentWidth={390} scrollable={scrollable}>
          {children}
        </ScaledPreview>
      </div>
    </div>
  );
}

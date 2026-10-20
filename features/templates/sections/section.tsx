import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface SectionProps extends React.ComponentProps<"section"> {
  eyebrow?: string;
  title?: string;
  /** Shows a chapter number before the eyebrow ("01 ——— Eyebrow"). */
  index?: number;
  align?: "left" | "center";
  titleClassName?: string;
  eyebrowClassName?: string;
}

/** Consistent vertical rhythm, heading structure and entrance motion for invitation sections. */
export function Section({ eyebrow, title, index, align = "center", className, titleClassName, eyebrowClassName, children, ...props }: SectionProps) {
  return (
    <section className={cn("scroll-mt-6 px-6 py-14 sm:px-10 sm:py-20", align === "center" && "text-center", className)} {...props}>
      {eyebrow || title ? (
        <header className={cn("mb-10", align === "center" ? "mx-auto max-w-md" : "max-w-md")}>
          {eyebrow ? (
            <p
              className={cn(
                "mb-3 flex items-center gap-3 text-[0.7rem] font-semibold tracking-[0.22em] uppercase text-(--inv-accent)",
                align === "center" && "justify-center",
                eyebrowClassName,
              )}
              data-inv-reveal
            >
              {index !== undefined ? (
                <>
                  <span className="tabular-nums">{String(index).padStart(2, "0")}</span>
                  <span className="h-px w-8 bg-current opacity-50" aria-hidden />
                </>
              ) : null}
              <span>{eyebrow}</span>
            </p>
          ) : null}
          {title ? (
            <h2 className={cn("inv-display text-3xl leading-tight text-balance sm:text-5xl", titleClassName)} data-inv-reveal="split">
              {title}
            </h2>
          ) : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

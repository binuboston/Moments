import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface SectionProps extends React.ComponentProps<"section"> {
  eyebrow?: string;
  title?: string;
  align?: "left" | "center";
  titleClassName?: string;
  eyebrowClassName?: string;
}

/** Consistent vertical rhythm and heading structure for invitation sections. */
export function Section({ eyebrow, title, align = "center", className, titleClassName, eyebrowClassName, children, ...props }: SectionProps) {
  return (
    <section className={cn("px-6 py-12 sm:px-10 sm:py-16", align === "center" && "text-center", className)} {...props}>
      {eyebrow || title ? (
        <header className={cn("mb-8", align === "center" ? "mx-auto max-w-md" : "max-w-md")}>
          {eyebrow ? (
            <p className={cn("mb-2 text-[0.7rem] font-semibold tracking-[0.22em] uppercase text-(--inv-accent)", eyebrowClassName)}>{eyebrow}</p>
          ) : null}
          {title ? <h2 className={cn("inv-display text-3xl leading-tight text-balance sm:text-4xl", titleClassName)}>{title}</h2> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

import { cn } from "@/lib/utils/cn";
import { LotusDivider } from "@/features/templates/cinematic/art/ornaments";
import { PaperGrain } from "@/features/templates/cinematic/art/ornaments";

interface CineSectionProps extends React.ComponentProps<"section"> {
  contrast?: boolean;
  grain?: boolean;
}

/** Full-bleed section on paper or on the contrast band. Remaps text vars on contrast. */
export function CineSection({ contrast, grain = true, className, children, ...props }: CineSectionProps) {
  return (
    <section className={cn("relative isolate overflow-hidden px-6 py-20 @2xl:px-10 @2xl:py-28", contrast && "cine-contrast", className)} {...props}>
      {grain ? <PaperGrain opacity={contrast ? 0.12 : 0.07} /> : null}
      <div className="relative">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-[0.68rem] font-medium tracking-[0.32em] text-(--inv-accent-ink) uppercase", className)}>{children}</p>;
}

export function SectionHeading({ id, eyebrow, title, align = "center", className }: { id: string; eyebrow?: string; title: string; align?: "center" | "left"; className?: string }) {
  return (
    <header className={cn("mb-12 flex flex-col gap-4", align === "center" ? "items-center text-center" : "items-start text-left", className)} data-reveal="up">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 id={id} className="inv-display text-4xl leading-[1.05] text-balance @2xl:text-5xl">
        {title}
      </h2>
      <LotusDivider className={align === "left" ? "-ml-24" : undefined} />
    </header>
  );
}

/** Couple names with a script ampersand; single titles render as-is. */
export function DisplayNames({ title, className, stacked = true }: { title: string; className?: string; stacked?: boolean }) {
  const parts = title.split(/\s+&\s+/);
  if (parts.length !== 2) return <span className={className}>{title}</span>;
  return (
    <span className={cn(stacked ? "flex flex-col items-center" : "inline", className)}>
      <span className="block">{parts[0]}</span>
      <span className="inv-script my-[-0.12em] block text-[0.7em] text-(--inv-accent-ink)" aria-label="and">
        &amp;
      </span>
      <span className="block">{parts[1]}</span>
    </span>
  );
}

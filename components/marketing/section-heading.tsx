import { cn } from "@/lib/utils/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  /** Use "h1" for the page title; sections default to h2. */
  as?: "h1" | "h2";
}

export function SectionHeading({ eyebrow, title, description, align = "center", className, as: Heading = "h2" }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
      <Heading className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">{title}</Heading>
      {description ? <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">{description}</p> : null}
    </div>
  );
}

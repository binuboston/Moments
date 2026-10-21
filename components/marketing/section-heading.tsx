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
    <div className={cn(Heading === "h1" ? "max-w-4xl" : "max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {/* Page titles drop their eyebrow on phones (the title says enough there). */}
      {eyebrow ? <p className={cn("eyebrow mb-4", Heading === "h1" && "max-sm:hidden")}>{eyebrow}</p> : null}
      <Heading data-reveal="split" className={cn("text-balance", Heading === "h1" ? "display-2" : "display-3")}>
        {title}
      </Heading>
      {description ? (
        <p data-reveal className="lead mt-5 text-pretty">
          {description}
        </p>
      ) : null}
    </div>
  );
}

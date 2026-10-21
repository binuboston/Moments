import { formatEventDate, formatTimeRange } from "@/lib/utils/dates";
import { DecoCorner, HeroTitle, Invocation, kindDetails, monogram } from "@/features/templates/designs/shared";
import type { TemplateProps } from "@/features/templates/types";

/** Art deco: corner brackets, diamond monogram, spaced capitals. */
export function DecoHero({ view }: TemplateProps) {
  const { content } = view;
  const details = kindDetails(view);
  return (
    <header data-inv-exit className="relative px-6 pt-14 pb-14 text-center sm:px-12 sm:pt-20">
      <DecoCorner className="absolute top-4 left-4" />
      <DecoCorner className="absolute top-4 right-4 rotate-90" />
      <DecoCorner className="absolute bottom-4 left-4 -rotate-90" />
      <DecoCorner className="absolute right-4 bottom-4 rotate-180" />
      <Invocation view={view} />
      <div className="mx-auto mb-8 flex w-fit" data-inv-hero>
        <div className="inline-flex size-20 items-center justify-center bg-(--inv-accent) text-(--inv-accent-contrast)" style={{ clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)" }}>
          <span className="inv-display text-lg tracking-[0.2em]">{monogram(view)}</span>
        </div>
      </div>
      <p className="text-[0.7rem] font-medium tracking-[0.36em] uppercase text-(--inv-accent)" data-inv-hero>
        {details.eyebrow}
      </p>
      <HeroTitle view={view} className="inv-display mt-6 text-5xl leading-[1.05] tracking-[0.04em] uppercase text-balance sm:text-6xl" headlineClassName="text-xs tracking-[0.24em] uppercase text-(--inv-muted)" />
      {content.subheading ? (
        <p className="mt-5 text-sm tracking-[0.2em] uppercase text-(--inv-muted)" data-inv-hero>
          {content.subheading}
        </p>
      ) : null}
      <div className="mx-auto mt-10 flex justify-center" aria-hidden data-inv-reveal="draw">
        <span className="h-px w-24 bg-(--inv-accent)" data-line />
      </div>
      <p className="mt-6 text-lg tracking-wide" data-inv-hero>
        {formatEventDate(content.startsAt, content.timezone)}
      </p>
      <p className="mt-1 text-sm text-(--inv-muted)" data-inv-hero>
        {formatTimeRange(content.startsAt, content.endsAt, content.timezone)}
      </p>
    </header>
  );
}

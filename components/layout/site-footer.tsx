import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";

const columns = [
  {
    heading: "Product",
    links: [
      { href: "/templates", label: "Templates" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    heading: "Occasions",
    links: [
      { href: "/templates?category=wedding", label: "Weddings" },
      { href: "/templates?category=birthday", label: "Birthdays" },
      { href: "/templates?category=baby-shower", label: "Baby showers" },
      { href: "/templates?category=corporate", label: "Corporate events" },
    ],
  },
  {
    heading: "Support",
    links: [
      { href: "/help", label: "Help centre" },
      { href: "/help#privacy", label: "Privacy" },
      { href: "/help#terms", label: "Terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground text-pretty">
            Choose a design. Make it yours. Share your event with the world. Elegant digital invitations for every occasion.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.heading}>
            <h3 className="text-sm font-semibold">{col.heading}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      {/* Oversized closing wordmark, cropped by the page edge. */}
      <Container aria-hidden className="overflow-hidden">
        <p className="-mb-[0.18em] select-none text-[clamp(5rem,24vw,22rem)] leading-none font-medium tracking-[-0.06em] text-foreground/[0.06]">Mirth</p>
      </Container>
      <div className="border-t border-border/70">
        <Container className="flex flex-col items-start justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Mirth. All rights reserved.</p>
          <p>Made with care for the moments that matter.</p>
        </Container>
      </div>
    </footer>
  );
}

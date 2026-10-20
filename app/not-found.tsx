import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { ROUTES } from "@/lib/routes";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center paper-grain">
      <Logo />
      <p className="eyebrow mt-10">404</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">We couldn't find that page</h1>
      <p className="mt-4 max-w-md text-muted-foreground text-pretty">The link may be incorrect, or the page may have been moved or unpublished.</p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href={ROUTES.home}>Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.templates}>Browse templates</Link>
        </Button>
      </div>
    </main>
  );
}

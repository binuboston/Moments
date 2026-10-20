import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

export default function InvitationNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center paper-grain">
      <Logo />
      <h1 className="mt-10 font-display text-3xl font-semibold tracking-tight sm:text-4xl">This invitation isn't available</h1>
      <p className="mt-4 max-w-md text-muted-foreground text-pretty">
        It may not be published yet, it may have been taken down by the host, or the link might be mistyped. Please check with whoever sent it to you.
      </p>
      <Button asChild variant="outline" className="mt-8">
        <Link href="/">Create your own invitation</Link>
      </Button>
    </main>
  );
}

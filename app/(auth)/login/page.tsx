import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/auth-forms";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="h-80 w-full" />}>
      <LoginForm />
    </Suspense>
  );
}

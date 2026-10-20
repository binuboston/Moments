import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupForm } from "@/features/auth/auth-forms";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default function SignupPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <SignupForm />
    </Suspense>
  );
}

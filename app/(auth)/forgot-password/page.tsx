import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ForgotPasswordForm } from "@/features/auth/auth-forms";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/features/auth/auth-forms";
import { getCurrentUser } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default async function ResetPasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.forgotPassword);
  return <ResetPasswordForm />;
}

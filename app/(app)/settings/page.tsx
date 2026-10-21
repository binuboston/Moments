import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm, SecurityPanel } from "@/features/auth/settings-forms";
import { PLAN_LIMITS } from "@/lib/entitlements";
import { requireAppUser } from "@/lib/auth/session";
import { getCurrentProfile } from "@/lib/supabase/server";
import { BRAND } from "@/lib/brand";
import { ROUTES, routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };

export default async function SettingsPage() {
  const user = await requireAppUser(ROUTES.settings);
  if (user.is_anonymous) {
    // Guests have no profile or password yet.
    return (
      <div className="grid min-w-0 grid-cols-1 gap-5 sm:gap-8">
        <PageHeader title="Settings" description="Your profile, plan and account security." />
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>You&apos;re designing as a guest. Create a free account to publish, set up your profile and use your drafts on any device. Your work comes with you.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href={routes.signup(ROUTES.settings)}>Create free account</Link>
            </Button>
            <Button asChild variant="soft">
              <Link href={routes.login(ROUTES.settings)}>Log in</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Follow your device, or always use light or dark.</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeSwitcher className="max-w-sm" />
          </CardContent>
        </Card>
      </div>
    );
  }
  const profile = await getCurrentProfile();
  const plan = profile?.plan ?? "free";
  const limits = PLAN_LIMITS[plan];

  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 sm:gap-8">
      <PageHeader title="Settings" description="Your profile, plan and account security." />
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Follow your device, or always use light or dark.</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSwitcher className="max-w-sm" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>How your name appears in the dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm fullName={profile?.full_name ?? ""} email={user.email ?? ""} />
            </CardContent>
          </Card>
          <Card id="security">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Change your password or sign out of this device.</CardDescription>
            </CardHeader>
            <CardContent>
              <SecurityPanel email={user.email ?? ""} />
            </CardContent>
          </Card>
        </div>
        <Card className="self-start">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Plan
              <Badge variant={plan === "pro" ? "accent" : "outline"} className="capitalize">
                {plan}
              </Badge>
            </CardTitle>
            <CardDescription>What your current plan includes.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Live invitations</dt>
                <dd className="font-medium">{limits.maxActiveInvitations}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Gallery photos</dt>
                <dd className="font-medium">{limits.maxGalleryImages} per invitation</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Premium templates</dt>
                <dd className="font-medium">{plan === "pro" ? "Included" : "Pro only"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{BRAND.badge}</dt>
                <dd className="font-medium">{limits.branding ? "Shown" : "Removed"}</dd>
              </div>
            </dl>
            {plan === "free" ? <p className="mt-4 text-xs text-muted-foreground">Payments are not yet live. Contact support to upgrade.</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

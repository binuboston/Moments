import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm, SecurityPanel } from "@/features/auth/settings-forms";
import { PLAN_LIMITS } from "@/lib/entitlements";
import { getCurrentProfile, getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const profile = await getCurrentProfile();
  const plan = profile?.plan ?? "free";
  const limits = PLAN_LIMITS[plan];

  return (
    <div className="grid gap-8">
      <PageHeader title="Settings" description="Your profile, plan and account security." />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-6">
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
                <dt className="text-muted-foreground">Mirth badge</dt>
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

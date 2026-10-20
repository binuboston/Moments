"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, MailCheckIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, fieldAria } from "@/components/forms/field";
import { createClient } from "@/lib/supabase/client";
import { safeNextPath } from "@/features/auth/safe-next";
import { AuthSwitch, claimGuestDrafts, GoogleButton, googleEnabled, GuestNotice, OrDivider, PasswordInput, StrengthMeter } from "@/features/auth/auth-ui";
import { ROUTES, routes } from "@/lib/routes";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type ResetPasswordInput,
  type SignupInput,
} from "@/features/auth/schemas";

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "That email and password don't match. Please try again.";
  if (m.includes("email not confirmed")) return "Please confirm your email address first. Check your inbox for the link.";
  if (m.includes("user already registered")) return "An account with this email already exists. Try logging in instead.";
  if (m.includes("rate limit")) return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("password")) return message;
  return "Something went wrong. Please try again.";
}

interface AuthFormProps {
  /** Inside another surface (the publish sheet): no page heading or switch. */
  embedded?: boolean;
  /** Where to go after signing in (defaults to ?next= or the dashboard). */
  next?: string;
  /** Called after sign-in (and after guest drafts are kept) instead of navigating. */
  onSuccess?: () => void;
}

function useAfterAuth({ next, onSuccess }: { next: string; onSuccess?: () => void }) {
  const router = useRouter();
  return async () => {
    // A guest's drafts move to the account before anything re-renders.
    await claimGuestDrafts();
    if (onSuccess) onSuccess();
    else {
      router.replace(next);
      router.refresh();
    }
  };
}

const ERRORS: Record<string, string> = {
  auth: "Your sign-in link was invalid or has expired. Please try again.",
  oauth: "Google sign-in was cancelled or didn't complete. Please try again.",
};

export function LoginForm({ embedded = false, next: nextProp, onSuccess }: AuthFormProps = {}) {
  const searchParams = useSearchParams();
  const next = nextProp ?? safeNextPath(searchParams.get("next"));
  const [error, setError] = useState<string | null>(ERRORS[searchParams.get("error") ?? ""] ?? null);
  const [done, setDone] = useState(false);
  const afterAuth = useAfterAuth({ next, onSuccess });

  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = async (values: LoginInput) => {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      setError(friendlyAuthError(error.message));
      return;
    }
    setDone(true);
    await afterAuth();
  };

  return (
    <div className="grid gap-6">
      {embedded ? null : (
        <>
          <AuthSwitch active="login" next={next} />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome <span className="font-serif font-normal text-primary italic">back</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Log in to manage and share your invitations.</p>
          </div>
        </>
      )}
      {embedded ? null : <GuestNotice />}
      <GoogleButton next={next} />
      {googleEnabled() ? <OrDivider /> : null}
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5" noValidate>
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Couldn&apos;t log in</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <Field id="email" label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" placeholder="you@example.com" {...fieldAria("email", { error: errors.email?.message })} {...form.register("email")} />
        </Field>
        <Field id="password" label="Password" error={errors.password?.message}>
          <PasswordInput autoComplete="current-password" {...fieldAria("password", { error: errors.password?.message })} {...form.register("password")} />
        </Field>
        <div className="-mt-2 text-right">
          <Link href={ROUTES.forgotPassword} className="text-xs text-muted-foreground hover:text-foreground">
            Forgot your password?
          </Link>
        </div>
        <Button type="submit" size="lg" loading={isSubmitting && !done} disabled={done}>
          {done ? (
            <>
              <CheckIcon aria-hidden /> Welcome back
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </div>
  );
}

export function SignupForm({ embedded = false, next: nextProp, onSuccess }: AuthFormProps = {}) {
  const searchParams = useSearchParams();
  const next = nextProp ?? safeNextPath(searchParams.get("next"));
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const afterAuth = useAfterAuth({ next, onSuccess });

  const form = useForm<SignupInput>({ resolver: zodResolver(signupSchema), defaultValues: { fullName: "", email: "", password: "" } });
  const { errors, isSubmitting } = form.formState;
  const password = useWatch({ control: form.control, name: "password" });

  const onSubmit = async (values: SignupInput) => {
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName },
        emailRedirectTo: `${window.location.origin}${routes.authCallback(next)}`,
      },
    });
    if (error) {
      setError(friendlyAuthError(error.message));
      return;
    }
    if (data.session) {
      setDone(true);
      await afterAuth();
      return;
    }
    setSentTo(values.email);
  };

  if (sentTo) {
    return (
      <div className="text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
          <MailCheckIcon className="size-6" aria-hidden />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Check your inbox</h1>
        <p className="mt-3 text-sm text-muted-foreground text-pretty">
          We sent a confirmation link to <span className="font-medium text-foreground">{sentTo}</span>. Open it on this device to finish, and your draft comes with you.
        </p>
        {embedded ? null : (
          <Button asChild variant="soft" className="mt-8">
            <Link href={ROUTES.login}>Back to log in</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {embedded ? null : (
        <>
          <AuthSwitch active="signup" next={next} />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Create your <span className="font-serif font-normal text-primary italic">account</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Free to start. No credit card needed.</p>
          </div>
        </>
      )}
      {embedded ? null : <GuestNotice />}
      <GoogleButton next={next} label="Sign up with Google" />
      {googleEnabled() ? <OrDivider /> : null}
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5" noValidate>
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Couldn&apos;t sign up</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <Field id="fullName" label="Full name" error={errors.fullName?.message}>
          <Input autoComplete="name" placeholder="Aisha Khan" {...fieldAria("fullName", { error: errors.fullName?.message })} {...form.register("fullName")} />
        </Field>
        <Field id="email" label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" placeholder="you@example.com" {...fieldAria("email", { error: errors.email?.message })} {...form.register("email")} />
        </Field>
        <Field id="password" label="Password" error={errors.password?.message}>
          <PasswordInput autoComplete="new-password" {...fieldAria("password", { error: errors.password?.message })} {...form.register("password")} />
          <StrengthMeter value={password} />
        </Field>
        <Button type="submit" size="lg" loading={isSubmitting && !done} disabled={done}>
          {done ? (
            <>
              <CheckIcon aria-hidden /> You&apos;re in
            </>
          ) : (
            "Create account"
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link href={ROUTES.terms} className="underline underline-offset-2">
            terms
          </Link>{" "}
          and{" "}
          <Link href={ROUTES.privacy} className="underline underline-offset-2">
            privacy summary
          </Link>
          .
        </p>
      </form>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: "" } });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = async (values: ForgotPasswordInput) => {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}${routes.authCallback(ROUTES.resetPassword)}`,
    });
    if (error) {
      setError(friendlyAuthError(error.message));
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
          <MailCheckIcon className="size-6" aria-hidden />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Check your inbox</h1>
        <p className="mt-3 text-sm text-muted-foreground text-pretty">If an account exists for that address, we've sent a link to reset your password.</p>
        <Button asChild variant="outline" className="mt-8">
          <Link href={ROUTES.login}>Back to log in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Reset your password</h1>
      <p className="mt-2 text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 grid gap-5" noValidate>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <Field id="email" label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...fieldAria("email", { error: errors.email?.message })} {...form.register("email")} />
        </Field>
        <Button type="submit" size="lg" loading={isSubmitting}>
          Send reset link
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href={ROUTES.login} className="font-medium text-primary underline-offset-4 hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { password: "", confirm: "" } });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = async (values: ResetPasswordInput) => {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setError(friendlyAuthError(error.message));
      return;
    }
    router.replace(ROUTES.app);
    router.refresh();
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Choose a new password</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 grid gap-5" noValidate>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <Field id="password" label="New password" error={errors.password?.message}>
          <Input type="password" autoComplete="new-password" {...fieldAria("password", { error: errors.password?.message })} {...form.register("password")} />
        </Field>
        <Field id="confirm" label="Confirm password" error={errors.confirm?.message}>
          <Input type="password" autoComplete="new-password" {...fieldAria("confirm", { error: errors.confirm?.message })} {...form.register("confirm")} />
        </Field>
        <Button type="submit" size="lg" loading={isSubmitting}>
          Update password
        </Button>
      </form>
    </div>
  );
}

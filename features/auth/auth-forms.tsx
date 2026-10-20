"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheckIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, fieldAria } from "@/components/forms/field";
import { createClient } from "@/lib/supabase/client";
import { safeNextPath } from "@/features/auth/safe-next";
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

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const [error, setError] = useState<string | null>(searchParams.get("error") ? "Your sign-in link was invalid or has expired. Please try again." : null);

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
    router.replace(next);
    router.refresh();
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">Log in to manage your invitations.</p>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 grid gap-5" noValidate>
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Couldn't log in</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <Field id="email" label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...fieldAria("email", { error: errors.email?.message })} {...form.register("email")} />
        </Field>
        <Field id="password" label="Password" error={errors.password?.message}>
          <Input type="password" autoComplete="current-password" {...fieldAria("password", { error: errors.password?.message })} {...form.register("password")} />
        </Field>
        <div className="-mt-2 text-right">
          <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
            Forgot your password?
          </Link>
        </div>
        <Button type="submit" size="lg" loading={isSubmitting}>
          Log in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Mirth?{" "}
        <Link href={next !== "/dashboard" ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="font-medium text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm<SignupInput>({ resolver: zodResolver(signupSchema), defaultValues: { fullName: "", email: "", password: "" } });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = async (values: SignupInput) => {
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setError(friendlyAuthError(error.message));
      return;
    }
    if (data.session) {
      router.replace(next);
      router.refresh();
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
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">Check your inbox</h1>
        <p className="mt-3 text-sm text-muted-foreground text-pretty">
          We sent a confirmation link to <span className="font-medium text-foreground">{sentTo}</span>. Open it to activate your account.
        </p>
        <Button asChild variant="outline" className="mt-8">
          <Link href="/login">Back to log in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">Free to start. No credit card needed.</p>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 grid gap-5" noValidate>
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Couldn't sign up</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <Field id="fullName" label="Full name" error={errors.fullName?.message}>
          <Input autoComplete="name" {...fieldAria("fullName", { error: errors.fullName?.message })} {...form.register("fullName")} />
        </Field>
        <Field id="email" label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...fieldAria("email", { error: errors.email?.message })} {...form.register("email")} />
        </Field>
        <Field id="password" label="Password" hint="At least 8 characters" error={errors.password?.message}>
          <Input type="password" autoComplete="new-password" {...fieldAria("password", { error: errors.password?.message, hint: "At least 8 characters" })} {...form.register("password")} />
        </Field>
        <Button type="submit" size="lg" loading={isSubmitting}>
          Create account
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link href="/help#terms" className="underline underline-offset-2">
            terms
          </Link>{" "}
          and{" "}
          <Link href="/help#privacy" className="underline underline-offset-2">
            privacy summary
          </Link>
          .
        </p>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
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
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
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
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">Check your inbox</h1>
        <p className="mt-3 text-sm text-muted-foreground text-pretty">If an account exists for that address, we've sent a link to reset your password.</p>
        <Button asChild variant="outline" className="mt-8">
          <Link href="/login">Back to log in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Reset your password</h1>
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
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
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
    router.replace("/dashboard");
    router.refresh();
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Choose a new password</h1>
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

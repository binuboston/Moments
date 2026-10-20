"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, fieldAria } from "@/components/forms/field";
import { apiFetch } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/client";
import { errorMessage } from "@/features/invitations/hooks";
import { useSignOut } from "@/features/auth/use-sign-out";
import { ROUTES, routes } from "@/lib/routes";

const profileSchema = z.object({ fullName: z.string().trim().min(1, "Tell us your name").max(120) });
type ProfileInput = z.infer<typeof profileSchema>;

export function ProfileForm({ fullName, email }: { fullName: string; email: string }) {
  const router = useRouter();
  const form = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), defaultValues: { fullName } });
  const save = useMutation({
    mutationFn: (values: ProfileInput) => apiFetch<{ ok: true }>("/api/profile", { method: "PATCH", json: values }),
    onSuccess: () => {
      toast.success("Profile updated");
      router.refresh();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  const { errors } = form.formState;

  return (
    <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="grid max-w-md gap-5" noValidate>
      <Field id="fullName" label="Full name" error={errors.fullName?.message}>
        <Input autoComplete="name" {...fieldAria("fullName", { error: errors.fullName?.message })} {...form.register("fullName")} />
      </Field>
      <Field id="email" label="Email" hint="Contact support to change your email address.">
        <Input id="email" value={email} readOnly disabled />
      </Field>
      <div>
        <Button type="submit" loading={save.isPending}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

export function SecurityPanel({ email }: { email: string }) {
  const { signOut, pending: signingOut } = useSignOut();
  const reset = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}${routes.authCallback(ROUTES.resetPassword)}` });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => toast.success("Password reset link sent. Check your inbox."),
    onError: (err) => toast.error(errorMessage(err)),
  });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" onClick={() => reset.mutate()} loading={reset.isPending}>
        Send password reset email
      </Button>
      <Button variant="ghost" onClick={signOut} loading={signingOut}>
        Log out
      </Button>
    </div>
  );
}

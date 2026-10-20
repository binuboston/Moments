import { z } from "zod";

export const emailSchema = z.email("Enter a valid email address").max(254);
export const passwordSchema = z.string().min(8, "Use at least 8 characters").max(72, "Use at most 72 characters");

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, "Enter your password") });
export const signupSchema = z.object({
  fullName: z.string().trim().min(1, "Tell us your name").max(120),
  email: emailSchema,
  password: passwordSchema,
});
export const forgotPasswordSchema = z.object({ email: emailSchema });
export const resetPasswordSchema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

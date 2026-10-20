import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Accessible form field wrapper. Pass `id` to both this and the control.
 * Wires hint and error text via aria-describedby through the `fieldDescribedBy` helper.
 */
export function Field({ id, label, hint, error, optional, className, children }: FieldProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {optional ? <span className="text-xs text-muted-foreground">Optional</span> : null}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Returns aria props for a control inside <Field>. */
export function fieldAria(id: string, opts: { error?: string; hint?: string }) {
  return {
    id,
    "aria-invalid": opts.error ? true : undefined,
    "aria-describedby": opts.error ? `${id}-error` : opts.hint ? `${id}-hint` : undefined,
  } as const;
}

"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field, fieldAria } from "@/components/forms/field";
import { COMMON_TIMEZONES, fromLocalInputValue, toLocalInputValue } from "@/lib/utils/dates";

interface BaseProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
}

export function TextField({ id, label, hint, error, optional, inputProps }: BaseProps & { inputProps: React.ComponentProps<"input"> }) {
  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional}>
      <Input {...inputProps} {...fieldAria(id, { error, hint })} />
    </Field>
  );
}

export function TextareaField({ id, label, hint, error, optional, textareaProps }: BaseProps & { textareaProps: React.ComponentProps<"textarea"> }) {
  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional}>
      <Textarea {...textareaProps} {...fieldAria(id, { error, hint })} />
    </Field>
  );
}

interface DateTimeFieldProps extends BaseProps {
  value: string; // ISO with offset or ""
  timezone: string;
  onChange: (iso: string) => void;
}

/** datetime-local input that stores an ISO string in the event's time zone. */
export function DateTimeField({ id, label, hint, error, optional, value, timezone, onChange }: DateTimeFieldProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional}>
      <Input
        type="datetime-local"
        value={toLocalInputValue(value, timezone)}
        onChange={(e) => onChange(fromLocalInputValue(e.target.value, timezone))}
        {...fieldAria(id, { error, hint })}
      />
    </Field>
  );
}

interface TimezoneFieldProps extends BaseProps {
  value: string;
  onChange: (tz: string) => void;
}

export function TimezoneField({ id, label, hint, error, value, onChange }: TimezoneFieldProps) {
  const options = React.useMemo(() => {
    const list = new Set<string>(COMMON_TIMEZONES);
    if (value) list.add(value);
    try {
      list.add(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      /* ignore */
    }
    return [...list].sort();
  }, [value]);

  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger {...fieldAria(id, { error, hint })} aria-label={label}>
          <SelectValue placeholder="Choose a time zone" />
        </SelectTrigger>
        <SelectContent>
          {options.map((tz) => (
            <SelectItem key={tz} value={tz}>
              {tz.replace(/_/g, " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FormProvider, useForm, useFormContext, type Resolver } from "react-hook-form";
import { contentSchemaByKind, type ContentKind, type InvitationContentInput } from "@/lib/validation/content";
import { useEditorStore } from "@/stores/editor-store";

/** Flat form shape covering every category; the resolver enforces the active category's schema. */
export interface ContentFormValues {
  kind: ContentKind;
  invocation?: string;
  hashtag?: string;
  headline: string;
  subheading: string;
  intro: string;
  hosts: string;
  message: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  venue: { name: string; address: string; mapsUrl: string };
  contacts: { name: string; phone: string; email: string }[];
  gifts: { note: string; url: string };
  dressCode: string;
  partnerOne?: string;
  partnerTwo?: string;
  familyOne?: string;
  familyTwo?: string;
  celebrantName?: string;
  age?: number | "";
  years?: number | "";
  parentNames?: string;
  babyName?: string;
  reveal?: "surprise" | "boy" | "girl";
  hostNames?: string;
  occasion?: string;
  organisation?: string;
  agenda?: string;
}

export interface KindField {
  name: keyof ContentFormValues;
  label: string;
  hint?: string;
  optional?: boolean;
  type?: "text" | "number";
}

export const KIND_FIELDS: Record<ContentKind, KindField[]> = {
  wedding: [
    { name: "partnerOne", label: "Partner one" },
    { name: "partnerTwo", label: "Partner two" },
    { name: "familyOne", label: "Family of partner one", hint: "e.g. Daughter of Farah & Imran Khan", optional: true },
    { name: "familyTwo", label: "Family of partner two", optional: true },
  ],
  engagement: [
    { name: "partnerOne", label: "Partner one" },
    { name: "partnerTwo", label: "Partner two" },
  ],
  birthday: [
    { name: "celebrantName", label: "Who's celebrating?" },
    { name: "age", label: "Age", type: "number", optional: true },
  ],
  anniversary: [
    { name: "partnerOne", label: "Partner one" },
    { name: "partnerTwo", label: "Partner two" },
    { name: "years", label: "Years together", type: "number", optional: true },
  ],
  "baby-shower": [
    { name: "parentNames", label: "Parents-to-be", hint: "e.g. Elena & Marco" },
    { name: "babyName", label: "Baby's name", optional: true },
  ],
  housewarming: [{ name: "hostNames", label: "Hosts" }],
  party: [
    { name: "occasion", label: "Occasion", hint: "e.g. Midsummer Soirée", optional: true },
    { name: "hostNames", label: "Hosts", optional: true },
  ],
  corporate: [
    { name: "organisation", label: "Organisation" },
    { name: "agenda", label: "Agenda", hint: "Separate items with · or new lines", optional: true },
  ],
};

/**
 * One form for all content steps. It stays mounted while steps change, so
 * values, validation and autosave behave exactly as a single form; each step
 * renders only its own fields (react-hook-form keeps unmounted values).
 */
export function ContentFormProvider({ children }: { children: React.ReactNode }) {
  const draft = useEditorStore((s) => s.draft)!;
  const setContent = useEditorStore((s) => s.setContent);
  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchemaByKind[draft.categorySlug]) as unknown as Resolver<ContentFormValues>,
    defaultValues: draft.content as unknown as ContentFormValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    const unsubscribe = form.subscribe({
      formState: { values: true },
      callback: ({ values }) => setContent(values as unknown as InvitationContentInput),
    });
    return unsubscribe;
  }, [form, setContent]);

  return <FormProvider {...form}>{children}</FormProvider>;
}

/** The content form and an error lookup by dotted path ("venue.mapsUrl"). */
export function useContentForm() {
  const form = useFormContext<ContentFormValues>();
  const { errors } = form.formState;
  const err = (path: string) => {
    let cur: unknown = errors;
    for (const p of path.split(".")) cur = (cur as Record<string, unknown> | undefined)?.[p];
    return (cur as { message?: string } | undefined)?.message;
  };
  const kind = useEditorStore((s) => s.draft!.categorySlug) as ContentKind;
  return { form, err, kind };
}

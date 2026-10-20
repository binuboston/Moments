"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Field, fieldAria } from "@/components/forms/field";
import { categoryIcon } from "@/components/marketing/category-grid";
import { apiFetch } from "@/lib/api/client";
import { errorMessage } from "@/features/invitations/hooks";
import { CATEGORY_SLUGS, type EventCategory } from "@/types/domain";

const createSchema = z.object({
  slug: z.enum(CATEGORY_SLUGS),
  name: z.string().trim().min(1).max(60),
  description: z.string().trim().max(300).default(""),
  icon: z.string().trim().max(40).default(""),
  sort_order: z.coerce.number().int().default(100),
});
type CreateInput = z.input<typeof createSchema>;

export function CategoriesAdmin({ rows }: { rows: EventCategory[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const refresh = () => router.refresh();

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Pick<EventCategory, "name" | "description" | "icon" | "sort_order" | "is_active">> }) =>
      apiFetch<{ ok: true }>(`/api/admin/categories/${id}`, { method: "PATCH", json: patch }),
    onSuccess: () => {
      toast.success("Category updated");
      refresh();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => apiFetch<{ ok: true }>(`/api/admin/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Category deleted");
      refresh();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  const create = useMutation({
    mutationFn: (body: CreateInput) => apiFetch<{ id: string }>("/api/admin/categories", { method: "POST", json: body }),
    onSuccess: () => {
      toast.success("Category created");
      setOpen(false);
      refresh();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const form = useForm<CreateInput>({ resolver: zodResolver(createSchema), defaultValues: { slug: undefined, name: "", description: "", icon: "", sort_order: 100 } });
  const { errors } = form.formState;
  const usedSlugs = new Set(rows.map((r) => r.slug));
  const availableSlugs = CATEGORY_SLUGS.filter((s) => !usedSlugs.has(s));

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4">
      <div className="flex justify-end [&>button]:w-full sm:[&>button]:w-auto">
        <Button onClick={() => setOpen(true)} disabled={availableSlugs.length === 0}>
          <PlusIcon aria-hidden /> Add category
        </Button>
      </div>
      <ul className="grid gap-2.5 md:hidden" aria-label="Categories">
        {rows.map((row) => {
          const Icon = categoryIcon(row.icon);
          return (
            <li key={row.id} className="grid gap-3 rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Icon className="size-4 shrink-0 text-primary" aria-hidden />
                  <code className="truncate text-xs text-muted-foreground">{row.slug}</code>
                </div>
                <div className="flex items-center gap-1">
                  <Switch checked={row.is_active} onCheckedChange={(v) => update.mutate({ id: row.id, patch: { is_active: v } })} aria-label={`Active ${row.slug}`} />
                  <Button variant="ghost" size="icon-sm" onClick={() => remove.mutate(row.id)} aria-label={`Delete ${row.name}`}>
                    <Trash2Icon className="text-destructive" />
                  </Button>
                </div>
              </div>
              <Input defaultValue={row.name} aria-label={`Name for ${row.slug}`} onBlur={(e) => e.target.value.trim() !== row.name && update.mutate({ id: row.id, patch: { name: e.target.value.trim() } })} />
              <Input defaultValue={row.description ?? ""} placeholder="Description" aria-label={`Description for ${row.slug}`} onBlur={(e) => (e.target.value.trim() || null) !== row.description && update.mutate({ id: row.id, patch: { description: e.target.value.trim() || null } })} />
              <div className="grid grid-cols-[1fr_6rem] gap-2">
                <Input defaultValue={row.icon ?? ""} placeholder="Lucide icon" aria-label={`Icon for ${row.slug}`} onBlur={(e) => (e.target.value.trim() || null) !== row.icon && update.mutate({ id: row.id, patch: { icon: e.target.value.trim() || null } })} />
                <Input type="number" inputMode="numeric" defaultValue={row.sort_order} aria-label={`Order for ${row.slug}`} onBlur={(e) => Number(e.target.value) !== row.sort_order && update.mutate({ id: row.id, patch: { sort_order: Number(e.target.value) } })} />
              </div>
            </li>
          );
        })}
      </ul>
      <div className="relative hidden overflow-x-auto rounded-2xl border border-border bg-surface md:block">
        <table className="w-full text-sm">
          <thead className="bg-subtle text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Icon</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Active</th>
              <th className="px-4 py-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => {
              const Icon = categoryIcon(row.icon);
              return (
                <tr key={row.id}>
                  <td className="px-4 py-3">
                    <Input defaultValue={row.name} className="h-9 w-44" aria-label={`Name for ${row.slug}`} onBlur={(e) => e.target.value.trim() !== row.name && update.mutate({ id: row.id, patch: { name: e.target.value.trim() } })} />
                    <code className="mt-1 block text-xs text-muted-foreground">{row.slug}</code>
                  </td>
                  <td className="px-4 py-3">
                    <Input defaultValue={row.description ?? ""} className="h-9 min-w-64" aria-label={`Description for ${row.slug}`} onBlur={(e) => (e.target.value.trim() || null) !== row.description && update.mutate({ id: row.id, patch: { description: e.target.value.trim() || null } })} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-primary" aria-hidden />
                      <Input defaultValue={row.icon ?? ""} className="h-9 w-32" aria-label={`Icon for ${row.slug}`} onBlur={(e) => (e.target.value.trim() || null) !== row.icon && update.mutate({ id: row.id, patch: { icon: e.target.value.trim() || null } })} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Input type="number" defaultValue={row.sort_order} className="h-9 w-20" aria-label={`Order for ${row.slug}`} onBlur={(e) => Number(e.target.value) !== row.sort_order && update.mutate({ id: row.id, patch: { sort_order: Number(e.target.value) } })} />
                  </td>
                  <td className="px-4 py-3">
                    <Switch checked={row.is_active} onCheckedChange={(v) => update.mutate({ id: row.id, patch: { is_active: v } })} aria-label={`Active ${row.slug}`} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon-sm" onClick={() => remove.mutate(row.id)} aria-label={`Delete ${row.name}`}>
                      <Trash2Icon className="text-destructive" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a category</DialogTitle>
            <DialogDescription>Only categories with a content schema in the codebase can be added. Adding a new kind of event requires a code change first.</DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" noValidate onSubmit={form.handleSubmit((v) => create.mutate(v))}>
            <Field id="cat-slug" label="Content schema" error={errors.slug?.message}>
              <select id="cat-slug" className="h-11 w-full rounded-lg border border-input bg-surface px-3 text-base sm:h-10 sm:text-sm" {...form.register("slug")}>
                <option value="">Choose…</option>
                {availableSlugs.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="cat-name" label="Name" error={errors.name?.message}>
              <Input {...fieldAria("cat-name", { error: errors.name?.message })} {...form.register("name")} />
            </Field>
            <Field id="cat-description" label="Description" optional>
              <Input id="cat-description" {...form.register("description")} />
            </Field>
            <Field id="cat-icon" label="Lucide icon name" optional hint="e.g. Heart, Cake, Briefcase">
              <Input id="cat-icon" {...form.register("icon")} />
            </Field>
            <Field id="cat-order" label="Sort order">
              <Input id="cat-order" type="number" {...form.register("sort_order")} />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={create.isPending}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

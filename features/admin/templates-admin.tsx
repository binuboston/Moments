"use client";

import { useMutation } from "@tanstack/react-query";
import { AlertTriangleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api/client";
import { errorMessage } from "@/features/invitations/hooks";
import type { TemplateRow } from "@/types/domain";

type Row = TemplateRow & { hasRenderer: boolean };
type Patch = Partial<Pick<TemplateRow, "status" | "tier" | "is_featured" | "sort_order" | "name" | "description">>;

export function TemplatesAdmin({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Patch }) => apiFetch<{ ok: true }>(`/api/admin/templates/${id}`, { method: "PATCH", json: patch }),
    onSuccess: () => {
      toast.success("Template updated");
      router.refresh();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full text-sm">
        <thead className="bg-subtle text-left text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Template</th>
            <th className="px-4 py-3 font-medium">Categories</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Tier</th>
            <th className="px-4 py-3 font-medium">Featured</th>
            <th className="px-4 py-3 font-medium">Order</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3">
                <div className="font-medium">{row.name}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <code>{row.renderer_key}</code>
                  {!row.hasRenderer ? (
                    <Badge variant="destructive">
                      <AlertTriangleIcon aria-hidden /> No renderer
                    </Badge>
                  ) : null}
                </div>
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{row.category_slugs.join(", ")}</td>
              <td className="px-4 py-3">
                <Select value={row.status} onValueChange={(v) => update.mutate({ id: row.id, patch: { status: v as TemplateRow["status"] } })}>
                  <SelectTrigger className="h-9 w-36" aria-label={`Status for ${row.name}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-4 py-3">
                <Select value={row.tier} onValueChange={(v) => update.mutate({ id: row.id, patch: { tier: v as TemplateRow["tier"] } })}>
                  <SelectTrigger className="h-9 w-32" aria-label={`Tier for ${row.name}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-4 py-3">
                <Switch checked={row.is_featured} onCheckedChange={(v) => update.mutate({ id: row.id, patch: { is_featured: v } })} aria-label={`Featured ${row.name}`} />
              </td>
              <td className="px-4 py-3">
                <Input
                  type="number"
                  defaultValue={row.sort_order}
                  className="h-9 w-20"
                  aria-label={`Sort order for ${row.name}`}
                  onBlur={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isFinite(v) && v !== row.sort_order) update.mutate({ id: row.id, patch: { sort_order: v } });
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

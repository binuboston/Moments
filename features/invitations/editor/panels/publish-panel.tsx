"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircleIcon, CheckCircle2Icon, ExternalLinkIcon, Share2Icon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShareDialog } from "@/features/invitations/components/share-dialog";
import { StatusBadge } from "@/features/invitations/components/status-badge";
import { invitationKeys, invitationsApi } from "@/features/invitations/api";
import { flushSave } from "@/features/invitations/editor/use-autosave";
import { errorMessage } from "@/features/invitations/hooks";
import { canUseTemplate } from "@/lib/entitlements";
import { formatEventDate } from "@/lib/utils/dates";
import { publishableSchema } from "@/lib/validation/invitation";
import { withDerivedHeadline } from "@/lib/validation/content";
import { useEditorStore, type EditorStep } from "@/stores/editor-store";

const FIELD_LABELS: Record<string, { label: string; step: EditorStep }> = {
  "content.headline": { label: "Headline", step: "details" },
  "content.partnerOne": { label: "Partner one", step: "details" },
  "content.partnerTwo": { label: "Partner two", step: "details" },
  "content.celebrantName": { label: "Who's celebrating", step: "details" },
  "content.parentNames": { label: "Parents-to-be", step: "details" },
  "content.hostNames": { label: "Hosts", step: "details" },
  "content.organisation": { label: "Organisation", step: "details" },
  "content.startsAt": { label: "Start date and time", step: "details" },
  "content.endsAt": { label: "End time", step: "details" },
  "content.timezone": { label: "Time zone", step: "details" },
  "content.venue.mapsUrl": { label: "Directions link", step: "details" },
  "content.gifts.url": { label: "Registry link", step: "details" },
  "settings.rsvp.deadline": { label: "RSVP deadline", step: "settings" },
};

function labelFor(path: string): { label: string; step: EditorStep } {
  if (FIELD_LABELS[path]) return FIELD_LABELS[path];
  if (path.startsWith("content.contacts")) return { label: "Contacts", step: "details" };
  if (path.startsWith("functions")) return { label: "Schedule", step: "schedule" };
  if (path.startsWith("content.")) return { label: path.replace("content.", ""), step: "details" };
  return { label: path, step: "settings" };
}

export function PublishPanel() {
  const qc = useQueryClient();
  const draft = useEditorStore((s) => s.draft)!;
  const setStep = useEditorStore((s) => s.setStep);
  const syncStatus = useEditorStore((s) => s.syncStatus);
  const [shareOpen, setShareOpen] = useState(false);

  const validation = publishableSchema.safeParse({ content: withDerivedHeadline(draft.content), theme: draft.theme, settings: draft.settings, functions: draft.functions });
  const issues = validation.success ? [] : Array.from(new Map(validation.error.issues.map((i) => [i.path.join("."), i])).values());
  const premiumBlocked = !canUseTemplate(draft.plan, draft.templateTier);
  const isPublished = draft.status === "published";
  const headline = (draft.content as { headline?: string }).headline || "You're invited";
  const dateLabel = validation.success ? formatEventDate(validation.data.content.startsAt, validation.data.content.timezone) : undefined;

  const publish = useMutation({
    mutationFn: async () => {
      await flushSave();
      return invitationsApi.publish(draft.id);
    },
    onSuccess: () => {
      syncStatus({ status: "published", publishedAt: draft.publishedAt ?? new Date().toISOString(), slug: draft.slug });
      void qc.invalidateQueries({ queryKey: invitationKeys.all });
      toast.success(isPublished ? "Changes are live." : "Published! Your invitation is live.");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const unpublish = useMutation({
    mutationFn: () => invitationsApi.unpublish(draft.id),
    onSuccess: () => {
      syncStatus({ status: "unpublished", publishedAt: draft.publishedAt, slug: draft.slug });
      void qc.invalidateQueries({ queryKey: invitationKeys.all });
      toast.success("Unpublished. The link no longer works.");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return (
    <div className="grid gap-8">
      <section className="grid gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold">Status</h2>
          <StatusBadge status={draft.status} />
        </div>
        {isPublished ? (
          <div className="grid gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
            <p className="text-sm">Your invitation is live. Share the link with your guests.</p>
            <div className="flex gap-2">
              <Input readOnly value={draft.publicUrl} aria-label="Public link" onFocus={(e) => e.currentTarget.select()} data-testid="public-url" />
              <Button asChild variant="outline" aria-label="Open invitation">
                <a href={draft.publicUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLinkIcon />
                </a>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setShareOpen(true)} data-testid="open-share">
                <Share2Icon aria-hidden /> Share
              </Button>
              <Button asChild variant="outline">
                <Link href={`/dashboard/invitations/${draft.id}/rsvps`}>View RSVPs</Link>
              </Button>
              <Button variant="ghost" onClick={() => unpublish.mutate()} loading={unpublish.isPending} data-testid="unpublish">
                Unpublish
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Edits save automatically and appear on the live page within a few minutes.</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {draft.status === "unpublished" ? "This invitation was taken offline. Publish again to restore the link." : "Your invitation is a private draft. Only you can see it."}
          </p>
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="text-base font-semibold">Ready to publish?</h2>
        {issues.length === 0 && !premiumBlocked ? (
          <Alert variant="success">
            <CheckCircle2Icon />
            <AlertTitle>Everything looks good</AlertTitle>
            <AlertDescription>All required details are in place.</AlertDescription>
          </Alert>
        ) : (
          <Alert variant="warning">
            <AlertCircleIcon />
            <AlertTitle>A few things need attention</AlertTitle>
            <AlertDescription>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                {premiumBlocked ? <li>This premium template needs the Pro plan. Choose a free template in Design, or upgrade.</li> : null}
                {issues.map((i) => {
                  const path = i.path.join(".");
                  const { label, step } = labelFor(path);
                  return (
                    <li key={path}>
                      <button type="button" className="underline underline-offset-2" onClick={() => setStep(step)}>
                        {label}
                      </button>
                      : {i.message}
                    </li>
                  );
                })}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        <div>
          <Button size="lg" disabled={issues.length > 0 || premiumBlocked} loading={publish.isPending} onClick={() => publish.mutate()} data-testid="publish">
            {isPublished ? "Publish changes now" : "Publish invitation"}
          </Button>
        </div>
      </section>

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} url={draft.publicUrl} headline={headline} dateLabel={dateLabel} />
    </div>
  );
}

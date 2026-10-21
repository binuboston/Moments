"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircleIcon, CheckCircle2Icon, ExternalLinkIcon, Share2Icon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AccountGate } from "@/features/auth/account-gate";
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
import { stepForPath } from "@/features/invitations/editor/steps";
import { useEditorStore, type EditorTarget } from "@/stores/editor-store";
import { routes } from "@/lib/routes";

const FIELD_LABELS: Record<string, string> = {
  "content.headline": "Headline",
  "content.partnerOne": "Partner one",
  "content.partnerTwo": "Partner two",
  "content.celebrantName": "Who's celebrating",
  "content.parentNames": "Parents-to-be",
  "content.hostNames": "Hosts",
  "content.organisation": "Organisation",
  "content.startsAt": "Start date and time",
  "content.endsAt": "End time",
  "content.timezone": "Time zone",
  "content.venue.mapsUrl": "Directions link",
  "content.gifts.url": "Registry link",
  "settings.rsvp.deadline": "RSVP deadline",
};

/** Plain-language reason for a validation issue (Zod's defaults are written for developers). */
function friendlyMessage(issue: { code?: string; message: string; minimum?: unknown }): string {
  if (issue.code === "too_small" && issue.minimum === 1) return "add this to publish";
  if (issue.code === "too_small") return "too short";
  if (issue.code === "too_big") return "too long";
  if (issue.code === "invalid_format" || issue.code === "invalid_string") return "check the format";
  if (issue.code === "invalid_type") return "add this to publish";
  return issue.message;
}

function labelFor(path: string): { label: string; step: EditorTarget } {
  const step = stepForPath(path) ?? "settings";
  if (FIELD_LABELS[path]) return { label: FIELD_LABELS[path], step };
  if (path.startsWith("content.contacts")) return { label: "Contacts", step };
  if (path.startsWith("functions")) return { label: "Schedule", step };
  return { label: path.replace("content.", ""), step };
}

export function PublishPanel({ isGuest = false }: { isGuest?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const qc = useQueryClient();
  const draft = useEditorStore((s) => s.draft)!;
  const setStep = useEditorStore((s) => s.goTo);
  const syncStatus = useEditorStore((s) => s.syncStatus);
  const [shareOpen, setShareOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

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
      const firstPublish = !isPublished;
      syncStatus({ status: "published", publishedAt: draft.publishedAt ?? new Date().toISOString(), slug: draft.slug });
      void qc.invalidateQueries({ queryKey: invitationKeys.all });
      if (firstPublish) {
        // The product's key moment: celebrate and put sharing one tap away.
        setCelebrate(true);
        setShareOpen(true);
      } else {
        toast.success("Changes are live.");
      }
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
                <Link href={routes.invitationResponses(draft.id)}>View RSVPs</Link>
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
                {premiumBlocked ? <li>This premium template needs the Pro plan. Switch to a free design from the toolbar, or upgrade.</li> : null}
                {issues.map((i) => {
                  const path = i.path.join(".");
                  const { label, step } = labelFor(path);
                  return (
                    <li key={path}>
                      <button type="button" className="font-medium underline underline-offset-2" onClick={() => setStep(step)}>
                        {label}
                      </button>
                      : {friendlyMessage(i as { code?: string; message: string; minimum?: unknown })}
                    </li>
                  );
                })}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        {isGuest ? (
          // Guests sign in right here; the page then reopens this sheet as the account owner.
          <AccountGate
            next={`${pathname}?publish=1`}
            onSuccess={() => {
              router.replace(`${pathname}?publish=1`);
              router.refresh();
            }}
          />
        ) : (
          <div>
            <Button size="lg" disabled={issues.length > 0 || premiumBlocked} loading={publish.isPending} onClick={() => publish.mutate()} data-testid="publish">
              {isPublished ? "Publish changes now" : "Publish invitation"}
            </Button>
          </div>
        )}
      </section>

      <ShareDialog
        open={shareOpen}
        onOpenChange={(open) => {
          setShareOpen(open);
          if (!open) setCelebrate(false);
        }}
        url={draft.publicUrl}
        headline={headline}
        dateLabel={dateLabel}
        celebrate={celebrate}
      />
    </div>
  );
}

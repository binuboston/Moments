"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { InvitationRenderer } from "@/features/templates/renderer";
import { getTemplateOrFallback } from "@/features/templates/registry";
import { draftToView } from "@/features/invitations/mappers";
import { showsBranding } from "@/lib/entitlements";
import { useEditorStore } from "@/stores/editor-store";

/**
 * The Preview tab: the invitation exactly as guests see it at this screen
 * size (no device switching). The opening card and scroll animations play on
 * the published page.
 */
export function PreviewPane() {
  const draft = useEditorStore((s) => s.draft)!;

  const view = draftToView({
    id: draft.id,
    slug: draft.slug,
    status: draft.status,
    categorySlug: draft.categorySlug,
    templateKey: draft.templateKey,
    templateName: getTemplateOrFallback(draft.templateKey).name,
    templateTier: draft.templateTier,
    content: draft.content,
    theme: draft.theme,
    settings: draft.settings,
    functions: draft.functions,
    media: draft.media,
    publicUrl: draft.publicUrl,
    showBranding: showsBranding(draft.plan),
  });

  return (
    <div className="mx-auto w-full max-w-3xl">
      <ErrorBoundary
        resetKey={draft.templateKey}
        fallback={<div className="surface-card p-6 text-sm text-destructive">The preview couldn&apos;t render. Your changes are still saved. Try switching design or reloading.</div>}
      >
        <div className="surface-card overflow-hidden" role="region" aria-label="Invitation preview" data-testid="preview">
          <InvitationRenderer view={view} mode="preview" />
        </div>
      </ErrorBoundary>
      <p className="mt-3 text-center text-xs text-muted-foreground">How guests see it on this screen. The opening card and animations play on your published page.</p>
    </div>
  );
}

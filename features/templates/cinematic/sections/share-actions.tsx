"use client";

import { CheckIcon, CopyIcon, Share2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { canSubmit, type RenderMode } from "@/features/templates/types";

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Hashtag copy + Web Share with a clipboard fallback. */
export function ShareActions({ hashtag, title, text, url, mode }: { hashtag: string; title: string; text: string; url: string; mode: RenderMode }) {
  const [copied, setCopied] = useState<"hashtag" | "link" | null>(null);

  const flash = (what: "hashtag" | "link") => {
    setCopied(what);
    window.setTimeout(() => setCopied(null), 1800);
  };

  const share = async () => {
    if (!canSubmit(mode) && mode === "preview") {
      toast.info("Sharing works on the published invitation.");
      return;
    }
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    if (await copy(text)) {
      flash("link");
      toast.success("Invitation link copied");
    } else {
      toast.error("Couldn't copy automatically. Please copy the address from your browser.");
    }
  };

  const copyHashtag = async () => {
    if (await copy(`#${hashtag}`)) {
      flash("hashtag");
      toast.success("Hashtag copied");
    } else {
      toast.error("Couldn't copy the hashtag.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {hashtag ? (
        <button type="button" onClick={copyHashtag} className="group inline-flex items-center gap-3 text-lg tracking-wide text-(--inv-accent-ink) transition-opacity hover:opacity-80" data-testid="copy-hashtag" aria-label={`Copy hashtag #${hashtag}`}>
          <span className="inv-display text-2xl @2xl:text-3xl">#{hashtag}</span>
          {copied === "hashtag" ? <CheckIcon className="size-4" aria-hidden /> : <CopyIcon className="size-4 opacity-60 group-hover:opacity-100" aria-hidden />}
        </button>
      ) : null}
      <button type="button" onClick={share} className="cine-button" data-testid="share-invitation">
        {copied === "link" ? <CheckIcon className="size-4" aria-hidden /> : <Share2Icon className="size-4" aria-hidden />}
        {copied === "link" ? "Link copied" : "Share invitation"}
      </button>
    </div>
  );
}

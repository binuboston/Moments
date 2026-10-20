"use client";

import { CheckIcon, CopyIcon, Share2Icon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { copyText, shareInvitation, type ShareData } from "@/features/templates/sections/share";

interface ShareMomentsProps {
  hashtag: string;
  share: ShareData;
  className?: string;
  hashtagClassName?: string;
}

/** Closing block: the couple's hashtag with a copy button, and a share button. */
export function ShareMoments({ hashtag, share, className, hashtagClassName }: ShareMomentsProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState<"idle" | "copied">("idle");

  const copyHashtag = async () => {
    if ((await copyText(`#${hashtag}`)) === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const onShare = async () => {
    if ((await shareInvitation(share)) === "copied") {
      setShared("copied");
      setTimeout(() => setShared("idle"), 2000);
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-5 text-center", className)} data-inv-reveal>
      {hashtag ? (
        <>
          <p className="text-[0.7rem] tracking-[0.24em] uppercase text-(--inv-muted)">Share your moments with</p>
          <p className={cn("inv-display max-w-full text-3xl break-words text-(--inv-accent) sm:text-4xl", hashtagClassName)}>#{hashtag}</p>
          <button
            type="button"
            onClick={copyHashtag}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-(--inv-accent)/50 px-5 text-xs font-semibold tracking-[0.18em] uppercase text-(--inv-accent) transition-colors hover:bg-(--inv-accent)/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--inv-accent)"
          >
            {copied ? <CheckIcon className="size-4" aria-hidden /> : <CopyIcon className="size-4" aria-hidden />}
            <span aria-live="polite">{copied ? "Copied" : "Copy hashtag"}</span>
          </button>
        </>
      ) : null}
      <button
        type="button"
        onClick={onShare}
        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-(--inv-accent) px-7 text-sm font-semibold text-(--inv-accent-contrast) shadow-[0_12px_30px_-12px_var(--inv-accent)] transition-transform hover:-translate-y-0.5 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--inv-accent)"
      >
        <Share2Icon className="size-4" aria-hidden />
        <span aria-live="polite">{shared === "copied" ? "Link copied" : "Share invitation"}</span>
      </button>
    </div>
  );
}

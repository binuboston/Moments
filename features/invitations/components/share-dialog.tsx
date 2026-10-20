"use client";

import { CheckIcon, CopyIcon, ExternalLinkIcon, MailIcon, MessageCircleIcon, MessageSquareIcon, SendIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCelebrate } from "@/components/brand/celebrate";
import { gsap, MQ, useGSAP } from "@/lib/motion/gsap";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { buildShareMessage, emailShareUrl, smsShareUrl, telegramShareUrl, whatsappShareUrl } from "@/lib/utils/share";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  headline: string;
  dateLabel?: string;
  /** First publish: show a celebratory "You're live" header with a drawn check mark. */
  celebrate?: boolean;
}

function LiveMark() {
  const ref = useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const tl = gsap.timeline();
        tl.fromTo(ref.current, { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(2)" })
          .fromTo("circle", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, ease: "power2.out" }, "<")
          .fromTo("path", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4, ease: "power2.out" }, "-=0.2");
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  return (
    <svg ref={ref} viewBox="0 0 52 52" className="size-14 text-success" aria-hidden>
      <circle cx="26" cy="26" r="24" fill="color-mix(in oklab, currentColor 10%, transparent)" stroke="currentColor" strokeWidth="2" pathLength={1} strokeDasharray="1" />
      <path d="M15 27 L23 34 L37 19" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" />
    </svg>
  );
}

export function ShareDialog({ open, onOpenChange, url, headline, dateLabel, celebrate = false }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const message = buildShareMessage({ headline, dateLabel, url });
  const burstFrom = useCelebrate();

  // Going live for the first time: a full blossom burst from the top of the screen.
  useEffect(() => {
    if (!open || !celebrate) return;
    const t = setTimeout(() => burstFrom({ x: window.innerWidth / 2, y: window.innerHeight * 0.3 }, { count: 60 }), 180);
    return () => clearTimeout(t);
  }, [open, celebrate, burstFrom]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy automatically. Select the link and copy it.");
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: headline, text: message, url });
    } catch {
      /* user cancelled */
    }
  };

  const channels = [
    { label: "WhatsApp", href: whatsappShareUrl(message), icon: MessageCircleIcon, className: "bg-[#25D366] text-white hover:brightness-95", testId: "share-whatsapp" },
    { label: "Messages", href: smsShareUrl(message), icon: MessageSquareIcon, className: "bg-foreground text-background hover:bg-foreground/90" },
    { label: "Telegram", href: telegramShareUrl(url, `You're invited: ${headline}`), icon: SendIcon, className: "bg-[#229ED9] text-white hover:brightness-95" },
    { label: "Email", href: emailShareUrl(`You're invited: ${headline}`, message), icon: MailIcon, className: "bg-muted text-foreground hover:bg-border/70" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className={celebrate ? "items-center text-center sm:items-center sm:text-center" : undefined}>
          {celebrate ? <LiveMark /> : null}
          <DialogTitle className={celebrate ? "mt-2 text-2xl" : undefined}>{celebrate ? "You're live" : "Share your invitation"}</DialogTitle>
          <DialogDescription>
            {celebrate ? "Your invitation is published. Send it to your guests, they'll see a rich preview in their messages." : "Send the link anywhere. Messaging apps will show a preview with your event details."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Input readOnly value={url} aria-label="Invitation link" onFocus={(e) => e.currentTarget.select()} data-testid="share-url" />
          <Button variant="outline" onClick={copy} aria-label="Copy link">
            {copied ? <CheckIcon className="text-success" /> : <CopyIcon />}
          </Button>
          <Button asChild variant="outline" aria-label="Open invitation">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLinkIcon />
            </a>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={c.testId}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-ring ${c.className}`}
            >
              <c.icon className="size-4" aria-hidden /> {c.label}
            </a>
          ))}
        </div>
        {typeof navigator !== "undefined" && "share" in navigator ? (
          <Button variant="ghost" onClick={nativeShare}>
            More options…
          </Button>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

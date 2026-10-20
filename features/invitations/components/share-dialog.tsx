"use client";

import { CheckIcon, CopyIcon, ExternalLinkIcon, MailIcon, MessageCircleIcon, MessageSquareIcon, SendIcon } from "lucide-react";
import { useState } from "react";
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
}

export function ShareDialog({ open, onOpenChange, url, headline, dateLabel }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const message = buildShareMessage({ headline, dateLabel, url });

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
        <DialogHeader>
          <DialogTitle>Share your invitation</DialogTitle>
          <DialogDescription>Send the link anywhere. Messaging apps will show a preview with your event details.</DialogDescription>
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

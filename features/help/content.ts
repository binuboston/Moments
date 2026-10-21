/**
 * Help centre questions. One source for the help page and global search
 * (features/search/providers/help.ts), so answers are always findable.
 */
export interface HelpItem {
  question: string;
  answer: string;
}

export interface HelpSection {
  /** Anchor on the help page (/help#id). */
  id: string;
  title: string;
  items: HelpItem[];
}

const gettingStarted: HelpItem[] = [
  { question: "How do I create my first invitation?", answer: "Sign up, go to your dashboard and choose New invitation. Pick the occasion and a template, fill in your details and publish when you're ready. Drafts save automatically." },
  { question: "Can I change the template later?", answer: "Yes. In the editor, open the Template step and choose another design that supports your occasion. Your content carries over." },
  { question: "Which time zone is used?", answer: "You choose the event's time zone when entering the date. Guests see the time exactly as you set it, with the zone shown next to it." },
];

const sharing: HelpItem[] = [
  { question: "How do I share on WhatsApp?", answer: "After publishing, use Share on WhatsApp from your dashboard or the publish screen. WhatsApp opens with your invitation link and a short message ready to send." },
  { question: "Why does the link preview look different in some apps?", answer: "Messaging apps cache previews. If you edit your invitation after sharing, the preview may take time to refresh. The page itself always shows the latest version." },
  { question: "Can I stop people from viewing the invitation?", answer: "Yes. Unpublish from your dashboard and the link stops working immediately. You can republish later." },
];

const rsvp: HelpItem[] = [
  { question: "Where do I see responses?", answer: "Open the invitation in your dashboard and select RSVPs. You'll see totals, individual responses and can export a CSV." },
  { question: "Can guests change their answer?", answer: "Yes. If a guest submits again with the same name, their earlier response is updated rather than duplicated." },
  { question: "Is guest information public?", answer: "Never. Responses are visible only to the invitation owner." },
];

export const HELP_SECTIONS: HelpSection[] = [
  { id: "getting-started", title: "Getting started", items: gettingStarted },
  { id: "sharing", title: "Publishing and sharing", items: sharing },
  { id: "rsvp", title: "RSVPs and guests", items: rsvp },
];

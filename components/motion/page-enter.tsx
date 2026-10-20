"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import { isFocusedFlow } from "@/lib/routes";
import { gsap, MQ, useGSAP } from "@/lib/motion/gsap";
import { EASE } from "@/lib/motion/tokens";

/**
 * Becomes true after the first page mount. Hard loads show content instantly
 * (it is already painted from the server); in-app navigations animate.
 * Components with their own entrance (count-ups) read it too.
 */
export const navigation = { hydrated: false };

/**
 * Page entrance for app routes (used from a route template, so it remounts on
 * every navigation). On in-app navigations the page's top-level blocks rise
 * in one after another, including content that replaces a loading skeleton.
 * Hard loads are left alone (see below). Focused flows (wizard, editor) are skipped because
 * their fixed action bars must never sit inside a transformed parent.
 */
export function PageEnter({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const skip = isFocusedFlow(pathname);
  // Decided once, at first render: effects can run twice (React Strict Mode in
  // development), and the second run must not mistake a hard load for navigation.
  const firstMount = useRef(!navigation.hydrated);

  useGSAP(
    () => {
      const root = scope.current;
      navigation.hydrated = true;
      if (!root || skip) return;
      const animate = (container: Element) => {
        const blocks = Array.from(container.children);
        if (blocks.length === 0) return;
        gsap.fromTo(blocks, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, ease: EASE.out, stagger: 0.06, clearProps: "opacity,transform" });
      };
      // Hard loads: the server already painted the page and streamed content is
      // hydrated by React afterwards. Touching it before hydration (inline
      // styles) would cause hydration mismatches, so do nothing at all.
      if (firstMount.current) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        if (root.firstElementChild) animate(root.firstElementChild);
        const observer = new MutationObserver((records) => {
          for (const record of records) record.addedNodes.forEach((node) => node instanceof Element && animate(node));
        });
        observer.observe(root, { childList: true });
        return () => observer.disconnect();
      });
      return () => mm.revert();
    },
    { scope },
  );

  return <div ref={scope}>{children}</div>;
}

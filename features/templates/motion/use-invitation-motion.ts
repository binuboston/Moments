"use client";

import type { RefObject } from "react";
import { MOTION_PRESETS, type MotionPresetKey } from "@/features/templates/motion/engine/presets";
import { MOTION_EFFECTS, OWNED_SELECTOR } from "@/features/templates/motion/engine/registry";
import type { MotionContext } from "@/features/templates/motion/engine/types";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";

/**
 * Declarative motion for an invitation (public page and live demo). Templates
 * and shared sections mark elements with attributes; the effects in
 * `engine/effects` animate them, timed by the template's motion preset. See
 * docs/TEMPLATES.md for the attribute reference.
 *
 * Until `started` is true (the guest has not opened the invitation yet) every
 * marked element is claimed and kept hidden, so the CSS failsafe does not
 * reveal content behind the cover. Reduced motion: CSS never hides anything
 * and nothing runs.
 */
export function useInvitationMotion(scope: RefObject<HTMLElement | null>, started: boolean, presetKey: MotionPresetKey = "gentle") {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const all = (sel: string) => Array.from(root.querySelectorAll<HTMLElement>(sel));
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        all(OWNED_SELECTOR).forEach((el) => el.setAttribute("data-reveal-bound", ""));
        if (!started) return;

        const ctx: MotionContext = { root, all, preset: MOTION_PRESETS[presetKey] ?? MOTION_PRESETS.gentle };
        const variants = new Set(MOTION_EFFECTS.flatMap((e) => (e.reveal ? [e.reveal] : [])));
        // A bare attribute renders as data-inv-reveal="true"; unknown variants also fall back to the default.
        const variantOf = (el: HTMLElement) => {
          const v = el.dataset.invReveal ?? "";
          return variants.has(v) ? v : "";
        };
        const reveals = all("[data-inv-reveal]");

        for (const effect of MOTION_EFFECTS) {
          const elements = effect.reveal !== undefined ? reveals.filter((el) => variantOf(el) === effect.reveal) : effect.selector ? all(effect.selector) : [];
          if (elements.length) effect.run(elements, ctx);
        }

        ScrollTrigger.refresh();
      });

      return () => mm.revert();
    },
    { scope, dependencies: [started, presetKey], revertOnUpdate: true },
  );
}

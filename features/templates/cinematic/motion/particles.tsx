"use client";

import { useEffect, useState } from "react";
import type { ArtDirection } from "@/features/templates/cinematic/art-direction";

/** Deterministic pseudo-random values per index (no Math.random during render). */
const jitter = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * A short, one-off burst of petals or gold dust. At most 18 elements, CSS
 * keyframes only (transform/opacity), removed from the DOM after it finishes.
 */
export function ParticleBurst({ style, active, count = 18 }: { style: ArtDirection["opening"]["particles"]; active: boolean; count?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active || style === "none") return;
    const show = window.setTimeout(() => setVisible(true), 0);
    const hide = window.setTimeout(() => setVisible(false), 3600);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [active, style]);

  if (!visible || style === "none") return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const left = 8 + jitter(i, 1) * 84;
        const delay = jitter(i, 2) * 0.45;
        const duration = 2.2 + jitter(i, 3) * 1.1;
        const drift = (jitter(i, 4) - 0.5) * 160;
        const spin = (jitter(i, 5) - 0.5) * 540;
        const size = style === "petals" ? 9 + jitter(i, 6) * 9 : 3 + jitter(i, 6) * 4;
        return (
          <span
            key={i}
            className={style === "petals" ? "cine-petal" : "cine-dust"}
            style={
              {
                left: `${left}%`,
                width: size,
                height: style === "petals" ? size * 0.72 : size,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                "--drift": `${drift}px`,
                "--spin": `${spin}deg`,
                background: i % 3 === 0 ? "var(--inv-accent)" : "var(--inv-bloom)",
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

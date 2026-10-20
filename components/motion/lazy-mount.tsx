"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mounts heavy children (live invitation previews) only when they come within
 * `rootMargin` of the viewport, keeping the initial DOM small. The placeholder
 * reserves the same space so nothing shifts.
 */
export function LazyMount({ children, placeholder, className, rootMargin = "600px" }: { children: React.ReactNode; placeholder?: React.ReactNode; className?: string; rootMargin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no observer support: mount immediately
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : placeholder}
    </div>
  );
}

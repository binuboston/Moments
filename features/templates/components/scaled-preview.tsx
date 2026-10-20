"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface ScaledPreviewProps {
  /** Natural width of the content being scaled, in CSS pixels. */
  contentWidth?: number;
  className?: string;
  /** Allow scrolling inside the frame. */
  scrollable?: boolean;
  children: React.ReactNode;
}

/**
 * Renders children at a fixed design width and scales them to fit the
 * container. Used for device frames in the catalogue and the editor.
 */
export function ScaledPreview({ contentWidth = 390, className, scrollable = true, children }: ScaledPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // ResizeObserver fires once on observe(), which provides the initial measurement.
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;
      setScale(rect.width / contentWidth);
      setHeight(rect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [contentWidth]);

  return (
    <div ref={ref} className={cn("relative h-full w-full overflow-hidden", className)}>
      <div
        // container-type:size lets a cinematic cover size itself to this frame (100cqh).
        className={cn("absolute top-0 left-0 origin-top-left [container-type:size]", scrollable ? "overflow-y-auto no-scrollbar" : "overflow-hidden")}
        style={{
          width: contentWidth,
          height: height ? height / scale : "100%",
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

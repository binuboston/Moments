import QRCode from "qrcode";
import { cn } from "@/lib/utils/cn";

/**
 * Isomorphic QR code rendered as a single SVG path (no canvas, no network).
 * Returns null if the payload cannot be encoded.
 */
export function QrCode({ value, label, className }: { value: string; label: string; className?: string }) {
  let size = 0;
  let d = "";
  try {
    const qr = QRCode.create(value, { errorCorrectionLevel: "M" });
    size = qr.modules.size;
    const parts: string[] = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (qr.modules.get(y, x)) parts.push(`M${x} ${y}h1v1h-1z`);
      }
    }
    d = parts.join("");
  } catch {
    return null;
  }
  const quiet = 2;
  return (
    <svg viewBox={`${-quiet} ${-quiet} ${size + quiet * 2} ${size + quiet * 2}`} className={cn("block", className)} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect x={-quiet} y={-quiet} width={size + quiet * 2} height={size + quiet * 2} fill="#ffffff" />
      <path d={d} fill="#1f1d1a" />
    </svg>
  );
}

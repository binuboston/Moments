"use client";

import { MapIcon } from "lucide-react";
import { useState } from "react";

/**
 * Click-to-load map. No request goes to Google until the guest asks for it,
 * which keeps the page fast and avoids third-party cookies by default.
 */
export function MapEmbed({ query, title }: { query: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  if (!query) return null;
  if (!loaded) {
    return (
      <button type="button" onClick={() => setLoaded(true)} className="cine-button cine-button-ghost" data-testid="load-map">
        <MapIcon className="size-4" aria-hidden /> Show map
      </button>
    );
  }
  return (
    <div className="mt-2 aspect-[4/3] w-full overflow-hidden border border-(--inv-border)">
      <iframe title={title} src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`} className="h-full w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
    </div>
  );
}

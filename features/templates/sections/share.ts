export interface ShareData {
  title: string;
  /** Message without the link; the current page URL is added at share time. */
  text: string;
}

/** Native share sheet when available, otherwise copy the message and link. */
export async function shareInvitation({ title, text }: ShareData): Promise<"shared" | "copied" | "failed"> {
  const url = `${window.location.origin}${window.location.pathname}`;
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text, url });
      return "shared";
    } catch (error) {
      // The guest closed the share sheet: not an error worth a fallback.
      if (error instanceof DOMException && error.name === "AbortError") return "failed";
    }
  }
  return copyText(`${text}\n${url}`);
}

export async function copyText(value: string): Promise<"copied" | "failed"> {
  try {
    await navigator.clipboard.writeText(value);
    return "copied";
  } catch {
    return "failed";
  }
}

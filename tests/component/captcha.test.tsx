import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const signInWithPassword = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ auth: { signInWithPassword } }) }));
vi.mock("@/features/auth/auth-ui", async (importActual) => ({
  ...(await importActual<typeof import("@/features/auth/auth-ui")>()),
  GoogleButton: () => null,
  googleEnabled: () => false,
  claimGuestDrafts: vi.fn().mockResolvedValue(0),
}));

/** A stand-in for Cloudflare's script: records the widget's callbacks so tests can drive them. */
function fakeTurnstile() {
  const widgets: Record<string, (...args: unknown[]) => void>[] = [];
  const api = {
    render: vi.fn((_el: HTMLElement, options: Record<string, (...args: unknown[]) => void>) => {
      widgets.push(options);
      return `w${widgets.length}`;
    }),
    reset: vi.fn(),
    remove: vi.fn(),
  };
  window.turnstile = api;
  return { api, widget: () => widgets[widgets.length - 1] };
}

async function renderLogin() {
  // Fresh module per test: the site key and the script loader are module-level.
  vi.resetModules();
  const { LoginForm } = await import("@/features/auth/auth-forms");
  render(<LoginForm embedded next="/invitations" />);
}

async function submit() {
  await userEvent.type(screen.getByLabelText("Email"), "maya@example.test");
  await userEvent.type(screen.getByLabelText("Password", { exact: true }), "Passw0rd!long");
  await userEvent.click(screen.getByRole("button", { name: "Log in" }));
}

beforeEach(() => {
  signInWithPassword.mockReset().mockResolvedValue({ error: { code: "invalid_credentials", message: "Invalid login credentials" } });
});

afterEach(() => {
  vi.unstubAllEnvs();
  delete window.turnstile;
  document.head.querySelectorAll("script[src*='turnstile']").forEach((s) => s.remove());
});

describe("Turnstile on auth forms", () => {
  it("without a site key: no widget, no token, the form works as before", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "");
    await renderLogin();
    expect(screen.queryByTestId("captcha")).not.toBeInTheDocument();
    await submit();
    await waitFor(() => expect(signInWithPassword).toHaveBeenCalledTimes(1));
    expect(signInWithPassword.mock.calls[0][0]).toMatchObject({ email: "maya@example.test", options: { captchaToken: undefined } });
  });

  it("with a site key: blocks submission until the check passes, then sends the token once", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "1x00000000000000000000AA");
    const { api, widget } = fakeTurnstile();
    await renderLogin();
    await waitFor(() => expect(api.render).toHaveBeenCalled());
    expect(api.render.mock.calls[0][1]).toMatchObject({ sitekey: "1x00000000000000000000AA", action: "login" });

    await submit();
    expect(await screen.findByText(/check your browser/i)).toBeInTheDocument();
    expect(signInWithPassword).not.toHaveBeenCalled();

    act(() => widget().callback("token-1"));
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));
    await waitFor(() => expect(signInWithPassword).toHaveBeenCalledTimes(1));
    expect(signInWithPassword.mock.calls[0][0].options).toEqual({ captchaToken: "token-1" });
    // Single-use: the widget is reset, and the next attempt waits for a new token.
    expect(api.reset).toHaveBeenCalledWith("w1");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));
    expect(signInWithPassword).toHaveBeenCalledTimes(1);
  });

  it("an expired token is not sent", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "1x00000000000000000000AA");
    const { api, widget } = fakeTurnstile();
    await renderLogin();
    await waitFor(() => expect(api.render).toHaveBeenCalled());
    act(() => widget().callback("token-1"));
    act(() => widget()["expired-callback"]());
    await submit();
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("a server-side rejection shows a clear message", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "1x00000000000000000000AA");
    const { api, widget } = fakeTurnstile();
    signInWithPassword.mockResolvedValue({ error: { code: "captcha_failed", message: "captcha protection: request disallowed (invalid-input-response)" } });
    await renderLogin();
    await waitFor(() => expect(api.render).toHaveBeenCalled());
    act(() => widget().callback("forged"));
    await submit();
    expect(await screen.findByText(/security check didn't pass/i)).toBeInTheDocument();
  });

  it("fails closed when the widget errors or the script cannot load", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "1x00000000000000000000AA");
    const { api, widget } = fakeTurnstile();
    await renderLogin();
    await waitFor(() => expect(api.render).toHaveBeenCalled());
    act(() => widget()["error-callback"]());
    await submit();
    expect(await screen.findByText(/couldn't verify this browser/i)).toBeInTheDocument();
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("fails closed when Cloudflare's script is blocked", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "1x00000000000000000000AA");
    await renderLogin();
    const script = await waitFor(() => {
      const s = document.head.querySelector<HTMLScriptElement>("script[src*='challenges.cloudflare.com/turnstile']");
      expect(s).not.toBeNull();
      return s!;
    });
    act(() => script.onerror?.(new Event("error")));
    await submit();
    expect(await screen.findByText(/couldn't verify this browser/i)).toBeInTheDocument();
    expect(signInWithPassword).not.toHaveBeenCalled();
  });
});

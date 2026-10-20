import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InvitationRenderer } from "@/features/templates/renderer";
import { sampleView } from "@/features/templates/sample-data";
import { CinematicCountdown } from "@/features/templates/cinematic/sections/countdown";

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes("reduce"),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

const view = () => sampleView("wedding", { key: "shubh-vivah", name: "Shubh Vivah", tier: "premium" });

describe("cinematic opening cover", () => {
  beforeEach(() => {
    mockReducedMotion(true);
    window.sessionStorage.clear();
    window.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    } as unknown as typeof IntersectionObserver;
  });
  afterEach(() => {
    document.documentElement.style.overflow = "";
  });

  it("opens with the keyboard and reveals the invitation", async () => {
    render(<InvitationRenderer view={view()} mode="demo" motion="full" />);
    const open = await screen.findByTestId("open-invitation");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(document.documentElement.style.overflow).toBe("hidden");
    open.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(document.documentElement.style.overflow).toBe("");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Ananya.*Kiran/);
  });

  it("can be skipped with the link or the Escape key", async () => {
    const { unmount } = render(<InvitationRenderer view={view()} mode="demo" motion="full" />);
    await userEvent.click(await screen.findByTestId("skip-opening"));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    unmount();

    render(<InvitationRenderer view={view()} mode="demo" motion="full" />);
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("static previews have no cover and nothing hidden behind motion", () => {
    const { container } = render(<InvitationRenderer view={view()} mode="preview" motion="static" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(container.querySelector(".motion-ready")).toBeNull();
    expect(screen.getByRole("heading", { level: 1 })).toBeVisible();
  });

  it("renders every configured section with working actions", () => {
    render(<InvitationRenderer view={view()} mode="preview" motion="static" />);
    expect(screen.getByTestId("add-google-calendar")).toHaveAttribute("href", expect.stringContaining("calendar.google.com"));
    expect(screen.getByTestId("directions")).toHaveAttribute("href", expect.stringContaining("google.com/maps/search"));
    expect(screen.getByRole("img", { name: /QR code for directions/i })).toBeInTheDocument();
    expect(screen.getByTestId("copy-hashtag")).toHaveTextContent("#AnanyaWedsKiran");
    expect(screen.getByText("ॐ श्री गणेशाय नमः")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /open photo/i }).length).toBeGreaterThan(0);
  });
});

describe("cinematic countdown", () => {
  afterEach(() => vi.useRealTimers());
  const model = { startsAt: "2026-10-19T11:40:00+05:30", endsAt: "", ceremonyLabel: "Muhurtham", timeLabel: "11:40 AM IST", title: "Neelanjana & Anurag" };

  it("shows a thank-you state after the event instead of a fake countdown", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-20T10:00:00+05:30"));
    render(<CinematicCountdown model={model} />);
    expect(screen.getByTestId("countdown-done")).toHaveTextContent("Thank you for celebrating with us");
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("shows the live state on the day", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-19T12:30:00+05:30"));
    render(<CinematicCountdown model={model} />);
    expect(screen.getByTestId("countdown-done")).toHaveTextContent("The celebration has begun");
  });

  it("counts down before the date", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-17T11:40:00+05:30"));
    render(<CinematicCountdown model={model} />);
    await act(async () => undefined);
    expect(screen.getByRole("timer")).toHaveAttribute("aria-label", expect.stringMatching(/^2 days, 0 hours and 0 minutes until the muhurtham/));
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Countdown } from "@/features/templates/sections/countdown";

describe("Countdown", () => {
  it("renders four cells with labels for a future date", () => {
    render(<Countdown targetIso={new Date(Date.now() + 3 * 86_400_000).toISOString()} />);
    const timer = screen.getByRole("timer");
    expect(timer).toBeInTheDocument();
    for (const label of ["Days", "Hours", "Minutes", "Seconds"]) expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("thanks guests once the event is over", async () => {
    render(<Countdown targetIso="2000-01-01T00:00:00Z" />);
    expect(await screen.findByRole("status")).toHaveTextContent("Thank you for celebrating with us");
  });

  it("says the celebration has begun while the event is running", async () => {
    const start = new Date(Date.now() - 3_600_000).toISOString();
    const end = new Date(Date.now() + 3_600_000).toISOString();
    render(<Countdown targetIso={start} endIso={end} />);
    expect(await screen.findByRole("status")).toHaveTextContent("The celebration has begun");
  });

  it("treats an event without an end time as running for 12 hours", async () => {
    render(<Countdown targetIso={new Date(Date.now() - 11 * 3_600_000).toISOString()} />);
    expect(await screen.findByRole("status")).toHaveTextContent("The celebration has begun");
  });
});

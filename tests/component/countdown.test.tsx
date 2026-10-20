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

  it("renders the complete label for a past date", async () => {
    render(<Countdown targetIso="2000-01-01T00:00:00Z" completeLabel="The day is here" />);
    expect(await screen.findByRole("status")).toHaveTextContent("The day is here");
  });
});

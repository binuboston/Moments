import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RsvpForm } from "@/features/templates/sections/rsvp-form";

const settings = { enabled: true, allowGuestCount: true, maxGuests: 4, askDietary: true, askContact: false, deadline: "" };

describe("RsvpForm", () => {
  it("shows a validation error when the name is missing", async () => {
    render(<RsvpForm slug="maya-x1y2" settings={settings} timezone="UTC" mode="public" />);
    await userEvent.click(screen.getByRole("button", { name: /send response/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/your name/i);
  });

  it("hides guest count and dietary fields when declining", async () => {
    render(<RsvpForm slug="maya-x1y2" settings={settings} timezone="UTC" mode="public" />);
    expect(screen.getByLabelText(/number of guests/i)).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText(/regretfully no/i));
    await waitFor(() => expect(screen.queryByLabelText(/number of guests/i)).not.toBeInTheDocument());
    expect(screen.queryByLabelText(/dietary/i)).not.toBeInTheDocument();
  });

  it("submits to the API and shows a thank-you state", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({ ok: true, updated: false }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<RsvpForm slug="maya-x1y2" settings={settings} timezone="UTC" mode="public" />);
    await userEvent.type(screen.getByLabelText(/your name/i), "Priya Sharma");
    await userEvent.click(screen.getByRole("button", { name: /send response/i }));
    expect(await screen.findByText(/thank you/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/rsvp", expect.objectContaining({ method: "POST" }));
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body).toMatchObject({ slug: "maya-x1y2", guestName: "Priya Sharma", attendance: "yes" });
    vi.unstubAllGlobals();
  });

  it("does not call the API in preview mode", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<RsvpForm slug="maya-x1y2" settings={settings} timezone="UTC" mode="preview" />);
    await userEvent.type(screen.getByLabelText(/your name/i), "Priya");
    await userEvent.click(screen.getByRole("button", { name: /send response/i }));
    await waitFor(() => expect(fetchMock).not.toHaveBeenCalled());
    vi.unstubAllGlobals();
  });
});

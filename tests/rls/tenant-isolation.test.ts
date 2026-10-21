import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { admin, anonClient, catalogue, createUser, deleteUser, sampleContent, uniqueSlug, type TestUser } from "./helpers";

let alice: TestUser;
let bob: TestUser;
let templateId: string;
let categoryId: string;
let aliceDraftId: string;
let alicePublishedId: string;
let alicePublishedSlug: string;

beforeAll(async () => {
  [alice, bob] = await Promise.all([createUser("alice"), createUser("bob")]);
  ({ templateId, categoryId } = await catalogue());

  const { data: draft, error } = await alice.client
    .from("invitations")
    .insert({ owner_id: alice.id, template_id: templateId, category_id: categoryId, slug: uniqueSlug("alice-draft"), content: sampleContent(), status: "draft" })
    .select("id")
    .single();
  if (error) throw error;
  aliceDraftId = draft.id;

  alicePublishedSlug = uniqueSlug("alice-live");
  const { data: live, error: liveErr } = await alice.client
    .from("invitations")
    .insert({
      owner_id: alice.id,
      template_id: templateId,
      category_id: categoryId,
      slug: alicePublishedSlug,
      content: sampleContent(),
      status: "published",
      settings: { rsvp: { enabled: true, allowGuestCount: true, maxGuests: 3, askDietary: false, askContact: false, deadline: "" }, showCalendarActions: true },
    })
    .select("id")
    .single();
  if (liveErr) throw liveErr;
  alicePublishedId = live.id;
});

afterAll(async () => {
  await Promise.all([deleteUser(alice), deleteUser(bob)]);
});

describe("invitations", () => {
  it("owner can read their own draft", async () => {
    const { data } = await alice.client.from("invitations").select("id").eq("id", aliceDraftId).maybeSingle();
    expect(data?.id).toBe(aliceDraftId);
  });

  it("another user cannot read, update or delete someone else's draft", async () => {
    const { data } = await bob.client.from("invitations").select("id").eq("id", aliceDraftId).maybeSingle();
    expect(data).toBeNull();

    const { data: updated } = await bob.client.from("invitations").update({ title: "hacked" }).eq("id", aliceDraftId).select("id");
    expect(updated ?? []).toHaveLength(0);

    const { data: deleted } = await bob.client.from("invitations").delete().eq("id", aliceDraftId).select("id");
    expect(deleted ?? []).toHaveLength(0);

    const { data: still } = await admin.from("invitations").select("title").eq("id", aliceDraftId).single();
    expect(still?.title).not.toBe("hacked");
  });

  it("a user cannot insert an invitation owned by someone else", async () => {
    const { error } = await bob.client
      .from("invitations")
      .insert({ owner_id: alice.id, template_id: templateId, category_id: categoryId, slug: uniqueSlug("spoof"), content: sampleContent() });
    expect(error).not.toBeNull();
    expect(error?.code).toBe("42501");
  });

  it("anonymous visitors can read published invitations but not drafts", async () => {
    const anon = anonClient();
    const { data: live } = await anon.from("invitations").select("id, slug, content").eq("slug", alicePublishedSlug).maybeSingle();
    expect(live?.id).toBe(alicePublishedId);
    const { data: draft } = await anon.from("invitations").select("id").eq("id", aliceDraftId).maybeSingle();
    expect(draft).toBeNull();
  });

  it("a signed-in non-owner cannot read someone else's published invitation through their session", async () => {
    const { data } = await bob.client.from("invitations").select("id").eq("id", alicePublishedId).maybeSingle();
    expect(data).toBeNull();
    const { data: fns } = await bob.client.from("invitation_functions").select("id").eq("invitation_id", alicePublishedId);
    expect(fns ?? []).toHaveLength(0);
  });

  it("slug_available reports taken slugs without exposing rows", async () => {
    const { data: taken } = await bob.client.rpc("slug_available", { p_slug: alicePublishedSlug });
    expect(taken).toBe(false);
    const { data: free } = await bob.client.rpc("slug_available", { p_slug: uniqueSlug("free") });
    expect(free).toBe(true);
    const { data: own } = await alice.client.rpc("slug_available", { p_slug: alicePublishedSlug, p_exclude_id: alicePublishedId });
    expect(own).toBe(true);
    const anon = anonClient();
    const { error } = await anon.rpc("slug_available", { p_slug: alicePublishedSlug });
    expect(error).not.toBeNull();
  });

  it("anonymous visitors cannot read owner_id even on published rows", async () => {
    const anon = anonClient();
    const { error } = await anon.from("invitations").select("owner_id").eq("slug", alicePublishedSlug).maybeSingle();
    expect(error).not.toBeNull();
    expect(error?.code).toBe("42501");
  });

  it("unpublishing hides the invitation from anonymous visitors", async () => {
    const anon = anonClient();
    await alice.client.from("invitations").update({ status: "unpublished" }).eq("id", alicePublishedId);
    const { data } = await anon.from("invitations").select("id").eq("slug", alicePublishedSlug).maybeSingle();
    expect(data).toBeNull();
    await alice.client.from("invitations").update({ status: "published" }).eq("id", alicePublishedId);
  });
});

describe("functions and media", () => {
  it("only the owner can add functions to an invitation", async () => {
    const row = { invitation_id: aliceDraftId, name: "Ceremony", starts_at: "2030-06-20T15:00:00+01:00", timezone: "Europe/London" };
    const { error: bobErr } = await bob.client.from("invitation_functions").insert(row);
    expect(bobErr?.code).toBe("42501");
    const { error: aliceErr } = await alice.client.from("invitation_functions").insert(row);
    expect(aliceErr).toBeNull();
  });

  it("media rows are visible anonymously only for published and uploaded objects", async () => {
    const anon = anonClient();
    const path = `${alicePublishedId}/00000000-0000-4000-8000-000000000001.jpg`;
    const { data: inserted, error } = await alice.client
      .from("invitation_media")
      .insert({ invitation_id: alicePublishedId, owner_id: alice.id, storage_path: path, kind: "gallery", mime_type: "image/jpeg", size_bytes: 1000, is_uploaded: false })
      .select("id")
      .single();
    expect(error).toBeNull();
    const { data: hidden } = await anon.from("invitation_media").select("id").eq("id", inserted!.id).maybeSingle();
    expect(hidden).toBeNull();
    await alice.client.from("invitation_media").update({ is_uploaded: true }).eq("id", inserted!.id);
    const { data: visible } = await anon.from("invitation_media").select("id, storage_path").eq("id", inserted!.id).maybeSingle();
    expect(visible?.id).toBe(inserted!.id);
    const { error: ownerErr } = await anon.from("invitation_media").select("owner_id").eq("id", inserted!.id).maybeSingle();
    expect(ownerErr?.code).toBe("42501");
  });

  it("storage: users cannot upload into another user's invitation folder", async () => {
    const blob = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], { type: "image/jpeg" });
    const { error: bobErr } = await bob.client.storage.from("invitation-media").upload(`${aliceDraftId}/11111111-1111-4111-8111-111111111111.jpg`, blob, { contentType: "image/jpeg" });
    expect(bobErr).not.toBeNull();
    const { error: aliceErr } = await alice.client.storage.from("invitation-media").upload(`${aliceDraftId}/11111111-1111-4111-8111-111111111111.jpg`, blob, { contentType: "image/jpeg" });
    expect(aliceErr).toBeNull();
    // Draft media is not readable anonymously, even with the exact path.
    const anon = anonClient();
    const { error: signErr } = await anon.storage.from("invitation-media").createSignedUrl(`${aliceDraftId}/11111111-1111-4111-8111-111111111111.jpg`, 60);
    expect(signErr).not.toBeNull();
  });
});

describe("rsvps", () => {
  it("guests cannot insert directly into rsvps", async () => {
    const anon = anonClient();
    const { error } = await anon.from("rsvps").insert({ invitation_id: alicePublishedId, guest_name: "Mallory", attendance: "yes", submission_key: "x" });
    expect(error?.code).toBe("42501");
  });

  it("submit_rsvp works for published invitations with RSVP enabled and dedupes", async () => {
    const anon = anonClient();
    const args = { p_slug: alicePublishedSlug, p_guest_name: "Priya Sharma", p_attendance: "yes" as const, p_guest_count: 2, p_message: "Can't wait", p_dietary_notes: "", p_contact: "", p_ip_hash: "hash-a" };
    const first = await anon.rpc("submit_rsvp", args);
    expect(first.error).toBeNull();
    expect((first.data as { updated: boolean }).updated).toBe(false);
    const second = await anon.rpc("submit_rsvp", { ...args, p_guest_count: 3 });
    expect((second.data as { updated: boolean }).updated).toBe(true);
    const { data: rows } = await alice.client.from("rsvps").select("guest_count").eq("invitation_id", alicePublishedId);
    expect(rows).toHaveLength(1);
    expect(rows?.[0].guest_count).toBe(3);
  });

  it("submit_rsvp rejects drafts and rate-limits a hashed IP", async () => {
    const anon = anonClient();
    const { data: draftRow } = await admin.from("invitations").select("slug").eq("id", aliceDraftId).single();
    const res = await anon.rpc("submit_rsvp", { p_slug: draftRow!.slug, p_guest_name: "X", p_attendance: "yes", p_guest_count: 1, p_message: "", p_dietary_notes: "", p_contact: "", p_ip_hash: "h" });
    expect(res.error?.code).toBe("P0002");

    for (let i = 0; i < 5; i++) {
      const r = await anon.rpc("submit_rsvp", { p_slug: alicePublishedSlug, p_guest_name: `Guest ${i}`, p_attendance: "yes", p_guest_count: 1, p_message: "", p_dietary_notes: "", p_contact: "", p_ip_hash: "flood" });
      expect(r.error).toBeNull();
    }
    const limited = await anon.rpc("submit_rsvp", { p_slug: alicePublishedSlug, p_guest_name: "Guest 6", p_attendance: "yes", p_guest_count: 1, p_message: "", p_dietary_notes: "", p_contact: "", p_ip_hash: "flood" });
    expect(limited.error?.code).toBe("P0005");
  });

  it("only the owner can read responses", async () => {
    const { data: bobRows } = await bob.client.from("rsvps").select("id").eq("invitation_id", alicePublishedId);
    expect(bobRows ?? []).toHaveLength(0);
    const anon = anonClient();
    const { data: anonRows, error } = await anon.from("rsvps").select("id").eq("invitation_id", alicePublishedId);
    expect((anonRows ?? []).length === 0 || error !== null).toBe(true);
  });
});

describe("global search columns", () => {
  it("search_text is maintained from the content and matched case-insensitively", async () => {
    const { data } = await alice.client.from("invitations").select("id").eq("id", aliceDraftId).ilike("search_text", "%rls test party%");
    expect(data).toHaveLength(1);
  });

  it("another user cannot find someone else's invitations or guests by searching", async () => {
    const { data: invitations } = await bob.client.from("invitations").select("id").ilike("search_text", "%rls test party%");
    expect((invitations ?? []).map((r) => r.id)).not.toContain(aliceDraftId);
    const { data: guests } = await bob.client.from("rsvps").select("id").ilike("guest_name", "%priya%");
    expect(guests ?? []).toHaveLength(0);
    const { data: own } = await alice.client.from("rsvps").select("guest_name").ilike("guest_name", "%priya%");
    expect((own ?? []).length).toBeGreaterThan(0);
  });
});

describe("profiles and admin", () => {
  it("users cannot read other profiles or escalate their own role", async () => {
    const { data } = await bob.client.from("profiles").select("id").eq("id", alice.id).maybeSingle();
    expect(data).toBeNull();
    const { error } = await bob.client.from("profiles").update({ role: "admin" }).eq("id", bob.id);
    expect(error?.code).toBe("42501");
    const { data: still } = await admin.from("profiles").select("role").eq("id", bob.id).single();
    expect(still?.role).toBe("user");
  });

  it("non-admins cannot modify templates or categories", async () => {
    const { data: t } = await bob.client.from("templates").update({ tier: "free" }).eq("id", templateId).select("id");
    expect(t ?? []).toHaveLength(0);
    const { error } = await bob.client.from("event_categories").insert({ slug: "hack", name: "Hack" });
    expect(error?.code).toBe("42501");
  });

  it("admins can read every invitation and change template availability", async () => {
    const root = await createUser("admin", { role: "admin" });
    try {
      const { data } = await root.client.from("invitations").select("id").eq("id", aliceDraftId).maybeSingle();
      expect(data?.id).toBe(aliceDraftId);
      const { data: updated, error } = await root.client.from("templates").update({ is_featured: true }).eq("id", templateId).select("id");
      expect(error).toBeNull();
      expect(updated).toHaveLength(1);
    } finally {
      await deleteUser(root);
    }
  });
});

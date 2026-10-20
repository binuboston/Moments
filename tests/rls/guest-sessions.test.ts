import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { admin, anonClient, catalogue, sampleContent, uniqueSlug } from "./helpers";

/** Guests (anonymous Supabase users) can draft but never publish. */
const guest = anonClient();
let guestId: string;
let templateId: string;
let categoryId: string;

beforeAll(async () => {
  const { data, error } = await guest.auth.signInAnonymously();
  if (error || !data.user) throw new Error(`anonymous sign-in failed: ${error?.message}`);
  guestId = data.user.id;
  ({ templateId, categoryId } = await catalogue());
});

afterAll(async () => {
  if (guestId) await admin.auth.admin.deleteUser(guestId);
});

describe("guest sessions", () => {
  it("a guest gets a profile and can create and edit a draft", async () => {
    const { data: profile } = await guest.from("profiles").select("id").eq("id", guestId).maybeSingle();
    expect(profile?.id).toBe(guestId);

    const { data: draft, error } = await guest
      .from("invitations")
      .insert({ owner_id: guestId, template_id: templateId, category_id: categoryId, slug: uniqueSlug("guest-draft"), content: sampleContent(), status: "draft" })
      .select("id")
      .single();
    expect(error).toBeNull();
    const { data: updated } = await guest.from("invitations").update({ title: "Our day" }).eq("id", draft!.id).select("id");
    expect(updated).toHaveLength(1);
  });

  it("a guest cannot publish, by insert or by update", async () => {
    const inserted = await guest
      .from("invitations")
      .insert({ owner_id: guestId, template_id: templateId, category_id: categoryId, slug: uniqueSlug("guest-live"), content: sampleContent(), status: "published" })
      .select("id");
    expect(inserted.error?.code).toBe("42501");

    const { data: draft } = await guest.from("invitations").select("id").eq("owner_id", guestId).limit(1).single();
    const updated = await guest.from("invitations").update({ status: "published" }).eq("id", draft!.id).select("id");
    expect(updated.error?.code).toBe("42501");
  });
});

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { admin, anonClient, catalogue, sampleContent, uniqueSlug } from "./helpers";

/** Anonymous Supabase users (retired guest mode) can neither create nor publish invitations. */
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

describe("anonymous sessions (retired guest mode)", () => {
  it("cannot create an invitation", async () => {
    const { error } = await guest
      .from("invitations")
      .insert({ owner_id: guestId, template_id: templateId, category_id: categoryId, slug: uniqueSlug("guest-draft"), content: sampleContent(), status: "draft" })
      .select("id");
    expect(error?.code).toBe("42501");
    expect(error?.hint).toBe("account_required");
  });

  it("an existing guest draft can be edited but never published", async () => {
    // Drafts made before guest mode was retired (created here with the service role).
    const { data: draft } = await admin
      .from("invitations")
      .insert({ owner_id: guestId, template_id: templateId, category_id: categoryId, slug: uniqueSlug("guest-old"), content: sampleContent(), status: "draft" })
      .select("id")
      .single();
    const { data: updated } = await guest.from("invitations").update({ title: "Our day" }).eq("id", draft!.id).select("id");
    expect(updated).toHaveLength(1);
    const published = await guest.from("invitations").update({ status: "published" }).eq("id", draft!.id).select("id");
    expect(published.error?.code).toBe("42501");
  });
});

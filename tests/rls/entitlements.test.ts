import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { canUseTemplate, PLAN_LIMITS, showsBranding } from "@/lib/entitlements";
import { admin, anonClient, catalogue, createUser, deleteUser, sampleContent, uniqueSlug, type TestUser } from "./helpers";

/**
 * Plan entitlements hold at the database, for writes made directly through
 * the Data API (bypassing the app's API routes), and the plan comes only from
 * the admin-managed profiles.plan.
 */
let free: TestUser;
let pro: TestUser;
let templateId: string;
let categoryId: string;
let premiumTemplateId: string;

beforeAll(async () => {
  ({ templateId, categoryId } = await catalogue());
  const key = `rls-premium-${Math.random().toString(36).slice(2, 8)}`;
  const { data, error } = await admin.from("templates").insert({ slug: key, renderer_key: key, name: "RLS premium", tier: "premium", status: "published" }).select("id").single();
  if (error || !data) throw new Error(`premium template fixture failed: ${error?.message}`);
  premiumTemplateId = data.id;
  [free, pro] = await Promise.all([createUser("ent-free"), createUser("ent-pro", { plan: "pro" })]);
});

afterAll(async () => {
  await Promise.all([free && deleteUser(free), pro && deleteUser(pro)]);
  if (premiumTemplateId) await admin.from("templates").delete().eq("id", premiumTemplateId);
});

function draft(user: TestUser, overrides: Record<string, unknown> = {}) {
  return { owner_id: user.id, template_id: templateId, category_id: categoryId, slug: uniqueSlug("ent"), content: sampleContent(), status: "draft" as const, ...overrides };
}

async function createDraft(user: TestUser, overrides: Record<string, unknown> = {}): Promise<string> {
  const { data, error } = await user.client.from("invitations").insert(draft(user, overrides)).select("id").single();
  if (error || !data) throw new Error(`draft insert failed: ${error?.message}`);
  return data.id;
}

const publish = (user: TestUser, id: string) => user.client.from("invitations").update({ status: "published", published_at: new Date().toISOString() }).eq("id", id).select("id, settings");

async function clearLive(user: TestUser) {
  await admin.from("invitations").update({ status: "unpublished" }).eq("owner_id", user.id).eq("status", "published");
}

describe("plan entitlements (database)", () => {
  it("the database limits match lib/entitlements.ts", async () => {
    const { data } = await anonClient().from("plan_entitlements").select("*");
    expect(data).toHaveLength(2);
    for (const row of data!) {
      expect(row.max_active_invitations).toBe(PLAN_LIMITS[row.plan].maxActiveInvitations);
      expect(row.max_gallery_images).toBe(PLAN_LIMITS[row.plan].maxGalleryImages);
      expect(row.branding).toBe(showsBranding(row.plan));
      expect(row.premium_templates).toBe(canUseTemplate(row.plan, "premium"));
    }
  });

  it("users cannot change their own plan or the plan table", async () => {
    const self = await free.client.from("profiles").update({ plan: "pro" }).eq("id", free.id).select("plan");
    expect(self.error?.code).toBe("42501");
    const table = await free.client.from("plan_entitlements").update({ max_active_invitations: 999 }).eq("plan", "free").select();
    expect(table.data ?? []).toHaveLength(0);
    const { data } = await admin.from("plan_entitlements").select("max_active_invitations").eq("plan", "free").single();
    expect(data!.max_active_invitations).toBe(PLAN_LIMITS.free.maxActiveInvitations);
  });

  it("Free cannot publish a premium template, by update or insert; Pro can", async () => {
    const id = await createDraft(free, { template_id: premiumTemplateId });
    const viaUpdate = await publish(free, id);
    expect(viaUpdate.error?.code).toBe("42501");
    expect(viaUpdate.error?.hint).toBe("premium_required");
    const viaInsert = await free.client.from("invitations").insert(draft(free, { template_id: premiumTemplateId, status: "published" })).select("id");
    expect(viaInsert.error?.hint).toBe("premium_required");
    // Drafting with a premium template stays allowed (preview before upgrading).
    expect(id).toBeTruthy();

    const proId = await createDraft(pro, { template_id: premiumTemplateId });
    expect((await publish(pro, proId)).error).toBeNull();
    await clearLive(pro);
  });

  it("Free cannot switch a live invitation to a premium template", async () => {
    const id = await createDraft(free);
    expect((await publish(free, id)).error).toBeNull();
    const switched = await free.client.from("invitations").update({ template_id: premiumTemplateId }).eq("id", id).select("id");
    expect(switched.error?.hint).toBe("premium_required");
    // Ordinary edits to the live invitation still work.
    expect((await free.client.from("invitations").update({ title: "Edited" }).eq("id", id).select("id")).error).toBeNull();
    await clearLive(free);
  });

  it("the live invitation limit holds for direct writes, including concurrent publishes", async () => {
    const max = PLAN_LIMITS.free.maxActiveInvitations;
    const ids = await Promise.all(Array.from({ length: max + 1 }, () => createDraft(free)));
    for (const id of ids.slice(0, max - 1)) expect((await publish(free, id)).error).toBeNull();

    // One slot left, two publishes at once: exactly one wins.
    const [a, b] = await Promise.all([publish(free, ids[max - 1]), publish(free, ids[max])]);
    const errors = [a.error, b.error].filter(Boolean);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.hint).toBe("plan_limit");

    const viaInsert = await free.client.from("invitations").insert(draft(free, { status: "published" })).select("id");
    expect(viaInsert.error?.hint).toBe("plan_limit");

    // Unpublishing frees a slot.
    const loser = a.error ? ids[max - 1] : ids[max];
    const winner = a.error ? ids[max] : ids[max - 1];
    await free.client.from("invitations").update({ status: "unpublished" }).eq("id", winner);
    expect((await publish(free, loser)).error).toBeNull();
    await clearLive(free);
  });

  it("branding follows the plan, not the settings a client writes", async () => {
    const id = await createDraft(free, { settings: { branding: false } });
    const { data } = await publish(free, id);
    expect((data![0].settings as { branding: boolean }).branding).toBe(true);
    const edited = await free.client.from("invitations").update({ settings: { branding: false } }).eq("id", id).select("settings");
    expect((edited.data![0].settings as { branding: boolean }).branding).toBe(true);

    const proId = await createDraft(pro);
    const { data: proRow } = await publish(pro, proId);
    expect((proRow![0].settings as { branding: boolean }).branding).toBe(false);
    await Promise.all([clearLive(free), clearLive(pro)]);
  });

  it("the gallery limit holds for direct inserts and kind changes", async () => {
    const id = await createDraft(free);
    const media = (kind: "gallery" | "cover") => ({ invitation_id: id, owner_id: free.id, storage_path: `${id}/${randomUUID()}.jpg`, kind, mime_type: "image/jpeg", size_bytes: 1000 });
    const max = PLAN_LIMITS.free.maxGalleryImages;
    const filled = await free.client.from("invitation_media").insert(Array.from({ length: max }, () => media("gallery"))).select("id");
    expect(filled.error).toBeNull();

    const extra = await free.client.from("invitation_media").insert(media("gallery")).select("id");
    expect(extra.error?.hint).toBe("plan_limit");

    const cover = await free.client.from("invitation_media").insert(media("cover")).select("id").single();
    expect(cover.error).toBeNull();
    const promoted = await free.client.from("invitation_media").update({ kind: "gallery" }).eq("id", cover.data!.id).select("id");
    expect(promoted.error?.hint).toBe("plan_limit");
  });

  it("public viewing is unaffected", async () => {
    const id = await createDraft(free);
    expect((await publish(free, id)).error).toBeNull();
    const { data } = await anonClient().from("invitations").select("id, slug").eq("id", id).maybeSingle();
    expect(data?.id).toBe(id);
    await clearLive(free);
  });
});

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { anonClient, createUser, deleteUser, type TestUser } from "./helpers";

/**
 * Policies call helper functions as the querying role, so revoking EXECUTE
 * from a role whose policies use a helper breaks every read of that table
 * ("permission denied for function ..."). Guards
 * supabase/migrations/20261025000003_harden_functions.sql.
 */
const ANON_TABLES = ["event_categories", "templates", "invitations", "invitation_functions", "invitation_media"] as const;
const USER_TABLES = [...ANON_TABLES, "profiles", "rsvps"] as const;

let user: TestUser;
beforeAll(async () => {
  user = await createUser("grants");
});
afterAll(async () => {
  await deleteUser(user);
});

describe("function grants match the policies that use them", () => {
  it.each(ANON_TABLES)("anon can query %s", async (table) => {
    // "id" only: anon has column-level grants on invitations and invitation_media.
    const { error } = await anonClient().from(table).select("id").limit(1);
    expect(error).toBeNull();
  });

  it.each(USER_TABLES)("a signed-in user can query %s", async (table) => {
    const { error } = await user.client.from(table).select("*").limit(1);
    expect(error).toBeNull();
  });

  it("anon can list published media objects", async () => {
    const { error } = await anonClient().storage.from("invitation-media").list();
    expect(error).toBeNull();
  });

  it("the sign-up trigger function cannot be called over the API", async () => {
    const { error } = await user.client.rpc("handle_new_user" as never);
    expect(error).not.toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { anonClient } from "./helpers";

/**
 * The password policy is enforced by Supabase itself (supabase/config.toml:
 * minimum_password_length = 8), not only by the sign-up form, so a direct API
 * call cannot create a weaker password.
 */
describe("password policy (server-side)", () => {
  it("rejects passwords shorter than 8 characters", async () => {
    const { error } = await anonClient().auth.signUp({ email: `short-${Date.now()}@example.test`, password: "Ab1!xyz" });
    expect(error?.code).toBe("weak_password");
  });

  it("accepts 8 characters", async () => {
    const { error } = await anonClient().auth.signUp({ email: `ok-${Date.now()}@example.test`, password: "Ab1!xyzw" });
    expect(error).toBeNull();
  });
});

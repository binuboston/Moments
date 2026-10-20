import { z } from "zod";
import { handle, json, mapDbError, readJson, requireUser } from "@/lib/api/respond";

const schema = z.object({ fullName: z.string().trim().min(1, "Tell us your name").max(120) });

export const PATCH = handle(async (request: Request) => {
  const { user, supabase } = await requireUser();
  const body = schema.parse(await readJson(request));
  const { error } = await supabase.from("profiles").update({ full_name: body.fullName }).eq("id", user.id);
  if (error) mapDbError(error, "profile.update");
  return json({ ok: true });
});

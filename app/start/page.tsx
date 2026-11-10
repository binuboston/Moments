import { redirect } from "next/navigation";
import { safeNextPath } from "@/features/auth/safe-next";
import { routes } from "@/lib/routes";

/** The old guest entry point. Creating now needs an account: old links go to sign-up and come back to `next`. */
export default async function StartPage({ searchParams }: PageProps<"/start">) {
  const next = (await searchParams).next;
  redirect(routes.signup(safeNextPath(typeof next === "string" ? next : null)));
}

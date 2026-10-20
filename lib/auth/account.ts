/** What the UI needs to know about whoever is using the app. */
export interface Account {
  name: string;
  email: string;
  role: "user" | "admin";
  plan: "free" | "pro";
  /** Designing without an account yet (anonymous session). */
  isGuest: boolean;
}

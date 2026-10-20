/**
 * The product's name and voice in one place. Change the brand here; never
 * write the product name as a literal elsewhere (metadata, footer, badges,
 * calendar files, social images all read from this).
 */
export const BRAND = {
  name: "Invite",
  tagline: "Beautiful digital invitations",
  /** Default <title> and social title. */
  title: "Invite — Beautiful digital invitations",
  description:
    "Choose a design, make it yours and share your event with the world. Elegant digital invitations for weddings, birthdays, showers and more.",
  /** Shown on free invitations ("Made with Invite") and in plan comparisons. */
  badge: "Invite badge",
  /** PRODID for .ics calendar files. */
  icsProdId: "-//Invite//Invitations//EN",
} as const;

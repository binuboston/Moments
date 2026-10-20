import type { PlanTier, TemplateTier } from "@/types/domain";

/**
 * The only place that answers plan questions. Presentation code asks these
 * helpers; it never compares plan strings itself. Billing can later change the
 * inputs without touching templates or pages.
 */
export const PLAN_LIMITS: Record<PlanTier, { maxActiveInvitations: number; maxGalleryImages: number; branding: boolean }> = {
  free: { maxActiveInvitations: 3, maxGalleryImages: 8, branding: true },
  pro: { maxActiveInvitations: 50, maxGalleryImages: 40, branding: false },
};

export function canUseTemplate(plan: PlanTier, tier: TemplateTier): boolean {
  return tier === "free" || plan === "pro";
}

export function showsBranding(plan: PlanTier): boolean {
  return PLAN_LIMITS[plan].branding;
}

export function maxGalleryImages(plan: PlanTier): number {
  return PLAN_LIMITS[plan].maxGalleryImages;
}

export function maxActiveInvitations(plan: PlanTier): number {
  return PLAN_LIMITS[plan].maxActiveInvitations;
}

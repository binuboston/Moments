-- =====================================================================
-- Catalogue data: event categories and templates.
-- Idempotent upserts so the same file is safe in every environment.
-- renderer_key values must exist in features/templates/registry.ts
-- (enforced by tests/unit/template-registry.test.ts).
-- =====================================================================

insert into public.event_categories (slug, name, description, icon, sort_order) values
  ('wedding', 'Wedding', 'Ceremonies, receptions and every function in between.', 'Heart', 10),
  ('engagement', 'Engagement', 'Announce the yes and gather the people who matter.', 'Gem', 20),
  ('birthday', 'Birthday', 'From first birthdays to milestone celebrations.', 'Cake', 30),
  ('anniversary', 'Anniversary', 'Celebrate the years with the people who shared them.', 'Sparkles', 40),
  ('baby-shower', 'Baby shower', 'Welcome a new arrival with family and friends.', 'Baby', 50),
  ('housewarming', 'Housewarming', 'Open the doors of a new home.', 'Home', 60),
  ('party', 'Party', 'Dinners, soirées, reunions and everything fun.', 'PartyPopper', 70),
  ('corporate', 'Corporate', 'Launches, galas, offsites and company milestones.', 'Briefcase', 80)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

insert into public.templates (slug, renderer_key, name, description, tier, status, is_featured, category_slugs, sort_order) values
  ('eternal-grace', 'eternal-grace', 'Eternal Grace',
   'Classic serif typography, soft ivory paper and a restrained gold rule. Timeless for weddings and engagements.',
   'free', 'published', true, array['wedding', 'engagement', 'anniversary'], 10),
  ('botanical-noir', 'botanical-noir', 'Botanical Noir',
   'Deep forest tones with hand-drawn foliage and luminous type. Moody, modern and memorable.',
   'premium', 'published', true, array['wedding', 'engagement', 'anniversary', 'party'], 20),
  ('modern-minimal', 'modern-minimal', 'Modern Minimal',
   'Bold typographic layout with generous whitespace. Works for any occasion that wants to feel considered.',
   'free', 'published', true, array['birthday', 'corporate', 'housewarming', 'party', 'anniversary', 'engagement'], 30),
  ('confetti-pop', 'confetti-pop', 'Confetti Pop',
   'Bright, joyful and playful with floating confetti. Made for birthdays, showers and parties.',
   'free', 'published', true, array['birthday', 'baby-shower', 'party'], 40),
  ('golden-gala', 'golden-gala', 'Golden Gala',
   'Black tie elegance: midnight background, champagne accents and an art deco frame.',
   'premium', 'published', false, array['corporate', 'anniversary', 'party', 'birthday'], 50),
  ('soft-pastel', 'soft-pastel', 'Soft Pastel',
   'Gentle pastel washes and rounded shapes. Warm and welcoming for showers and family celebrations.',
   'free', 'published', false, array['baby-shower', 'birthday', 'housewarming'], 60)
on conflict (slug) do update set
  renderer_key = excluded.renderer_key,
  name = excluded.name,
  description = excluded.description,
  category_slugs = excluded.category_slugs,
  sort_order = excluded.sort_order;

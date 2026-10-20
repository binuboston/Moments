-- =====================================================================
-- Cinematic templates (art-direction configs in
-- features/templates/cinematic/templates/*). Featured and ordered first.
-- =====================================================================
insert into public.templates (slug, renderer_key, name, description, tier, status, is_featured, category_slugs, sort_order) values
  ('shubh-vivah', 'shubh-vivah', 'Shubh Vivah',
   'An heirloom wedding card come to life: ivory paper, champagne-gold linework, marigold toran and a wax-sealed envelope that opens to your names.',
   'premium', 'published', true, array['wedding', 'engagement'], 1),
  ('royal-night', 'royal-night', 'Royal Night',
   'A sangeet-at-dusk mood: deep olive night, champagne fine-line frames and an ivory gatefold that parts like palace doors.',
   'premium', 'published', true, array['wedding', 'engagement', 'anniversary'], 2),
  ('gulmohar-garden', 'gulmohar-garden', 'Gulmohar Garden',
   'Soft beige paper, muted-rose blooms and olive leaves. Layered cards lift away to an editorial, photo-led invitation for mehendi mornings and garden vows.',
   'free', 'published', true, array['engagement', 'wedding', 'anniversary'], 3)
on conflict (slug) do update set
  renderer_key = excluded.renderer_key,
  name = excluded.name,
  description = excluded.description,
  tier = excluded.tier,
  is_featured = excluded.is_featured,
  category_slugs = excluded.category_slugs,
  sort_order = excluded.sort_order;

-- =====================================================================
-- Four recipe-based templates (features/templates/designs/*.tsx):
-- Indian traditional, typographic monochrome, kids' party and formal.
-- =====================================================================
insert into public.templates (slug, renderer_key, name, description, tier, status, is_featured, category_slugs, sort_order) values
  ('kalyanam', 'kalyanam', 'Kalyanam',
   'A temple-gate invitation: marigold toran, a kolam mandala that draws itself in, classical capitals and kumkum, haldi or temple-brass colours.',
   'free', 'published', true, array['wedding', 'engagement', 'housewarming', 'anniversary'], 5),
  ('monochrome', 'monochrome', 'Monochrome',
   'A typographic poster: giant date numerals, heavy black type, black-and-white photography and one bold accent.',
   'free', 'published', true, array['birthday', 'party', 'corporate', 'engagement', 'wedding', 'anniversary', 'housewarming'], 35),
  ('balloon-bash', 'balloon-bash', 'Balloon Bash',
   'Bobbing balloons, chunky rounded type and sticker-bright colours. Made for kids'' birthdays, showers and parties.',
   'free', 'published', true, array['birthday', 'baby-shower', 'party'], 45),
  ('summit', 'summit', 'Summit',
   'Clean and formal, with an admission-ticket masthead, a clear agenda and structured details. For conferences, launches, galas and award nights.',
   'free', 'published', true, array['corporate', 'party', 'anniversary'], 55)
on conflict (slug) do update set
  renderer_key = excluded.renderer_key,
  name = excluded.name,
  description = excluded.description,
  tier = excluded.tier,
  is_featured = excluded.is_featured,
  category_slugs = excluded.category_slugs,
  sort_order = excluded.sort_order;

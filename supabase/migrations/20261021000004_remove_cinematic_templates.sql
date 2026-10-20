-- =====================================================================
-- Remove the cinematic templates (shubh-vivah, royal-night, gulmohar-garden).
-- Their renderers were deleted from the codebase. Existing invitations are
-- moved to the closest classic design that supports the same categories,
-- and template-specific palette/font choices are reset to that design's defaults.
-- =====================================================================

with mapping(old_slug, new_slug) as (
  values
    ('shubh-vivah', 'eternal-grace'),
    ('royal-night', 'botanical-noir'),
    ('gulmohar-garden', 'eternal-grace')
)
update public.invitations i
set template_id = new_t.id,
    theme = jsonb_set(jsonb_set(coalesce(i.theme, '{}'::jsonb), '{paletteId}', '""'), '{fontPairingId}', '""')
from mapping m
join public.templates old_t on old_t.slug = m.old_slug
join public.templates new_t on new_t.slug = m.new_slug
where i.template_id = old_t.id;

-- The "opening" section toggle only existed for cinematic templates.
update public.invitations
set theme = jsonb_set(theme, '{sections}', (theme -> 'sections') - 'opening')
where theme -> 'sections' ? 'opening';

delete from public.templates where slug in ('shubh-vivah', 'royal-night', 'gulmohar-garden');

-- Make the cinematic templates free (matches tier in features/templates/cinematic/templates/*.ts).
update public.templates
set tier = 'free'
where slug in ('shubh-vivah', 'royal-night');

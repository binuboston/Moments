-- Make Botanical Noir and Golden Gala free (matches tier in features/templates/designs/*.tsx).
update public.templates
set tier = 'free'
where slug in ('botanical-noir', 'golden-gala');

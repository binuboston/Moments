-- =====================================================================
-- Global search (features/search). Owners search their invitations by
-- title, headline, names and venue, and their guests by name. Matching is
-- substring (ILIKE '%q%'), served by trigram indexes so it stays fast as
-- tables grow. Row-level security still decides what each user can see.
-- =====================================================================
create extension if not exists pg_trgm with schema extensions;

-- Drafts often have no title yet, so search the content people actually type.
alter table public.invitations
  add column search_text text generated always as (
    lower(
      coalesce(title, '') || ' ' ||
      coalesce(content ->> 'headline', '') || ' ' ||
      coalesce(content ->> 'partnerOne', '') || ' ' ||
      coalesce(content ->> 'partnerTwo', '') || ' ' ||
      coalesce(content ->> 'celebrantName', '') || ' ' ||
      coalesce(content ->> 'hostNames', '') || ' ' ||
      coalesce(content ->> 'parentNames', '') || ' ' ||
      coalesce(content ->> 'organisation', '') || ' ' ||
      coalesce(content -> 'venue' ->> 'name', '') || ' ' ||
      slug
    )
  ) stored;

comment on column public.invitations.search_text is 'Lower-cased searchable text (title, headline, names, venue, slug). Maintained by Postgres; read by features/search.';

create index invitations_search_trgm_idx on public.invitations using gin (search_text extensions.gin_trgm_ops);
create index rsvps_guest_name_trgm_idx on public.rsvps using gin (guest_name extensions.gin_trgm_ops);

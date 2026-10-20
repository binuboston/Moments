-- =====================================================================
-- Mirth: initial schema
-- Tables, constraints, helper functions, triggers, RLS and storage policies.
-- Conventions: snake_case, uuid primary keys, timestamptz, RLS on everything.
-- =====================================================================

-- ---------- Enums ----------
create type public.user_role as enum ('user', 'admin');
create type public.plan_tier as enum ('free', 'pro');
create type public.template_tier as enum ('free', 'premium');
create type public.template_status as enum ('draft', 'published', 'archived');
create type public.invitation_status as enum ('draft', 'published', 'unpublished');
create type public.media_kind as enum ('cover', 'gallery');
create type public.attendance as enum ('yes', 'no', 'maybe');

-- ---------- Generic helpers ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Safe uuid cast used by storage policies (paths come from untrusted clients).
create or replace function public.try_uuid(p text)
returns uuid
language plpgsql
immutable
as $$
begin
  return p::uuid;
exception when others then
  return null;
end;
$$;

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  avatar_url text,
  role public.user_role not null default 'user',
  plan public.plan_tier not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per auth user. role/plan are managed by admins only.';

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Create a profile automatically when an auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Admin check. SECURITY DEFINER so it can read profiles regardless of RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Prevent users from promoting themselves. Runs as the invoking role on purpose.
create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
as $$
begin
  if (new.role is distinct from old.role) or (new.plan is distinct from old.plan) then
    if not (
      public.is_admin()
      or coalesce(auth.role(), '') = 'service_role'
      or current_user in ('postgres', 'supabase_admin')
    ) then
      raise exception 'role and plan can only be changed by an administrator'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_privileges
before update on public.profiles
for each row execute function public.protect_profile_privileges();

-- ---------- event_categories ----------
create table public.event_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 60),
  description text check (char_length(description) <= 300),
  icon text check (char_length(icon) <= 40),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger event_categories_set_updated_at
before update on public.event_categories
for each row execute function public.set_updated_at();

-- ---------- templates ----------
create table public.templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- Must match a key in features/templates/registry.ts. Rendering lives in code.
  renderer_key text not null unique check (renderer_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 80),
  description text check (char_length(description) <= 400),
  tier public.template_tier not null default 'free',
  status public.template_status not null default 'published',
  is_featured boolean not null default false,
  category_slugs text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index templates_status_sort_idx on public.templates (status, sort_order);

create trigger templates_set_updated_at
before update on public.templates
for each row execute function public.set_updated_at();

-- ---------- invitations ----------
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  template_id uuid not null references public.templates (id) on delete restrict,
  category_id uuid not null references public.event_categories (id) on delete restrict,
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 60),
  title text not null default '' check (char_length(title) <= 140),
  status public.invitation_status not null default 'draft',
  content jsonb not null default '{}'::jsonb check (pg_column_size(content) <= 200000),
  theme jsonb not null default '{}'::jsonb check (pg_column_size(theme) <= 10000),
  settings jsonb not null default '{}'::jsonb check (pg_column_size(settings) <= 10000),
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.invitations.content is 'Category-specific content validated by lib/validation/content.ts';
comment on column public.invitations.theme is 'Palette/font choices validated by lib/validation/theme.ts';
comment on column public.invitations.settings is 'Feature toggles (rsvp, sections) validated by lib/validation/settings.ts';

create index invitations_owner_updated_idx on public.invitations (owner_id, updated_at desc);
create index invitations_published_idx on public.invitations (published_at desc) where status = 'published';
create index invitations_template_idx on public.invitations (template_id);
create index invitations_category_idx on public.invitations (category_id);

create trigger invitations_set_updated_at
before update on public.invitations
for each row execute function public.set_updated_at();

-- ---------- invitation_functions ----------
create table public.invitation_functions (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  description text check (char_length(description) <= 600),
  starts_at timestamptz not null,
  ends_at timestamptz check (ends_at is null or ends_at >= starts_at),
  timezone text not null default 'UTC' check (char_length(timezone) <= 64),
  venue_name text check (char_length(venue_name) <= 160),
  address text check (char_length(address) <= 400),
  maps_url text check (maps_url is null or maps_url ~* '^https://'),
  dress_code text check (char_length(dress_code) <= 120),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index invitation_functions_invitation_idx on public.invitation_functions (invitation_id, sort_order);

-- ---------- invitation_media ----------
create table public.invitation_media (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  -- Always "{invitation_id}/{uuid}.{ext}" inside bucket invitation-media
  storage_path text not null unique check (storage_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|avif)$'),
  kind public.media_kind not null default 'gallery',
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif')),
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 8388608),
  width integer check (width is null or (width > 0 and width <= 12000)),
  height integer check (height is null or (height > 0 and height <= 12000)),
  alt text check (char_length(alt) <= 200),
  sort_order integer not null default 0,
  is_uploaded boolean not null default false,
  created_at timestamptz not null default now()
);

create index invitation_media_invitation_idx on public.invitation_media (invitation_id, kind, sort_order);
create index invitation_media_owner_idx on public.invitation_media (owner_id);
create index invitation_media_pending_idx on public.invitation_media (created_at) where is_uploaded = false;

-- ---------- rsvps ----------
create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  guest_name text not null check (char_length(guest_name) between 1 and 120),
  attendance public.attendance not null,
  guest_count integer not null default 1 check (guest_count between 0 and 20),
  message text check (char_length(message) <= 1000),
  dietary_notes text check (char_length(dietary_notes) <= 500),
  contact text check (char_length(contact) <= 160),
  submission_key text not null,
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.rsvps is 'Guest responses. Private to the invitation owner. Inserted only through submit_rsvp().';

create unique index rsvps_submission_key_idx on public.rsvps (invitation_id, submission_key);
create index rsvps_invitation_created_idx on public.rsvps (invitation_id, created_at desc);
create index rsvps_rate_limit_idx on public.rsvps (invitation_id, ip_hash, updated_at desc);

create trigger rsvps_set_updated_at
before update on public.rsvps
for each row execute function public.set_updated_at();

-- ---------- Ownership helpers (SECURITY DEFINER, used inside policies) ----------
create or replace function public.owns_invitation(p_invitation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.invitations i
    where i.id = p_invitation_id and i.owner_id = auth.uid()
  );
$$;

create or replace function public.invitation_is_published(p_invitation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.invitations i
    where i.id = p_invitation_id and i.status = 'published'
  );
$$;

-- ---------- RSVP submission (the only write path for guests) ----------
create or replace function public.submit_rsvp(
  p_slug text,
  p_guest_name text,
  p_attendance public.attendance,
  p_guest_count integer,
  p_message text,
  p_dietary_notes text,
  p_contact text,
  p_ip_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv public.invitations%rowtype;
  v_rsvp jsonb;
  v_enabled boolean;
  v_allow_count boolean;
  v_max_guests integer;
  v_deadline timestamptz;
  v_recent integer;
  v_key text;
  v_count integer;
  v_id uuid;
  v_existing uuid;
begin
  select * into v_inv from public.invitations where slug = p_slug and status = 'published';
  if not found then
    raise exception 'invitation_not_found' using errcode = 'P0002';
  end if;

  v_rsvp := coalesce(v_inv.settings -> 'rsvp', '{}'::jsonb);
  v_enabled := coalesce((v_rsvp ->> 'enabled')::boolean, false);
  if not v_enabled then
    raise exception 'rsvp_disabled' using errcode = 'P0003';
  end if;

  v_deadline := nullif(v_rsvp ->> 'deadline', '')::timestamptz;
  if v_deadline is not null and v_deadline < now() then
    raise exception 'rsvp_closed' using errcode = 'P0004';
  end if;

  -- Rate limit: at most 5 submissions per hashed IP per invitation per 10 minutes.
  -- An empty hash means the IP was unknown; such requests are not grouped together.
  if nullif(p_ip_hash, '') is not null then
    select count(*) into v_recent
    from public.rsvps r
    where r.invitation_id = v_inv.id
      and r.ip_hash = p_ip_hash
      and r.updated_at > now() - interval '10 minutes';
    if v_recent >= 5 then
      raise exception 'rate_limited' using errcode = 'P0005';
    end if;
  end if;

  v_allow_count := coalesce((v_rsvp ->> 'allowGuestCount')::boolean, false);
  v_max_guests := coalesce((v_rsvp ->> 'maxGuests')::integer, 10);
  v_count := case
    when p_attendance = 'no' then 0
    when v_allow_count then greatest(1, least(coalesce(p_guest_count, 1), v_max_guests))
    else 1
  end;

  v_key := md5(lower(btrim(p_guest_name)) || '|' || coalesce(lower(btrim(p_contact)), ''));

  select id into v_existing
  from public.rsvps
  where invitation_id = v_inv.id and submission_key = v_key;

  insert into public.rsvps (
    invitation_id, guest_name, attendance, guest_count, message, dietary_notes, contact, submission_key, ip_hash
  ) values (
    v_inv.id, btrim(p_guest_name), p_attendance, v_count,
    nullif(btrim(p_message), ''), nullif(btrim(p_dietary_notes), ''), nullif(btrim(p_contact), ''),
    v_key, nullif(p_ip_hash, '')
  )
  on conflict (invitation_id, submission_key) do update set
    attendance = excluded.attendance,
    guest_count = excluded.guest_count,
    message = excluded.message,
    dietary_notes = excluded.dietary_notes,
    contact = excluded.contact,
    ip_hash = excluded.ip_hash,
    updated_at = now()
  returning id into v_id;

  return jsonb_build_object('id', v_id, 'updated', v_existing is not null);
end;
$$;

revoke all on function public.submit_rsvp(text, text, public.attendance, integer, text, text, text, text) from public;
grant execute on function public.submit_rsvp(text, text, public.attendance, integer, text, text, text, text) to anon, authenticated, service_role;

-- Aggregate RSVP summary for owners (avoids pulling every row for a dashboard card).
create or replace function public.rsvp_summary(p_invitation_id uuid)
returns table (total integer, yes integer, no integer, maybe integer, guests integer)
language sql
stable
security invoker
set search_path = public
as $$
  select
    count(*)::integer as total,
    count(*) filter (where attendance = 'yes')::integer as yes,
    count(*) filter (where attendance = 'no')::integer as no,
    count(*) filter (where attendance = 'maybe')::integer as maybe,
    coalesce(sum(guest_count) filter (where attendance = 'yes'), 0)::integer as guests
  from public.rsvps
  where invitation_id = p_invitation_id;
$$;

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.event_categories enable row level security;
alter table public.templates enable row level security;
alter table public.invitations enable row level security;
alter table public.invitation_functions enable row level security;
alter table public.invitation_media enable row level security;
alter table public.rsvps enable row level security;

-- profiles
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());

create policy "profiles: update own or admin" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or public.is_admin())
  with check (id = (select auth.uid()) or public.is_admin());

-- event_categories: public read, admin write
create policy "categories: public read" on public.event_categories
  for select to anon, authenticated
  using (true);

create policy "categories: admin insert" on public.event_categories
  for insert to authenticated with check (public.is_admin());
create policy "categories: admin update" on public.event_categories
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "categories: admin delete" on public.event_categories
  for delete to authenticated using (public.is_admin());

-- templates: published visible to all, everything to admins
create policy "templates: read published or admin" on public.templates
  for select to anon, authenticated
  using (status = 'published' or public.is_admin());

create policy "templates: admin insert" on public.templates
  for insert to authenticated with check (public.is_admin());
create policy "templates: admin update" on public.templates
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "templates: admin delete" on public.templates
  for delete to authenticated using (public.is_admin());

-- invitations
create policy "invitations: owner, admin or published" on public.invitations
  for select to anon, authenticated
  using (owner_id = (select auth.uid()) or status = 'published' or public.is_admin());

create policy "invitations: owner insert" on public.invitations
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy "invitations: owner or admin update" on public.invitations
  for update to authenticated
  using (owner_id = (select auth.uid()) or public.is_admin())
  with check (owner_id = (select auth.uid()) or public.is_admin());

create policy "invitations: owner or admin delete" on public.invitations
  for delete to authenticated
  using (owner_id = (select auth.uid()) or public.is_admin());

-- Column-level privileges: anonymous visitors never see owner_id on invitations.
revoke select on public.invitations from anon;
grant select (id, template_id, category_id, slug, title, status, content, theme, settings, published_at, expires_at, updated_at)
  on public.invitations to anon;

-- invitation_functions
create policy "functions: visible with invitation" on public.invitation_functions
  for select to anon, authenticated
  using (public.owns_invitation(invitation_id) or public.invitation_is_published(invitation_id) or public.is_admin());

create policy "functions: owner insert" on public.invitation_functions
  for insert to authenticated with check (public.owns_invitation(invitation_id));
create policy "functions: owner update" on public.invitation_functions
  for update to authenticated
  using (public.owns_invitation(invitation_id) or public.is_admin())
  with check (public.owns_invitation(invitation_id) or public.is_admin());
create policy "functions: owner delete" on public.invitation_functions
  for delete to authenticated using (public.owns_invitation(invitation_id) or public.is_admin());

-- invitation_media
create policy "media: visible with invitation" on public.invitation_media
  for select to anon, authenticated
  using (public.owns_invitation(invitation_id) or (public.invitation_is_published(invitation_id) and is_uploaded) or public.is_admin());

create policy "media: owner insert" on public.invitation_media
  for insert to authenticated
  with check (owner_id = (select auth.uid()) and public.owns_invitation(invitation_id));
create policy "media: owner update" on public.invitation_media
  for update to authenticated
  using (owner_id = (select auth.uid()) or public.is_admin())
  with check (owner_id = (select auth.uid()) or public.is_admin());
create policy "media: owner delete" on public.invitation_media
  for delete to authenticated using (owner_id = (select auth.uid()) or public.is_admin());

revoke select on public.invitation_media from anon;
grant select (id, invitation_id, storage_path, kind, mime_type, width, height, alt, sort_order, is_uploaded, created_at)
  on public.invitation_media to anon;

-- rsvps: owners and admins read/delete. No direct insert or update for anyone.
create policy "rsvps: owner or admin read" on public.rsvps
  for select to authenticated
  using (public.owns_invitation(invitation_id) or public.is_admin());

create policy "rsvps: owner or admin delete" on public.rsvps
  for delete to authenticated
  using (public.owns_invitation(invitation_id) or public.is_admin());

-- =====================================================================
-- Storage: private bucket, owner-managed, public read only when published
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('invitation-media', 'invitation-media', false, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "media objects: owner manage" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'invitation-media'
    and public.owns_invitation(public.try_uuid((storage.foldername(name))[1]))
  )
  with check (
    bucket_id = 'invitation-media'
    and public.owns_invitation(public.try_uuid((storage.foldername(name))[1]))
  );

create policy "media objects: public read when published" on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'invitation-media'
    and public.invitation_is_published(public.try_uuid((storage.foldername(name))[1]))
  );

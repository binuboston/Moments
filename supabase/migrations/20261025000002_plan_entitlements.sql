-- Plan entitlements, enforced by the database.
--
-- The API checks plans before publishing and uploading (lib/entitlements.ts),
-- but owners can also write their own rows directly through the Data API
-- (RLS owner policies). These triggers make the database the final word, so
-- no client can publish a premium template on Free, exceed the live
-- invitation or gallery limits, or remove branding by editing settings JSON.
--
-- The plan always comes from profiles.plan, which only admins / the service
-- role can change (protect_profile_privileges). Public reads and guest RSVPs
-- are unaffected: these triggers only run on owner writes.

create table public.plan_entitlements (
  plan public.plan_tier primary key,
  max_active_invitations integer not null check (max_active_invitations >= 0),
  max_gallery_images integer not null check (max_gallery_images >= 0),
  premium_templates boolean not null,
  branding boolean not null
);

comment on table public.plan_entitlements is 'What each plan allows. Must match PLAN_LIMITS in lib/entitlements.ts (checked by tests/rls/entitlements.test.ts).';

insert into public.plan_entitlements (plan, max_active_invitations, max_gallery_images, premium_templates, branding) values
  ('free', 3, 8, false, true),
  ('pro', 50, 40, true, false);

alter table public.plan_entitlements enable row level security;
create policy "plan_entitlements: public read" on public.plan_entitlements for select to anon, authenticated using (true);
revoke insert, update, delete on public.plan_entitlements from anon, authenticated;

-- Maintenance (service role, migrations, SQL console) is not subject to plan
-- limits. session_user, not current_user: inside the security definer triggers
-- below, current_user is always the function owner.
create or replace function public.is_maintenance()
returns boolean
language sql
stable
as $$
  select coalesce(auth.role(), '') = 'service_role' or session_user in ('postgres', 'supabase_admin')
$$;

-- Runs as definer so it can read the owner's plan and count rows regardless of
-- who is writing (owner or admin), without exposing either to the caller.
create or replace function public.enforce_invitation_entitlements()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ent public.plan_entitlements;
  becoming_live boolean;
  live integer;
begin
  if new.status <> 'published' or public.is_maintenance() then
    return new;
  end if;

  select e.* into ent
  from public.plan_entitlements e
  where e.plan = coalesce((select p.plan from public.profiles p where p.id = new.owner_id), 'free');

  becoming_live := tg_op = 'INSERT' or old.status <> 'published';

  -- Premium templates: checked when going live or switching template (an
  -- invitation published before a downgrade keeps working and stays editable).
  if not ent.premium_templates and (becoming_live or new.template_id is distinct from old.template_id) then
    if exists (select 1 from public.templates t where t.id = new.template_id and t.tier = 'premium') then
      raise exception 'This is a premium template. Upgrade to Pro to publish with it.'
        using errcode = '42501', hint = 'premium_required';
    end if;
  end if;

  -- Live invitation limit. The lock serialises concurrent publishes by one owner.
  if becoming_live then
    perform pg_advisory_xact_lock(hashtextextended('invite-publish:' || new.owner_id::text, 0));
    select count(*) into live
    from public.invitations i
    where i.owner_id = new.owner_id and i.status = 'published' and i.id <> new.id;
    if live >= ent.max_active_invitations then
      raise exception 'Your plan allows % live invitations. Unpublish one to publish another.', ent.max_active_invitations
        using errcode = '42501', hint = 'plan_limit';
    end if;
  end if;

  -- Branding follows the plan, never the client.
  new.settings := jsonb_set(coalesce(new.settings, '{}'::jsonb), '{branding}', to_jsonb(ent.branding));
  return new;
end;
$$;

revoke execute on function public.enforce_invitation_entitlements() from public, anon, authenticated;

create trigger invitations_enforce_entitlements
before insert or update on public.invitations
for each row execute function public.enforce_invitation_entitlements();

create or replace function public.enforce_media_entitlements()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  max_images integer;
  existing integer;
begin
  if new.kind <> 'gallery' or public.is_maintenance() then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.kind = 'gallery' and old.invitation_id = new.invitation_id then
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtextextended('invite-media:' || new.invitation_id::text, 0));
  select e.max_gallery_images into max_images
  from public.invitations i
  left join public.profiles p on p.id = i.owner_id
  join public.plan_entitlements e on e.plan = coalesce(p.plan, 'free')
  where i.id = new.invitation_id;

  select count(*) into existing
  from public.invitation_media m
  where m.invitation_id = new.invitation_id and m.kind = 'gallery' and m.id <> new.id;

  if existing >= coalesce(max_images, 0) then
    raise exception 'Your plan allows up to % gallery photos.', coalesce(max_images, 0)
      using errcode = '42501', hint = 'plan_limit';
  end if;
  return new;
end;
$$;

revoke execute on function public.enforce_media_entitlements() from public, anon, authenticated;

create trigger invitation_media_enforce_entitlements
before insert or update of kind, invitation_id on public.invitation_media
for each row execute function public.enforce_media_entitlements();

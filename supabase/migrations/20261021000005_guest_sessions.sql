-- Guest sessions: anonymous Supabase users can create and edit drafts (all
-- existing owner policies apply), but can never publish. The API checks this
-- too; this trigger is the database-level guarantee.

create or replace function public.is_guest()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
$$;

create or replace function public.prevent_guest_publish()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' and public.is_guest() then
    raise exception 'Create an account to publish this invitation'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists invitations_prevent_guest_publish on public.invitations;
create trigger invitations_prevent_guest_publish
before insert or update of status on public.invitations
for each row execute function public.prevent_guest_publish();

-- Housekeeping: delete abandoned guest users. Their profiles and drafts go with
-- them (on delete cascade). Run from a scheduled job (pg_cron or a cron route)
-- with the service role, e.g. select public.purge_stale_guests();
create or replace function public.purge_stale_guests(p_older_than interval default interval '30 days')
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  removed integer;
begin
  delete from auth.users u
  where u.is_anonymous
    and coalesce(u.last_sign_in_at, u.created_at) < now() - p_older_than;
  get diagnostics removed = row_count;
  return removed;
end;
$$;

revoke all on function public.purge_stale_guests(interval) from public, anon, authenticated;

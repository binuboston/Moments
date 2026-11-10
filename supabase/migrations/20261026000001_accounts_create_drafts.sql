-- Creating an invitation now needs an account (guest mode is retired).
--
-- 1. creation_key: the wizard sends one key per "Continue with this design".
--    Retries, double clicks, refreshes and the return from an email
--    confirmation reuse the key, so they get the same draft instead of a new
--    one (app/api/invitations/route.ts).
-- 2. Anonymous sessions can no longer create invitations. The API refuses them
--    too; this is the database-level guarantee. Drafts that earlier guests
--    already have stay editable by them until they sign in and claim them.

alter table public.invitations add column creation_key uuid;

create unique index invitations_owner_creation_key_idx
  on public.invitations (owner_id, creation_key)
  where creation_key is not null;

create or replace function public.prevent_guest_create()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if public.is_guest() then
    raise exception 'Create a free account to make an invitation'
      using errcode = '42501', hint = 'account_required';
  end if;
  return new;
end;
$$;

revoke execute on function public.prevent_guest_create() from public, anon, authenticated;

create trigger invitations_prevent_guest_create
before insert on public.invitations
for each row execute function public.prevent_guest_create();

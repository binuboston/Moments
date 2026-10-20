-- =====================================================================
-- Tighten read policies: published rows are public to the anonymous role
-- only. Logged-in users read their own rows (and admins read everything).
-- Public pages always use the anonymous server client, so this does not
-- affect guests. It prevents a signed-in user from reading another tenant's
-- published invitation through their own session.
-- =====================================================================

drop policy if exists "invitations: owner, admin or published" on public.invitations;
create policy "invitations: anon reads published" on public.invitations
  for select to anon
  using (status = 'published');
create policy "invitations: owner or admin read" on public.invitations
  for select to authenticated
  using (owner_id = (select auth.uid()) or public.is_admin());

drop policy if exists "functions: visible with invitation" on public.invitation_functions;
create policy "functions: anon reads published" on public.invitation_functions
  for select to anon
  using (public.invitation_is_published(invitation_id));
create policy "functions: owner or admin read" on public.invitation_functions
  for select to authenticated
  using (public.owns_invitation(invitation_id) or public.is_admin());

drop policy if exists "media: visible with invitation" on public.invitation_media;
create policy "media: anon reads published" on public.invitation_media
  for select to anon
  using (public.invitation_is_published(invitation_id) and is_uploaded);
create policy "media: owner or admin read" on public.invitation_media
  for select to authenticated
  using (public.owns_invitation(invitation_id) or public.is_admin());

drop policy if exists "media objects: public read when published" on storage.objects;
create policy "media objects: anon reads published" on storage.objects
  for select to anon
  using (
    bucket_id = 'invitation-media'
    and public.invitation_is_published(public.try_uuid((storage.foldername(name))[1]))
  );

-- Slug availability for owners choosing a custom address. Reveals only whether a
-- slug exists, which the public URL already reveals.
create or replace function public.slug_available(p_slug text, p_exclude_id uuid default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.invitations i
    where i.slug = p_slug and (p_exclude_id is null or i.id <> p_exclude_id)
  );
$$;

-- Default privileges grant execute to anon/authenticated at creation time, so revoke
-- from anon explicitly rather than only from the public pseudo-role.
revoke all on function public.slug_available(text, uuid) from public, anon;
grant execute on function public.slug_available(text, uuid) to authenticated, service_role;

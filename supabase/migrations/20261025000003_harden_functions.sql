-- =====================================================================
-- Function hardening (Supabase security advisors 0011, 0028, 0029).
--
-- 1. Pin search_path on functions that did not set one, so a caller cannot
--    shadow the objects they reference. Every body already uses qualified
--    names (public.*, auth.*) or pg_catalog built-ins, so '' is safe.
-- 2. Revoke EXECUTE where a role never needs to call a function. Policies run
--    as the querying role, so a helper must stay executable by every role
--    whose policies reference it (tests/rls/function-grants.test.ts):
--      is_admin                   -> anon + authenticated (templates read)
--      owns_invitation            -> authenticated policies only
--      invitation_is_published    -> anon policies only
--    submit_rsvp (anon + authenticated) and slug_available (authenticated)
--    are public RPCs by design and keep their grants.
-- =====================================================================

alter function public.set_updated_at() set search_path = '';
alter function public.try_uuid(text) set search_path = '';
alter function public.protect_profile_privileges() set search_path = '';
alter function public.is_guest() set search_path = '';
alter function public.prevent_guest_publish() set search_path = '';
alter function public.is_maintenance() set search_path = '';

-- Trigger function: fired by auth.users inserts, never called over the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

revoke execute on function public.owns_invitation(uuid) from public, anon;
revoke execute on function public.invitation_is_published(uuid) from public, authenticated;

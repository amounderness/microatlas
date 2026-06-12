-- MicroAtlas Phase 7 fix: avoid recursive profile RLS policies.
-- Do not query public.profiles directly inside a public.profiles policy.
-- Use a SECURITY DEFINER helper for current-user role checks.

drop function if exists public.current_user_is_moderator_or_admin();

create or replace function public.current_user_is_moderator_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('moderator', 'admin')
      and p.is_banned = false
  );
$$;

revoke all on function public.current_user_is_moderator_or_admin() from public;
grant execute on function public.current_user_is_moderator_or_admin() to authenticated;

-- Replace recursive profiles policy.

drop policy if exists "Moderators and admins can view all profiles" on public.profiles;

create policy "Moderators and admins can view all profiles"
on public.profiles
for select
to authenticated
using (
  public.current_user_is_moderator_or_admin()
);

-- Replace moderator/admin inspection policies with the helper.

drop policy if exists "Moderators and admins can view all nations" on public.nations;

create policy "Moderators and admins can view all nations"
on public.nations
for select
to authenticated
using (
  public.current_user_is_moderator_or_admin()
);

drop policy if exists "Moderators and admins can view all nation claims" on public.nation_claims;

create policy "Moderators and admins can view all nation claims"
on public.nation_claims
for select
to authenticated
using (
  public.current_user_is_moderator_or_admin()
);

drop policy if exists "Moderators and admins can view all nation assets" on public.nation_assets;

create policy "Moderators and admins can view all nation assets"
on public.nation_assets
for select
to authenticated
using (
  public.current_user_is_moderator_or_admin()
);

drop policy if exists "Moderators and admins can view all flag objects" on storage.objects;

create policy "Moderators and admins can view all flag objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'nation-flags'
  and public.current_user_is_moderator_or_admin()
);

-- Optional hardening: replace queue/log role checks too.

drop policy if exists "Moderators and admins can view all moderation queue items" on public.moderation_queue;

create policy "Moderators and admins can view all moderation queue items"
on public.moderation_queue
for select
to authenticated
using (
  public.current_user_is_moderator_or_admin()
);

drop policy if exists "Moderators and admins can view moderation log" on public.moderation_log;

create policy "Moderators and admins can view moderation log"
on public.moderation_log
for select
to authenticated
using (
  public.current_user_is_moderator_or_admin()
);
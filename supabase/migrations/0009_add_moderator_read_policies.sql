-- MicroAtlas Phase 7 fix: allow moderators/admins to inspect submitted content.
-- The moderation queue can be visible while related nation/profile/claim/asset rows
-- remain hidden by RLS unless explicit read policies exist.

-- Profiles: allow moderators/admins to view user profiles for moderation context.

drop policy if exists "Moderators and admins can view all profiles" on public.profiles;

create policy "Moderators and admins can view all profiles"
on public.profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles current_profile
    where current_profile.user_id = auth.uid()
      and current_profile.role in ('moderator', 'admin')
      and current_profile.is_banned = false
  )
);

-- Nations: allow moderators/admins to inspect all submitted/reviewable entries.

drop policy if exists "Moderators and admins can view all nations" on public.nations;

create policy "Moderators and admins can view all nations"
on public.nations
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles current_profile
    where current_profile.user_id = auth.uid()
      and current_profile.role in ('moderator', 'admin')
      and current_profile.is_banned = false
  )
);

-- Claims: allow moderators/admins to inspect map geometry.

drop policy if exists "Moderators and admins can view all nation claims" on public.nation_claims;

create policy "Moderators and admins can view all nation claims"
on public.nation_claims
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles current_profile
    where current_profile.user_id = auth.uid()
      and current_profile.role in ('moderator', 'admin')
      and current_profile.is_banned = false
  )
);

-- Assets: allow moderators/admins to inspect flag metadata.

drop policy if exists "Moderators and admins can view all nation assets" on public.nation_assets;

create policy "Moderators and admins can view all nation assets"
on public.nation_assets
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles current_profile
    where current_profile.user_id = auth.uid()
      and current_profile.role in ('moderator', 'admin')
      and current_profile.is_banned = false
  )
);

-- Storage: allow moderators/admins to create signed URLs for submitted flag files.

drop policy if exists "Moderators and admins can view all flag objects" on storage.objects;

create policy "Moderators and admins can view all flag objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'nation-flags'
  and exists (
    select 1
    from public.profiles current_profile
    where current_profile.user_id = auth.uid()
      and current_profile.role in ('moderator', 'admin')
      and current_profile.is_banned = false
  )
);
-- MicroAtlas Phase 7 fix: user-visible moderation timeline.
-- Lets a nation owner or moderator/admin view review history for a nation,
-- including moderator display name, timestamp, decision, and notes.

drop function if exists public.get_nation_review_timeline(uuid);

create or replace function public.get_nation_review_timeline(p_nation_id uuid)
returns table (
  event_type text,
  action text,
  notes text,
  created_at timestamptz,
  actor_display_name text,
  actor_username text,
  actor_role text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_can_view boolean;
begin
  select exists (
    select 1
    from public.nations n
    join public.profiles owner_profile on owner_profile.id = n.owner_id
    where n.id = p_nation_id
      and owner_profile.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.profiles current_profile
    where current_profile.user_id = auth.uid()
      and current_profile.role in ('moderator', 'admin')
      and current_profile.is_banned = false
  )
  into v_can_view;

  if not coalesce(v_can_view, false) then
    raise exception 'You do not have permission to view this review history.';
  end if;

  return query
  select
    'nation_created'::text as event_type,
    'created'::text as action,
    null::text as notes,
    n.created_at,
    owner_profile.display_name as actor_display_name,
    owner_profile.username as actor_username,
    owner_profile.role as actor_role
  from public.nations n
  join public.profiles owner_profile on owner_profile.id = n.owner_id
  where n.id = p_nation_id

  union all

  select
    'moderation_event'::text as event_type,
    ml.action,
    ml.notes,
    ml.created_at,
    actor.display_name as actor_display_name,
    actor.username as actor_username,
    actor.role as actor_role
  from public.moderation_log ml
  left join public.profiles actor on actor.id = ml.actor_id
  where ml.target_type = 'nation'
    and ml.target_id = p_nation_id

  order by created_at asc;
end;
$$;

revoke all on function public.get_nation_review_timeline(uuid) from public;
grant execute on function public.get_nation_review_timeline(uuid) to authenticated;
-- MicroAtlas Phase 6: moderation queue and submission workflow.
-- Allows users to submit complete draft nations for admin review.

create table if not exists public.moderation_queue (
  id uuid primary key default gen_random_uuid(),

  target_type text not null
    check (target_type in ('nation', 'claim', 'asset', 'profile')),

  target_id uuid not null,

  submitted_by uuid not null references public.profiles(id) on delete cascade,

  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'needs_changes')),

  moderator_id uuid references public.profiles(id) on delete set null,

  moderator_notes text,

  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists moderation_queue_target_idx
  on public.moderation_queue(target_type, target_id);

create index if not exists moderation_queue_status_idx
  on public.moderation_queue(status);

create index if not exists moderation_queue_submitted_by_idx
  on public.moderation_queue(submitted_by);

-- Prevent duplicate open review requests for the same target.
create unique index if not exists moderation_queue_one_open_review_per_target_idx
  on public.moderation_queue(target_type, target_id)
  where status in ('pending', 'needs_changes');

alter table public.moderation_queue enable row level security;

drop policy if exists "Users can view their own moderation queue items" on public.moderation_queue;
drop policy if exists "Moderators and admins can view all moderation queue items" on public.moderation_queue;

create policy "Users can view their own moderation queue items"
on public.moderation_queue
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = moderation_queue.submitted_by
      and p.user_id = auth.uid()
  )
);

create policy "Moderators and admins can view all moderation queue items"
on public.moderation_queue
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('moderator', 'admin')
  )
);

revoke all on public.moderation_queue from anon;
revoke all on public.moderation_queue from authenticated;

grant select on public.moderation_queue to authenticated;

-- Atomic submission function.
-- This validates readiness, locks the nation by changing status to submitted,
-- and creates a moderation queue row.

drop function if exists public.submit_nation_for_review(uuid);

create or replace function public.submit_nation_for_review(p_nation_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_nation record;
  v_queue_id uuid;
begin
  select p.id
  into v_profile_id
  from public.profiles p
  where p.user_id = auth.uid()
    and p.is_banned = false;

  if v_profile_id is null then
    raise exception 'Profile could not be found, or this account is banned.';
  end if;

  select n.*
  into v_nation
  from public.nations n
  where n.id = p_nation_id
    and n.owner_id = v_profile_id;

  if v_nation.id is null then
    raise exception 'Nation could not be found, or you do not have permission to submit it.';
  end if;

  if v_nation.status <> 'draft' then
    raise exception 'Only draft nations can be submitted for review.';
  end if;

  if char_length(coalesce(v_nation.name, '')) < 2 then
    raise exception 'Nation name is incomplete.';
  end if;

  if char_length(coalesce(v_nation.short_description, '')) < 10 then
    raise exception 'Short description is incomplete.';
  end if;

  if not exists (
    select 1
    from public.nation_claims nc
    where nc.nation_id = p_nation_id
  ) then
    raise exception 'A map claim is required before submission.';
  end if;

  if not exists (
    select 1
    from public.nation_assets na
    where na.nation_id = p_nation_id
      and na.asset_type = 'flag'
      and na.status in ('pending', 'approved')
  ) then
    raise exception 'A flag upload is required before submission.';
  end if;

  update public.nations
  set
    status = 'submitted',
    visibility = 'private',
    updated_at = now()
  where id = p_nation_id
    and owner_id = v_profile_id
    and status = 'draft';

  insert into public.moderation_queue (
    target_type,
    target_id,
    submitted_by,
    status
  )
  values (
    'nation',
    p_nation_id,
    v_profile_id,
    'pending'
  )
  returning id into v_queue_id;

  return v_queue_id;
end;
$$;

revoke all on function public.submit_nation_for_review(uuid) from public;
grant execute on function public.submit_nation_for_review(uuid) to authenticated;
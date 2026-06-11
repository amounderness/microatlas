-- MicroAtlas Phase 7: moderation log and admin review workflow.
-- Adds admin/moderator review functions and unlocks needs_changes entries for user editing.

create table if not exists public.moderation_log (
  id uuid primary key default gen_random_uuid(),

  actor_id uuid not null references public.profiles(id) on delete cascade,

  target_type text not null
    check (target_type in ('nation', 'claim', 'profile', 'asset', 'user', 'queue')),

  target_id uuid not null,

  action text not null
    check (
      action in (
        'approved',
        'rejected',
        'needs_changes',
        'hidden',
        'restored',
        'submitted',
        'resubmitted'
      )
    ),

  notes text,
  created_at timestamptz not null default now()
);

create index if not exists moderation_log_actor_idx
  on public.moderation_log(actor_id);

create index if not exists moderation_log_target_idx
  on public.moderation_log(target_type, target_id);

create index if not exists moderation_log_created_at_idx
  on public.moderation_log(created_at desc);

alter table public.moderation_log enable row level security;

drop policy if exists "Moderators and admins can view moderation log" on public.moderation_log;

create policy "Moderators and admins can view moderation log"
on public.moderation_log
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

revoke all on public.moderation_log from anon;
revoke all on public.moderation_log from authenticated;

grant select on public.moderation_log to authenticated;

-- Replace nation editing policies so users can edit draft and needs_changes entries.

drop policy if exists "Users can update their own draft nations" on public.nations;

create policy "Users can update their own editable nations"
on public.nations
for update
to authenticated
using (
  status in ('draft', 'needs_changes')
  and exists (
    select 1
    from public.profiles p
    where p.id = nations.owner_id
      and p.user_id = auth.uid()
      and p.is_banned = false
  )
)
with check (
  status in ('draft', 'needs_changes')
  and exists (
    select 1
    from public.profiles p
    where p.id = nations.owner_id
      and p.user_id = auth.uid()
      and p.is_banned = false
  )
);

-- Replace claim editing policies so users can edit claims while draft or needs_changes.

drop policy if exists "Users can insert claims for own draft nations" on public.nation_claims;
drop policy if exists "Users can update claims for own draft nations" on public.nation_claims;
drop policy if exists "Users can delete claims for own draft nations" on public.nation_claims;

create policy "Users can insert claims for own editable nations"
on public.nation_claims
for insert
to authenticated
with check (
  exists (
    select 1
    from public.nations n
    join public.profiles p on p.id = n.owner_id
    where n.id = nation_claims.nation_id
      and n.status in ('draft', 'needs_changes')
      and p.user_id = auth.uid()
      and p.is_banned = false
  )
);

create policy "Users can update claims for own editable nations"
on public.nation_claims
for update
to authenticated
using (
  exists (
    select 1
    from public.nations n
    join public.profiles p on p.id = n.owner_id
    where n.id = nation_claims.nation_id
      and n.status in ('draft', 'needs_changes')
      and p.user_id = auth.uid()
      and p.is_banned = false
  )
)
with check (
  exists (
    select 1
    from public.nations n
    join public.profiles p on p.id = n.owner_id
    where n.id = nation_claims.nation_id
      and n.status in ('draft', 'needs_changes')
      and p.user_id = auth.uid()
      and p.is_banned = false
  )
);

create policy "Users can delete claims for own editable nations"
on public.nation_claims
for delete
to authenticated
using (
  exists (
    select 1
    from public.nations n
    join public.profiles p on p.id = n.owner_id
    where n.id = nation_claims.nation_id
      and n.status in ('draft', 'needs_changes')
      and p.user_id = auth.uid()
      and p.is_banned = false
  )
);

-- Replace asset editing policies so users can edit flag assets while draft or needs_changes.

drop policy if exists "Users can insert assets for own draft nations" on public.nation_assets;
drop policy if exists "Users can update assets for own draft nations" on public.nation_assets;
drop policy if exists "Users can delete assets for own draft nations" on public.nation_assets;

create policy "Users can insert assets for own editable nations"
on public.nation_assets
for insert
to authenticated
with check (
  status = 'pending'
  and exists (
    select 1
    from public.nations n
    join public.profiles p on p.id = n.owner_id
    where n.id = nation_assets.nation_id
      and n.status in ('draft', 'needs_changes')
      and p.user_id = auth.uid()
      and p.is_banned = false
  )
);

create policy "Users can update assets for own editable nations"
on public.nation_assets
for update
to authenticated
using (
  exists (
    select 1
    from public.nations n
    join public.profiles p on p.id = n.owner_id
    where n.id = nation_assets.nation_id
      and n.status in ('draft', 'needs_changes')
      and p.user_id = auth.uid()
      and p.is_banned = false
  )
)
with check (
  status = 'pending'
  and exists (
    select 1
    from public.nations n
    join public.profiles p on p.id = n.owner_id
    where n.id = nation_assets.nation_id
      and n.status in ('draft', 'needs_changes')
      and p.user_id = auth.uid()
      and p.is_banned = false
  )
);

create policy "Users can delete assets for own editable nations"
on public.nation_assets
for delete
to authenticated
using (
  exists (
    select 1
    from public.nations n
    join public.profiles p on p.id = n.owner_id
    where n.id = nation_assets.nation_id
      and n.status in ('draft', 'needs_changes')
      and p.user_id = auth.uid()
      and p.is_banned = false
  )
);

-- Replace submission RPC so needs_changes entries can be resubmitted.

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
  v_existing_queue_id uuid;
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

  if v_nation.status not in ('draft', 'needs_changes') then
    raise exception 'Only draft or needs-changes nations can be submitted for review.';
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
    and status in ('draft', 'needs_changes');

  select mq.id
  into v_existing_queue_id
  from public.moderation_queue mq
  where mq.target_type = 'nation'
    and mq.target_id = p_nation_id
    and mq.status = 'needs_changes'
  order by mq.created_at desc
  limit 1;

  if v_existing_queue_id is not null then
    update public.moderation_queue
    set
      status = 'pending',
      moderator_id = null,
      moderator_notes = null,
      reviewed_at = null
    where id = v_existing_queue_id
    returning id into v_queue_id;
  else
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
  end if;

  insert into public.moderation_log (
    actor_id,
    target_type,
    target_id,
    action,
    notes
  )
  values (
    v_profile_id,
    'nation',
    p_nation_id,
    case when v_nation.status = 'needs_changes' then 'resubmitted' else 'submitted' end,
    null
  );

  return v_queue_id;
end;
$$;

revoke all on function public.submit_nation_for_review(uuid) from public;
grant execute on function public.submit_nation_for_review(uuid) to authenticated;

-- Admin/moderator review RPC.

drop function if exists public.review_nation_submission(uuid, text, text);

create or replace function public.review_nation_submission(
  p_queue_id uuid,
  p_decision text,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid;
  v_queue record;
  v_nation_id uuid;
begin
  select p.id
  into v_actor_id
  from public.profiles p
  where p.user_id = auth.uid()
    and p.role in ('moderator', 'admin')
    and p.is_banned = false;

  if v_actor_id is null then
    raise exception 'You do not have permission to review submissions.';
  end if;

  if p_decision not in ('approved', 'rejected', 'needs_changes') then
    raise exception 'Invalid moderation decision.';
  end if;

  select mq.*
  into v_queue
  from public.moderation_queue mq
  where mq.id = p_queue_id
    and mq.target_type = 'nation'
    and mq.status = 'pending';

  if v_queue.id is null then
    raise exception 'Pending moderation item could not be found.';
  end if;

  v_nation_id := v_queue.target_id;

  if p_decision = 'approved' then
    update public.nations
    set
      status = 'approved',
      visibility = 'public',
      updated_at = now()
    where id = v_nation_id
      and status = 'submitted';

    update public.nation_assets
    set
      status = 'approved',
      updated_at = now()
    where nation_id = v_nation_id
      and asset_type = 'flag'
      and status = 'pending';
  elsif p_decision = 'rejected' then
    update public.nations
    set
      status = 'rejected',
      visibility = 'private',
      updated_at = now()
    where id = v_nation_id
      and status = 'submitted';

    update public.nation_assets
    set
      status = 'rejected',
      updated_at = now()
    where nation_id = v_nation_id
      and asset_type = 'flag'
      and status = 'pending';
  elsif p_decision = 'needs_changes' then
    update public.nations
    set
      status = 'needs_changes',
      visibility = 'private',
      updated_at = now()
    where id = v_nation_id
      and status = 'submitted';

    update public.nation_assets
    set
      status = 'pending',
      updated_at = now()
    where nation_id = v_nation_id
      and asset_type = 'flag';
  end if;

  update public.moderation_queue
  set
    status = p_decision,
    moderator_id = v_actor_id,
    moderator_notes = nullif(trim(coalesce(p_notes, '')), ''),
    reviewed_at = now()
  where id = p_queue_id;

  insert into public.moderation_log (
    actor_id,
    target_type,
    target_id,
    action,
    notes
  )
  values (
    v_actor_id,
    'nation',
    v_nation_id,
    p_decision,
    nullif(trim(coalesce(p_notes, '')), '')
  );
end;
$$;

revoke all on function public.review_nation_submission(uuid, text, text) from public;
grant execute on function public.review_nation_submission(uuid, text, text) to authenticated;
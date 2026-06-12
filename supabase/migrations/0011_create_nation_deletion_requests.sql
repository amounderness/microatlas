-- MicroAtlas Phase 7.5: direct draft deletion and moderated deletion requests.
-- Draft/needs_changes/rejected nations can be hard-deleted by their owner.
-- Approved nations can be requested for deletion and soft-hidden after moderation.

-- Extend moderation_log action values.

alter table public.moderation_log
drop constraint if exists moderation_log_action_check;

alter table public.moderation_log
add constraint moderation_log_action_check
check (
  action in (
    'approved',
    'rejected',
    'needs_changes',
    'hidden',
    'restored',
    'submitted',
    'resubmitted',
    'draft_deleted',
    'deletion_requested',
    'deletion_approved',
    'deletion_rejected',
    'deletion_cancelled'
  )
);

-- Deletion request table.

create table if not exists public.nation_deletion_requests (
  id uuid primary key default gen_random_uuid(),

  nation_id uuid not null references public.nations(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete cascade,

  reason text not null
    check (
      reason in (
        'inactive',
        'created_in_error',
        'duplicate_or_replaced',
        'leaving_microatlas',
        'privacy_or_safety_concern',
        'ownership_or_representation_issue',
        'other'
      )
    ),

  details text,

  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'cancelled')),

  moderator_id uuid references public.profiles(id) on delete set null,
  moderator_notes text,

  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists nation_deletion_requests_nation_id_idx
  on public.nation_deletion_requests(nation_id);

create index if not exists nation_deletion_requests_requested_by_idx
  on public.nation_deletion_requests(requested_by);

create index if not exists nation_deletion_requests_status_idx
  on public.nation_deletion_requests(status);

create unique index if not exists nation_deletion_requests_one_pending_per_nation_idx
  on public.nation_deletion_requests(nation_id)
  where status = 'pending';

alter table public.nation_deletion_requests enable row level security;

drop policy if exists "Users can view their own deletion requests" on public.nation_deletion_requests;
drop policy if exists "Moderators and admins can view all deletion requests" on public.nation_deletion_requests;

create policy "Users can view their own deletion requests"
on public.nation_deletion_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = nation_deletion_requests.requested_by
      and p.user_id = auth.uid()
  )
);

create policy "Moderators and admins can view all deletion requests"
on public.nation_deletion_requests
for select
to authenticated
using (
  public.current_user_is_moderator_or_admin()
);

revoke all on public.nation_deletion_requests from anon;
revoke all on public.nation_deletion_requests from authenticated;

grant select on public.nation_deletion_requests to authenticated;

-- Allow owners to directly delete nations that have not become approved public records.

drop policy if exists "Users can delete their own unapproved nations" on public.nations;

create policy "Users can delete their own unapproved nations"
on public.nations
for delete
to authenticated
using (
  status in ('draft', 'needs_changes', 'rejected')
  and exists (
    select 1
    from public.profiles p
    where p.id = nations.owner_id
      and p.user_id = auth.uid()
      and p.is_banned = false
  )
);

grant delete on public.nations to authenticated;

-- User RPC: request deletion for an approved nation.

drop function if exists public.request_nation_deletion(uuid, text, text);

create or replace function public.request_nation_deletion(
  p_nation_id uuid,
  p_reason text,
  p_details text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_nation record;
  v_request_id uuid;
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
    raise exception 'Nation could not be found, or you do not have permission to request deletion.';
  end if;

  if v_nation.status <> 'approved' then
    raise exception 'Only approved nations can be submitted for moderated deletion.';
  end if;

  if p_reason not in (
    'inactive',
    'created_in_error',
    'duplicate_or_replaced',
    'leaving_microatlas',
    'privacy_or_safety_concern',
    'ownership_or_representation_issue',
    'other'
  ) then
    raise exception 'Invalid deletion request reason.';
  end if;

  insert into public.nation_deletion_requests (
    nation_id,
    requested_by,
    reason,
    details,
    status
  )
  values (
    p_nation_id,
    v_profile_id,
    p_reason,
    nullif(trim(coalesce(p_details, '')), ''),
    'pending'
  )
  returning id into v_request_id;

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
    'deletion_requested',
    concat(
      'Reason: ',
      p_reason,
      case
        when nullif(trim(coalesce(p_details, '')), '') is not null
          then E'\n\nDetails: ' || trim(p_details)
        else ''
      end
    )
  );

  return v_request_id;
end;
$$;

revoke all on function public.request_nation_deletion(uuid, text, text) from public;
grant execute on function public.request_nation_deletion(uuid, text, text) to authenticated;

-- Admin RPC: approve or reject a deletion request.

drop function if exists public.review_nation_deletion_request(uuid, text, text);

create or replace function public.review_nation_deletion_request(
  p_request_id uuid,
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
  v_request record;
begin
  select p.id
  into v_actor_id
  from public.profiles p
  where p.user_id = auth.uid()
    and p.role in ('moderator', 'admin')
    and p.is_banned = false;

  if v_actor_id is null then
    raise exception 'You do not have permission to review deletion requests.';
  end if;

  if p_decision not in ('approved', 'rejected') then
    raise exception 'Invalid deletion review decision.';
  end if;

  select dr.*
  into v_request
  from public.nation_deletion_requests dr
  where dr.id = p_request_id
    and dr.status = 'pending';

  if v_request.id is null then
    raise exception 'Pending deletion request could not be found.';
  end if;

  if p_decision = 'approved' then
    update public.nations
    set
      status = 'hidden',
      visibility = 'private',
      updated_at = now()
    where id = v_request.nation_id
      and status = 'approved';

    update public.nation_deletion_requests
    set
      status = 'approved',
      moderator_id = v_actor_id,
      moderator_notes = nullif(trim(coalesce(p_notes, '')), ''),
      reviewed_at = now()
    where id = p_request_id;

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
      v_request.nation_id,
      'deletion_approved',
      nullif(trim(coalesce(p_notes, '')), '')
    );
  else
    update public.nation_deletion_requests
    set
      status = 'rejected',
      moderator_id = v_actor_id,
      moderator_notes = nullif(trim(coalesce(p_notes, '')), ''),
      reviewed_at = now()
    where id = p_request_id;

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
      v_request.nation_id,
      'deletion_rejected',
      nullif(trim(coalesce(p_notes, '')), '')
    );
  end if;
end;
$$;

revoke all on function public.review_nation_deletion_request(uuid, text, text) from public;
grant execute on function public.review_nation_deletion_request(uuid, text, text) to authenticated;
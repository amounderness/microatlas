-- MicroAtlas Phase 9: reports, hide/restore, and ban/unban workflow.

-- Extend moderation log actions.

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
    'deletion_cancelled',
    'report_reviewing',
    'report_resolved',
    'report_dismissed',
    'banned',
    'unbanned'
  )
);

-- Public report table.

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),

  reporter_id uuid references public.profiles(id) on delete set null,

  target_type text not null
    check (target_type in ('nation', 'profile', 'asset')),

  target_id uuid not null,

  reason text not null
    check (
      reason in (
        'spam',
        'abuse_or_harassment',
        'privacy_or_personal_information',
        'extremist_or_hateful_content',
        'impersonation',
        'pornographic_or_shock_content',
        'malware_or_suspicious_link',
        'disruptive_or_excessive_claim',
        'low_effort_or_nonsense',
        'other'
      )
    ),

  details text,

  status text not null default 'open'
    check (status in ('open', 'reviewing', 'resolved', 'dismissed')),

  moderator_id uuid references public.profiles(id) on delete set null,
  moderator_notes text,

  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists reports_target_idx
  on public.reports(target_type, target_id);

create index if not exists reports_reporter_idx
  on public.reports(reporter_id);

create index if not exists reports_status_idx
  on public.reports(status);

create index if not exists reports_created_at_idx
  on public.reports(created_at desc);

alter table public.reports enable row level security;

drop policy if exists "Users can view their own reports" on public.reports;
drop policy if exists "Moderators and admins can view all reports" on public.reports;

create policy "Users can view their own reports"
on public.reports
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = reports.reporter_id
      and p.user_id = auth.uid()
  )
);

create policy "Moderators and admins can view all reports"
on public.reports
for select
to authenticated
using (
  public.current_user_is_moderator_or_admin()
);

revoke all on public.reports from anon;
revoke all on public.reports from authenticated;

grant select on public.reports to authenticated;

-- Anonymous/authenticated report submission RPC.
-- For MVP, reports are limited to approved public nation entries.

drop function if exists public.submit_nation_report(text, uuid, text, text);

create or replace function public.submit_nation_report(
  p_target_type text,
  p_target_id uuid,
  p_reason text,
  p_details text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reporter_id uuid;
  v_reporter_is_banned boolean;
  v_report_id uuid;
begin
  if p_target_type <> 'nation' then
    raise exception 'Only nation reports are supported at this stage.';
  end if;

  if p_reason not in (
    'spam',
    'abuse_or_harassment',
    'privacy_or_personal_information',
    'extremist_or_hateful_content',
    'impersonation',
    'pornographic_or_shock_content',
    'malware_or_suspicious_link',
    'disruptive_or_excessive_claim',
    'low_effort_or_nonsense',
    'other'
  ) then
    raise exception 'Invalid report reason.';
  end if;

  if auth.uid() is not null then
    select p.id, p.is_banned
    into v_reporter_id, v_reporter_is_banned
    from public.profiles p
    where p.user_id = auth.uid();

    if coalesce(v_reporter_is_banned, false) then
      raise exception 'Banned users cannot submit reports.';
    end if;
  end if;

  if not exists (
    select 1
    from public.nations n
    where n.id = p_target_id
      and n.status = 'approved'
      and n.visibility = 'public'
  ) then
    raise exception 'Only approved public nations can be reported.';
  end if;

  insert into public.reports (
    reporter_id,
    target_type,
    target_id,
    reason,
    details,
    status
  )
  values (
    v_reporter_id,
    p_target_type,
    p_target_id,
    p_reason,
    nullif(trim(coalesce(p_details, '')), ''),
    'open'
  )
  returning id into v_report_id;

  return v_report_id;
end;
$$;

revoke all on function public.submit_nation_report(text, uuid, text, text) from public;
grant execute on function public.submit_nation_report(text, uuid, text, text) to anon, authenticated;

-- Admin/moderator report review RPC.

drop function if exists public.review_report(uuid, text, text);

create or replace function public.review_report(
  p_report_id uuid,
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
  v_report record;
  v_action text;
begin
  select p.id
  into v_actor_id
  from public.profiles p
  where p.user_id = auth.uid()
    and p.role in ('moderator', 'admin')
    and p.is_banned = false;

  if v_actor_id is null then
    raise exception 'You do not have permission to review reports.';
  end if;

  if p_decision not in ('reviewing', 'resolved', 'dismissed') then
    raise exception 'Invalid report decision.';
  end if;

  select r.*
  into v_report
  from public.reports r
  where r.id = p_report_id;

  if v_report.id is null then
    raise exception 'Report could not be found.';
  end if;

  if v_report.status in ('resolved', 'dismissed') then
    raise exception 'This report has already been closed.';
  end if;

  update public.reports
  set
    status = p_decision,
    moderator_id = v_actor_id,
    moderator_notes = nullif(trim(coalesce(p_notes, '')), ''),
    reviewed_at = case
      when p_decision in ('resolved', 'dismissed') then now()
      else reviewed_at
    end
  where id = p_report_id;

  v_action := case
    when p_decision = 'reviewing' then 'report_reviewing'
    when p_decision = 'resolved' then 'report_resolved'
    when p_decision = 'dismissed' then 'report_dismissed'
  end;

  insert into public.moderation_log (
    actor_id,
    target_type,
    target_id,
    action,
    notes
  )
  values (
    v_actor_id,
    v_report.target_type,
    v_report.target_id,
    v_action,
    nullif(trim(coalesce(p_notes, '')), '')
  );
end;
$$;

revoke all on function public.review_report(uuid, text, text) from public;
grant execute on function public.review_report(uuid, text, text) to authenticated;

-- Hide approved nation.

drop function if exists public.hide_nation_for_moderation(uuid, text);

create or replace function public.hide_nation_for_moderation(
  p_nation_id uuid,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid;
begin
  select p.id
  into v_actor_id
  from public.profiles p
  where p.user_id = auth.uid()
    and p.role in ('moderator', 'admin')
    and p.is_banned = false;

  if v_actor_id is null then
    raise exception 'You do not have permission to hide nations.';
  end if;

  update public.nations
  set
    status = 'hidden',
    visibility = 'private',
    updated_at = now()
  where id = p_nation_id
    and status = 'approved';

  if not found then
    raise exception 'Only approved nations can be hidden.';
  end if;

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
    p_nation_id,
    'hidden',
    nullif(trim(coalesce(p_notes, '')), '')
  );
end;
$$;

revoke all on function public.hide_nation_for_moderation(uuid, text) from public;
grant execute on function public.hide_nation_for_moderation(uuid, text) to authenticated;

-- Restore hidden nation.

drop function if exists public.restore_nation_for_moderation(uuid, text);

create or replace function public.restore_nation_for_moderation(
  p_nation_id uuid,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid;
begin
  select p.id
  into v_actor_id
  from public.profiles p
  where p.user_id = auth.uid()
    and p.role in ('moderator', 'admin')
    and p.is_banned = false;

  if v_actor_id is null then
    raise exception 'You do not have permission to restore nations.';
  end if;

  update public.nations
  set
    status = 'approved',
    visibility = 'public',
    updated_at = now()
  where id = p_nation_id
    and status = 'hidden';

  if not found then
    raise exception 'Only hidden nations can be restored.';
  end if;

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
    p_nation_id,
    'restored',
    nullif(trim(coalesce(p_notes, '')), '')
  );
end;
$$;

revoke all on function public.restore_nation_for_moderation(uuid, text) from public;
grant execute on function public.restore_nation_for_moderation(uuid, text) to authenticated;

-- Ban profile.

drop function if exists public.ban_profile_for_moderation(uuid, text);

create or replace function public.ban_profile_for_moderation(
  p_profile_id uuid,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid;
  v_target record;
begin
  select p.id
  into v_actor_id
  from public.profiles p
  where p.user_id = auth.uid()
    and p.role in ('moderator', 'admin')
    and p.is_banned = false;

  if v_actor_id is null then
    raise exception 'You do not have permission to ban users.';
  end if;

  select p.*
  into v_target
  from public.profiles p
  where p.id = p_profile_id;

  if v_target.id is null then
    raise exception 'Target profile could not be found.';
  end if;

  if v_target.id = v_actor_id then
    raise exception 'You cannot ban your own account.';
  end if;

  if v_target.role = 'admin' then
    raise exception 'Admin profiles cannot be banned from this screen.';
  end if;

  update public.profiles
  set
    is_banned = true,
    updated_at = now()
  where id = p_profile_id;

  insert into public.moderation_log (
    actor_id,
    target_type,
    target_id,
    action,
    notes
  )
  values (
    v_actor_id,
    'user',
    p_profile_id,
    'banned',
    nullif(trim(coalesce(p_notes, '')), '')
  );
end;
$$;

revoke all on function public.ban_profile_for_moderation(uuid, text) from public;
grant execute on function public.ban_profile_for_moderation(uuid, text) to authenticated;

-- Unban profile.

drop function if exists public.unban_profile_for_moderation(uuid, text);

create or replace function public.unban_profile_for_moderation(
  p_profile_id uuid,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid;
begin
  select p.id
  into v_actor_id
  from public.profiles p
  where p.user_id = auth.uid()
    and p.role in ('moderator', 'admin')
    and p.is_banned = false;

  if v_actor_id is null then
    raise exception 'You do not have permission to unban users.';
  end if;

  update public.profiles
  set
    is_banned = false,
    updated_at = now()
  where id = p_profile_id;

  if not found then
    raise exception 'Target profile could not be found.';
  end if;

  insert into public.moderation_log (
    actor_id,
    target_type,
    target_id,
    action,
    notes
  )
  values (
    v_actor_id,
    'user',
    p_profile_id,
    'unbanned',
    nullif(trim(coalesce(p_notes, '')), '')
  );
end;
$$;

revoke all on function public.unban_profile_for_moderation(uuid, text) from public;
grant execute on function public.unban_profile_for_moderation(uuid, text) to authenticated;
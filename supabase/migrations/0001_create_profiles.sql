@'
-- MicroAtlas Phase 2: profiles table
-- Creates user profile records linked to Supabase Auth users.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,

  username text unique,
  display_name text,
  bio text,

  public_email_enabled boolean not null default false,
  public_email text,

  role text not null default 'user'
    check (role in ('user', 'moderator', 'admin')),

  trust_level integer not null default 0
    check (trust_level >= 0),

  is_banned boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint username_format check (
    username is null
    or username ~ '^[a-zA-Z0-9_]{3,32}$'
  ),

  constraint public_email_required_if_enabled check (
    public_email_enabled = false
    or public_email is not null
  )
);

create index if not exists profiles_user_id_idx
  on public.profiles(user_id);

create index if not exists profiles_username_idx
  on public.profiles(username);

-- Keep updated_at current.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- Create a profile automatically when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    user_id,
    display_name
  )
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1))
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Backfill profiles for users who already existed before this trigger.
insert into public.profiles (
  user_id,
  display_name
)
select
  id,
  coalesce(split_part(email, '@', 1), 'New user')
from auth.users
on conflict (user_id) do nothing;

-- Row Level Security.
alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own editable profile fields" on public.profiles;

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can update their own editable profile fields"
on public.profiles
for update
to authenticated
using (
  auth.uid() = user_id
  and is_banned = false
)
with check (
  auth.uid() = user_id
  and is_banned = false
);

-- Lock table access down, then grant only what the frontend needs.
revoke all on public.profiles from anon;
revoke all on public.profiles from authenticated;

grant select on public.profiles to authenticated;

grant update (
  username,
  display_name,
  bio,
  public_email_enabled,
  public_email
) on public.profiles to authenticated;
'@ | Set-Content "supabase\migrations\0001_create_profiles.sql"
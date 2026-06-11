-- MicroAtlas Phase 3: nations table
-- Draft nation records only. Map claims and flag assets come later.

create table if not exists public.nations (
  id uuid primary key default gen_random_uuid(),

  owner_id uuid not null references public.profiles(id) on delete cascade,

  name text not null,
  slug text not null unique,

  short_description text not null,
  long_description text,

  capital text,
  founded_date text,
  website_url text,

  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'approved', 'rejected', 'hidden', 'needs_changes')),

  visibility text not null default 'private'
    check (visibility in ('public', 'unlisted', 'private')),

  creator_public boolean not null default false,
  contact_public boolean not null default false,

  fill_colour text not null default '#2563eb'
    check (fill_colour ~ '^#[0-9A-Fa-f]{6}$'),

  border_colour text not null default '#1e3a8a'
    check (border_colour ~ '^#[0-9A-Fa-f]{6}$'),

  fill_opacity numeric not null default 0.35
    check (fill_opacity >= 0 and fill_opacity <= 1),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint nation_name_length check (char_length(name) between 2 and 120),
  constraint nation_short_description_length check (char_length(short_description) between 10 and 280)
);

create index if not exists nations_owner_id_idx
  on public.nations(owner_id);

create index if not exists nations_status_idx
  on public.nations(status);

create index if not exists nations_slug_idx
  on public.nations(slug);

drop trigger if exists set_nations_updated_at on public.nations;

create trigger set_nations_updated_at
before update on public.nations
for each row
execute function public.set_updated_at();

alter table public.nations enable row level security;

drop policy if exists "Public can view approved public nations" on public.nations;
drop policy if exists "Users can view their own nations" on public.nations;
drop policy if exists "Users can insert their own draft nations" on public.nations;
drop policy if exists "Users can update their own draft nations" on public.nations;

create policy "Public can view approved public nations"
on public.nations
for select
to anon, authenticated
using (
  status = 'approved'
  and visibility = 'public'
);

create policy "Users can view their own nations"
on public.nations
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = nations.owner_id
      and p.user_id = auth.uid()
  )
);

create policy "Users can insert their own draft nations"
on public.nations
for insert
to authenticated
with check (
  status = 'draft'
  and exists (
    select 1
    from public.profiles p
    where p.id = nations.owner_id
      and p.user_id = auth.uid()
      and p.is_banned = false
  )
);

create policy "Users can update their own draft nations"
on public.nations
for update
to authenticated
using (
  status = 'draft'
  and exists (
    select 1
    from public.profiles p
    where p.id = nations.owner_id
      and p.user_id = auth.uid()
      and p.is_banned = false
  )
)
with check (
  status = 'draft'
  and exists (
    select 1
    from public.profiles p
    where p.id = nations.owner_id
      and p.user_id = auth.uid()
      and p.is_banned = false
  )
);

revoke all on public.nations from anon;
revoke all on public.nations from authenticated;

grant select on public.nations to anon, authenticated;

grant insert (
  owner_id,
  name,
  slug,
  short_description,
  long_description,
  capital,
  founded_date,
  website_url,
  visibility,
  creator_public,
  contact_public,
  fill_colour,
  border_colour,
  fill_opacity
) on public.nations to authenticated;

grant update (
  name,
  slug,
  short_description,
  long_description,
  capital,
  founded_date,
  website_url,
  visibility,
  creator_public,
  contact_public,
  fill_colour,
  border_colour,
  fill_opacity
) on public.nations to authenticated;
-- MicroAtlas Phase 5: nation_assets and private flag storage.
-- One pending flag asset per draft nation.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'nation-flags',
  'nation-flags',
  false,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.nation_assets (
  id uuid primary key default gen_random_uuid(),

  nation_id uuid not null references public.nations(id) on delete cascade,

  asset_type text not null
    check (asset_type in ('flag', 'coat_of_arms')),

  storage_bucket text not null default 'nation-flags',
  storage_path text not null,

  original_filename text,
  mime_type text not null,
  size_bytes integer not null
    check (size_bytes > 0 and size_bytes <= 5242880),

  alt_text text not null,

  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (nation_id, asset_type)
);

create index if not exists nation_assets_nation_id_idx
  on public.nation_assets(nation_id);

create index if not exists nation_assets_status_idx
  on public.nation_assets(status);

drop trigger if exists set_nation_assets_updated_at on public.nation_assets;

create trigger set_nation_assets_updated_at
before update on public.nation_assets
for each row
execute function public.set_updated_at();

alter table public.nation_assets enable row level security;

drop policy if exists "Public can view approved public nation assets" on public.nation_assets;
drop policy if exists "Users can view their own nation assets" on public.nation_assets;
drop policy if exists "Users can insert assets for own draft nations" on public.nation_assets;
drop policy if exists "Users can update assets for own draft nations" on public.nation_assets;
drop policy if exists "Users can delete assets for own draft nations" on public.nation_assets;

create policy "Public can view approved public nation assets"
on public.nation_assets
for select
to anon, authenticated
using (
  status = 'approved'
  and exists (
    select 1
    from public.nations n
    where n.id = nation_assets.nation_id
      and n.status = 'approved'
      and n.visibility = 'public'
  )
);

create policy "Users can view their own nation assets"
on public.nation_assets
for select
to authenticated
using (
  exists (
    select 1
    from public.nations n
    join public.profiles p on p.id = n.owner_id
    where n.id = nation_assets.nation_id
      and p.user_id = auth.uid()
  )
);

create policy "Users can insert assets for own draft nations"
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
      and n.status = 'draft'
      and p.user_id = auth.uid()
      and p.is_banned = false
  )
);

create policy "Users can update assets for own draft nations"
on public.nation_assets
for update
to authenticated
using (
  exists (
    select 1
    from public.nations n
    join public.profiles p on p.id = n.owner_id
    where n.id = nation_assets.nation_id
      and n.status = 'draft'
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
      and n.status = 'draft'
      and p.user_id = auth.uid()
      and p.is_banned = false
  )
);

create policy "Users can delete assets for own draft nations"
on public.nation_assets
for delete
to authenticated
using (
  exists (
    select 1
    from public.nations n
    join public.profiles p on p.id = n.owner_id
    where n.id = nation_assets.nation_id
      and n.status = 'draft'
      and p.user_id = auth.uid()
      and p.is_banned = false
  )
);

revoke all on public.nation_assets from anon;
revoke all on public.nation_assets from authenticated;

grant select on public.nation_assets to anon, authenticated;
grant insert on public.nation_assets to authenticated;
grant update on public.nation_assets to authenticated;
grant delete on public.nation_assets to authenticated;

-- Storage object policies for private nation flag files.
-- Object paths must begin with the authenticated user's auth UUID.

drop policy if exists "Users can view their own flag objects" on storage.objects;
drop policy if exists "Users can upload their own flag objects" on storage.objects;
drop policy if exists "Users can update their own flag objects" on storage.objects;
drop policy if exists "Users can delete their own flag objects" on storage.objects;

create policy "Users can view their own flag objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'nation-flags'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can upload their own flag objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'nation-flags'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own flag objects"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'nation-flags'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'nation-flags'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own flag objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'nation-flags'
  and (storage.foldername(name))[1] = auth.uid()::text
);
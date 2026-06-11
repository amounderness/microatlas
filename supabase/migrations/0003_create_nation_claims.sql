-- MicroAtlas Phase 4: nation_claims table
-- Stores one editable GeoJSON polygon claim per draft nation.

create table if not exists public.nation_claims (
  id uuid primary key default gen_random_uuid(),

  nation_id uuid not null unique references public.nations(id) on delete cascade,

  geojson jsonb not null,

  claim_type text not null default 'primary'
    check (claim_type in ('primary', 'symbolic', 'historical', 'disputed')),

  area_label text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists nation_claims_nation_id_idx
  on public.nation_claims(nation_id);

drop trigger if exists set_nation_claims_updated_at on public.nation_claims;

create trigger set_nation_claims_updated_at
before update on public.nation_claims
for each row
execute function public.set_updated_at();

alter table public.nation_claims enable row level security;

drop policy if exists "Public can view approved public nation claims" on public.nation_claims;
drop policy if exists "Users can view their own nation claims" on public.nation_claims;
drop policy if exists "Users can insert claims for own draft nations" on public.nation_claims;
drop policy if exists "Users can update claims for own draft nations" on public.nation_claims;
drop policy if exists "Users can delete claims for own draft nations" on public.nation_claims;

create policy "Public can view approved public nation claims"
on public.nation_claims
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.nations n
    where n.id = nation_claims.nation_id
      and n.status = 'approved'
      and n.visibility = 'public'
  )
);

create policy "Users can view their own nation claims"
on public.nation_claims
for select
to authenticated
using (
  exists (
    select 1
    from public.nations n
    join public.profiles p on p.id = n.owner_id
    where n.id = nation_claims.nation_id
      and p.user_id = auth.uid()
  )
);

create policy "Users can insert claims for own draft nations"
on public.nation_claims
for insert
to authenticated
with check (
  exists (
    select 1
    from public.nations n
    join public.profiles p on p.id = n.owner_id
    where n.id = nation_claims.nation_id
      and n.status = 'draft'
      and p.user_id = auth.uid()
      and p.is_banned = false
  )
);

create policy "Users can update claims for own draft nations"
on public.nation_claims
for update
to authenticated
using (
  exists (
    select 1
    from public.nations n
    join public.profiles p on p.id = n.owner_id
    where n.id = nation_claims.nation_id
      and n.status = 'draft'
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
      and n.status = 'draft'
      and p.user_id = auth.uid()
      and p.is_banned = false
  )
);

create policy "Users can delete claims for own draft nations"
on public.nation_claims
for delete
to authenticated
using (
  exists (
    select 1
    from public.nations n
    join public.profiles p on p.id = n.owner_id
    where n.id = nation_claims.nation_id
      and n.status = 'draft'
      and p.user_id = auth.uid()
      and p.is_banned = false
  )
);

revoke all on public.nation_claims from anon;
revoke all on public.nation_claims from authenticated;

grant select on public.nation_claims to anon, authenticated;

grant insert (
  nation_id,
  geojson,
  claim_type,
  area_label
) on public.nation_claims to authenticated;

grant update (
  geojson,
  claim_type,
  area_label
) on public.nation_claims to authenticated;

grant delete on public.nation_claims to authenticated;
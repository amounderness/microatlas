-- MicroAtlas Phase 4 repair: ensure nation_claims table privileges are correct.

alter table public.nation_claims enable row level security;

grant select on public.nation_claims to anon, authenticated;
grant insert on public.nation_claims to authenticated;
grant update on public.nation_claims to authenticated;
grant delete on public.nation_claims to authenticated;
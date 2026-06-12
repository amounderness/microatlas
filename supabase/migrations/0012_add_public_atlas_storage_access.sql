-- MicroAtlas Phase 8: public atlas storage access.
-- Allows public visitors to view approved flag objects for approved public nations.
-- The storage bucket remains private; only approved/public flag objects are readable.

drop policy if exists "Public can view approved public flag objects" on storage.objects;

create policy "Public can view approved public flag objects"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'nation-flags'
  and exists (
    select 1
    from public.nation_assets na
    join public.nations n on n.id = na.nation_id
    where na.storage_bucket = storage.objects.bucket_id
      and na.storage_path = storage.objects.name
      and na.asset_type = 'flag'
      and na.status = 'approved'
      and n.status = 'approved'
      and n.visibility = 'public'
  )
);
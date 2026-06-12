import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import PublicAtlasMapWrapper, {
  PublicAtlasNation,
} from "@/components/map/public-atlas-map-wrapper";

const FLAG_BUCKET = "nation-flags";

export default function AtlasPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl p-8">
          <h1 className="text-3xl font-semibold">Atlas</h1>
          <p className="mt-3 text-muted-foreground">Loading approved entries...</p>
        </main>
      }
    >
      <Atlas />
    </Suspense>
  );
}

async function Atlas() {
  const supabase = await createClient();

  const { data: nations, error: nationsError } = await supabase
    .from("nations")
    .select(
      "id, name, slug, short_description, fill_colour, border_colour, fill_opacity"
    )
    .eq("status", "approved")
    .eq("visibility", "public")
    .order("name", { ascending: true });

  if (nationsError) {
    return (
      <main className="mx-auto max-w-6xl p-8">
        <h1 className="text-3xl font-semibold">Atlas</h1>
        <p className="mt-4 text-red-500">Public atlas entries could not be loaded.</p>
        <pre className="mt-4 rounded border p-4 text-sm">
          {nationsError.message}
        </pre>
      </main>
    );
  }

  const nationIds = nations?.map((nation) => nation.id) || [];

  const [{ data: claims }, { data: assets }] = await Promise.all([
    nationIds.length > 0
      ? supabase
          .from("nation_claims")
          .select("nation_id, geojson, claim_type, area_label")
          .in("nation_id", nationIds)
      : { data: [] },

    nationIds.length > 0
      ? supabase
          .from("nation_assets")
          .select("nation_id, storage_path, alt_text")
          .eq("asset_type", "flag")
          .eq("status", "approved")
          .in("nation_id", nationIds)
      : { data: [] },
  ]);

  const claimMap = new Map(
    (claims || []).map((claim) => [claim.nation_id, claim])
  );

  const assetMap = new Map(
    (assets || []).map((asset) => [asset.nation_id, asset])
  );

  const atlasNations: PublicAtlasNation[] = await Promise.all(
    (nations || []).flatMap(async (nation) => {
      const claim = claimMap.get(nation.id);

      if (!claim?.geojson) {
        return [];
      }

      const asset = assetMap.get(nation.id);

      let flagUrl: string | null = null;

      if (asset?.storage_path) {
        const { data: signedUrlData } = await supabase.storage
          .from(FLAG_BUCKET)
          .createSignedUrl(asset.storage_path, 3600);

        flagUrl = signedUrlData?.signedUrl || null;
      }

      return [
        {
          id: nation.id,
          name: nation.name,
          slug: nation.slug,
          short_description: nation.short_description,
          fill_colour: nation.fill_colour,
          border_colour: nation.border_colour,
          fill_opacity: Number(nation.fill_opacity),
          flag_url: flagUrl,
          claim: {
            geojson: claim.geojson,
            claim_type: claim.claim_type,
            area_label: claim.area_label,
          },
        },
      ];
    })
  ).then((items) => items.flat());

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-3xl font-semibold">Atlas</h1>

      <p className="mt-3 max-w-3xl text-muted-foreground">
        Browse approved MicroAtlas entries. Claims are self-declared and shown
        for registry, archival, and discovery purposes only.
      </p>

      <section className="mt-8">
        {atlasNations.length > 0 ? (
          <PublicAtlasMapWrapper nations={atlasNations} />
        ) : (
          <div className="rounded-lg border p-6 text-sm text-muted-foreground">
            No approved public nations are available yet.
          </div>
        )}
      </section>

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-medium">Approved entries</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {atlasNations.map((nation) => (
            <article key={nation.id} className="rounded-md border p-4">
              <h3 className="font-medium">{nation.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {nation.short_description}
              </p>
              <a
                href={`/nations/${nation.slug}`}
                className="mt-3 inline-block text-sm underline"
              >
                View profile
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
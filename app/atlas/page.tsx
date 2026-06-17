import Link from "next/link";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import PublicAtlasMapWrapper, {
  PublicAtlasNation,
} from "@/components/map/public-atlas-map-wrapper";

const FLAG_BUCKET = "nation-flags";
const SIGNED_FLAG_URL_SECONDS = 60 * 60;

export default function AtlasPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl p-8">
          <h1 className="font-brand text-3xl font-semibold">Atlas</h1>
          <p className="mt-3 text-muted-foreground">
            Loading approved entries...
          </p>
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
        <h1 className="font-brand text-3xl font-semibold">Atlas</h1>
        <p className="mt-4 text-destructive">
          Public atlas entries could not be loaded.
        </p>
        <pre className="mt-4 overflow-auto rounded border bg-muted p-4 text-sm">
          {nationsError.message}
        </pre>
      </main>
    );
  }

  const approvedNations = nations ?? [];
  const nationIds = approvedNations.map((nation) => nation.id);

  const claimsQuery = nationIds.length
    ? supabase
        .from("nation_claims")
        .select("nation_id, geojson, claim_type, area_label")
        .in("nation_id", nationIds)
    : Promise.resolve({ data: [], error: null });

  const assetsQuery = nationIds.length
    ? supabase
        .from("nation_assets")
        .select("nation_id, storage_path, alt_text")
        .eq("asset_type", "flag")
        .eq("status", "approved")
        .in("nation_id", nationIds)
    : Promise.resolve({ data: [], error: null });

  const [claimsResult, assetsResult] = await Promise.all([
    claimsQuery,
    assetsQuery,
  ]);

  if (claimsResult.error || assetsResult.error) {
    return (
      <main className="mx-auto max-w-6xl p-8">
        <h1 className="font-brand text-3xl font-semibold">Atlas</h1>
        <p className="mt-4 text-destructive">
          Approved entries were found, but their map data could not be loaded.
        </p>
        <pre className="mt-4 overflow-auto rounded border bg-muted p-4 text-sm">
          {claimsResult.error?.message ?? assetsResult.error?.message}
        </pre>
      </main>
    );
  }

  const claimMap = new Map(
    (claimsResult.data || []).map((claim) => [claim.nation_id, claim])
  );

  const assetMap = new Map(
    (assetsResult.data || []).map((asset) => [asset.nation_id, asset])
  );

  const atlasNations: PublicAtlasNation[] = [];

  for (const nation of approvedNations) {
    const claim = claimMap.get(nation.id);

    if (!claim?.geojson) {
      continue;
    }

    const asset = assetMap.get(nation.id);
    let flagUrl: string | null = null;

    if (asset?.storage_path) {
      const { data: signedUrlData } = await supabase.storage
        .from(FLAG_BUCKET)
        .createSignedUrl(asset.storage_path, SIGNED_FLAG_URL_SECONDS);

      flagUrl = signedUrlData?.signedUrl || null;
    }

    const fillOpacity = Number(nation.fill_opacity);

    atlasNations.push({
      id: nation.id,
      name: nation.name,
      slug: nation.slug,
      short_description: nation.short_description,
      fill_colour: nation.fill_colour,
      border_colour: nation.border_colour,
      fill_opacity: Number.isFinite(fillOpacity) ? fillOpacity : 0.35,
      flag_url: flagUrl,
      claim: {
        geojson: claim.geojson,
        claim_type: claim.claim_type,
        area_label: claim.area_label,
      },
    });
  }

  const entryLabel = atlasNations.length === 1 ? "entry" : "entries";

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Public atlas
        </p>
        <h1 className="font-brand mt-3 text-4xl font-semibold tracking-tight">
          Atlas
        </h1>

        <p className="mt-3 text-muted-foreground">
          Browse approved MicroAtlas entries. Claims are self-declared and shown
          for registry, archival, and discovery purposes only.
        </p>
      </div>

      <section className="mt-8" aria-label="Approved public atlas map">
        {atlasNations.length > 0 ? (
          <div className="microatlas-map-frame rounded-lg border bg-card">
            <PublicAtlasMapWrapper nations={atlasNations} />
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
            No approved public nations are available yet.
          </div>
        )}
      </section>

      {atlasNations.length > 0 ? (
        <section className="mt-8 rounded-lg border bg-card p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-medium">Approved entries</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {atlasNations.length} approved public {entryLabel} currently shown
                on the atlas.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {atlasNations.map((nation) => (
              <article
                key={nation.id}
                className="rounded-md border bg-background p-4"
              >
                <h3 className="font-medium">{nation.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {nation.short_description}
                </p>
                <Link
                  href={`/nations/${nation.slug}`}
                  className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
                >
                  View profile
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

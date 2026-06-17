import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import NationClaimPreviewWrapper from "@/components/map/nation-claim-preview-wrapper";
import NationReportForm from "@/components/nation-report-form";

const FLAG_BUCKET = "nation-flags";
const SIGNED_FLAG_URL_SECONDS = 60 * 60;

type NationProfilePageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    reported?: string;
    report_error?: string;
  }>;
};

export default function NationProfilePage(props: NationProfilePageProps) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-5xl p-8">
          <h1 className="font-brand text-2xl font-semibold">
            Loading nation profile...
          </h1>
        </main>
      }
    >
      <NationProfile {...props} />
    </Suspense>
  );
}

async function NationProfile({ params, searchParams }: NationProfilePageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const supabase = await createClient();

  const { data: nation, error: nationError } = await supabase
    .from("nations")
    .select(
      "id, name, slug, short_description, long_description, capital, founded_date, website_url, creator_public, contact_public, fill_colour, border_colour, fill_opacity, owner_id"
    )
    .eq("slug", slug)
    .eq("status", "approved")
    .eq("visibility", "public")
    .single();

  if (nationError || !nation) {
    notFound();
  }

  const claimQuery = supabase
    .from("nation_claims")
    .select("geojson, claim_type, area_label")
    .eq("nation_id", nation.id)
    .maybeSingle();

  const flagAssetQuery = supabase
    .from("nation_assets")
    .select("storage_path, alt_text")
    .eq("nation_id", nation.id)
    .eq("asset_type", "flag")
    .eq("status", "approved")
    .maybeSingle();

  const ownerQuery =
    nation.creator_public || nation.contact_public
      ? supabase
          .from("profiles")
          .select("username, display_name, public_email_enabled, public_email")
          .eq("id", nation.owner_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null });

  const [claimResult, flagAssetResult, ownerResult] = await Promise.all([
    claimQuery,
    flagAssetQuery,
    ownerQuery,
  ]);

  const claim = claimResult.data;
  const flagAsset = flagAssetResult.data;
  const owner = ownerResult.data;

  let flagUrl: string | null = null;

  if (flagAsset?.storage_path) {
    const { data: signedUrlData } = await supabase.storage
      .from(FLAG_BUCKET)
      .createSignedUrl(flagAsset.storage_path, SIGNED_FLAG_URL_SECONDS);

    flagUrl = signedUrlData?.signedUrl || null;
  }

  const fillOpacity = Number(nation.fill_opacity);
  const safeFillOpacity = Number.isFinite(fillOpacity) ? fillOpacity : 0.35;

  return (
    <main className="mx-auto max-w-5xl p-8">
      <Link
        href="/atlas"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        ← Back to atlas
      </Link>

      {query?.reported ? (
        <div className="mt-6 rounded-md border bg-card p-4 text-sm">
          Report submitted. A moderator will review it.
        </div>
      ) : null}

      {query?.report_error ? (
        <div className="mt-6 rounded-md border border-destructive p-4 text-sm text-destructive">
          {query.report_error}
        </div>
      ) : null}

      <section className="mt-6 rounded-lg border bg-card p-6">
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          {flagUrl ? (
            <div className="relative h-36 overflow-hidden rounded-md border bg-muted">
              <Image
                src={flagUrl}
                alt={flagAsset?.alt_text || `${nation.name} flag`}
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          ) : (
            <div className="flex h-36 items-center justify-center rounded-md border text-sm text-muted-foreground">
              No approved flag
            </div>
          )}

          <div>
            <h1 className="font-brand text-4xl font-semibold tracking-tight">
              {nation.name}
            </h1>
            <p className="mt-3 text-muted-foreground">
              {nation.short_description}
            </p>

            <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
              <div>
                <dt className="font-medium">Capital / headquarters</dt>
                <dd className="text-muted-foreground">
                  {nation.capital || "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="font-medium">Founded</dt>
                <dd className="text-muted-foreground">
                  {nation.founded_date || "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="font-medium">Website</dt>
                <dd className="text-muted-foreground">
                  {nation.website_url ? (
                    <a
                      href={nation.website_url}
                      rel="noreferrer"
                      target="_blank"
                      className="underline underline-offset-4"
                    >
                      Visit website
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </dd>
              </div>

              {nation.creator_public ? (
                <div>
                  <dt className="font-medium">Creator</dt>
                  <dd className="text-muted-foreground">
                    {owner?.display_name || owner?.username || "Not provided"}
                  </dd>
                </div>
              ) : null}

              {nation.contact_public && owner?.public_email_enabled ? (
                <div>
                  <dt className="font-medium">Public contact</dt>
                  <dd className="text-muted-foreground">
                    {owner.public_email || "Not provided"}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>
      </section>

      {nation.long_description ? (
        <section className="mt-8 rounded-lg border bg-card p-6">
          <h2 className="text-xl font-medium">Profile</h2>
          <p className="mt-4 whitespace-pre-wrap text-muted-foreground">
            {nation.long_description}
          </p>
        </section>
      ) : null}

      <section className="mt-8 rounded-lg border bg-card p-6">
        <h2 className="text-xl font-medium">Mapped claim</h2>

        {claim?.geojson ? (
          <div className="mt-4 space-y-4">
            <div className="microatlas-map-frame rounded-lg border bg-background">
              <NationClaimPreviewWrapper
                geojson={claim.geojson}
                fillColour={nation.fill_colour}
                borderColour={nation.border_colour}
                fillOpacity={safeFillOpacity}
              />
            </div>

            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium">Claim type</dt>
                <dd className="capitalize text-muted-foreground">
                  {claim.claim_type.replaceAll("_", " ")}
                </dd>
              </div>

              <div>
                <dt className="font-medium">Area label</dt>
                <dd className="text-muted-foreground">
                  {claim.area_label || "Not provided"}
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No approved map claim is available.
          </p>
        )}
      </section>

      <section className="mt-8 rounded-lg border bg-card p-6">
        <h2 className="text-xl font-medium">Report this entry</h2>

        <p className="mt-3 text-sm text-muted-foreground">
          Reports are reviewed by moderators. Use this for spam, abuse, privacy
          concerns, impersonation, suspicious links, or other serious issues.
        </p>

        <NationReportForm nationId={nation.id} slug={nation.slug} />
      </section>
    </main>
  );
}

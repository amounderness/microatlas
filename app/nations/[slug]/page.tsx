import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import NationClaimPreviewWrapper from "@/components/map/nation-claim-preview-wrapper";
import { submitNationReport } from "./actions";

const FLAG_BUCKET = "nation-flags";

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
          <h1 className="text-2xl font-semibold">Loading nation profile...</h1>
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

  const [{ data: claim }, { data: flagAsset }, { data: owner }] =
    await Promise.all([
      supabase
        .from("nation_claims")
        .select("geojson, claim_type, area_label")
        .eq("nation_id", nation.id)
        .maybeSingle(),

      supabase
        .from("nation_assets")
        .select("storage_path, alt_text")
        .eq("nation_id", nation.id)
        .eq("asset_type", "flag")
        .eq("status", "approved")
        .maybeSingle(),

      nation.creator_public || nation.contact_public
        ? supabase
            .from("profiles")
            .select("username, display_name, public_email_enabled, public_email")
            .eq("id", nation.owner_id)
            .maybeSingle()
        : { data: null },
    ]);

  let flagUrl: string | null = null;

  if (flagAsset?.storage_path) {
    const { data: signedUrlData } = await supabase.storage
      .from(FLAG_BUCKET)
      .createSignedUrl(flagAsset.storage_path, 3600);

    flagUrl = signedUrlData?.signedUrl || null;
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <Link href="/atlas" className="text-sm text-muted-foreground">
        ← Back to atlas
      </Link>

      {query?.reported ? (
        <div className="mt-6 rounded-md border p-4 text-sm">
           Report submitted. A moderator will review it.
       </div>
      ) : null}

      {query?.report_error ? (
        <div className="mt-6 rounded-md border border-red-500 p-4 text-sm text-red-500">
          {query.report_error}
        </div>
      ) : null}

      <section className="mt-6 rounded-lg border p-6">
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
            <h1 className="text-3xl font-semibold">{nation.name}</h1>
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
                      className="underline"
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
        <section className="mt-8 rounded-lg border p-6">
          <h2 className="text-xl font-medium">Profile</h2>
          <p className="mt-4 whitespace-pre-wrap text-muted-foreground">
            {nation.long_description}
          </p>
        </section>
      ) : null}

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-medium">Mapped claim</h2>

        {claim?.geojson ? (
          <div className="mt-4 space-y-4">
            <NationClaimPreviewWrapper
              geojson={claim.geojson}
              fillColour={nation.fill_colour}
              borderColour={nation.border_colour}
              fillOpacity={Number(nation.fill_opacity)}
            />

            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium">Claim type</dt>
                <dd className="text-muted-foreground">
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

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-medium">Report this entry</h2>

        <p className="mt-3 text-sm text-muted-foreground">
          Reports are reviewed by moderators. Use this for spam, abuse, privacy
          concerns, impersonation, suspicious links, or other serious issues.
        </p>

        <form action={submitNationReport} className="mt-5 space-y-5">
          <input type="hidden" name="target_id" value={nation.id} />
          <input type="hidden" name="slug" value={nation.slug} />
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          <input type="hidden" name="loaded_at" value={Date.now()} />

          <div>
            <label htmlFor="report-reason" className="block text-sm font-medium">
              Reason
            </label>

            <select
              id="report-reason"
              name="reason"
              required
              className="mt-2 w-full rounded-md border bg-background px-3 py-2"
            >
              <option value="">Select a reason</option>
              <option value="spam">Spam</option>
              <option value="abuse_or_harassment">Abuse or harassment</option>
              <option value="privacy_or_personal_information">
                Privacy or personal information
              </option>
              <option value="extremist_or_hateful_content">
                Extremist or hateful content
              </option>
              <option value="impersonation">Impersonation</option>
              <option value="pornographic_or_shock_content">
                Pornographic or shock content
              </option>
              <option value="malware_or_suspicious_link">
                Malware or suspicious link
              </option>
              <option value="disruptive_or_excessive_claim">
                Disruptive or excessive claim
              </option>
              <option value="low_effort_or_nonsense">
                Low-effort or nonsense entry
              </option>
              <option value="other">Other</option>
            </select>
          </div>   
          <div>
            <label htmlFor="report-details" className="block text-sm font-medium">
              Details
            </label>

            <textarea
              id="report-details"
              name="details"
              rows={5}
              className="mt-2 w-full rounded-md border bg-background px-3 py-2"
              placeholder="Add any context that may help moderators review this report."
            />
          </div>

          <button
            type="submit"
            className="rounded-md border px-4 py-2 text-sm font-medium"
          >
            Submit report
          </button>
        </form>
      </section>
    </main>
  );
}
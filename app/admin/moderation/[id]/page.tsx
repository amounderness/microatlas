import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import NationClaimPreviewWrapper from "@/components/map/nation-claim-preview-wrapper";
import { reviewNationSubmission } from "../actions";

const FLAG_BUCKET = "nation-flags";

type ModerationDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    reviewed?: string;
  }>;
};

export default function ModerationDetailPage(props: ModerationDetailPageProps) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-5xl p-8">
          <h1 className="text-2xl font-semibold">Loading submission...</h1>
        </main>
      }
    >
      <ModerationDetail {...props} />
    </Suspense>
  );
}

async function ModerationDetail({
  params,
  searchParams,
}: ModerationDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    !["moderator", "admin"].includes(profile.role)
  ) {
    redirect("/dashboard");
  }

  const { data: queueItem, error: queueError } = await supabase
    .from("moderation_queue")
    .select("id, target_id, status, moderator_notes, created_at, reviewed_at")
    .eq("id", id)
    .eq("target_type", "nation")
    .single();

  if (queueError || !queueItem) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <Link href="/admin/moderation" className="text-sm text-muted-foreground">
          ← Back to moderation queue
        </Link>

        <h1 className="mt-4 text-2xl font-semibold">Submission not found</h1>
      </main>
    );
  }

  const { data: nation, error: nationError } = await supabase
    .from("nations")
    .select(
      "id, name, slug, short_description, long_description, capital, founded_date, website_url, status, visibility, creator_public, contact_public, fill_colour, border_colour, fill_opacity, owner_id, updated_at"
    )
    .eq("id", queueItem.target_id)
    .single();

  if (nationError || !nation) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <Link href="/admin/moderation" className="text-sm text-muted-foreground">
          ← Back to moderation queue
        </Link>

        <h1 className="mt-4 text-2xl font-semibold">Nation not found</h1>
      </main>
    );
  }

  const [{ data: owner }, { data: claim }, { data: flagAsset }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("username, display_name, public_email_enabled, public_email")
        .eq("id", nation.owner_id)
        .single(),

      supabase
        .from("nation_claims")
        .select("geojson, area_label, claim_type")
        .eq("nation_id", nation.id)
        .maybeSingle(),

      supabase
        .from("nation_assets")
        .select(
          "storage_path, original_filename, mime_type, size_bytes, alt_text, status"
        )
        .eq("nation_id", nation.id)
        .eq("asset_type", "flag")
        .maybeSingle(),
    ]);

  let signedImageUrl: string | null = null;

  if (flagAsset?.storage_path) {
    const { data: signedUrlData } = await supabase.storage
      .from(FLAG_BUCKET)
      .createSignedUrl(flagAsset.storage_path, 600);

    signedImageUrl = signedUrlData?.signedUrl || null;
  }

  const canReview = queueItem.status === "pending";

  return (
    <main className="mx-auto max-w-5xl p-8">
      <Link href="/admin/moderation" className="text-sm text-muted-foreground">
        ← Back to moderation queue
      </Link>

      <h1 className="mt-4 text-3xl font-semibold">Review Submission</h1>

      <p className="mt-3 text-muted-foreground">
        Inspect the submitted nation, claim, and flag before making a moderation
        decision.
      </p>

      {query?.error ? (
        <div className="mt-6 rounded-md border border-red-500 p-4 text-sm text-red-500">
          {query.error}
        </div>
      ) : null}

      {query?.reviewed ? (
        <div className="mt-6 rounded-md border p-4 text-sm">
          Review decision saved.
        </div>
      ) : null}

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-medium">{nation.name}</h2>

        <dl className="mt-5 space-y-3 text-sm">
          <div>
            <dt className="font-medium">Queue status</dt>
            <dd className="text-muted-foreground">{queueItem.status}</dd>
          </div>

          <div>
            <dt className="font-medium">Nation status</dt>
            <dd className="text-muted-foreground">{nation.status}</dd>
          </div>

          <div>
            <dt className="font-medium">Visibility</dt>
            <dd className="text-muted-foreground">{nation.visibility}</dd>
          </div>

          <div>
            <dt className="font-medium">Creator</dt>
            <dd className="text-muted-foreground">
              {owner?.display_name || owner?.username || "Unknown profile"}
            </dd>
          </div>

          <div>
            <dt className="font-medium">Short description</dt>
            <dd className="text-muted-foreground">{nation.short_description}</dd>
          </div>

          <div>
            <dt className="font-medium">Long description</dt>
            <dd className="whitespace-pre-wrap text-muted-foreground">
              {nation.long_description || "Not provided"}
            </dd>
          </div>

          <div>
            <dt className="font-medium">Capital/headquarters</dt>
            <dd className="text-muted-foreground">
              {nation.capital || "Not provided"}
            </dd>
          </div>

          <div>
            <dt className="font-medium">Founded date</dt>
            <dd className="text-muted-foreground">
              {nation.founded_date || "Not provided"}
            </dd>
          </div>

          <div>
            <dt className="font-medium">Website</dt>
            <dd className="text-muted-foreground">
              {nation.website_url || "Not provided"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-medium">Map claim</h2>

        {claim?.geojson ? (
          <div className="mt-4 space-y-4">
            <NationClaimPreviewWrapper
              geojson={claim.geojson}
              fillColour={nation.fill_colour}
              borderColour={nation.border_colour}
              fillOpacity={Number(nation.fill_opacity)}
            />

            <p className="text-sm text-muted-foreground">
              Area label: {claim.area_label || "Not provided"}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-red-500">No map claim found.</p>
        )}
      </section>

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-medium">Flag</h2>

        {flagAsset && signedImageUrl ? (
          <div className="mt-4 space-y-4">
            <div className="relative h-48 w-full max-w-md overflow-hidden rounded-md border bg-muted">
              <Image
                src={signedImageUrl}
                alt={flagAsset.alt_text}
                fill
                unoptimized
                className="object-contain"
              />
            </div>

            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium">Filename</dt>
                <dd className="text-muted-foreground">
                  {flagAsset.original_filename || "Not recorded"}
                </dd>
              </div>

              <div>
                <dt className="font-medium">MIME type</dt>
                <dd className="text-muted-foreground">{flagAsset.mime_type}</dd>
              </div>

              <div>
                <dt className="font-medium">Size</dt>
                <dd className="text-muted-foreground">
                  {Math.round(flagAsset.size_bytes / 1024)} KB
                </dd>
              </div>

              <div>
                <dt className="font-medium">Status</dt>
                <dd className="text-muted-foreground">{flagAsset.status}</dd>
              </div>

              <div>
                <dt className="font-medium">Alt text</dt>
                <dd className="text-muted-foreground">{flagAsset.alt_text}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <p className="mt-3 text-sm text-red-500">No flag found.</p>
        )}
      </section>

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-medium">Decision</h2>

        {queueItem.moderator_notes ? (
          <div className="mt-4 rounded-md border p-4 text-sm">
            <p className="font-medium">Previous moderation notes</p>
            <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
              {queueItem.moderator_notes}
            </p>
          </div>
        ) : null}

        {canReview ? (
          <form action={reviewNationSubmission} className="mt-6 space-y-6">
            <input type="hidden" name="queue_id" value={queueItem.id} />

            <div>
              <label htmlFor="notes" className="block text-sm font-medium">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={5}
                className="mt-2 w-full rounded-md border bg-background px-3 py-2"
                placeholder="Required in practice for requested changes or rejection."
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                name="decision"
                value="approved"
                className="rounded-md border px-4 py-2 text-sm font-medium"
              >
                Approve
              </button>

              <button
                type="submit"
                name="decision"
                value="needs_changes"
                className="rounded-md border px-4 py-2 text-sm font-medium"
              >
                Request changes
              </button>

              <button
                type="submit"
                name="decision"
                value="rejected"
                className="rounded-md border px-4 py-2 text-sm font-medium text-red-500"
              >
                Reject
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            This item has already been reviewed.
          </p>
        )}
      </section>
    </main>
  );
}
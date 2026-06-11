import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { deleteNationFlag, uploadNationFlag } from "./actions";

const FLAG_BUCKET = "nation-flags";

type FlagPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    saved?: string;
    deleted?: string;
  }>;
};

export default function NationFlagPage(props: FlagPageProps) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-4xl p-8">
          <h1 className="text-2xl font-semibold">Loading flag upload...</h1>
        </main>
      }
    >
      <NationFlagContent {...props} />
    </Suspense>
  );
}

async function NationFlagContent({ params, searchParams }: FlagPageProps) {
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
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/dashboard");
  }

  const { data: nation, error: nationError } = await supabase
    .from("nations")
    .select("id, name, status")
    .eq("id", id)
    .eq("owner_id", profile.id)
    .single();

  if (nationError || !nation) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <Link href="/dashboard/nations" className="text-sm text-muted-foreground">
          ← Back to my nations
        </Link>

        <h1 className="mt-4 text-2xl font-semibold">Nation not found</h1>
        <p className="mt-3 text-muted-foreground">
          This draft does not exist, or you do not have permission to edit it.
        </p>
      </main>
    );
  }

  if (nation.status !== "draft") {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <Link
          href={`/dashboard/nations/${nation.id}/edit`}
          className="text-sm text-muted-foreground"
        >
          ← Back to nation
        </Link>

        <h1 className="mt-4 text-2xl font-semibold">Flag locked</h1>
        <p className="mt-3 text-muted-foreground">
          Only draft nations can have their flag edited.
        </p>
      </main>
    );
  }

  const { data: asset, error: assetError } = await supabase
    .from("nation_assets")
    .select(
      "id, storage_path, original_filename, mime_type, size_bytes, alt_text, status, updated_at"
    )
    .eq("nation_id", nation.id)
    .eq("asset_type", "flag")
    .maybeSingle();

  if (assetError) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <h1 className="text-2xl font-semibold">Flag upload</h1>
        <p className="mt-4 text-red-500">Flag asset could not be loaded.</p>
        <pre className="mt-4 rounded border p-4 text-sm">
          {assetError.message}
        </pre>
      </main>
    );
  }

  let signedImageUrl: string | null = null;

  if (asset?.storage_path) {
    const { data: signedUrlData } = await supabase.storage
      .from(FLAG_BUCKET)
      .createSignedUrl(asset.storage_path, 600);

    signedImageUrl = signedUrlData?.signedUrl || null;
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <Link
        href={`/dashboard/nations/${nation.id}/edit`}
        className="text-sm text-muted-foreground"
      >
        ← Back to nation
      </Link>

      <h1 className="mt-4 text-3xl font-semibold">Flag Upload</h1>

      <p className="mt-3 text-muted-foreground">
        Upload one pending flag image for {nation.name}. This remains private
        until later moderation and publication features are built.
      </p>

      {query?.error ? (
        <div className="mt-6 rounded-md border border-red-500 p-4 text-sm text-red-500">
          {query.error}
        </div>
      ) : null}

      {query?.saved ? (
        <div className="mt-6 rounded-md border p-4 text-sm">
          Flag saved.
        </div>
      ) : null}

      {query?.deleted ? (
        <div className="mt-6 rounded-md border p-4 text-sm">
          Flag deleted.
        </div>
      ) : null}

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-medium">Current flag</h2>

        {asset && signedImageUrl ? (
          <div className="mt-4 space-y-4">
            <div className="relative h-48 w-full max-w-md overflow-hidden rounded-md border bg-muted">
              <Image
                src={signedImageUrl}
                alt={asset.alt_text}
                fill
                unoptimized
                className="object-contain"
              />
            </div>

            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium">Filename</dt>
                <dd className="text-muted-foreground">
                  {asset.original_filename || "Not recorded"}
                </dd>
              </div>

              <div>
                <dt className="font-medium">MIME type</dt>
                <dd className="text-muted-foreground">{asset.mime_type}</dd>
              </div>

              <div>
                <dt className="font-medium">Size</dt>
                <dd className="text-muted-foreground">
                  {Math.round(asset.size_bytes / 1024)} KB
                </dd>
              </div>

              <div>
                <dt className="font-medium">Status</dt>
                <dd className="text-muted-foreground">{asset.status}</dd>
              </div>

              <div>
                <dt className="font-medium">Alt text</dt>
                <dd className="text-muted-foreground">{asset.alt_text}</dd>
              </div>
            </dl>

            <form action={deleteNationFlag}>
              <input type="hidden" name="nation_id" value={nation.id} />

              <button
                type="submit"
                className="rounded-md border px-4 py-2 text-sm font-medium text-red-500"
              >
                Delete flag
              </button>
            </form>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No flag has been uploaded yet.
          </p>
        )}
      </section>

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-medium">
          {asset ? "Replace flag" : "Upload flag"}
        </h2>

        <form action={uploadNationFlag} className="mt-6 space-y-6">
          <input type="hidden" name="nation_id" value={nation.id} />

          <div>
            <label htmlFor="flag" className="block text-sm font-medium">
              Flag image
            </label>
            <input
              id="flag"
              name="flag"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              required
              className="mt-2 w-full rounded-md border bg-background px-3 py-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              PNG, JPG/JPEG, or WebP. Maximum 5MB. SVG is intentionally excluded
              from the MVP.
            </p>
          </div>

          <div>
            <label htmlFor="alt_text" className="block text-sm font-medium">
              Alt text
            </label>
            <input
              id="alt_text"
              name="alt_text"
              required
              minLength={5}
              defaultValue={asset?.alt_text || ""}
              placeholder="e.g. Flag of Exampleland"
              className="mt-2 w-full rounded-md border bg-background px-3 py-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Required for accessibility and future moderation review.
            </p>
          </div>

          <button
            type="submit"
            className="rounded-md border px-4 py-2 text-sm font-medium"
          >
            {asset ? "Replace flag" : "Upload flag"}
          </button>
        </form>
      </section>
    </main>
  );
}
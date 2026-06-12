import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import NationClaimEditorWrapper from "@/components/map/nation-claim-editor-wrapper";
import { deleteNationClaim, saveNationClaim } from "./actions";

type ClaimPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    saved?: string;
    deleted?: string;
  }>;
};

export default function NationClaimPage(props: ClaimPageProps) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-5xl p-8">
          <h1 className="text-2xl font-semibold">Loading map claim...</h1>
        </main>
      }
    >
      <NationClaimContent {...props} />
    </Suspense>
  );
}

async function NationClaimContent({ params, searchParams }: ClaimPageProps) {
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
    .select(
      "id, name, status, fill_colour, border_colour, fill_opacity"
    )
    .eq("id", id)
    .eq("owner_id", profile.id)
    .single();

  if (nationError || !nation) {
    return (
      <main className="mx-auto max-w-5xl p-8">
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

  if (!["draft", "needs_changes"].includes(nation.status)) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <Link
          href={`/dashboard/nations/${nation.id}/edit`}
          className="text-sm text-muted-foreground"
        >
          ← Back to nation
        </Link>

        <h1 className="mt-4 text-2xl font-semibold">Claim locked</h1>
        <p className="mt-3 text-muted-foreground">
          Only draft or needs-changes nations can have their map claim edited.
        </p>
      </main>
    );
  }

  const { data: claim, error: claimError } = await supabase
    .from("nation_claims")
    .select("geojson, area_label")
    .eq("nation_id", nation.id)
    .maybeSingle();

  if (claimError) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="text-2xl font-semibold">Map claim</h1>
        <p className="mt-4 text-red-500">Claim could not be loaded.</p>
        <pre className="mt-4 rounded border p-4 text-sm">
          {claimError.message}
        </pre>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <Link
        href={`/dashboard/nations/${nation.id}/edit`}
        className="text-sm text-muted-foreground"
      >
        ← Back to nation
      </Link>

      <h1 className="mt-4 text-3xl font-semibold">Map Claim</h1>

      <p className="mt-3 text-muted-foreground">
        Draw one primary polygon claim for {nation.name}. This remains private
        while the nation is still a draft.
      </p>

      {query?.error ? (
        <div className="mt-6 rounded-md border border-red-500 p-4 text-sm text-red-500">
          {query.error}
        </div>
      ) : null}

      {query?.saved ? (
        <div className="mt-6 rounded-md border p-4 text-sm">
          Map claim saved.
        </div>
      ) : null}

      {query?.deleted ? (
        <div className="mt-6 rounded-md border p-4 text-sm">
          Map claim deleted.
        </div>
      ) : null}

      <form action={saveNationClaim} className="mt-8 space-y-6">
        <input type="hidden" name="nation_id" value={nation.id} />

        <div>
          <label htmlFor="area_label" className="block text-sm font-medium">
            Area label
          </label>
          <input
            id="area_label"
            name="area_label"
            defaultValue={claim?.area_label || ""}
            placeholder="e.g. Cottam, Preston, Lancashire"
            className="mt-2 w-full rounded-md border bg-background px-3 py-2"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Optional human-readable description of the claim.
          </p>
        </div>

        <NationClaimEditorWrapper
          initialGeojson={claim?.geojson || null}
          fillColour={nation.fill_colour}
          borderColour={nation.border_colour}
          fillOpacity={Number(nation.fill_opacity)}
        />

        <button
          type="submit"
          className="rounded-md border px-4 py-2 text-sm font-medium"
        >
          Save map claim
        </button>
      </form>

      <form action={deleteNationClaim} className="mt-4">
        <input type="hidden" name="nation_id" value={nation.id} />

        <button
          type="submit"
          className="rounded-md border px-4 py-2 text-sm font-medium text-red-500"
        >
          Delete saved claim
        </button>
      </form>
    </main>
  );
}
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { submitNationForReview, updateDraftNation } from "../../actions";

type EditNationPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    saved?: string;
    submitted?: string;
  }>;
};

export default function EditNationPage(props: EditNationPageProps) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl p-8">
          <h1 className="text-2xl font-semibold">Loading nation...</h1>
        </main>
      }
    >
      <EditNationForm {...props} />
    </Suspense>
  );
}

async function EditNationForm({ params, searchParams }: EditNationPageProps) {
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
        "id, name, short_description, long_description, capital, founded_date, website_url, status, visibility, creator_public, contact_public, fill_colour, border_colour, fill_opacity, updated_at"
    )
    .eq("id", id)
    .eq("owner_id", profile.id)
    .single();

  if (nationError || !nation) {
    return (
      <main className="mx-auto max-w-3xl p-8">
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

const [{ data: claim }, { data: flagAsset }, { data: queueEntry }] =
  await Promise.all([
    supabase
      .from("nation_claims")
      .select("id")
      .eq("nation_id", nation.id)
      .maybeSingle(),

    supabase
      .from("nation_assets")
      .select("id, status")
      .eq("nation_id", nation.id)
      .eq("asset_type", "flag")
      .maybeSingle(),

    supabase
      .from("moderation_queue")
      .select("id, status, created_at")
      .eq("target_type", "nation")
      .eq("target_id", nation.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

const detailsComplete =
  nation.name.trim().length >= 2 &&
  nation.short_description.trim().length >= 10;

const claimComplete = Boolean(claim?.id);
const flagComplete = Boolean(flagAsset?.id);

const isEditable =
  nation.status === "draft" || nation.status === "needs_changes";

const readyToSubmit =
  isEditable && detailsComplete && claimComplete && flagComplete;

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/dashboard/nations" className="text-sm text-muted-foreground">
        ← Back to my nations
      </Link>

      <h1 className="mt-4 text-3xl font-semibold">Edit Nation</h1>

      <p className="mt-3 text-muted-foreground">
        Status: {nation.status}. Nations can be edited while they are drafts or when
        a moderator has requested changes.
      </p>

      {query?.error ? (
        <div className="mt-6 rounded-md border border-red-500 p-4 text-sm text-red-500">
          {query.error}
        </div>
      ) : null}

      {query?.saved ? (
        <div className="mt-6 rounded-md border p-4 text-sm">
            Changes saved.
        </div>
      ) : null}

      {query?.submitted ? (
        <div className="mt-6 rounded-md border p-4 text-sm">
            Nation submitted for review.
        </div>
      ) : null}

    <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-medium">Submission readiness</h2>

        <p className="mt-2 text-sm text-muted-foreground">
            A nation can only be submitted once its details, map claim, and flag upload
            are complete.
        </p>

        <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
            <span>Details complete</span>
            <span>{detailsComplete ? "Complete" : "Incomplete"}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
             <span>Map claim added</span>
             <span>{claimComplete ? "Complete" : "Missing"}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span>Flag uploaded</span>
              <span>{flagComplete ? "Complete" : "Missing"}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
             <span>Current status</span>
             <span>{nation.status}</span>
            </div>

            {queueEntry ? (
             <div className="flex items-center justify-between gap-4">
                <span>Review queue</span>
                <span>{queueEntry.status}</span>
             </div>
         ) : null}
         </div>

         {!isEditable ? (
            <div className="mt-6 rounded-md border p-4 text-sm">
                This nation is not currently editable. Editing is only available while it is
                a draft or when a moderator has requested changes.
            </div>
         ) : null}

        {isEditable ? (
         <form action={submitNationForReview} className="mt-6">
           <input type="hidden" name="nation_id" value={nation.id} />

             <button
               type="submit"
               disabled={!readyToSubmit}
               className="rounded-md border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
              Submit for review
             </button>

             {!readyToSubmit ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Complete all readiness checks before submitting.
               </p>
              ) : null}
         </form>
        ) : null}
    </section>

      <form
        key={`${nation.id}-${nation.updated_at}`}
        action={updateDraftNation}
        className="mt-8 space-y-6"
    >       
        <input type="hidden" name="id" value={nation.id} />

        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Nation name
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={2}
            maxLength={120}
            defaultValue={nation.name}
            className="mt-2 w-full rounded-md border bg-background px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="short_description"
            className="block text-sm font-medium"
          >
            Short description
          </label>
          <textarea
            id="short_description"
            name="short_description"
            required
            minLength={10}
            maxLength={280}
            rows={3}
            defaultValue={nation.short_description}
            className="mt-2 w-full rounded-md border bg-background px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="long_description"
            className="block text-sm font-medium"
          >
            Long description
          </label>
          <textarea
            id="long_description"
            name="long_description"
            rows={6}
            defaultValue={nation.long_description || ""}
            className="mt-2 w-full rounded-md border bg-background px-3 py-2"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="capital" className="block text-sm font-medium">
              Capital or headquarters
            </label>
            <input
              id="capital"
              name="capital"
              defaultValue={nation.capital || ""}
              className="mt-2 w-full rounded-md border bg-background px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="founded_date" className="block text-sm font-medium">
              Founded date
            </label>
            <input
              id="founded_date"
              name="founded_date"
              defaultValue={nation.founded_date || ""}
              className="mt-2 w-full rounded-md border bg-background px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="website_url" className="block text-sm font-medium">
            Website
          </label>
          <input
            id="website_url"
            name="website_url"
            type="url"
            defaultValue={nation.website_url || ""}
            className="mt-2 w-full rounded-md border bg-background px-3 py-2"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <label htmlFor="fill_colour" className="block text-sm font-medium">
              Fill colour
            </label>
            <input
              id="fill_colour"
              name="fill_colour"
              type="color"
              defaultValue={nation.fill_colour}
              className="mt-2 h-10 w-full rounded-md border bg-background px-2 py-1"
            />
          </div>

          <div>
            <label
              htmlFor="border_colour"
              className="block text-sm font-medium"
            >
              Border colour
            </label>
            <input
              id="border_colour"
              name="border_colour"
              type="color"
              defaultValue={nation.border_colour}
              className="mt-2 h-10 w-full rounded-md border bg-background px-2 py-1"
            />
          </div>

          <div>
            <label htmlFor="fill_opacity" className="block text-sm font-medium">
              Fill opacity
            </label>
            <input
              id="fill_opacity"
              name="fill_opacity"
              type="number"
              min="0"
              max="1"
              step="0.05"
              defaultValue={nation.fill_opacity}
              className="mt-2 w-full rounded-md border bg-background px-3 py-2"
            />
          </div>
        </div>

        <input type="hidden" name="visibility" value="private" />

        <label className="flex items-center gap-3 text-sm">
          <input
            name="creator_public"
            type="checkbox"
            defaultChecked={Boolean(nation.creator_public)}
          />
          Show my creator profile publicly later
        </label>

        <label className="flex items-center gap-3 text-sm">
          <input
            name="contact_public"
            type="checkbox"
            defaultChecked={Boolean(nation.contact_public)}
          />
          Show public contact details later
        </label>

        <div className="flex flex-wrap gap-3">
        {isEditable ? (
            <>
             <button
               type="submit"
                className="rounded-md border px-4 py-2 text-sm font-medium"
              >
                Save changes
              </button>

              <Link
                href={`/dashboard/nations/${nation.id}/claim`}
                className="inline-block rounded-md border px-4 py-2 text-sm font-medium"
              >
                Edit map claim
              </Link>

              <Link
                href={`/dashboard/nations/${nation.id}/flag`}
                className="inline-block rounded-md border px-4 py-2 text-sm font-medium"
              >
                Upload flag
              </Link>
            </>
        ) : (
            <p className="text-sm text-muted-foreground">
               Editing controls are locked unless this nation is a draft or has been returned
               for changes.
            </p>
        )}
        </div>
      </form>
    </main>
  );
}
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { reviewNationDeletionRequest } from "../../actions";

type DeletionReviewPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    reviewed?: string;
  }>;
};

export default function DeletionReviewPage(props: DeletionReviewPageProps) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-5xl p-8">
          <h1 className="text-2xl font-semibold">
            Loading deletion request...
          </h1>
        </main>
      }
    >
      <DeletionReviewDetail {...props} />
    </Suspense>
  );
}

async function DeletionReviewDetail({
  params,
  searchParams,
}: DeletionReviewPageProps) {
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

  const { data: deletionRequest, error: requestError } = await supabase
    .from("nation_deletion_requests")
    .select(
      "id, nation_id, requested_by, reason, details, status, moderator_notes, created_at, reviewed_at"
    )
    .eq("id", id)
    .single();

  if (requestError || !deletionRequest) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <Link href="/admin/moderation" className="text-sm text-muted-foreground">
          ← Back to moderation queue
        </Link>

        <h1 className="mt-4 text-2xl font-semibold">
          Deletion request not found
        </h1>
      </main>
    );
  }

  const [{ data: nation }, { data: requester }] = await Promise.all([
    supabase
      .from("nations")
      .select(
        "id, name, short_description, long_description, status, visibility, updated_at"
      )
      .eq("id", deletionRequest.nation_id)
      .single(),

    supabase
      .from("profiles")
      .select("username, display_name, role")
      .eq("id", deletionRequest.requested_by)
      .single(),
  ]);

  const canReview = deletionRequest.status === "pending";

  return (
    <main className="mx-auto max-w-5xl p-8">
      <Link href="/admin/moderation" className="text-sm text-muted-foreground">
        ← Back to moderation queue
      </Link>

      <h1 className="mt-4 text-3xl font-semibold">
        Review Deletion Request
      </h1>

      {query?.error ? (
        <div className="mt-6 rounded-md border border-red-500 p-4 text-sm text-red-500">
          {query.error}
        </div>
      ) : null}

      {query?.reviewed ? (
        <div className="mt-6 rounded-md border p-4 text-sm">
          Deletion review decision saved.
        </div>
      ) : null}

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-medium">
          {nation?.name || "Unknown nation"}
        </h2>

        <dl className="mt-5 space-y-3 text-sm">
          <div>
            <dt className="font-medium">Nation status</dt>
            <dd className="text-muted-foreground">
              {nation?.status || "Unknown"}
            </dd>
          </div>

          <div>
            <dt className="font-medium">Visibility</dt>
            <dd className="text-muted-foreground">
              {nation?.visibility || "Unknown"}
            </dd>
          </div>

          <div>
            <dt className="font-medium">Short description</dt>
            <dd className="text-muted-foreground">
              {nation?.short_description || "No description"}
            </dd>
          </div>

          <div>
            <dt className="font-medium">Requester</dt>
            <dd className="text-muted-foreground">
              {requester?.display_name || requester?.username || "Unknown user"}
            </dd>
          </div>

          <div>
            <dt className="font-medium">Deletion request status</dt>
            <dd className="text-muted-foreground">
              {deletionRequest.status}
            </dd>
          </div>

          <div>
            <dt className="font-medium">Reason</dt>
            <dd className="text-muted-foreground">
              {deletionRequest.reason.replaceAll("_", " ")}
            </dd>
          </div>

          <div>
            <dt className="font-medium">Details</dt>
            <dd className="whitespace-pre-wrap text-muted-foreground">
              {deletionRequest.details || "No details provided"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-medium">Decision</h2>

        {canReview ? (
          <form action={reviewNationDeletionRequest} className="mt-6 space-y-6">
            <input type="hidden" name="request_id" value={deletionRequest.id} />

            <div>
              <label htmlFor="notes" className="block text-sm font-medium">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={5}
                className="mt-2 w-full rounded-md border bg-background px-3 py-2"
                placeholder="Explain the decision if needed."
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                name="decision"
                value="approved"
                className="rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-500"
              >
                Approve deletion
              </button>

              <button
                type="submit"
                name="decision"
                value="rejected"
                className="rounded-md border px-4 py-2 text-sm font-medium"
              >
                Reject deletion
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            This deletion request has already been reviewed.
          </p>
        )}
      </section>
    </main>
  );
}
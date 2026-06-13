import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  deleteOwnNation,
  requestNationDeletion,
  submitNationForReview,
  updateDraftNation,
} from "../../actions";

import AccountRestrictedNotice from "@/components/account-restricted-notice";
import { getCurrentProfile } from "@/lib/auth/profile";

type ReviewTimelineEvent = {
  event_type: string;
  action: string;
  notes: string | null;
  created_at: string;
  actor_display_name: string | null;
  actor_username: string | null;
  actor_role: string | null;
};

type EditNationPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    saved?: string;
    submitted?: string;
    deleted?: string;
    deletion_requested?: string;
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

  const { profile: currentProfile } = await getCurrentProfile();

  if (currentProfile?.is_banned) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <AccountRestrictedNotice />
      </main>
    );
  }

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

  const [
    { data: claim },
    { data: flagAsset },
    { data: queueEntry },
    { data: deletionRequest },
    { data: reviewTimeline, error: reviewTimelineError },
  ] = await Promise.all([
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
      .select("id, status, moderator_notes, created_at, reviewed_at")
      .eq("target_type", "nation")
      .eq("target_id", nation.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from("nation_deletion_requests")
      .select(
        "id, status, reason, details, moderator_notes, created_at, reviewed_at"
      )
      .eq("nation_id", nation.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase.rpc("get_nation_review_timeline", {
      p_nation_id: nation.id,
    }),
  ]);

  const canDeleteDirectly =
    nation.status === "draft" ||
    nation.status === "needs_changes" ||
    nation.status === "rejected";

  const canRequestDeletion = nation.status === "approved";

  const hasPendingDeletionRequest = deletionRequest?.status === "pending";

  const typedReviewTimeline = (reviewTimeline || []) as ReviewTimelineEvent[];

  const latestTimelineNote =
    typedReviewTimeline
      .filter(
        (event: ReviewTimelineEvent) =>
          event.notes && event.notes.trim().length > 0
      )
      .at(-1) || null;

  const latestQueueNote: ReviewTimelineEvent | null =
    queueEntry?.moderator_notes && queueEntry.moderator_notes.trim().length > 0
      ? {
          event_type: "moderation_queue",
          action: queueEntry.status,
          notes: queueEntry.moderator_notes,
          created_at: queueEntry.reviewed_at || queueEntry.created_at,
          actor_display_name: null,
          actor_username: null,
          actor_role: "Moderator",
        }
      : null;

  const latestModeratorNote = latestTimelineNote || latestQueueNote;

  const visibleReviewTimeline =
    typedReviewTimeline.length > 0
      ? typedReviewTimeline
      : latestQueueNote
        ? [latestQueueNote]
        : [];

  const detailsComplete =
    nation.name.trim().length >= 2 &&
    nation.short_description.trim().length >= 10;

  const claimComplete = Boolean(claim?.id);
  const flagComplete = Boolean(flagAsset?.id);

  const isEditable =
    nation.status === "draft" || nation.status === "needs_changes";

  const readyToSubmit =
    isEditable && detailsComplete && claimComplete && flagComplete;

  const isUnderReview = nation.status === "submitted";
  const needsChanges = nation.status === "needs_changes";
  const isApproved = nation.status === "approved";
  const isRejected = nation.status === "rejected";

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/dashboard/nations" className="text-sm text-muted-foreground">
        ← Back to my nations
      </Link>

      <h1 className="mt-4 text-3xl font-semibold">Edit Nation</h1>

      <p className="mt-3 text-muted-foreground">
        Status: {nation.status}. Nations can be edited while they are drafts or
        when a moderator has requested changes.
      </p>

      {query?.error ? (
        <div className="mt-6 rounded-md border border-red-500 p-4 text-sm text-red-500">
          {query.error}
        </div>
      ) : null}

      {query?.saved ? (
        <div className="mt-6 rounded-md border p-4 text-sm">Changes saved.</div>
      ) : null}

      {query?.submitted && nation.status === "submitted" ? (
        <div className="mt-6 rounded-md border p-4 text-sm">
          Nation submitted for review.
        </div>
      ) : null}

      {query?.deletion_requested ? (
        <div className="mt-6 rounded-md border p-4 text-sm">
          Deletion request submitted for moderation.
        </div>
      ) : null}

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-medium">Submission readiness</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          A nation can only be submitted once its details, map claim, and flag
          upload are complete.
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

        {isUnderReview ? (
          <div className="mt-6 rounded-md border p-4 text-sm">
            This nation has been submitted for review. Editing is locked while a
            moderator reviews the submission.
          </div>
        ) : null}

        {needsChanges ? (
          <div className="mt-6 rounded-md border p-4 text-sm">
            A moderator has requested changes. Editing is currently unlocked.
            Make the required updates, then resubmit the nation for review.
          </div>
        ) : null}

        {isApproved ? (
          <div className="mt-6 rounded-md border p-4 text-sm">
            This nation has been approved and is no longer editable from the
            draft workflow.
          </div>
        ) : null}

        {isRejected ? (
          <div className="mt-6 rounded-md border p-4 text-sm">
            This nation has been rejected and is no longer editable from the
            draft workflow.
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

      {reviewTimelineError ? (
        <section className="mt-8 rounded-lg border border-red-500 p-6 text-sm text-red-500">
          <h2 className="text-xl font-medium">
            Review timeline could not be loaded
          </h2>
          <p className="mt-3">{reviewTimelineError.message}</p>
        </section>
      ) : null}

      {latestModeratorNote ? (
        <section className="mt-8 rounded-lg border p-6">
          <h2 className="text-xl font-medium">Latest moderator note</h2>

          <div className="mt-4 rounded-md border p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-medium">
                {latestModeratorNote.actor_display_name ||
                  latestModeratorNote.actor_username ||
                  "Moderator"}
              </p>

              <p className="text-xs text-muted-foreground">
                {new Date(latestModeratorNote.created_at).toLocaleString(
                  "en-GB"
                )}
              </p>
            </div>

            <p className="mt-3 whitespace-pre-wrap text-muted-foreground">
              {latestModeratorNote.notes}
            </p>
          </div>
        </section>
      ) : null}

      {visibleReviewTimeline.length > 0 ? (
        <section className="mt-8 rounded-lg border p-6">
          <h2 className="text-xl font-medium">Review timeline</h2>

          <ol className="mt-5 space-y-4">
            {visibleReviewTimeline.map(
              (event: ReviewTimelineEvent, index: number) => (
                <li
                  key={`${event.action}-${event.created_at}-${index}`}
                  className="border-l pl-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-medium">
                      {event.action.replaceAll("_", " ")}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleString("en-GB")}
                    </p>
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    By{" "}
                    {event.actor_display_name ||
                      event.actor_username ||
                      event.actor_role ||
                      "System"}
                  </p>

                  {event.notes ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                      {event.notes}
                    </p>
                  ) : null}
                </li>
              )
            )}
          </ol>
        </section>
      ) : null}

      {deletionRequest ? (
        <section className="mt-8 rounded-lg border p-6">
          <h2 className="text-xl font-medium">Deletion request</h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-medium">Status</dt>
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

            {deletionRequest.details ? (
              <div>
                <dt className="font-medium">Details</dt>
                <dd className="whitespace-pre-wrap text-muted-foreground">
                  {deletionRequest.details}
                </dd>
              </div>
            ) : null}

            {deletionRequest.moderator_notes ? (
              <div>
                <dt className="font-medium">Moderator notes</dt>
                <dd className="whitespace-pre-wrap text-muted-foreground">
                  {deletionRequest.moderator_notes}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      <form
        key={`${nation.id}-${nation.updated_at}`}
        action={updateDraftNation}
        className="mt-8 space-y-6"
      >
        <input type="hidden" name="id" value={nation.id} />

        <fieldset
          disabled={!isEditable}
          className={`space-y-6 ${!isEditable ? "opacity-60" : ""}`}
        >
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
              <label
                htmlFor="founded_date"
                className="block text-sm font-medium"
              >
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
        </fieldset>

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
              Editing controls are locked while this nation is under review,
              approved, or rejected. They reopen only when a moderator requests
              changes.
            </p>
          )}
        </div>
      </form>

      <section className="mt-8 rounded-lg border border-red-500 p-6">
        <h2 className="text-xl font-medium text-red-500">Danger zone</h2>

        {canDeleteDirectly ? (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              This nation has not become an approved public record. You can
              delete it directly. This permanently removes the draft, its map
              claim, and its uploaded flag record.
            </p>

            <form action={deleteOwnNation} className="mt-5 space-y-4">
              <input type="hidden" name="nation_id" value={nation.id} />

              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  name="confirm_delete"
                  value="yes"
                  className="mt-1"
                  required
                />
                <span>
                  I understand that this will permanently delete this unapproved
                  nation.
                </span>
              </label>

              <button
                type="submit"
                className="rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-500"
              >
                Delete nation
              </button>
            </form>
          </div>
        ) : null}

        {nation.status === "submitted" ? (
          <p className="mt-4 text-sm text-muted-foreground">
            This nation is currently under review and cannot be deleted while a
            moderation decision is pending.
          </p>
        ) : null}

        {canRequestDeletion ? (
          <div className="mt-4">
            {hasPendingDeletionRequest ? (
              <p className="text-sm text-muted-foreground">
                A deletion request is already pending moderator review.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  This nation has been approved as a public record. It cannot be
                  permanently deleted directly, but you can request that it be
                  hidden from the atlas and regular public views.
                </p>

                <form action={requestNationDeletion} className="mt-5 space-y-5">
                  <input type="hidden" name="nation_id" value={nation.id} />

                  <div>
                    <label
                      htmlFor="deletion-reason"
                      className="block text-sm font-medium"
                    >
                      Reason
                    </label>
                    <select
                      id="deletion-reason"
                      name="reason"
                      required
                      className="mt-2 w-full rounded-md border bg-background px-3 py-2"
                    >
                      <option value="">Select a reason</option>
                      <option value="inactive">Inactive</option>
                      <option value="created_in_error">Created in error</option>
                      <option value="duplicate_or_replaced">
                        Duplicate or replaced
                      </option>
                      <option value="leaving_microatlas">
                        Leaving MicroAtlas
                      </option>
                      <option value="privacy_or_safety_concern">
                        Privacy or safety concern
                      </option>
                      <option value="ownership_or_representation_issue">
                        Ownership or representation issue
                      </option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="deletion-details"
                      className="block text-sm font-medium"
                    >
                      Details
                    </label>
                    <textarea
                      id="deletion-details"
                      name="details"
                      rows={5}
                      className="mt-2 w-full rounded-md border bg-background px-3 py-2"
                      placeholder="Add any context that may help a moderator review this request."
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-500"
                  >
                    Request deletion
                  </button>
                </form>
              </>
            )}
          </div>
        ) : null}

        {nation.status === "hidden" ? (
          <p className="mt-4 text-sm text-muted-foreground">
            This nation has already been hidden from regular public views.
          </p>
        ) : null}
      </section>
    </main>
  );
}

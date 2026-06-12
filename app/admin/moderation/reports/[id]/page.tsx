import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  banProfileForModeration,
  hideNationForModeration,
  restoreNationForModeration,
  reviewReport,
  unbanProfileForModeration,
} from "../../actions";

type ReportReviewPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    reviewed?: string;
    moderated?: string;
  }>;
};

export default function ReportReviewPage(props: ReportReviewPageProps) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-5xl p-8">
          <h1 className="text-2xl font-semibold">Loading report...</h1>
        </main>
      }
    >
      <ReportReviewDetail {...props} />
    </Suspense>
  );
}

async function ReportReviewDetail({
  params,
  searchParams,
}: ReportReviewPageProps) {
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

  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select(
      "id, reporter_id, target_type, target_id, reason, details, status, moderator_notes, created_at, reviewed_at"
    )
    .eq("id", id)
    .single();

  if (reportError || !report) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <Link href="/admin/moderation" className="text-sm text-muted-foreground">
          ← Back to moderation queue
        </Link>

        <h1 className="mt-4 text-2xl font-semibold">Report not found</h1>
      </main>
    );
  }

  const [{ data: nation }, { data: reporter }] = await Promise.all([
    report.target_type === "nation"
      ? supabase
          .from("nations")
          .select(
            "id, name, slug, short_description, long_description, status, visibility, owner_id, updated_at"
          )
          .eq("id", report.target_id)
          .single()
      : { data: null },

    report.reporter_id
      ? supabase
          .from("profiles")
          .select("id, username, display_name, role, is_banned")
          .eq("id", report.reporter_id)
          .maybeSingle()
      : { data: null },
  ]);

  const { data: owner } = nation?.owner_id
    ? await supabase
        .from("profiles")
        .select("id, username, display_name, role, is_banned")
        .eq("id", nation.owner_id)
        .maybeSingle()
    : { data: null };

  const canCloseReport =
    report.status === "open" || report.status === "reviewing";

  return (
    <main className="mx-auto max-w-5xl p-8">
      <Link href="/admin/moderation" className="text-sm text-muted-foreground">
        ← Back to moderation queue
      </Link>

      <h1 className="mt-4 text-3xl font-semibold">Review Report</h1>

      {query?.error ? (
        <div className="mt-6 rounded-md border border-red-500 p-4 text-sm text-red-500">
          {query.error}
        </div>
      ) : null}

      {query?.reviewed ? (
        <div className="mt-6 rounded-md border p-4 text-sm">
          Report review status saved.
        </div>
      ) : null}

      {query?.moderated ? (
        <div className="mt-6 rounded-md border p-4 text-sm">
          Moderation action saved.
        </div>
      ) : null}

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-medium">Report details</h2>

        <dl className="mt-5 space-y-3 text-sm">
          <div>
            <dt className="font-medium">Status</dt>
            <dd className="text-muted-foreground">{report.status}</dd>
          </div>

          <div>
            <dt className="font-medium">Reason</dt>
            <dd className="text-muted-foreground">
              {report.reason.replaceAll("_", " ")}
            </dd>
          </div>

          <div>
            <dt className="font-medium">Details</dt>
            <dd className="whitespace-pre-wrap text-muted-foreground">
              {report.details || "No details provided"}
            </dd>
          </div>

          <div>
            <dt className="font-medium">Reporter</dt>
            <dd className="text-muted-foreground">
              {reporter
                ? reporter.display_name || reporter.username || "Known user"
                : "Anonymous visitor"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-medium">Reported nation</h2>

        {nation ? (
          <dl className="mt-5 space-y-3 text-sm">
            <div>
              <dt className="font-medium">Name</dt>
              <dd className="text-muted-foreground">{nation.name}</dd>
            </div>

            <div>
              <dt className="font-medium">Status</dt>
              <dd className="text-muted-foreground">{nation.status}</dd>
            </div>

            <div>
              <dt className="font-medium">Visibility</dt>
              <dd className="text-muted-foreground">{nation.visibility}</dd>
            </div>

            <div>
              <dt className="font-medium">Short description</dt>
              <dd className="text-muted-foreground">
                {nation.short_description}
              </dd>
            </div>

            <div>
              <dt className="font-medium">Owner</dt>
              <dd className="text-muted-foreground">
                {owner?.display_name || owner?.username || "Unknown owner"}
                {owner?.is_banned ? " — banned" : ""}
              </dd>
            </div>

            {nation.status === "approved" ? (
              <div>
                <dt className="font-medium">Public profile</dt>
                <dd>
                  <Link href={`/nations/${nation.slug}`} className="underline">
                    View public profile
                  </Link>
                </dd>
              </div>
            ) : null}
          </dl>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Reported target could not be loaded.
          </p>
        )}
      </section>

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-medium">Report status decision</h2>

        {canCloseReport ? (
          <form action={reviewReport} className="mt-6 space-y-5">
            <input type="hidden" name="report_id" value={report.id} />

            <div>
              <label htmlFor="report-notes" className="block text-sm font-medium">
                Notes
              </label>
              <textarea
                id="report-notes"
                name="notes"
                rows={4}
                className="mt-2 w-full rounded-md border bg-background px-3 py-2"
                placeholder="Add internal notes about this report."
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                name="decision"
                value="reviewing"
                className="rounded-md border px-4 py-2 text-sm font-medium"
              >
                Mark reviewing
              </button>

              <button
                type="submit"
                name="decision"
                value="resolved"
                className="rounded-md border px-4 py-2 text-sm font-medium"
              >
                Mark resolved
              </button>

              <button
                type="submit"
                name="decision"
                value="dismissed"
                className="rounded-md border px-4 py-2 text-sm font-medium"
              >
                Dismiss report
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            This report has already been closed.
          </p>
        )}
      </section>

      {nation ? (
        <section className="mt-8 rounded-lg border border-red-500 p-6">
          <h2 className="text-xl font-medium text-red-500">
            Moderation actions
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {nation.status === "approved" ? (
              <form action={hideNationForModeration} className="space-y-4">
                <input type="hidden" name="report_id" value={report.id} />
                <input type="hidden" name="nation_id" value={nation.id} />

                <label className="block text-sm font-medium" htmlFor="hide-notes">
                  Hide nation notes
                </label>
                <textarea
                  id="hide-notes"
                  name="notes"
                  rows={4}
                  className="w-full rounded-md border bg-background px-3 py-2"
                />

                <button
                  type="submit"
                  className="rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-500"
                >
                  Hide nation
                </button>
              </form>
            ) : null}

            {nation.status === "hidden" ? (
              <form action={restoreNationForModeration} className="space-y-4">
                <input type="hidden" name="report_id" value={report.id} />
                <input type="hidden" name="nation_id" value={nation.id} />

                <label
                  className="block text-sm font-medium"
                  htmlFor="restore-notes"
                >
                  Restore nation notes
                </label>
                <textarea
                  id="restore-notes"
                  name="notes"
                  rows={4}
                  className="w-full rounded-md border bg-background px-3 py-2"
                />

                <button
                  type="submit"
                  className="rounded-md border px-4 py-2 text-sm font-medium"
                >
                  Restore nation
                </button>
              </form>
            ) : null}

            {owner && !owner.is_banned ? (
              <form action={banProfileForModeration} className="space-y-4">
                <input type="hidden" name="report_id" value={report.id} />
                <input type="hidden" name="profile_id" value={owner.id} />

                <label className="block text-sm font-medium" htmlFor="ban-notes">
                  Ban owner notes
                </label>
                <textarea
                  id="ban-notes"
                  name="notes"
                  rows={4}
                  className="w-full rounded-md border bg-background px-3 py-2"
                />

                <button
                  type="submit"
                  className="rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-500"
                >
                  Ban owner
                </button>
              </form>
            ) : null}

            {owner?.is_banned ? (
              <form action={unbanProfileForModeration} className="space-y-4">
                <input type="hidden" name="report_id" value={report.id} />
                <input type="hidden" name="profile_id" value={owner.id} />

                <label
                  className="block text-sm font-medium"
                  htmlFor="unban-notes"
                >
                  Unban owner notes
                </label>
                <textarea
                  id="unban-notes"
                  name="notes"
                  rows={4}
                  className="w-full rounded-md border bg-background px-3 py-2"
                />

                <button
                  type="submit"
                  className="rounded-md border px-4 py-2 text-sm font-medium"
                >
                  Unban owner
                </button>
              </form>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
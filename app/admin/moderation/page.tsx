import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type QueueItem = {
  id: string;
  status: string;
  created_at: string;
  target_id: string;
};

type NationSummary = {
  id: string;
  name: string;
  short_description: string;
  status: string;
  updated_at: string;
};

type DeletionRequestItem = {
  id: string;
  nation_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
};

type DeletionNationSummary = {
  id: string;
  name: string;
  short_description: string;
  status: string;
  visibility: string;
};

export default function AdminModerationPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-5xl p-8">
          <h1 className="text-2xl font-semibold">
            Loading moderation queue...
          </h1>
        </main>
      }
    >
      <ModerationQueue />
    </Suspense>
  );
}

async function ModerationQueue() {
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

  const { data: queueItems, error: queueError } = await supabase
    .from("moderation_queue")
    .select("id, status, created_at, target_id")
    .eq("target_type", "nation")
    .order("created_at", { ascending: false });

  if (queueError) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="text-2xl font-semibold">Moderation Queue</h1>
        <p className="mt-4 text-red-500">Queue could not be loaded.</p>
        <pre className="mt-4 rounded border p-4 text-sm">
          {queueError.message}
        </pre>
      </main>
    );
  }

  const typedQueueItems = (queueItems || []) as QueueItem[];
  const nationIds = typedQueueItems.map((item) => item.target_id);

  const { data: nations, error: nationsError } =
    nationIds.length > 0
      ? await supabase
          .from("nations")
          .select("id, name, short_description, status, updated_at")
          .in("id", nationIds)
      : { data: [], error: null };

  if (nationsError) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="text-2xl font-semibold">Moderation Queue</h1>
        <p className="mt-4 text-red-500">
          Submitted nations could not be loaded.
        </p>
        <pre className="mt-4 rounded border p-4 text-sm">
          {nationsError.message}
        </pre>
      </main>
    );
  }

  const nationMap = new Map(
    ((nations || []) as NationSummary[]).map((nation) => [nation.id, nation])
  );

  const pendingItems = typedQueueItems.filter(
    (item) => item.status === "pending"
  );

  const historicItems = typedQueueItems.filter(
    (item) => item.status !== "pending"
  );

  const { data: deletionRequests, error: deletionRequestsError } =
    await supabase
      .from("nation_deletion_requests")
      .select("id, nation_id, reason, details, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

  const typedDeletionRequests =
    (deletionRequests || []) as DeletionRequestItem[];

  const deletionNationIds = typedDeletionRequests.map(
    (request) => request.nation_id
  );

  const { data: deletionNations } =
    deletionNationIds.length > 0
      ? await supabase
          .from("nations")
          .select("id, name, short_description, status, visibility")
          .in("id", deletionNationIds)
      : { data: [] };

  const deletionNationMap = new Map(
    ((deletionNations || []) as DeletionNationSummary[]).map((nation) => [
      nation.id,
      nation,
    ])
  );

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-3xl font-semibold">Moderation Queue</h1>

      <p className="mt-3 text-muted-foreground">
        Review submitted nations and deletion requests before they affect the
        public atlas.
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-medium">Pending review</h2>

        <div className="mt-4 space-y-4">
          {pendingItems.length > 0 ? (
            pendingItems.map((item) => {
              const nation = nationMap.get(item.target_id);

              return (
                <article key={item.id} className="rounded-lg border p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium">
                        {nation?.name || "Unknown nation"}
                      </h3>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {nation?.short_description || "No description"}
                      </p>

                      <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
                        Queue status: {item.status}
                      </p>
                    </div>

                    <Link
                      href={`/admin/moderation/${item.id}`}
                      className="rounded-md border px-4 py-2 text-sm font-medium"
                    >
                      Review
                    </Link>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-lg border p-5 text-sm text-muted-foreground">
              No pending submissions.
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-medium">Pending deletion requests</h2>

        <div className="mt-4 space-y-4">
          {deletionRequestsError ? (
            <div className="rounded-lg border border-red-500 p-5 text-sm text-red-500">
              Deletion requests could not be loaded:{" "}
              {deletionRequestsError.message}
            </div>
          ) : typedDeletionRequests.length > 0 ? (
            typedDeletionRequests.map((request) => {
              const nation = deletionNationMap.get(request.nation_id);

              return (
                <article key={request.id} className="rounded-lg border p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium">
                        {nation?.name || "Unknown nation"}
                      </h3>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Reason: {request.reason.replaceAll("_", " ")}
                      </p>

                      <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
                        Request status: {request.status}
                      </p>
                    </div>

                    <Link
                      href={`/admin/moderation/deletions/${request.id}`}
                      className="rounded-md border px-4 py-2 text-sm font-medium"
                    >
                      Review deletion
                    </Link>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-lg border p-5 text-sm text-muted-foreground">
              No pending deletion requests.
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-medium">Recent reviewed items</h2>

        <div className="mt-4 space-y-4">
          {historicItems.length > 0 ? (
            historicItems.slice(0, 10).map((item) => {
              const nation = nationMap.get(item.target_id);

              return (
                <article
                  key={item.id}
                  className="rounded-lg border p-5 opacity-80"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium">
                        {nation?.name || "Unknown nation"}
                      </h3>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Queue status: {item.status}
                      </p>
                    </div>

                    <Link
                      href={`/admin/moderation/${item.id}`}
                      className="rounded-md border px-4 py-2 text-sm font-medium"
                    >
                      View
                    </Link>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-lg border p-5 text-sm text-muted-foreground">
              No reviewed submissions yet.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
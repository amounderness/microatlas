import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import AccountRestrictedNotice from "@/components/account-restricted-notice";
import { getCurrentProfile } from "@/lib/auth/profile";

export default function NationsPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-4xl p-8">
          <h1 className="text-2xl font-semibold">Loading nations...</h1>
        </main>
      }
    >
      <NationsContent />
    </Suspense>
  );
}

async function NationsContent() {
  const supabase = await createClient();
  const { profile: currentProfile } = await getCurrentProfile();

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
    return (
      <main className="mx-auto max-w-4xl p-8">
        <h1 className="text-2xl font-semibold">My Nations</h1>
        <p className="mt-4 text-red-500">Profile could not be loaded.</p>
      </main>
    );
  }

  const { data: nations, error: nationsError } = await supabase
    .from("nations")
    .select("id, name, slug, status, short_description, updated_at")
    .eq("owner_id", profile.id)
    .order("updated_at", { ascending: false });

  if (nationsError) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <h1 className="text-2xl font-semibold">My Nations</h1>
        <p className="mt-4 text-red-500">Nations could not be loaded.</p>
        <pre className="mt-4 rounded border p-4 text-sm">
          {nationsError.message}
        </pre>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/dashboard" className="text-sm text-muted-foreground">
            ← Back to dashboard
          </Link>
          {currentProfile?.is_banned ? (
            <div className="mb-6">
              <AccountRestrictedNotice />
            </div>
          ) : null}
          <h1 className="mt-4 text-3xl font-semibold">My Nations</h1>
          <p className="mt-3 text-muted-foreground">
            Create and manage draft micronation entries before map claims and
            flag uploads are added.
          </p>
        </div>

        {!currentProfile?.is_banned ? (
          <Link
            href="/dashboard/nations/new"
            className="rounded-md border px-4 py-2 text-sm font-medium"
          >
            Create nation
          </Link>
        ) : null}
      </div>

      <section className="mt-8 space-y-4">
        {nations && nations.length > 0 ? (
          nations.map((nation) => (
            <article key={nation.id} className="rounded-lg border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-medium">{nation.name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {nation.short_description}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
                    Status: {nation.status}
                  </p>
                </div>

                <Link
                  href={`/dashboard/nations/${nation.id}/edit`}
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  Edit
                </Link>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-medium">No nations yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first draft nation. It will remain private until later
              submission and moderation features are built.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
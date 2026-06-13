import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import AccountRestrictedNotice from "@/components/account-restricted-notice";

import { signOut } from "@/app/auth/actions";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl p-8">
          <h1 className="text-2xl font-semibold">Loading dashboard...</h1>
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
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
    .select(
      "username, display_name, bio, public_email_enabled, public_email, role, trust_level, is_banned"
    )
    .eq("user_id", user.id)
    .single();
    
  if (profileError) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-4 text-red-500">
          Profile could not be loaded. Check the profiles table and RLS policy.
        </p>
        <pre className="mt-4 rounded border p-4 text-sm">
          {profileError.message}
        </pre>
      </main>
    );
  }

  if (profile.is_banned) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <AccountRestrictedNotice />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-semibold">MicroAtlas Dashboard</h1>

      <p className="mt-3 text-muted-foreground">
        Manage your profile and your micronation submissions.
      </p>

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-medium">Profile</h2>

        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="font-medium">Account email</dt>
            <dd className="text-muted-foreground">{user.email}</dd>
          </div>

          <div>
            <dt className="font-medium">Display name</dt>
            <dd className="text-muted-foreground">
              {profile?.display_name || "Not set"}
            </dd>
          </div>

          <div>
            <dt className="font-medium">Username</dt>
            <dd className="text-muted-foreground">
              {profile?.username || "Not set"}
            </dd>
          </div>

          <div>
            <dt className="font-medium">Role</dt>
            <dd className="text-muted-foreground">{profile?.role}</dd>
          </div>

          <div>
            <dt className="font-medium">Trust level</dt>
            <dd className="text-muted-foreground">{profile?.trust_level}</dd>
          </div>
        </dl>

        <Link
          href="/dashboard/profile"
          className="mt-6 inline-block rounded-md border px-4 py-2 text-sm font-medium"
        >
          Edit profile
        </Link>

        <div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border px-4 py-2 text-sm font-medium"
            >
              Sign out
            </button>
          </form>
        </div>
        
      </section>

      <section className="mt-6 rounded-lg border p-6">
        <h2 className="text-xl font-medium">My Nations</h2>
        <p className="mt-2 text-sm text-muted-foreground">
            Create and manage private draft nation records.
        </p>

        <Link
            href="/dashboard/nations"
            className="mt-6 inline-block rounded-md border px-4 py-2 text-sm font-medium"
        >
            Manage nations
        </Link>
        </section>
    </main>
  );
}
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "./actions";

type ProfilePageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default function ProfilePage(props: ProfilePageProps) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl p-8">
          <h1 className="text-2xl font-semibold">Loading profile...</h1>
        </main>
      }
    >
      <ProfileForm {...props} />
    </Suspense>
  );
}

async function ProfileForm({ searchParams }: ProfilePageProps) {
  const params = await searchParams;
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
    .select("username, display_name, bio, public_email_enabled, public_email")
    .eq("user_id", user.id)
    .single();

  if (profileError) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold">Edit profile</h1>
        <p className="mt-4 text-red-500">
          Profile could not be loaded. Check the profiles table and RLS policy.
        </p>
        <pre className="mt-4 rounded border p-4 text-sm">
          {profileError.message}
        </pre>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/dashboard" className="text-sm text-muted-foreground">
        ← Back to dashboard
      </Link>

      <h1 className="mt-4 text-3xl font-semibold">Edit profile</h1>

      <p className="mt-3 text-muted-foreground">
        This information controls how you appear inside MicroAtlas. Your account
        email remains private unless you explicitly add and enable a public
        contact email.
      </p>

      {params?.error ? (
        <div className="mt-6 rounded-md border border-red-500 p-4 text-sm text-red-500">
          {params.error}
        </div>
      ) : null}

      <form action={updateProfile} className="mt-8 space-y-6">
        <div>
          <label htmlFor="display_name" className="block text-sm font-medium">
            Display name
          </label>
          <input
            id="display_name"
            name="display_name"
            defaultValue={profile?.display_name || ""}
            className="mt-2 w-full rounded-md border bg-background px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            name="username"
            defaultValue={profile?.username || ""}
            placeholder="letters_numbers_only"
            className="mt-2 w-full rounded-md border bg-background px-3 py-2"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            3–32 characters. Letters, numbers, and underscores only.
          </p>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={profile?.bio || ""}
            rows={5}
            className="mt-2 w-full rounded-md border bg-background px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="public_email" className="block text-sm font-medium">
            Public contact email
          </label>
          <input
            id="public_email"
            name="public_email"
            type="email"
            defaultValue={profile?.public_email || ""}
            className="mt-2 w-full rounded-md border bg-background px-3 py-2"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            This is separate from your login email.
          </p>
        </div>

        <label className="flex items-center gap-3 text-sm">
          <input
            name="public_email_enabled"
            type="checkbox"
            defaultChecked={Boolean(profile?.public_email_enabled)}
          />
          Show this contact email publicly later
        </label>

        <button
          type="submit"
          className="rounded-md border px-4 py-2 text-sm font-medium"
        >
          Save profile
        </button>
      </form>
    </main>
  );
}
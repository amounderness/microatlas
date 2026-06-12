import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export async function SiteNav() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdminOrModerator = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    isAdminOrModerator =
      profile?.role === "admin" || profile?.role === "moderator";
  }

  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-8 py-4">
        <Link href="/" className="font-semibold">
          MicroAtlas
        </Link>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/dashboard/profile">Profile</Link>
          <Link href="/dashboard/nations">My Nations</Link>

          {isAdminOrModerator ? (
            <Link href="/admin/moderation">Admin</Link>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type ProfileRole = "user" | "moderator" | "admin";

export function SiteNav() {
  const pathname = usePathname();
  const supabase = createClient();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminOrModerator, setIsAdminOrModerator] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadUserRole = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsLoggedIn(false);
      setIsAdminOrModerator(false);
      setHasLoaded(true);
      return;
    }

    setIsLoggedIn(true);

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    const role = profile?.role as ProfileRole | undefined;

    setIsAdminOrModerator(role === "admin" || role === "moderator");
    setHasLoaded(true);
  }, [supabase]);

  useEffect(() => {
    void loadUserRole();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadUserRole();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserRole, supabase]);

  useEffect(() => {
    void loadUserRole();
  }, [pathname, loadUserRole]);

  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-8 py-4">
        <Link href="/" className="font-semibold">
          MicroAtlas
        </Link>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/atlas">Atlas</Link>
          <Link href="/roadmap">Roadmap</Link>
          
          {isLoggedIn ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/dashboard/profile">Profile</Link>
              <Link href="/dashboard/nations">My Nations</Link>

              {hasLoaded && isAdminOrModerator ? (
                <Link href="/admin/moderation">Admin</Link>
              ) : null}
            </>
          ) : (
            <>
              <Link href="/auth/login">Sign in</Link>
              <Link href="/auth/sign-up">Sign up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

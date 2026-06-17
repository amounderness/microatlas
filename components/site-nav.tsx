"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandMark } from "@/components/brand/brand-mark";
import { Logo } from "@/components/brand/logo";
import { createClient } from "@/lib/supabase/client";

type ProfileRole = "user" | "moderator" | "admin";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  pathname: string;
};

function NavLink({ href, children, pathname }: NavLinkProps) {
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={[
        "rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

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
    <header className="sticky top-0 z-[2000] border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link
          href="/"
          aria-label="MicroAtlas home"
          className="flex shrink-0 items-center"
        >
          <Logo className="hidden h-12 w-auto sm:block" />
          <BrandMark className="h-11 w-11 sm:hidden" />
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <NavLink href="/atlas" pathname={pathname}>
            Atlas
          </NavLink>
          <NavLink href="/faq" pathname={pathname}>
            FAQ
          </NavLink>
          <NavLink href="/roadmap" pathname={pathname}>
            Roadmap
          </NavLink>

          {isLoggedIn ? (
            <>
              <NavLink href="/dashboard" pathname={pathname}>
                Dashboard
              </NavLink>
              <NavLink href="/dashboard/profile" pathname={pathname}>
                Profile
              </NavLink>
              <NavLink href="/dashboard/nations" pathname={pathname}>
                My Nations
              </NavLink>

              {hasLoaded && isAdminOrModerator ? (
                <NavLink href="/admin/moderation" pathname={pathname}>
                  Admin
                </NavLink>
              ) : null}
            </>
          ) : (
            <>
              <NavLink href="/auth/login" pathname={pathname}>
                Sign in
              </NavLink>
              <Link
                href="/auth/sign-up"
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
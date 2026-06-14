import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

function isPublicRoute(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/atlas" ||
    pathname.startsWith("/nations/") ||
    pathname.startsWith("/auth/")
  );
}

function isDashboardRoute(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isProtectedRoute(pathname: string) {
  return (
    isDashboardRoute(pathname) ||
    isAdminRoute(pathname) ||
    pathname === "/protected"
  );
}

function redirectWithCookies(
  request: NextRequest,
  supabaseResponse: NextResponse,
  pathname: string,
  searchParams?: Record<string, string>,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }

  const redirectResponse = NextResponse.redirect(url);

  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (!hasEnvVars) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  /*
   * Keep this immediately after createServerClient.
   * Supabase recommends avoiding logic between client creation and auth lookup,
   * otherwise session/cookie behaviour can become difficult to debug.
   */
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const pathname = request.nextUrl.pathname;

  /*
   * Public routes do not require login.
   *
   * This includes:
   * - /
   * - /atlas
   * - /nations/[slug]
   * - /auth/login
   * - /auth/sign-up
   * - /auth/confirm
   * - /auth/update-password
   * - /auth/error
   */
  if (isPublicRoute(pathname)) {
    return supabaseResponse;
  }

  /*
   * Dashboard/admin/protected routes require login.
   */
  if (!user && isProtectedRoute(pathname)) {
    return redirectWithCookies(request, supabaseResponse, "/auth/login", {
      redirectedFrom: pathname,
    });
  }

  /*
   * If logged in, check the user's profile for bans and admin permissions.
   *
   * user.sub is the Supabase Auth user id.
   */
  if (user && isProtectedRoute(pathname)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_banned")
      .eq("user_id", user.sub)
      .maybeSingle();

    /*
     * Banned users should not be able to use dashboard/admin areas.
     * Send them to dashboard so your existing restricted-account notice
     * can handle the user-facing explanation.
     */
    if (profile?.is_banned && pathname !== "/dashboard") {
      return redirectWithCookies(request, supabaseResponse, "/dashboard");
    }

    /*
     * Admin routes require moderator/admin role.
     */
    if (isAdminRoute(pathname)) {
      const isStaff =
        profile?.role === "admin" || profile?.role === "moderator";

      if (!isStaff) {
        return redirectWithCookies(request, supabaseResponse, "/dashboard");
      }
    }
  }

  return supabaseResponse;
}
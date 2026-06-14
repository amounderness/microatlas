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
  return isDashboardRoute(pathname) || isAdminRoute(pathname);
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
   * Supabase session/cookie behaviour can become difficult to debug if
   * unrelated logic is inserted before the auth lookup.
   */
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const pathname = request.nextUrl.pathname;

  /*
   * Public routes do not require login:
   * - /
   * - /atlas
   * - /nations/[slug]
   * - /auth/*
   */
  if (isPublicRoute(pathname)) {
    return supabaseResponse;
  }

  /*
   * Dashboard and admin routes require login.
   */
  if (!user && isProtectedRoute(pathname)) {
    return redirectWithCookies(request, supabaseResponse, "/auth/login", {
      redirectedFrom: pathname,
    });
  }

  /*
   * Logged-in users still need profile checks for bans and admin access.
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
     * Banned users may reach /dashboard so the app can show the
     * restricted-account notice, but they should not access deeper
     * dashboard/admin routes.
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
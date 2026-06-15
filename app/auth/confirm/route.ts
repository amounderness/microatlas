// /confirm/route.ts

import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

function getSafeNextPath(next: string | null): string {
  if (!next) {
    return "/dashboard";
  }

  // Only allow internal relative paths.
  if (!next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }

  // Do not redirect back into auth pages.
  if (next.startsWith("/auth/")) {
    return "/dashboard";
  }

  return next;
}

function redirectToAuthError(message: string): never {
  redirect(`/auth/error?error=${encodeURIComponent(message)}`);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = getSafeNextPath(searchParams.get("next"));

  const supabase = await createClient();

  /*
   * Flow 1: Supabase default PKCE confirmation URL.
   *
   * Email link goes:
   * supabase.co/auth/v1/verify?...&redirect_to=https://www.microatlas.xyz/auth/confirm
   *
   * Supabase then redirects back to:
   * /auth/confirm?code=...
   */
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      redirectToAuthError(error.message);
    }

    redirect(next);
  }

  /*
   * Flow 2: Custom TokenHash template flow.
   *
   * Email link goes directly to:
   * /auth/confirm?token_hash=...&type=email
   *
   * Keep this for future compatibility if/when you use custom SMTP/templates.
   */
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (error) {
      redirectToAuthError(error.message);
    }

    redirect(next);
  }

  redirectToAuthError("No authentication code, token hash, or type was provided");
}
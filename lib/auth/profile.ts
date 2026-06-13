import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function getCurrentProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      supabase,
      user: null,
      profile: null,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, user_id, username, display_name, role, is_banned")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    supabase,
    user,
    profile,
  };
}

export async function requireActiveProfile() {
  const { supabase, user, profile } = await getCurrentProfile();

  if (!user) {
    redirect("/auth/login");
  }

  if (!profile) {
    redirect("/dashboard/profile");
  }

  if (profile.is_banned) {
    redirect("/dashboard?restricted=1");
  }

  return {
    supabase,
    user,
    profile,
  };
}
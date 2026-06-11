"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  const usernameRaw = String(formData.get("username") || "").trim();
  const displayNameRaw = String(formData.get("display_name") || "").trim();
  const bioRaw = String(formData.get("bio") || "").trim();
  const publicEmailRaw = String(formData.get("public_email") || "").trim();
  const publicEmailEnabled = formData.get("public_email_enabled") === "on";

  const username = usernameRaw === "" ? null : usernameRaw;
  const display_name = displayNameRaw === "" ? null : displayNameRaw;
  const bio = bioRaw === "" ? null : bioRaw;
  const public_email = publicEmailRaw === "" ? null : publicEmailRaw;

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      display_name,
      bio,
      public_email_enabled: publicEmailEnabled,
      public_email,
    })
    .eq("user_id", user.id);

  if (error) {
    redirect(`/dashboard/profile?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  redirect("/dashboard");
}
"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function cleanOptionalText(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text === "" ? null : text;
}

function cleanRequiredText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function cleanOpacity(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return 0.35;
  return Math.min(1, Math.max(0, parsed));
}

async function getCurrentProfile(supabase: SupabaseServerClient) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, is_banned")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    redirect(
      `/dashboard?error=${encodeURIComponent(
        "Profile could not be loaded. Create or repair your profile first."
      )}`
    );
  }

  if (profile.is_banned) {
    redirect(
      `/dashboard?error=${encodeURIComponent(
        "This account cannot create or edit nations."
      )}`
    );
  }

  return profile;
}

export async function createDraftNation(formData: FormData) {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  const name = cleanRequiredText(formData.get("name"));
  const short_description = cleanRequiredText(formData.get("short_description"));

  if (name.length < 2) {
    redirect(
      `/dashboard/nations/new?error=${encodeURIComponent(
        "Nation name must be at least 2 characters."
      )}`
    );
  }

  if (short_description.length < 10) {
    redirect(
      `/dashboard/nations/new?error=${encodeURIComponent(
        "Short description must be at least 10 characters."
      )}`
    );
  }

  const slugBase = slugify(name) || "nation";
  const slug = `${slugBase}-${randomUUID().slice(0, 8)}`;

  const { error } = await supabase.from("nations").insert({
    owner_id: profile.id,
    name,
    slug,
    short_description,
    long_description: cleanOptionalText(formData.get("long_description")),
    capital: cleanOptionalText(formData.get("capital")),
    founded_date: cleanOptionalText(formData.get("founded_date")),
    website_url: cleanOptionalText(formData.get("website_url")),
    visibility: String(formData.get("visibility") || "private"),
    creator_public: formData.get("creator_public") === "on",
    contact_public: formData.get("contact_public") === "on",
    fill_colour: String(formData.get("fill_colour") || "#2563eb"),
    border_colour: String(formData.get("border_colour") || "#1e3a8a"),
    fill_opacity: cleanOpacity(formData.get("fill_opacity")),
  });

  if (error) {
    redirect(`/dashboard/nations/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/nations");
  redirect("/dashboard/nations");
}

export async function updateDraftNation(formData: FormData) {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  const id = cleanRequiredText(formData.get("id"));
  const name = cleanRequiredText(formData.get("name"));
  const short_description = cleanRequiredText(formData.get("short_description"));

  if (!id) {
    redirect("/dashboard/nations");
  }

  if (name.length < 2) {
    redirect(
      `/dashboard/nations/${id}/edit?error=${encodeURIComponent(
        "Nation name must be at least 2 characters."
      )}`
    );
  }

  if (short_description.length < 10) {
    redirect(
      `/dashboard/nations/${id}/edit?error=${encodeURIComponent(
        "Short description must be at least 10 characters."
      )}`
    );
  }

  const { error } = await supabase
    .from("nations")
    .update({
      name,
      short_description,
      long_description: cleanOptionalText(formData.get("long_description")),
      capital: cleanOptionalText(formData.get("capital")),
      founded_date: cleanOptionalText(formData.get("founded_date")),
      website_url: cleanOptionalText(formData.get("website_url")),
      visibility: String(formData.get("visibility") || "private"),
      creator_public: formData.get("creator_public") === "on",
      contact_public: formData.get("contact_public") === "on",
      fill_colour: String(formData.get("fill_colour") || "#2563eb"),
      border_colour: String(formData.get("border_colour") || "#1e3a8a"),
      fill_opacity: cleanOpacity(formData.get("fill_opacity")),
    })
    .eq("id", id)
    .eq("owner_id", profile.id)
    .select("id")
    .single();

  if (error) {
    redirect(
      `/dashboard/nations/${id}/edit?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/nations");
  revalidatePath(`/dashboard/nations/${id}/edit`);
  redirect("/dashboard/nations");
}
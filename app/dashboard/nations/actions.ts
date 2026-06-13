"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

import { requireActiveProfile } from "@/lib/auth/profile";

const FLAG_BUCKET = "nation-flags";

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
  await requireActiveProfile();

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
  await requireActiveProfile();
  
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
  revalidatePath(`/dashboard/nations/${id}/claim`);
  redirect(`/dashboard/nations/${id}/edit?saved=1`);
}

export async function submitNationForReview(formData: FormData) {
  await requireActiveProfile();

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  const nationId = cleanRequiredText(formData.get("nation_id"));

  if (!nationId) {
    redirect("/dashboard/nations");
  }

  const { error } = await supabase.rpc("submit_nation_for_review", {
    p_nation_id: nationId,
  });

  if (error) {
    redirect(
      `/dashboard/nations/${nationId}/edit?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/nations");
  revalidatePath(`/dashboard/nations/${nationId}/edit`);
  revalidatePath(`/dashboard/nations/${nationId}/claim`);
  revalidatePath(`/dashboard/nations/${nationId}/flag`);

  redirect(`/dashboard/nations/${nationId}/edit?submitted=1`);
}

export async function deleteOwnNation(formData: FormData) {
  await requireActiveProfile();

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  const nationId = cleanRequiredText(formData.get("nation_id"));
  const confirmDelete = formData.get("confirm_delete") === "yes";

  if (!nationId) {
    redirect("/dashboard/nations");
  }

  if (!confirmDelete) {
    redirect(
      `/dashboard/nations/${nationId}/edit?error=${encodeURIComponent(
        "You must confirm deletion before deleting this nation."
      )}`
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    redirect(
      `/dashboard/nations/${nationId}/edit?error=${encodeURIComponent(
        "Profile could not be loaded."
      )}`
    );
  }

  const { data: nation, error: nationError } = await supabase
    .from("nations")
    .select("id, owner_id, status")
    .eq("id", nationId)
    .eq("owner_id", profile.id)
    .single();

  if (nationError || !nation) {
    redirect(
      `/dashboard/nations/${nationId}/edit?error=${encodeURIComponent(
        "Nation could not be found."
      )}`
    );
  }

  if (!["draft", "needs_changes", "rejected"].includes(nation.status)) {
    redirect(
      `/dashboard/nations/${nationId}/edit?error=${encodeURIComponent(
        "Only draft, needs-changes, or rejected nations can be deleted directly."
      )}`
    );
  }

  const { data: assets } = await supabase
    .from("nation_assets")
    .select("storage_path")
    .eq("nation_id", nationId);

  const storagePaths =
    assets?.map((asset) => asset.storage_path).filter(Boolean) || [];

  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(FLAG_BUCKET)
      .remove(storagePaths);

    if (storageError) {
      redirect(
        `/dashboard/nations/${nationId}/edit?error=${encodeURIComponent(
          storageError.message
        )}`
      );
    }
  }

  const { error: deleteError } = await supabase
    .from("nations")
    .delete()
    .eq("id", nationId)
    .eq("owner_id", profile.id);

  if (deleteError) {
    redirect(
      `/dashboard/nations/${nationId}/edit?error=${encodeURIComponent(
        deleteError.message
      )}`
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/nations");

  redirect("/dashboard/nations?deleted=1");
}

export async function requestNationDeletion(formData: FormData) {
  await requireActiveProfile();

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  const nationId = cleanRequiredText(formData.get("nation_id"));
  const reason = cleanRequiredText(formData.get("reason"));
  const details = cleanRequiredText(formData.get("details"));

  if (!nationId) {
    redirect("/dashboard/nations");
  }

  const { error } = await supabase.rpc("request_nation_deletion", {
    p_nation_id: nationId,
    p_reason: reason,
    p_details: details || null,
  });

  if (error) {
    redirect(
      `/dashboard/nations/${nationId}/edit?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/nations");
  revalidatePath(`/dashboard/nations/${nationId}/edit`);

  redirect(`/dashboard/nations/${nationId}/edit?deletion_requested=1`);
}
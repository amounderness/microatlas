"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const FLAG_BUCKET = "nation-flags";
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

function cleanRequiredText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function getExtensionFromMimeType(mimeType: string) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/webp") return "webp";
  return null;
}

async function getCurrentUserAndProfile(supabase: SupabaseServerClient) {
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
    redirect("/dashboard");
  }

  if (profile.is_banned) {
    redirect("/dashboard");
  }

  return { user, profile };
}

async function getEditableDraftNation(
  supabase: SupabaseServerClient,
  nationId: string,
  profileId: string
) {
  const { data: nation, error } = await supabase
    .from("nations")
    .select("id, status")
    .eq("id", nationId)
    .eq("owner_id", profileId)
    .single();

  if (error || !nation) {
    return null;
  }

  if (!["draft", "needs_changes"].includes(nation.status)) {
  return null;
  }

  return nation;
}

export async function uploadNationFlag(formData: FormData) {
  const supabase = await createClient();
  const { user, profile } = await getCurrentUserAndProfile(supabase);

  const nationId = cleanRequiredText(formData.get("nation_id"));
  const altText = cleanRequiredText(formData.get("alt_text"));
  const fileValue = formData.get("flag");

  if (!nationId) {
    redirect("/dashboard/nations");
  }

  const nation = await getEditableDraftNation(supabase, nationId, profile.id);

  if (!nation) {
    redirect("/dashboard/nations");
  }

  if (!altText || altText.length < 5) {
    redirect(
      `/dashboard/nations/${nationId}/flag?error=${encodeURIComponent(
        "Flag alt text must be at least 5 characters."
      )}`
    );
  }

  if (!(fileValue instanceof File)) {
    redirect(
      `/dashboard/nations/${nationId}/flag?error=${encodeURIComponent(
        "Choose a flag image before uploading."
      )}`
    );
  }

  const file = fileValue;

  if (file.size <= 0) {
    redirect(
      `/dashboard/nations/${nationId}/flag?error=${encodeURIComponent(
        "The selected file is empty."
      )}`
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    redirect(
      `/dashboard/nations/${nationId}/flag?error=${encodeURIComponent(
        "Flag image must be 5MB or smaller."
      )}`
    );
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    redirect(
      `/dashboard/nations/${nationId}/flag?error=${encodeURIComponent(
        "Only PNG, JPG/JPEG, and WebP images are supported."
      )}`
    );
  }

  const extension = getExtensionFromMimeType(file.type);

  if (!extension) {
    redirect(
      `/dashboard/nations/${nationId}/flag?error=${encodeURIComponent(
        "Unsupported file type."
      )}`
    );
  }

  const { data: existingAsset } = await supabase
    .from("nation_assets")
    .select("storage_path")
    .eq("nation_id", nationId)
    .eq("asset_type", "flag")
    .maybeSingle();

  const storagePath = `${user.id}/${nationId}/flag-${randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(FLAG_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    redirect(
      `/dashboard/nations/${nationId}/flag?error=${encodeURIComponent(
        uploadError.message
      )}`
    );
  }

  const { error: assetError } = await supabase.from("nation_assets").upsert(
    {
      nation_id: nationId,
      asset_type: "flag",
      storage_bucket: FLAG_BUCKET,
      storage_path: storagePath,
      original_filename: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      alt_text: altText,
      status: "pending",
    },
    {
      onConflict: "nation_id,asset_type",
    }
  );

  if (assetError) {
    await supabase.storage.from(FLAG_BUCKET).remove([storagePath]);

    redirect(
      `/dashboard/nations/${nationId}/flag?error=${encodeURIComponent(
        assetError.message
      )}`
    );
  }

  if (existingAsset?.storage_path) {
    await supabase.storage.from(FLAG_BUCKET).remove([existingAsset.storage_path]);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/nations");
  revalidatePath(`/dashboard/nations/${nationId}/edit`);
  revalidatePath(`/dashboard/nations/${nationId}/flag`);

  redirect(`/dashboard/nations/${nationId}/flag?saved=1`);
}

export async function deleteNationFlag(formData: FormData) {
  const supabase = await createClient();
  const { profile } = await getCurrentUserAndProfile(supabase);

  const nationId = cleanRequiredText(formData.get("nation_id"));

  if (!nationId) {
    redirect("/dashboard/nations");
  }

  const nation = await getEditableDraftNation(supabase, nationId, profile.id);

  if (!nation) {
    redirect("/dashboard/nations");
  }

  const { data: asset, error: assetLoadError } = await supabase
    .from("nation_assets")
    .select("storage_path")
    .eq("nation_id", nationId)
    .eq("asset_type", "flag")
    .maybeSingle();

  if (assetLoadError) {
    redirect(
      `/dashboard/nations/${nationId}/flag?error=${encodeURIComponent(
        assetLoadError.message
      )}`
    );
  }

  if (asset?.storage_path) {
    await supabase.storage.from(FLAG_BUCKET).remove([asset.storage_path]);
  }

  const { error: deleteError } = await supabase
    .from("nation_assets")
    .delete()
    .eq("nation_id", nationId)
    .eq("asset_type", "flag");

  if (deleteError) {
    redirect(
      `/dashboard/nations/${nationId}/flag?error=${encodeURIComponent(
        deleteError.message
      )}`
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/nations");
  revalidatePath(`/dashboard/nations/${nationId}/edit`);
  revalidatePath(`/dashboard/nations/${nationId}/flag`);

  redirect(`/dashboard/nations/${nationId}/flag?deleted=1`);
}
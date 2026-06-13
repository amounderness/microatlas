"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function cleanRequiredText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

export async function submitNationReport(formData: FormData) {
  const supabase = await createClient();
  const targetId = cleanRequiredText(formData.get("target_id"));
  const slug = cleanRequiredText(formData.get("slug"));
  const reason = cleanRequiredText(formData.get("reason"));
  const details = cleanRequiredText(formData.get("details"));
  const website = cleanRequiredText(formData.get("website"));
  const loadedAt = Number(cleanRequiredText(formData.get("loaded_at")));
  const ageMs = Date.now() - loadedAt;
  

if (website || !Number.isFinite(loadedAt) || ageMs < 3000 || ageMs > 86400000) {
  redirect(`/nations/${slug}?reported=1`);
}

  if (!targetId || !slug) {
    redirect("/atlas");
  }

  const { error } = await supabase.rpc("submit_nation_report", {
    p_target_type: "nation",
    p_target_id: targetId,
    p_reason: reason,
    p_details: details || null,
  });

  if (error) {
    redirect(
      `/nations/${slug}?report_error=${encodeURIComponent(error.message)}`
    );
  }

  redirect(`/nations/${slug}?reported=1`);
}
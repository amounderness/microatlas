"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function cleanRequiredText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

export async function reviewNationSubmission(formData: FormData) {
  const supabase = await createClient();

  const queueId = cleanRequiredText(formData.get("queue_id"));
  const decision = cleanRequiredText(formData.get("decision"));
  const notes = cleanRequiredText(formData.get("notes"));

  if (!queueId) {
    redirect("/admin/moderation");
  }

  const { error } = await supabase.rpc("review_nation_submission", {
    p_queue_id: queueId,
    p_decision: decision,
    p_notes: notes || null,
  });

  if (error) {
    redirect(
      `/admin/moderation/${queueId}?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/admin/moderation");
  revalidatePath(`/admin/moderation/${queueId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/nations");

  redirect(`/admin/moderation/${queueId}?reviewed=1`);
}
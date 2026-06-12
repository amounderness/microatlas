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

export async function reviewNationDeletionRequest(formData: FormData) {
  const supabase = await createClient();

  const requestId = cleanRequiredText(formData.get("request_id"));
  const decision = cleanRequiredText(formData.get("decision"));
  const notes = cleanRequiredText(formData.get("notes"));

  if (!requestId) {
    redirect("/admin/moderation");
  }

  const { error } = await supabase.rpc("review_nation_deletion_request", {
    p_request_id: requestId,
    p_decision: decision,
    p_notes: notes || null,
  });

  if (error) {
    redirect(
      `/admin/moderation/deletions/${requestId}?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath("/admin/moderation");
  revalidatePath(`/admin/moderation/deletions/${requestId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/nations");

  redirect(`/admin/moderation/deletions/${requestId}?reviewed=1`);
}

export async function reviewReport(formData: FormData) {
  const supabase = await createClient();

  const reportId = cleanRequiredText(formData.get("report_id"));
  const decision = cleanRequiredText(formData.get("decision"));
  const notes = cleanRequiredText(formData.get("notes"));

  if (!reportId) {
    redirect("/admin/moderation");
  }

  const { error } = await supabase.rpc("review_report", {
    p_report_id: reportId,
    p_decision: decision,
    p_notes: notes || null,
  });

  if (error) {
    redirect(
      `/admin/moderation/reports/${reportId}?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath("/admin/moderation");
  revalidatePath(`/admin/moderation/reports/${reportId}`);

  redirect(`/admin/moderation/reports/${reportId}?reviewed=1`);
}

export async function hideNationForModeration(formData: FormData) {
  const supabase = await createClient();

  const reportId = cleanRequiredText(formData.get("report_id"));
  const nationId = cleanRequiredText(formData.get("nation_id"));
  const notes = cleanRequiredText(formData.get("notes"));

  if (!nationId) {
    redirect("/admin/moderation");
  }

  const { error } = await supabase.rpc("hide_nation_for_moderation", {
    p_nation_id: nationId,
    p_notes: notes || null,
  });

  if (error) {
    redirect(
      `/admin/moderation/reports/${reportId}?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath("/admin/moderation");
  revalidatePath(`/admin/moderation/reports/${reportId}`);
  revalidatePath("/atlas");

  redirect(`/admin/moderation/reports/${reportId}?moderated=1`);
}

export async function restoreNationForModeration(formData: FormData) {
  const supabase = await createClient();

  const reportId = cleanRequiredText(formData.get("report_id"));
  const nationId = cleanRequiredText(formData.get("nation_id"));
  const notes = cleanRequiredText(formData.get("notes"));

  if (!nationId) {
    redirect("/admin/moderation");
  }

  const { error } = await supabase.rpc("restore_nation_for_moderation", {
    p_nation_id: nationId,
    p_notes: notes || null,
  });

  if (error) {
    redirect(
      `/admin/moderation/reports/${reportId}?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath("/admin/moderation");
  revalidatePath(`/admin/moderation/reports/${reportId}`);
  revalidatePath("/atlas");

  redirect(`/admin/moderation/reports/${reportId}?moderated=1`);
}

export async function banProfileForModeration(formData: FormData) {
  const supabase = await createClient();

  const reportId = cleanRequiredText(formData.get("report_id"));
  const profileId = cleanRequiredText(formData.get("profile_id"));
  const notes = cleanRequiredText(formData.get("notes"));

  if (!profileId) {
    redirect("/admin/moderation");
  }

  const { error } = await supabase.rpc("ban_profile_for_moderation", {
    p_profile_id: profileId,
    p_notes: notes || null,
  });

  if (error) {
    redirect(
      `/admin/moderation/reports/${reportId}?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath("/admin/moderation");
  revalidatePath(`/admin/moderation/reports/${reportId}`);

  redirect(`/admin/moderation/reports/${reportId}?moderated=1`);
}

export async function unbanProfileForModeration(formData: FormData) {
  const supabase = await createClient();

  const reportId = cleanRequiredText(formData.get("report_id"));
  const profileId = cleanRequiredText(formData.get("profile_id"));
  const notes = cleanRequiredText(formData.get("notes"));

  if (!profileId) {
    redirect("/admin/moderation");
  }

  const { error } = await supabase.rpc("unban_profile_for_moderation", {
    p_profile_id: profileId,
    p_notes: notes || null,
  });

  if (error) {
    redirect(
      `/admin/moderation/reports/${reportId}?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath("/admin/moderation");
  revalidatePath(`/admin/moderation/reports/${reportId}`);

  redirect(`/admin/moderation/reports/${reportId}?moderated=1`);
}
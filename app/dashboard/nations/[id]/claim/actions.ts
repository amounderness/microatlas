"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type Coordinate = [number, number];

function cleanRequiredText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function validatePolygonFeature(raw: string) {
  if (!raw.trim()) {
    return { error: "Draw a polygon before saving.", geojson: null };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "The saved map shape is not valid JSON.", geojson: null };
  }

  const feature = parsed as {
    type?: unknown;
    geometry?: {
      type?: unknown;
      coordinates?: unknown;
    };
    properties?: unknown;
  };

  if (feature.type !== "Feature") {
    return { error: "The map shape must be a GeoJSON Feature.", geojson: null };
  }

  if (feature.geometry?.type !== "Polygon") {
    return { error: "Only single polygon claims are supported in the MVP.", geojson: null };
  }

  const coordinates = feature.geometry.coordinates;

  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    return { error: "The polygon has no coordinates.", geojson: null };
  }

  let pointCount = 0;

  for (const ring of coordinates) {
    if (!Array.isArray(ring) || ring.length < 4) {
      return { error: "The polygon must have at least three points.", geojson: null };
    }

    for (const point of ring) {
      if (!Array.isArray(point) || point.length < 2) {
        return { error: "The polygon contains an invalid coordinate.", geojson: null };
      }

      const [lng, lat] = point as Coordinate;

      if (!isNumber(lng) || !isNumber(lat)) {
        return { error: "The polygon contains a non-numeric coordinate.", geojson: null };
      }

      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        return { error: "The polygon contains coordinates outside world bounds.", geojson: null };
      }

      pointCount += 1;
    }
  }

  if (pointCount > 500) {
    return {
      error: "The polygon is too complex. Use fewer than 500 coordinate points.",
      geojson: null,
    };
  }

  return {
    error: null,
    geojson: {
      type: "Feature",
      properties:
        feature.properties && typeof feature.properties === "object"
          ? feature.properties
          : {},
      geometry: feature.geometry,
    },
  };
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
    redirect("/dashboard");
  }

  if (profile.is_banned) {
    redirect("/dashboard");
  }

  return profile;
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

  if (nation.status !== "draft") {
    return null;
  }

  return nation;
}

export async function saveNationClaim(formData: FormData) {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  const nationId = cleanRequiredText(formData.get("nation_id"));
  const geojsonRaw = cleanRequiredText(formData.get("geojson"));
  const areaLabelRaw = cleanRequiredText(formData.get("area_label"));

  if (!nationId) {
    redirect("/dashboard/nations");
  }

  const nation = await getEditableDraftNation(supabase, nationId, profile.id);

  if (!nation) {
    redirect("/dashboard/nations");
  }

  const validation = validatePolygonFeature(geojsonRaw);

  if (validation.error || !validation.geojson) {
    redirect(
      `/dashboard/nations/${nationId}/claim?error=${encodeURIComponent(
        validation.error || "Invalid polygon."
      )}`
    );
  }

  const { error } = await supabase.from("nation_claims").upsert(
    {
      nation_id: nationId,
      geojson: validation.geojson,
      claim_type: "primary",
      area_label: areaLabelRaw || null,
    },
    {
      onConflict: "nation_id",
    }
  );

  if (error) {
    redirect(
      `/dashboard/nations/${nationId}/claim?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath("/dashboard/nations");
  revalidatePath(`/dashboard/nations/${nationId}/edit`);
  revalidatePath(`/dashboard/nations/${nationId}/claim`);

  redirect(`/dashboard/nations/${nationId}/claim?saved=1`);
}

export async function deleteNationClaim(formData: FormData) {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  const nationId = cleanRequiredText(formData.get("nation_id"));

  if (!nationId) {
    redirect("/dashboard/nations");
  }

  const nation = await getEditableDraftNation(supabase, nationId, profile.id);

  if (!nation) {
    redirect("/dashboard/nations");
  }

  const { error } = await supabase
    .from("nation_claims")
    .delete()
    .eq("nation_id", nationId);

  if (error) {
    redirect(
      `/dashboard/nations/${nationId}/claim?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath("/dashboard/nations");
  revalidatePath(`/dashboard/nations/${nationId}/edit`);
  revalidatePath(`/dashboard/nations/${nationId}/claim`);

  redirect(`/dashboard/nations/${nationId}/claim?deleted=1`);
}
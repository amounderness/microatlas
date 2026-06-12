"use client";

import dynamic from "next/dynamic";

export type PublicAtlasNation = {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  fill_colour: string;
  border_colour: string;
  fill_opacity: number;
  flag_url: string | null;
  claim: {
    geojson: unknown;
    claim_type: string;
    area_label: string | null;
  };
};

export type PublicAtlasMapWrapperProps = {
  nations: PublicAtlasNation[];
};

const PublicAtlasMap = dynamic<PublicAtlasMapWrapperProps>(
  () => import("./public-atlas-map"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[640px] items-center justify-center rounded-lg border text-sm text-muted-foreground">
        Loading public atlas...
      </div>
    ),
  }
);

export default function PublicAtlasMapWrapper(
  props: PublicAtlasMapWrapperProps
) {
  return <PublicAtlasMap {...props} />;
}
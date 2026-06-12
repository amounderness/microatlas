"use client";

import dynamic from "next/dynamic";

export type NationClaimPreviewWrapperProps = {
  geojson: unknown;
  fillColour: string;
  borderColour: string;
  fillOpacity: number;
};

const NationClaimPreview = dynamic<NationClaimPreviewWrapperProps>(
  () => import("./nation-claim-preview"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-lg border text-sm text-muted-foreground">
        Loading claim preview...
      </div>
    ),
  }
);

export default function NationClaimPreviewWrapper(
  props: NationClaimPreviewWrapperProps
) {
  return <NationClaimPreview {...props} />;
}
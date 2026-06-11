"use client";

import dynamic from "next/dynamic";

export type NationClaimEditorWrapperProps = {
  initialGeojson: unknown | null;
  fillColour: string;
  borderColour: string;
  fillOpacity: number;
};

const NationClaimEditor = dynamic<NationClaimEditorWrapperProps>(
  () => import("./nation-claim-editor"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[520px] items-center justify-center rounded-lg border text-sm text-muted-foreground">
        Loading map editor...
      </div>
    ),
  }
);

export default function NationClaimEditorWrapper(
  props: NationClaimEditorWrapperProps
) {
  return <NationClaimEditor {...props} />;
}
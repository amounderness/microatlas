import { useEffect, useRef } from "react";
import L from "leaflet";

type NationClaimPreviewProps = {
  geojson: unknown;
  fillColour: string;
  borderColour: string;
  fillOpacity: number;
};

export default function NationClaimPreview({
  geojson,
  fillColour,
  borderColour,
  fillOpacity,
}: NationClaimPreviewProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) {
      return;
    }

    const map = L.map(mapElementRef.current, {
      center: [20, 0],
      zoom: 2,
      worldCopyJump: true,
      dragging: true,
      scrollWheelZoom: true,
    });

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const layer = L.geoJSON(geojson as GeoJSON.GeoJsonObject, {
      style: {
        color: borderColour,
        fillColor: fillColour,
        fillOpacity,
        weight: 2,
      },
    }).addTo(map);

    const bounds = layer.getBounds();

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 0);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [geojson, fillColour, borderColour, fillOpacity]);

  return (
    <div
      ref={mapElementRef}
      className="h-[420px] w-full overflow-hidden rounded-lg border"
    />
  );
}
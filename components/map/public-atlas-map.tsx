"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

import type {
  PublicAtlasMapWrapperProps,
  PublicAtlasNation,
} from "./public-atlas-map-wrapper";

function formatClaimType(value: string) {
  return value.replaceAll("_", " ");
}

function createPopupContent(nation: PublicAtlasNation) {
  const container = document.createElement("div");
  container.className = "w-64 space-y-3";

  if (nation.flag_url) {
    const image = document.createElement("img");
    image.src = nation.flag_url;
    image.alt = `${nation.name} flag`;
    image.className = "h-24 w-full rounded border object-contain";
    container.appendChild(image);
  }

  const textBlock = document.createElement("div");

  const title = document.createElement("h3");
  title.className = "font-medium";
  title.textContent = nation.name;

  const description = document.createElement("p");
  description.className = "mt-1 text-sm";
  description.textContent = nation.short_description;

  textBlock.appendChild(title);
  textBlock.appendChild(description);
  container.appendChild(textBlock);

  const claimType = document.createElement("p");
  claimType.className = "text-xs";
  claimType.textContent = `Claim type: ${formatClaimType(
    nation.claim.claim_type
  )}`;
  container.appendChild(claimType);

  if (nation.claim.area_label) {
    const area = document.createElement("p");
    area.className = "text-xs";
    area.textContent = `Area: ${nation.claim.area_label}`;
    container.appendChild(area);
  }

  const profileLink = document.createElement("a");
  profileLink.href = `/nations/${nation.slug}`;
  profileLink.className = "inline-block rounded border px-3 py-1 text-sm";
  profileLink.textContent = "View profile";
  container.appendChild(profileLink);

  return container;
}

export default function PublicAtlasMap({ nations }: PublicAtlasMapWrapperProps) {
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

    const bounds = L.latLngBounds([]);

    nations.forEach((nation) => {
      const layer = L.geoJSON(nation.claim.geojson as GeoJSON.GeoJsonObject, {
        style: {
          color: nation.border_colour,
          fillColor: nation.fill_colour,
          fillOpacity: nation.fill_opacity,
          weight: 2,
        },
      }).addTo(map);

      layer.bindPopup(createPopupContent(nation), {
        minWidth: 260,
        maxWidth: 320,
      });

      const layerBounds = layer.getBounds();

      if (layerBounds.isValid()) {
        bounds.extend(layerBounds);
      }
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 0);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [nations]);

  return (
    <div
      ref={mapElementRef}
      className="h-[640px] w-full overflow-hidden rounded-lg border"
    />
  );
}
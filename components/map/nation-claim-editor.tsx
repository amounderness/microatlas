"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet-draw";

type NationClaimEditorProps = {
  initialGeojson: unknown | null;
  fillColour: string;
  borderColour: string;
  fillOpacity: number;
};

function serialiseFeature(layer: L.Layer) {
  if ("toGeoJSON" in layer && typeof layer.toGeoJSON === "function") {
    return JSON.stringify(layer.toGeoJSON());
  }

  return "";
}

export default function NationClaimEditor({
  initialGeojson,
  fillColour,
  borderColour,
  fillOpacity,
}: NationClaimEditorProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);

  const [geojsonValue, setGeojsonValue] = useState(
    initialGeojson ? JSON.stringify(initialGeojson) : ""
  );

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) {
      return;
    }

    const map = L.map(mapElementRef.current, {
      center: [20, 0],
      zoom: 2,
      worldCopyJump: true,
    });

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const drawnItems = new L.FeatureGroup();
    drawnItemsRef.current = drawnItems;
    map.addLayer(drawnItems);

    const layerStyle = {
      color: borderColour,
      fillColor: fillColour,
      fillOpacity,
      weight: 2,
    };

    if (initialGeojson) {
      const initialLayer = L.geoJSON(initialGeojson as GeoJSON.GeoJsonObject, {
        style: layerStyle,
      });

      initialLayer.eachLayer((layer) => {
        drawnItems.addLayer(layer);
      });

      const bounds = initialLayer.getBounds();

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    }

    const drawControl = new L.Control.Draw({
        draw: {
            polygon: {
                allowIntersection: false,
                showArea: true,
                shapeOptions: layerStyle,
            },
            marker: false,
            circle: false,
            circlemarker: false,
            rectangle: false,
            polyline: false,
        },
        edit: {
            featureGroup: drawnItems,
            edit: {},
            remove: true,
        },
    });

    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (event) => {
      const drawEvent = event as L.DrawEvents.Created;
      drawnItems.clearLayers();

      const layer = drawEvent.layer;

      if (layer instanceof L.Path) {
        layer.setStyle(layerStyle);
      }

      drawnItems.addLayer(layer);
      setGeojsonValue(serialiseFeature(layer));
    });

    map.on(L.Draw.Event.EDITED, (event) => {
      const editedEvent = event as L.DrawEvents.Edited;
      let nextGeojson = "";

      editedEvent.layers.eachLayer((layer) => {
        nextGeojson = serialiseFeature(layer);
      });

      if (!nextGeojson) {
        drawnItems.eachLayer((layer) => {
          nextGeojson = serialiseFeature(layer);
        });
      }

      setGeojsonValue(nextGeojson);
    });

    map.on(L.Draw.Event.DELETED, () => {
      setGeojsonValue("");
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 0);

    return () => {
      map.remove();
      mapRef.current = null;
      drawnItemsRef.current = null;
    };
  }, [initialGeojson, fillColour, borderColour, fillOpacity]);

  return (
    <div className="space-y-3">
      <div
        ref={mapElementRef}
        className="h-[520px] w-full overflow-hidden rounded-lg border"
      />

      <textarea
        name="geojson"
        value={geojsonValue}
        readOnly
        hidden
        aria-hidden="true"
      />

      <p className="text-xs text-muted-foreground">
        Draw one polygon. Creating a new polygon will replace the previous one.
        Use the edit/delete controls on the map to adjust the saved claim.
      </p>
    </div>
  );
}
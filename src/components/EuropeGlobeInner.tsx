"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const DEFAULT_SELECTED_ISO = [
  "PL",
  "DE",
  "FR",
  "ES",
  "IT",
  "GB",
  "CZ",
  "SK",
  "AT",
  "RO",
  "SE",
  "NL",
];

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const SKY: maplibregl.SkySpecification = {
  "sky-color": "#0a2c3a",
  "horizon-color": "#1f5e72",
  "fog-color": "#06222e",
  "sky-horizon-blend": 0.6,
  "horizon-fog-blend": 0.5,
  "fog-ground-blend": 0.4,
  "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 0.9, 6, 0.3, 10, 0],
};

interface EuropeGlobeInnerProps {
  lowPerf?: boolean;
  selectedIso?: string[];
}

export default function EuropeGlobeInner({
  lowPerf = false,
  selectedIso,
}: EuropeGlobeInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isoKey = (selectedIso ?? []).join(",");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const SELECTED_ISO =
      selectedIso && selectedIso.length
        ? selectedIso.map((c) => c.toUpperCase())
        : DEFAULT_SELECTED_ISO;

    const SCALE = lowPerf ? 2.2 : 1.0;
    const fitZoom = () => {
      const rect = container.getBoundingClientRect();
      const minDim = Math.min(rect.width, rect.height) || 600;
      const dia = Math.min(SCALE * minDim, rect.height || 600);
      const z = Math.log2((dia * Math.PI) / 512);
      return Math.max(0.4, Math.min(z, 4.5));
    };

    const map = new maplibregl.Map({
      container,
      style: MAP_STYLE,
      center: [14, 30],
      zoom: fitZoom(),
      pitch: 0,
      bearing: 0,
      interactive: false,
      attributionControl: false,
      pixelRatio: lowPerf ? 1 : undefined,
    });

    map.on("style.load", () => {
      map.setProjection({ type: "globe" });
      map.setSky(SKY);

      for (const l of map.getStyle().layers ?? []) {
        if (l.type === "symbol") {
          try {
            map.removeLayer(l.id);
          } catch {
          }
        }
      }

      const layers = map.getStyle().layers ?? [];
      const firstSymbol = layers.find((l) => l.type === "symbol")?.id;
      const filter = [
        "in",
        ["get", "ISO_A2"],
        ["literal", SELECTED_ISO],
      ] as unknown as maplibregl.FilterSpecification;

      map.addSource("selected-countries", {
        type: "geojson",
        data: "/countries.geojson",
      });
      map.addLayer(
        {
          id: "selected-fill",
          type: "fill",
          source: "selected-countries",
          filter,
          paint: { "fill-color": "#59bfc8", "fill-opacity": 0.5 },
        },
        firstSymbol,
      );
      map.addLayer(
        {
          id: "selected-line",
          type: "line",
          source: "selected-countries",
          filter,
          paint: {
            "line-color": "#aef0f5",
            "line-width": 0.8,
            "line-opacity": 0.85,
          },
        },
        firstSymbol,
      );
    });

    map.on("load", () => {
      if (wrapperRef.current) wrapperRef.current.style.opacity = "1";
    });

    const ro = new ResizeObserver(() => {
      map.resize();
      map.setZoom(fitZoom());
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isoKey, lowPerf]);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: 0,
        transition: "opacity 0.5s ease-out",
      }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

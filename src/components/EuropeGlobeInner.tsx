"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Pin = {
  lat: number;
  lng: number;
  color: string;
  size: number;
  delay: number;
};

const PINS: Pin[] = [
  { lat: 52.23, lng: 21.01, color: "#b6fff0", size: 0.9, delay: 0.0 }, // Warszawa
  { lat: 52.52, lng: 13.41, color: "#4dffd2", size: 0.55, delay: 0.25 }, // Berlin
  { lat: 50.08, lng: 14.44, color: "#4dffd2", size: 0.55, delay: 0.4 }, // Praga
  { lat: 48.86, lng: 2.35, color: "#4dffd2", size: 0.55, delay: 0.55 }, // Paryż
  { lat: 51.51, lng: -0.13, color: "#4dffd2", size: 0.55, delay: 0.7 }, // Londyn
  { lat: 41.9, lng: 12.5, color: "#4dffd2", size: 0.55, delay: 0.85 }, // Rzym
  { lat: 40.42, lng: -3.7, color: "#4dffd2", size: 0.55, delay: 1.0 }, // Madryt
  { lat: 44.43, lng: 26.1, color: "#4dffd2", size: 0.55, delay: 1.15 }, // Bukareszt
  { lat: 59.33, lng: 18.07, color: "#4dffd2", size: 0.55, delay: 1.3 }, // Sztokholm
];

const MAP_STYLE = {
  version: 8 as const,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  // Globus od pierwszej klatki — bez krótkiego błysku 2D prostokąta.
  projection: { type: "globe" as const },
  sources: {
    countries: {
      type: "geojson" as const,
      data: "/countries.geojson",
    },
  },
  layers: [
    {
      id: "bg",
      type: "background" as const,
      paint: { "background-color": "#06222e" },
    },
    {
      id: "land-fill",
      type: "fill" as const,
      source: "countries",
      paint: {
        "fill-color": "#2d829c",
        "fill-opacity": 0.92,
      },
    },
    {
      id: "land-stroke",
      type: "line" as const,
      source: "countries",
      paint: {
        "line-color": "#7ed5e6",
        "line-opacity": 0.45,
        "line-width": 0.5,
      },
    },
  ],
};

function injectPinStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("europe-pin-styles")) return;
  const style = document.createElement("style");
  style.id = "europe-pin-styles";
  style.textContent = `
    @keyframes europePinPulse {
      0%, 100% { transform: scale(1); }
      50%      { transform: scale(1.06); }
    }
    @keyframes europePinGrow {
      0%   { transform: scaleY(0); opacity: 0; }
      60%  { opacity: 1; }
      100% { transform: scaleY(1); opacity: 1; }
    }
    /* MapLibre default marker styling clash: zerujemy translation defaults
       żeby anchor:'bottom' działał czysto z naszym DOM-em. */
    .europe-pin-marker {
      pointer-events: none;
    }`;
  document.head.appendChild(style);
}

function makePinElement(p: Pin): HTMLElement {
  const stemH = Math.round(34 * p.size + 14);
  const dot = Math.round(14 * p.size + 7);
  const el = document.createElement("div");
  el.className = "europe-pin-marker";
  el.style.pointerEvents = "none";
  el.innerHTML = `
    <div style="transform-origin:bottom center;opacity:0;
                animation:europePinGrow 0.7s cubic-bezier(0.34,1.56,0.64,1) ${p.delay}s both;">
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="width:${dot}px;height:${dot}px;border-radius:50%;
                    background:${p.color};
                    border:1.5px solid rgba(255,255,255,0.95);
                    box-shadow:0 0 3px #ffffff, 0 0 7px ${p.color}, 0 0 14px ${p.color}, 0 0 26px ${p.color}, 0 0 40px ${p.color}cc;
                    animation:europePinPulse 2.8s ease-in-out infinite;
                    animation-delay:${p.delay + 0.7}s;"></div>
        <div style="width:2px;height:${stemH}px;
                    background:linear-gradient(to bottom, ${p.color} 0%, ${p.color}00 100%);"></div>
      </div>
    </div>`;
  return el;
}

interface EuropeGlobeInnerProps {
  width: number;
  height: number;
}

export default function EuropeGlobeInner({
  width,
  height,
}: EuropeGlobeInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    injectPinStyles();
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE as unknown as maplibregl.StyleSpecification,
      center: [14, 28],
      zoom: 3.0,
      pitch: 0,
      bearing: 0,
      interactive: false,
      attributionControl: false,
    });

    const markers: maplibregl.Marker[] = [];

    map.on("load", () => {
      // Pokaż globus dopiero po załadowaniu — bez błysku pustego
      // prostokąta przy szybkim scrollu w dół.
      if (wrapperRef.current) wrapperRef.current.style.opacity = "1";

      // Markery — DOM piny, anchor: 'bottom' żeby tip kreski siedział
      // dokładnie w lat/lng.
      PINS.forEach((p) => {
        const el = makePinElement(p);
        const m = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([p.lng, p.lat])
          .addTo(map);
        markers.push(m);
      });
    });

    return () => {
      markers.forEach((m) => m.remove());
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        width,
        height,
        position: "relative",
        // Dekoracyjny — żeby map nie blokował scrolla na mobile.
        pointerEvents: "none",
        opacity: 0,
        transition: "opacity 0.5s ease-out",
      }}>
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

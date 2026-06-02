"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Domyślna lista krajów podświetlanych na globie (ISO_A2 z geojsona) — używana
// gdy w Sanity (homePage.globalMapCountries) nic nie wybrano.
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

// Basemapa jak w mapcn — hostowany styl wektorowy Carto "dark-matter".
const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

// Atmosfera/„kosmos" wokół globu — tony dopasowane do cyjanu sekcji (#59bfc8).
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
  // Kody ISO_A2 do podświetlenia (z Sanity). Puste/brak → lista domyślna.
  selectedIso?: string[];
}

export default function EuropeGlobeInner({
  lowPerf = false,
  selectedIso,
}: EuropeGlobeInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Stabilny string do zależności efektu — re-init mapy przy zmianie listy.
  const isoKey = (selectedIso ?? []).join(",");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const SELECTED_ISO =
      selectedIso && selectedIso.length
        ? selectedIso.map((c) => c.toUpperCase())
        : DEFAULT_SELECTED_ISO;

    // SCALE=1 → średnica globu = wysokość canvasu, więc górna krawędź globu
    // pokrywa się z górą canvasu (NIE ucina od góry). Rozmiar/pozycję steruje
    // wysoki, zsunięty w dół kontener (patrz EuropeGlobeSection); dół wystaje
    // pod viewport (ukryty).
    const SCALE = lowPerf ? 2.2 : 1.0;
    const fitZoom = () => {
      const rect = container.getBoundingClientRect();
      const minDim = Math.min(rect.width, rect.height) || 600;
      const z = Math.log2((SCALE * minDim * Math.PI) / 512);
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

    // Projekcja globu + atmosfera + podświetlenie krajów — po wczytaniu stylu.
    map.on("style.load", () => {
      map.setProjection({ type: "globe" });
      map.setSky(SKY);

      // Usuwamy wszystkie etykiety (nazwy krajów/miast = symbol layers).
      for (const l of map.getStyle().layers ?? []) {
        if (l.type === "symbol") {
          try {
            map.removeLayer(l.id);
          } catch {
            /* noop */
          }
        }
      }

      // Kraje wdrożeń: fill + obrys z geojsona.
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
      // Pokaż globus dopiero po załadowaniu — bez błysku pustego prostokąta.
      if (wrapperRef.current) wrapperRef.current.style.opacity = "1";
    });

    // Przy zmianie rozmiaru kontenera utrzymujemy glob w kadrze.
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

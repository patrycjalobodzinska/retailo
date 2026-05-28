"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Globe, { GlobeMethods } from "react-globe.gl";
import * as THREE from "three";

const COUNTRIES_URL = "/countries.geojson";

// Łuki Warszawa → wybrane stolice Europy. (na razie wyłączone)
// const ARCS_DATA = [
//   { startLat: 52.23, startLng: 21.01, endLat: 52.52, endLng: 13.41 }, // Berlin
//   { startLat: 52.23, startLng: 21.01, endLat: 48.86, endLng: 2.35 }, // Paryż
//   { startLat: 52.23, startLng: 21.01, endLat: 40.42, endLng: -3.7 }, // Madryt
//   { startLat: 52.23, startLng: 21.01, endLat: 41.9, endLng: 12.5 }, // Rzym
//   { startLat: 52.23, startLng: 21.01, endLat: 51.51, endLng: -0.13 }, // Londyn
//   { startLat: 52.23, startLng: 21.01, endLat: 59.33, endLng: 18.07 }, // Sztokholm
//   { startLat: 52.23, startLng: 21.01, endLat: 44.43, endLng: 26.1 }, // Bukareszt
//   { startLat: 52.23, startLng: 21.01, endLat: 50.08, endLng: 14.44 }, // Praga
// ] as const;

// Wystające piny — słupki w stolicach (Warszawa wyróżniona).
const PINS_DATA = [
  { lat: 52.23, lng: 21.01, color: "#b6fff0", size: 0.9, delay: 0.0 }, // Warszawa
  { lat: 52.52, lng: 13.41, color: "#4dffd2", size: 0.55, delay: 0.25 }, // Berlin
  { lat: 50.08, lng: 14.44, color: "#4dffd2", size: 0.55, delay: 0.4 }, // Praga
  { lat: 48.86, lng: 2.35, color: "#4dffd2", size: 0.55, delay: 0.55 }, // Paryż
  { lat: 51.51, lng: -0.13, color: "#4dffd2", size: 0.55, delay: 0.7 }, // Londyn
  { lat: 41.9, lng: 12.5, color: "#4dffd2", size: 0.55, delay: 0.85 }, // Rzym
  { lat: 40.42, lng: -3.7, color: "#4dffd2", size: 0.55, delay: 1.0 }, // Madryt
  { lat: 44.43, lng: 26.1, color: "#4dffd2", size: 0.55, delay: 1.15 }, // Bukareszt
  { lat: 59.33, lng: 18.07, color: "#4dffd2", size: 0.55, delay: 1.3 }, // Sztokholm
] as const;

type PinDatum = {
  lat: number;
  lng: number;
  color: string;
  size: number;
  delay: number;
};

// Keyframes dla pinów wstrzykiwane raz (markery to imperatywny DOM).
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
    }`;
  document.head.appendChild(style);
}

// Marker DOM: pionowa kreska + neonowy okrąg na górze. Minimalny puls +
// wielowarstwowa poświata (neon). Element DOM jest zawsze wyrównany do
// ekranu; tip kreski kotwiczy się w punkcie lat/lng.
function makePin(d: PinDatum) {
  injectPinStyles();
  const stemH = Math.round(34 * d.size + 14);
  const dot = Math.round(14 * d.size + 7);
  const el = document.createElement("div");
  el.style.position = "relative";
  el.style.width = "0";
  el.style.height = "0";
  el.style.pointerEvents = "none";
  el.innerHTML = `
    <div style="position:absolute;left:0;bottom:0;transform:translateX(-50%);">
      <div style="transform-origin:bottom center;opacity:0;
                  animation:europePinGrow 0.7s cubic-bezier(0.34,1.56,0.64,1) ${d.delay}s both;">
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="width:${dot}px;height:${dot}px;border-radius:50%;
                      background:${d.color};
                      border:1.5px solid rgba(255,255,255,0.95);
                      box-shadow:0 0 3px #ffffff, 0 0 7px ${d.color}, 0 0 14px ${d.color}, 0 0 26px ${d.color}, 0 0 40px ${d.color}cc;
                      animation:europePinPulse 2.8s ease-in-out infinite;
                      animation-delay:${d.delay + 0.7}s;"></div>
          <div style="width:2px;height:${stemH}px;
                      background:linear-gradient(to bottom, ${d.color} 0%, ${d.color}00 100%);"></div>
        </div>
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
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState<{ features: object[] }>({
    features: [],
  });
  const [hasWebGL, setHasWebGL] = useState(true);
  // Globus ładuje się od razu po mount sekcji — bez IO i czekania na scroll.
  // Trzy.js i tak musi się zbootstrapować, więc nie ma sensu opóźniać.
  const [isVisible, setIsVisible] = useState(true);
  // Piny renderujemy dopiero gdy globus widoczny (po fade-inie), inaczej
  // animacja `europePinGrow` leci pod przezroczystym wrapperem i kończy
  // się zanim user ją zobaczy.
  const [pinsActive, setPinsActive] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  useEffect(() => {
    if (!hasWebGL) return;
    fetch(COUNTRIES_URL)
      .then((r) => r.json())
      .then(setCountries)
      .catch(() => {});
  }, [hasWebGL]);

  const polygonsReady = countries.features.length > 0;

  useEffect(() => {
    if (!hasWebGL || !isVisible || !polygonsReady) return;
    const id = requestAnimationFrame(() => {
      const globe = globeRef.current;
      if (!globe) return;
      // Cały glob, ale wycentrowany i mocniej przybliżony na Europę.
      globe.pointOfView({ lat: 28, lng: 14, altitude: 1.55 });
      const controls = globe.controls();
      controls.enableRotate = false;
      controls.enableZoom = false;
      controls.enablePan = false;
    });
    return () => cancelAnimationFrame(id);
  }, [hasWebGL, isVisible, polygonsReady]);

  // Po fade-inie wrappera (~0.8s) montujemy piny — wtedy widać animację
  // wyrastania.
  useEffect(() => {
    if (!polygonsReady) return;
    const t = setTimeout(() => setPinsActive(true), 1000);
    return () => clearTimeout(t);
  }, [polygonsReady]);

  const globeMaterial = useMemo(() => {
    if (!hasWebGL) return undefined;
    // Ocean / tło globu.
    return new THREE.MeshPhongMaterial({
      color: "#0a2230",
      emissive: "#04141d",
      emissiveIntensity: 0.25,
      shininess: 8,
      specular: "#0e3440",
    });
  }, [hasWebGL]);

  if (!hasWebGL) {
    return (
      <div
        style={{
          width,
          height,
          borderRadius: "50%",
          background: "radial-gradient(circle, #1a1a1a 0%, #0a0a0a 70%)",
        }}
      />
    );
  }

  return (
    <div
      ref={wrapRef}
      style={{
        opacity: isVisible && polygonsReady ? 1 : 0,
        transition: "opacity 0.8s ease-out",
        // Dekoracyjny — bez tego OrbitControls przechwytuje dotyk i blokuje
        // scroll strony na mobile.
        pointerEvents: "none",
      }}>
      {isVisible ? (
        <Globe
          ref={globeRef}
          width={width}
          height={height}
          backgroundColor="rgba(0,0,0,0)"
          globeMaterial={globeMaterial}
          showAtmosphere={false}
          animateIn={false}
          // Kontynenty zakolorowane, granice państw widoczne w tle.
          polygonsData={countries.features}
          polygonCapColor={() => "rgba(45, 130, 156, 0.92)"}
          polygonSideColor={() => "rgba(10, 45, 60, 0.85)"}
          polygonStrokeColor={() => "rgba(126, 213, 230, 0.45)"}
          polygonAltitude={0.008}
          polygonsTransitionDuration={0}
          htmlElementsData={
            pinsActive ? (PINS_DATA as unknown as object[]) : []
          }
          htmlLat={(d) => (d as { lat: number }).lat}
          htmlLng={(d) => (d as { lng: number }).lng}
          htmlAltitude={0.005}
          htmlElement={(d) => makePin(d as PinDatum)}
        />
      ) : (
        <div
          style={{
            width,
            height,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 30%, #1a2a30 0%, #0a0f12 45%, #050505 100%)",
          }}
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Globe, { GlobeMethods } from "react-globe.gl";
import * as THREE from "three";

const COUNTRIES_URL = "/countries.geojson";

const ARCS_DATA = [
  { startLat: 52.23, startLng: 21.01, endLat: 52.52, endLng: 13.41 },
  { startLat: 52.23, startLng: 21.01, endLat: 50.08, endLng: 14.44 },
  { startLat: 52.23, startLng: 21.01, endLat: 48.15, endLng: 17.11 },
  { startLat: 52.23, startLng: 21.01, endLat: 48.21, endLng: 16.37 },
  { startLat: 52.23, startLng: 21.01, endLat: 48.86, endLng: 2.35 },
  { startLat: 52.23, startLng: 21.01, endLat: 40.42, endLng: -3.7 },
  { startLat: 52.23, startLng: 21.01, endLat: 41.9, endLng: 12.5 },
  { startLat: 52.23, startLng: 21.01, endLat: 44.43, endLng: 26.1 },
  { startLat: 52.23, startLng: 21.01, endLat: 59.33, endLng: 18.07 },
  { startLat: 52.23, startLng: 21.01, endLat: 52.37, endLng: 4.9 },
  { startLat: 52.23, startLng: 21.01, endLat: 51.51, endLng: -0.13 },
  { startLat: 52.23, startLng: 21.01, endLat: 47.5, endLng: 19.04 },
];

interface GlobeInnerProps {
  width: number;
  height: number;
}

export default function GlobeInner({ width, height }: GlobeInnerProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState<{ features: object[] }>({ features: [] });
  const [hasWebGL, setHasWebGL] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { rootMargin: "1500px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
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
      globe.pointOfView({ lat: 25, lng: 15, altitude: 1.6 });
      const controls = globe.controls();
      controls.enableRotate = false;
      controls.enableZoom = false;
      controls.enablePan = false;
    });
    return () => cancelAnimationFrame(id);
  }, [hasWebGL, isVisible, polygonsReady]);

  const globeMaterial = useMemo(() => {
    if (!hasWebGL) return undefined;
    return new THREE.MeshPhongMaterial({
      color: "#04080c",
      emissive: "#000000",
      emissiveIntensity: 0,
      shininess: 12,
      specular: "#061018",
    });
  }, [hasWebGL]);

  if (!hasWebGL) {
    return <div style={{ width, height, borderRadius: "50%", background: "radial-gradient(circle, #1a1a1a 0%, #0a0a0a 70%)" }} />;
  }

  return (
    <div
      ref={wrapRef}
      style={{
        opacity: isVisible && polygonsReady ? 1 : 0,
        transition: "opacity 0.8s ease-out",
        // Globus jest dekoracyjny (kontrolki wyłączone). Bez tego
        // OrbitControls przechwytuje dotyk na mobile i blokuje scroll
        // strony nad obszarem globusa.
        pointerEvents: "none",
      }}>

      {isVisible ? (
        <Globe
          ref={globeRef}
          width={width}
          height={height}
          backgroundColor="rgba(0,0,0,0)"
          globeMaterial={globeMaterial}
          showAtmosphere={true}
          atmosphereColor="#141c22"
          atmosphereAltitude={0.09}
          animateIn={false}
          polygonsData={countries.features}
          polygonCapColor={() => "rgba(32, 95, 118, 0.88)"}
          polygonSideColor={() => "rgba(14, 52, 64, 0.92)"}
          polygonStrokeColor={() => "rgba(90, 190, 205, 0.55)"}
          polygonAltitude={0.004}
          polygonsTransitionDuration={0}
          arcsData={ARCS_DATA}
          arcColor={() => ["rgba(130, 235, 245, 0.95)", "rgba(59, 191, 200, 0.55)"]}
          arcStroke={0.48}
          arcAltitudeAutoScale={0.38}
          arcDashLength={0.65}
          arcDashGap={0.18}
          arcDashAnimateTime={2200}
        />
      ) : (
        <div
          style={{
            width,
            height,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 30%, #1a2a30 0%, #0a0f12 45%, #050505 100%)",
          }}
        />
      )}
    </div>
  );
}

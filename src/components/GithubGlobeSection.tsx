"use client";

import dynamic from "next/dynamic";
import type { GlobeConfig } from "@/components/ui/globe";

const World = dynamic(
  () => import("@/components/ui/globe").then((m) => m.World),
  { ssr: false },
);

const WARSAW = { lat: 52.23, lng: 21.01 };

const CAPITALS: { lat: number; lng: number; alt: number }[] = [
  { lat: 52.52, lng: 13.41, alt: 0.12 }, // Berlin
  { lat: 50.08, lng: 14.44, alt: 0.1 }, // Praga
  { lat: 48.15, lng: 17.11, alt: 0.1 }, // Bratysława
  { lat: 48.21, lng: 16.37, alt: 0.12 }, // Wiedeń
  { lat: 48.86, lng: 2.35, alt: 0.2 }, // Paryż
  { lat: 40.42, lng: -3.7, alt: 0.3 }, // Madryt
  { lat: 41.9, lng: 12.5, alt: 0.22 }, // Rzym
  { lat: 44.43, lng: 26.1, alt: 0.18 }, // Bukareszt
  { lat: 59.33, lng: 18.07, alt: 0.16 }, // Sztokholm
  { lat: 52.37, lng: 4.9, alt: 0.16 }, // Amsterdam
  { lat: 51.51, lng: -0.13, alt: 0.22 }, // Londyn
  { lat: 47.5, lng: 19.04, alt: 0.1 }, // Budapeszt
];

const ARC_COLORS = ["#7ed5e6", "#59bfc8", "#82ebf5"];

const globeConfig: GlobeConfig = {
  pointSize: 2,
  globeColor: "#0a2c3c",
  showAtmosphere: true,
  atmosphereColor: "#59bfc8",
  atmosphereAltitude: 0.1,
  emissive: "#04141d",
  emissiveIntensity: 0.15,
  shininess: 0.9,
  polygonColor: "rgba(126,213,230,0.6)",
  ambientLight: "#59bfc8",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  pointLight: "#7ed5e6",
  arcTime: 1600,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  initialPosition: { lat: WARSAW.lat, lng: WARSAW.lng },
  autoRotate: true,
  autoRotateSpeed: 0.6,
};

const sampleArcs = CAPITALS.map((c, i) => ({
  order: (i % 6) + 1,
  startLat: WARSAW.lat,
  startLng: WARSAW.lng,
  endLat: c.lat,
  endLng: c.lng,
  arcAlt: c.alt,
  color: ARC_COLORS[i % ARC_COLORS.length],
}));

export default function GithubGlobeSection() {
  return (
    <section
      className="relative w-full overflow-hidden flex flex-col items-center px-[5vw] py-20"
      style={{
        background: "linear-gradient(180deg, #154D6D 0%, #000000 100%)",
      }}>
      <p
        className="flex items-center gap-4 text-white/80 tracking-wide m-0 mb-3 max-md:gap-2 max-md:flex-wrap max-md:justify-center"
        style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.5rem)" }}>
        Wdrozenia w calej Europie
        <span
          className="block w-[60px] h-px"
          style={{ background: "rgba(89,191,200,0.3)" }}
        />
        &#9992;
      </p>
      <h2
        className="m-0 mb-8 text-center font-black text-white"
        style={{
          fontSize: "clamp(1.8rem, 5vw, 3.4rem)",
          letterSpacing: "-0.03em",
        }}>
        Dzialamy globalnie
      </h2>

      <div className="relative w-full max-w-[640px] aspect-square">
        {/* Maska u dołu — zlewa globus z czarnym tłem sekcji */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/3"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, #000000 92%)",
          }}
        />
        <World globeConfig={globeConfig} data={sampleArcs} />
      </div>
    </section>
  );
}

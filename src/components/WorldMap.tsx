"use client";

import { useMemo, useRef } from "react";
import { motion } from "motion/react";
import DottedMap from "dotted-map";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
  dotColor?: string;
  backgroundColor?: string;
}

// Dotted world map (SVG, brak webgl). Łuki bezier między parami lat/lng,
// punkty pulsują. Wariant dostosowany do sekcji Global (ciemne tło).
//
// Zoom na Europę: kontener z `overflow:hidden` o proporcjach Europy.
// Wewnątrz inner wrapper o proporcjach całego świata (2:1) jest
// powiększony i przesunięty tak, że fragment Europy wypełnia
// kontener. Mapa-tło i SVG z łukami żyją w tym wewnętrznym wrapperze
// w pełnej skali świata (viewBox 800×400, kropki r=2 itd.) — dlatego
// łuki/kropki mają oryginalny rozmiar wizualny.
//
// Europa w equirectangular projection (lng -15..40, lat 35..70):
//   x: 367..489 (W=122), y: 44..122 (H=78)
const EU_X = 367;
const EU_Y = 44;
const EU_W = 122;
const EU_H = 78;
const WORLD_W = 800;
const WORLD_H = 400;
const SCALE = WORLD_W / EU_W; // ≈ 6.56 — ile razy inner > container
const INNER_W_PCT = SCALE * 100; // ≈ 656%
const INNER_LEFT_PCT = -(EU_X / WORLD_W) * INNER_W_PCT; // ≈ -301%
const INNER_TOP_PCT = -(EU_Y / EU_H) * 100; // ≈ -56.4%

export function WorldMap({
  dots = [],
  lineColor = "#7ed5e6",
  dotColor = "#FFFFFF35",
  backgroundColor = "transparent",
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const svgMap = useMemo(() => {
    const map = new DottedMap({ height: 100, grid: "diagonal" });
    return map.getSVG({
      radius: 0.22,
      color: dotColor,
      shape: "circle",
      backgroundColor,
    });
  }, [dotColor, backgroundColor]);

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (WORLD_W / 360);
    const y = (90 - lat) * (WORLD_H / 180);
    return { x, y };
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number },
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  return (
    <div
      className="w-full relative font-sans overflow-hidden"
      style={{ background: backgroundColor, aspectRatio: `${EU_W} / ${EU_H}` }}>
      {/* Inner wrapper o proporcjach świata (2:1), powiększony tak,
          żeby Europa wypełniała kontener. */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          width: `${INNER_W_PCT}%`,
          aspectRatio: "2 / 1",
          left: `${INNER_LEFT_PCT}%`,
          top: `${INNER_TOP_PCT}%`,
          maskImage:
            "linear-gradient(to bottom, transparent, white 10%, white 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, white 10%, white 90%, transparent)",
        }}>
        <img
          src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
          alt="world map"
          draggable={false}
          className="absolute inset-0 w-full h-full"
        />
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full">
          {dots.map((dot, i) => {
            const startPoint = projectPoint(dot.start.lat, dot.start.lng);
            const endPoint = projectPoint(dot.end.lat, dot.end.lng);
            return (
              <g key={`path-group-${i}`}>
                <motion.path
                  d={createCurvedPath(startPoint, endPoint)}
                  fill="none"
                  stroke="url(#path-gradient)"
                  strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 1,
                    delay: 0.5 * i,
                    ease: "easeOut",
                  }}
                />
              </g>
            );
          })}

          <defs>
            <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
              <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>

          {dots.map((dot, i) => (
            <g key={`points-group-${i}`}>
              <g key={`start-${i}`}>
                <circle
                  cx={projectPoint(dot.start.lat, dot.start.lng).x}
                  cy={projectPoint(dot.start.lat, dot.start.lng).y}
                  r="2"
                  fill={lineColor}
                />
                <circle
                  cx={projectPoint(dot.start.lat, dot.start.lng).x}
                  cy={projectPoint(dot.start.lat, dot.start.lng).y}
                  r="2"
                  fill={lineColor}
                  opacity="0.5">
                  <animate
                    attributeName="r"
                    from="2"
                    to="8"
                    dur="1.5s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.5"
                    to="0"
                    dur="1.5s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
              <g key={`end-${i}`}>
                <circle
                  cx={projectPoint(dot.end.lat, dot.end.lng).x}
                  cy={projectPoint(dot.end.lat, dot.end.lng).y}
                  r="2"
                  fill={lineColor}
                />
                <circle
                  cx={projectPoint(dot.end.lat, dot.end.lng).x}
                  cy={projectPoint(dot.end.lat, dot.end.lng).y}
                  r="2"
                  fill={lineColor}
                  opacity="0.5">
                  <animate
                    attributeName="r"
                    from="2"
                    to="8"
                    dur="1.5s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.5"
                    to="0"
                    dur="1.5s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export default WorldMap;

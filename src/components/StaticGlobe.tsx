import { STATIC_GLOBE } from "@/lib/staticGlobeData";

/**
 * Lekki, STATYCZNY glob (SVG) na mobile — bez WebGL. Rysuje realne lądy +
 * podświetlone kraje (projekcja ortograficzna), z prekompilowanych ścieżek
 * (scripts/gen-static-globe.mjs). Wypełnia kontener (absolute inset-0); svg
 * przyklejony do góry kontenera, wyśrodkowany, powiększony.
 */
export default function StaticGlobe() {
  const G = STATIC_GLOBE;
  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
      <svg
        viewBox={`0 0 ${G.size} ${G.size}`}
        className="w-[min(320vw,1200px)]"
        style={{
          position: "absolute",
          left: "57%",
          top: 0,
          transform: "translateX(-50%)",
          height: "auto",
          filter: "drop-shadow(0 0 40px rgba(89,191,200,0.32))",
        }}>
        <defs>
          <radialGradient id="sg-ocean" cx="38%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#1d5566" />
            <stop offset="45%" stopColor="#0e3b49" />
            <stop offset="100%" stopColor="#062029" />
          </radialGradient>
          <radialGradient id="sg-limb" cx="50%" cy="50%" r="50%">
            <stop offset="58%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
          </radialGradient>
        </defs>
        {/* Ocean / kula */}
        <circle cx={G.cx} cy={G.cy} r={G.r} fill="url(#sg-ocean)" />
        {/* Lądy */}
        <path d={G.land} fill="#2a6072" fillOpacity={0.55} />
        {/* Kraje wdrożeń */}
        <path
          d={G.highlight}
          fill="#59bfc8"
          fillOpacity={0.55}
          stroke="#aef0f5"
          strokeWidth={1.3}
          strokeOpacity={0.7}
        />
        {/* Przyciemnienie brzegu (efekt kuli) */}
        <circle cx={G.cx} cy={G.cy} r={G.r} fill="url(#sg-limb)" />
      </svg>
    </div>
  );
}

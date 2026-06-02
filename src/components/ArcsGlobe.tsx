"use client";

// Globus WebGL (react-globe.gl) z rysującymi się łukami Warszawa → stolice
// Europy. Mierzy własny (kwadratowy) kontener i podaje wymiary do GlobeInner,
// bo react-globe.gl wymaga rozmiaru w pikselach. Używany na mobile.

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const GlobeInner = dynamic(() => import("./GlobeInner"), { ssr: false });

export default function ArcsGlobe() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize(el.clientWidth));
    ro.observe(el);
    setSize(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full max-w-[460px] aspect-square">
      {size > 0 && <GlobeInner width={size} height={size} />}
    </div>
  );
}

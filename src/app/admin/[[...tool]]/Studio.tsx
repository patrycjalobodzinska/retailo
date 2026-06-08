"use client";

import dynamic from "next/dynamic";

const StudioClient = dynamic(() => import("./StudioClient"), { ssr: false });

export function Studio() {
  return <StudioClient />;
}

export default Studio;

"use client";

/**
 * Kliencki wrapper Studia. Ładuje właściwy render dynamicznie z ssr:false —
 * sanity/@sanity-ui wołają createContext i sięgają po `window` na poziomie
 * modułu, więc nie mogą wykonać się na serwerze.
 */
import dynamic from "next/dynamic";

const StudioClient = dynamic(() => import("./StudioClient"), { ssr: false });

export function Studio() {
  return <StudioClient />;
}

export default Studio;

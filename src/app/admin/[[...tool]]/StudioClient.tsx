/**
 * Faktyczny render Studia — ładowany wyłącznie po stronie klienta
 * (przez next/dynamic ssr:false w Studio.tsx), więc NextStudio i sanity.config
 * nigdy nie są ewaluowane na serwerze (gdzie nie istnieje `window`).
 */
import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export default function StudioClient() {
  return <NextStudio config={config} />;
}

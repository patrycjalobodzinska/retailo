import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import QASection from "@/components/QASection";
import { getHomePage, type HomePage } from "@/lib/sanity/fetch";

// Below-the-fold sections — heavy GSAP / ScrollTrigger / WebGL work that
// blocks initial hydration if eager-imported alongside the hero. Lazy
// loading them lets the hero animation kick off as soon as React hydrates
// the small set of above-the-fold components.
const ProductShowcase = dynamic(() => import("@/components/ProductShowcase"));
const RealizationsSection = dynamic(
  () => import("@/components/RealizationsSection"),
);
const RealizationsTabsSection = dynamic(
  () => import("@/components/RealizationsTabsSection"),
);
const GlobalSection = dynamic(() => import("@/components/GlobalSection"));
const Footer = dynamic(() => import("@/components/Footer"));

// Wrap the Sanity fetch — if Sanity is unreachable / misconfigured at
// build time we still want the home page in the route manifest, just
// with empty data (every component already accepts a null `data` prop
// and falls back to hardcoded copy).
async function safeGetHomePage(): Promise<HomePage | null> {
  try {
    return await getHomePage();
  } catch (e) {
    console.error("[Home] Sanity fetch failed; rendering with empty data:", e);
    return null;
  }
}

export default async function Home() {
  const home = await safeGetHomePage();

  return (
    <>
      <Header />
      <Hero data={home} />
      <QASection data={home} />
      <div id="rozwiazanie">
        <ProductShowcase />
      </div>
      <div id="realizacje">
        <RealizationsSection data={home} />
      </div>
      <RealizationsTabsSection />
      <GlobalSection />
    </>
  );
}

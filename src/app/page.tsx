import nextDynamic from "next/dynamic";
import Header from "@/components/Header";
import HeroConcept from "@/components/HeroConcept";
import QASection from "@/components/QASection";
import { getHomePage, type HomePage } from "@/lib/sanity/fetch";

// Below-the-fold sections — heavy GSAP / ScrollTrigger / WebGL work that
// blocks initial hydration if eager-imported alongside the hero. Lazy
// loading them lets the hero animation kick off as soon as React hydrates
// the small set of above-the-fold components.
const ProductShowcase = nextDynamic(() => import("@/components/ProductShowcase"));
const RealizationsCarousel = nextDynamic(
  () => import("@/components/RealizationsCarousel"),
);
const GlobalSection = nextDynamic(() => import("@/components/GlobalSection"));

// Force / to be prerendered as static at build time. Without this, the
// async nature of the page + the wrapped Sanity fetch could make Next
// emit / as a dynamic function — and if Vercel doesn't wire that
// function up under the deployment's URL, every request to / returns
// the platform's 404: NOT_FOUND.
export const dynamic = "force-static";
export const revalidate = 3600;

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
      <HeroConcept data={home} />
      <QASection data={home} />
      <div id="rozwiazanie">
        <ProductShowcase />
      </div>
      <div id="realizacje">
        <RealizationsCarousel />
      </div>
      <GlobalSection />
    </>
  );
}

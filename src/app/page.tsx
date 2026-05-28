import nextDynamic from "next/dynamic";
import Header from "@/components/Header";
import HeroConcept from "@/components/HeroConcept";
import {
  getHomePage,
  getRealizationsList,
  type HomePage,
  type Realization,
} from "@/lib/sanity/fetch";

// Below-the-fold sections — heavy GSAP / ScrollTrigger / WebGL work that
// blocks initial hydration if eager-imported alongside the hero. Lazy
// loading them lets the hero animation kick off as soon as React hydrates
// the small set of above-the-fold components.
const QASection = nextDynamic(() => import("@/components/QASection"));
const ProductShowcase = nextDynamic(
  () => import("@/components/ProductShowcase"),
);
const RealizationsCarousel = nextDynamic(
  () => import("@/components/RealizationsCarousel"),
);
const EuropeGlobeSection = nextDynamic(
  () => import("@/components/EuropeGlobeSection"),
);

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

async function safeGetRealizations(): Promise<Realization[]> {
  try {
    return await getRealizationsList();
  } catch (e) {
    console.error("[Home] Realizations fetch failed:", e);
    return [];
  }
}

export default async function Home() {
  const [home, realizations] = await Promise.all([
    safeGetHomePage(),
    safeGetRealizations(),
  ]);

  return (
    <>
      <Header />
      <HeroConcept data={home} />
      <div id="rozwiazanie">
        <QASection data={home} />
      </div>
      <ProductShowcase />
      <div id="realizacje">
        <RealizationsCarousel items={realizations} />
      </div>
      <EuropeGlobeSection />
    </>
  );
}

import nextDynamic from "next/dynamic";
import Header from "@/components/Header";
import HeroConcept from "@/components/HeroConcept";
import {
  getHomePage,
  getRealizationsList,
  getSiteSettings,
  type HomePage,
  type Realization,
  type SiteSettings,
} from "@/lib/sanity/fetch";

const QASection = nextDynamic(() => import("@/components/QASection"));
const ProductShowcase = nextDynamic(
  () => import("@/components/ProductShowcase"),
);
const ModelsSection = nextDynamic(() => import("@/components/ModelsSection"));
const RealizationsCarousel = nextDynamic(
  () => import("@/components/RealizationsCarousel"),
);
const EuropeGlobeSection = nextDynamic(
  () => import("@/components/EuropeGlobeSection"),
);

export const dynamic = "force-static";
export const revalidate = 3600;

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

async function safeGetSiteSettings(): Promise<SiteSettings> {
  try {
    return await getSiteSettings();
  } catch (e) {
    console.error("[Home] SiteSettings fetch failed:", e);
    return null;
  }
}

export default async function Home() {
  const [home, realizations, settings] = await Promise.all([
    safeGetHomePage(),
    safeGetRealizations(),
    safeGetSiteSettings(),
  ]);

  return (
    <>
      <Header settings={settings} />
      <main>
        <HeroConcept data={home} />
        <div id="rozwiazanie">
          <QASection data={home} />
        </div>
        <ProductShowcase data={home} />
        {home?.modelsVisible !== false && <ModelsSection data={home} />}
        <div id="realizacje">
          <RealizationsCarousel items={realizations} data={home} />
        </div>
        <EuropeGlobeSection data={home} settings={settings} webGlobeOnMobile />
      </main>
    </>
  );
}

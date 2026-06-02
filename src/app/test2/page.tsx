import nextDynamic from "next/dynamic";
import Header from "@/components/Header";
import HeroConcept from "@/components/HeroConcept";
import {
  getHomePage,
  getRealizationsList,
  type HomePage,
  type Realization,
} from "@/lib/sanity/fetch";

const QASection = nextDynamic(() => import("@/components/QASection"));
const ProductShowcase = nextDynamic(() => import("@/components/ProductShowcase"));
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
    console.error("[test2] Sanity fetch failed; rendering with empty data:", e);
    return null;
  }
}

async function safeGetRealizations(): Promise<Realization[]> {
  try {
    return await getRealizationsList();
  } catch {
    return [];
  }
}

export default async function Test2() {
  const [home, realizations] = await Promise.all([
    safeGetHomePage(),
    safeGetRealizations(),
  ]);

  return (
    <>
      <Header />
      <HeroConcept data={home} />
      <QASection data={home} />
      <ProductShowcase />
      <RealizationsCarousel items={realizations} />
      <EuropeGlobeSection data={home ?? undefined} webGlobeOnMobile />
    </>
  );
}

import nextDynamic from "next/dynamic";
import Hero from "@/components/Hero";
import QASection from "@/components/QASection";
import QASectionV1 from "@/components/QASectionV1";
import RealizationsCarousel from "@/components/RealizationsCarousel";
import {
  getHomePage,
  getRealizationsList,
  type HomePage,
  type Realization,
} from "@/lib/sanity/fetch";
import HeroConcept from "@/components/HeroConcept";

const RealizationsSection = nextDynamic(
  () => import("@/components/RealizationsSection"),
);
const ModelsSection = nextDynamic(() => import("@/components/ModelsSection"));

export const metadata = {
  title: "Komponenty · Retailo",
};

export const dynamic = "force-static";
export const revalidate = 3600;

async function safeGetHomePage(): Promise<HomePage | null> {
  try {
    return await getHomePage();
  } catch (e) {
    console.error(
      "[components] Sanity fetch failed; rendering with empty data:",
      e,
    );
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

export default async function ComponentsPage() {
  const [home, realizations] = await Promise.all([
    safeGetHomePage(),
    safeGetRealizations(),
  ]);

  return (
    <>
      <Hero data={home} />
      <HeroConcept data={home} />
      <QASectionV1 data={home} />
      <QASection data={home} />
      <RealizationsSection data={home} />
      <RealizationsCarousel items={realizations} />
      <RealizationsCarousel
        variant="dark"
        showHeader={false}
        items={realizations}
      />
      <ModelsSection />
    </>
  );
}

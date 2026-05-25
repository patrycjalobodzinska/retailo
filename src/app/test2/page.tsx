import nextDynamic from "next/dynamic";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import QASectionV1 from "@/components/QASectionV1";
import { getHomePage, type HomePage } from "@/lib/sanity/fetch";

const ProductShowcaseV1 = nextDynamic(
  () => import("@/components/ProductShowcaseV1"),
);
const RealizationsSection = nextDynamic(
  () => import("@/components/RealizationsSection"),
);
const RealizationsTabsSection = nextDynamic(
  () => import("@/components/RealizationsTabsSection"),
);
const GlobalSection = nextDynamic(() => import("@/components/GlobalSection"));

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

export default async function Test2() {
  const home = await safeGetHomePage();

  return (
    <>
      <Header />
      <Hero data={home} />
      <QASectionV1 data={home} />
      <div id="rozwiazanie">
        <ProductShowcaseV1 />
      </div>
      <div id="realizacje">
        <RealizationsSection data={home} />
      </div>
      <RealizationsTabsSection />
      <GlobalSection />
    </>
  );
}

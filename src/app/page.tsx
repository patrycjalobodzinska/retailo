import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import QASection from "@/components/QASection";
import { getHomePage } from "@/lib/sanity/fetch";

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

export default async function Home() {
  const home = await getHomePage();

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

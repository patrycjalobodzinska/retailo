import nextDynamic from "next/dynamic";
import Hero from "@/components/Hero";
import QASection from "@/components/QASection";
import QASectionV1 from "@/components/QASectionV1";
import RealizationsCarousel from "@/components/RealizationsCarousel";
import { getHomePage, type HomePage } from "@/lib/sanity/fetch";
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

function SectionLabel({
  num,
  title,
  desc,
}: {
  num: number;
  title: string;
  desc?: string;
}) {
  return (
    <div className="sticky top-0 z-40 w-full bg-[#0a2a2e] text-white border-b border-white/10 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1320px] items-baseline gap-4 px-6 py-3">
        <span className="font-mono text-xs text-white/45">
          {String(num).padStart(2, "0")}
        </span>
        <h2 className="m-0 text-sm font-semibold uppercase tracking-[0.18em]">
          {title}
        </h2>
        {desc && (
          <span className="hidden text-xs text-white/55 sm:inline">{desc}</span>
        )}
      </div>
    </div>
  );
}

export default async function ComponentsPage() {
  const home = await safeGetHomePage();

  return (
    <>
      <SectionLabel
        num={1}
        title="Hero — aktualny"
        desc="Wersja używana na stronie głównej"
      />
      <Hero data={home} />

      <SectionLabel
        num={2}
        title="Hero — wariant koncepcyjny"
        desc="Propozycja: jasny editorial layout z mockupem urządzenia"
      />
      <HeroConcept data={home} />

      <SectionLabel
        num={3}
        title="Sekcja 2 — wersja stara (V1)"
        desc="QASection przed redesignem"
      />
      <QASectionV1 data={home} />

      <SectionLabel
        num={4}
        title="Sekcja 2 — wersja aktualna"
        desc="QASection po redesignie bento"
      />
      <QASection data={home} />

      <SectionLabel
        num={5}
        title="Karuzela realizacji — stara"
        desc="Stara wersja z RealizationsSection"
      />
      <RealizationsSection data={home} />

      <SectionLabel
        num={6}
        title="Karuzela realizacji — jasna (aktualna)"
        desc="Wariant light używany na /"
      />
      <RealizationsCarousel />

      <SectionLabel
        num={7}
        title="Karuzela realizacji — ciemna"
        desc="Wariant dark"
      />
      <RealizationsCarousel variant="dark" showHeader={false} />

      <SectionLabel
        num={8}
        title="Poznaj modele PickUpWall"
        desc="Sekcja prezentująca warianty M / L / XL"
      />
      <ModelsSection />
    </>
  );
}

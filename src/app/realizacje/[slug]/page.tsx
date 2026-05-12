import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import {
  REALIZATIONS,
  getNextRealizations,
  getRealizationBySlug,
} from "@/lib/realizations";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return REALIZATIONS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const r = getRealizationBySlug(slug);
  return {
    title: r ? `${r.title} · Realizacje · Retailo` : "Realizacja · Retailo",
  };
}

export default async function RealizacjaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const r = getRealizationBySlug(slug);
  if (!r) notFound();

  const config = r.config;
  const totalUnits = (config?.masterCount ?? 0) + (config?.slaveCount ?? 0);

  const META_ROWS: Array<[string, string]> = [
    ["Klient", r.client ?? "—"],
    ["Lokalizacja", r.location],
    ["Rok wdrozenia", r.year ? String(r.year) : "—"],
    [
      "Liczba jednostek",
      totalUnits > 0
        ? `${totalUnits}${totalUnits === 1 ? " (jednostka glowna)" : ""}`
        : "—",
    ],
    ["Liczba skrytek", config?.lockers ? String(config.lockers) : "—"],
    ["Wymiary jednostki", config?.moduleDimensions ?? "1970 × 1025 × 50 mm"],
    ["Czas wdrozenia", r.integrationTime ?? "—"],
  ];

  const next = getNextRealizations(slug, 3);

  return (
    <>
      {/* Header slides down from above. */}
      <div className="realization-header-in">
        <Header />
      </div>

      <main className="relative z-[1] w-full text-[#0a2a2e]">
        {/* Hero — shorter (50vh) image, fades in over the gradient. */}
        <section className="relative w-full h-[50vh] min-h-[380px] overflow-hidden">
          <img
            src={r.image}
            alt={r.title}
            className="realization-image-in absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center" }}
          />
          <div
            className="realization-image-in absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(15,21,24,0.20) 0%, rgba(15,21,24,0.10) 40%, rgba(15,21,24,0.85) 100%)",
            }}
          />
          <div className="realization-block-in realization-block-in-1 absolute bottom-[6vh] left-[6vw] right-[6vw] max-w-[1100px] z-10">
            <Link
              href="/realizacje"
              className="inline-flex items-center gap-2 text-white/75 no-underline hover:text-white transition-colors mb-5"
              style={{
                fontSize: "0.78rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}>
              <span aria-hidden="true">&larr;</span>
              Realizacje
            </Link>
            <p
              className="m-0 mb-2 uppercase tracking-[0.22em] font-semibold text-[#7ed5e6]"
              style={{ fontSize: "clamp(0.72rem, 0.85vw, 0.85rem)" }}>
              {r.location}
            </p>
            <h1
              className="m-0 font-bold tracking-tight text-white"
              style={{
                fontSize: "clamp(2rem, 5vw, 4.5rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.02em",
                textShadow: "0 4px 24px rgba(0,0,0,0.4)",
              }}>
              {r.title}
            </h1>
          </div>
        </section>

        {/* Body — meta + narrative */}
        <section className="realization-block-in realization-block-in-2 px-[6vw] py-[10vh] max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12">
            <aside className="flex flex-col gap-5">
              <p
                className="m-0 uppercase tracking-[0.22em] font-semibold text-[#0086b0]"
                style={{ fontSize: "0.72rem" }}>
                Dane wdrozenia
              </p>
              <dl className="m-0 grid grid-cols-1 gap-4">
                {META_ROWS.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex flex-col gap-1 pb-3 border-b border-[#0a2a2e]/15">
                    <dt
                      className="m-0 uppercase tracking-widest text-[#3a5a60]"
                      style={{ fontSize: "0.7rem" }}>
                      {label}
                    </dt>
                    <dd
                      className="m-0 text-[#0a2a2e] font-semibold"
                      style={{ fontSize: "0.95rem" }}>
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>

            <div className="flex flex-col gap-10">
              <div>
                <h2
                  className="m-0 mb-4 font-bold tracking-tight text-[#0a2a2e]"
                  style={{
                    fontSize: "clamp(1.4rem, 2.4vw, 2rem)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.01em",
                  }}>
                  O wdrozeniu
                </h2>
                <p
                  className="m-0 text-[#3a5a60] leading-relaxed"
                  style={{ fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)" }}>
                  {r.description}
                </p>
                {config?.notes && (
                  <p
                    className="m-0 mt-4 text-[#3a5a60] leading-relaxed"
                    style={{ fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)" }}>
                    {config.notes}
                  </p>
                )}
                <p
                  className="m-0 mt-4 text-[#3a5a60] leading-relaxed"
                  style={{ fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)" }}>
                  PickUpWall jest rozwiazaniem modularnym. Instalacja sklada
                  sie z{" "}
                  <strong className="text-[#0a2a2e]">jednostki glownej</strong>
                  {" "}z ekranem dotykowym oraz dowolnej liczby{" "}
                  <strong className="text-[#0a2a2e]">
                    jednostek rozszerzajacych
                  </strong>
                  {" "}laczonych w jeden ciag — konfiguracja jest dobierana do
                  spodziewanego wolumenu zamowien i dostepnej przestrzeni w
                  punkcie obslugi. Pojedyncza jednostka ma wymiary{" "}
                  <strong className="text-[#0a2a2e]">
                    197 × 102.5 × 5 cm
                  </strong>
                  . Realizujemy rowniez wersje niestandardowe pod konkretna
                  zabudowe lub identyfikacje wizualna marki.
                </p>
              </div>

              {/* Config schema — visual layout of cabinet units side by side. */}
              {config?.masterCount !== undefined && (
                <div className="realization-block-in realization-block-in-3">
                  <p
                    className="m-0 mb-2 uppercase tracking-[0.22em] font-semibold text-[#0086b0]"
                    style={{ fontSize: "0.72rem" }}>
                    Konfiguracja wdrozenia
                  </p>
                  <p
                    className="m-0 mb-4 text-[#3a5a60] leading-relaxed"
                    style={{ fontSize: "0.92rem" }}>
                    Schematyczny widok od frontu —{" "}
                    {config.masterCount + (config.slaveCount ?? 0)}{" "}
                    {(() => {
                      const n =
                        config.masterCount + (config.slaveCount ?? 0);
                      if (n === 1) return "jednostka";
                      if (n < 5) return "jednostki polaczone w ciag";
                      return "jednostek polaczonych w ciag";
                    })()}
                    .
                  </p>
                  <div className="rounded-2xl bg-white/70 backdrop-blur-sm p-6 md:p-8 border border-[#0a2a2e]/10">
                    <div className="flex items-end justify-center mb-6">
                      {(() => {
                        const total =
                          (config.masterCount ?? 0) + (config.slaveCount ?? 0);
                        let i = 0;
                        const nodes: React.ReactNode[] = [];
                        const place = (variant: "master" | "slave") => {
                          const pos: ModulePosition =
                            total === 1
                              ? "only"
                              : i === 0
                                ? "first"
                                : i === total - 1
                                  ? "last"
                                  : "middle";
                          nodes.push(
                            <ModuleDiagram
                              key={`${variant}-${i}`}
                              variant={variant}
                              position={pos}
                            />,
                          );
                          i++;
                        };
                        for (let k = 0; k < (config.masterCount ?? 0); k++)
                          place("master");
                        for (let k = 0; k < (config.slaveCount ?? 0); k++)
                          place("slave");
                        return nodes;
                      })()}
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs uppercase tracking-wider text-[#3a5a60]">
                      <div className="flex items-center gap-2">
                        <span
                          className="block"
                          style={{
                            width: 12,
                            height: 12,
                            background: "#0086b0",
                            borderRadius: 2,
                          }}
                        />
                        Jednostka glowna · 39 skrytek + ekran
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="block"
                          style={{
                            width: 12,
                            height: 12,
                            background: "#7ed5e6",
                            borderRadius: 2,
                          }}
                        />
                        Jednostka rozszerzajaca · 40 skrytek
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Gallery */}
              <div className="realization-block-in realization-block-in-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <img
                  src="/realizacja-pickupwall.jpg"
                  alt={`${r.title} — widok 1`}
                  className="w-full aspect-[4/5] object-cover rounded-lg border border-[#0a2a2e]/10"
                />
                <img
                  src="/realizacja-pickupwall-2.jpg"
                  alt={`${r.title} — widok 2`}
                  className="w-full aspect-[4/5] object-cover rounded-lg border border-[#0a2a2e]/10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Next realizations */}
        <section className="realization-block-in realization-block-in-5 px-[6vw] py-[10vh] border-t border-[#0a2a2e]/10">
          <div className="max-w-[1200px] mx-auto">
            <p
              className="m-0 mb-3 uppercase tracking-[0.22em] font-semibold text-[#0086b0]"
              style={{ fontSize: "0.72rem" }}>
              Zobacz tez
            </p>
            <h2
              className="m-0 mb-8 font-bold tracking-tight text-[#0a2a2e]"
              style={{
                fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}>
              Kolejne realizacje.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {next.map((n) => (
                <Link
                  key={n.slug}
                  href={`/realizacje/${n.slug}`}
                  className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#0f1518] no-underline transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(10,30,38,0.18)]"
                  style={{ border: "1px solid rgba(10,42,46,0.06)" }}>
                  <img
                    src={n.image}
                    alt={n.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ opacity: 0.7 }}
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(15,21,24,0.92) 0%, rgba(15,21,24,0.25) 55%, rgba(15,21,24,0) 100%)",
                    }}
                  />
                  <div className="absolute left-5 right-5 bottom-5 z-[2]">
                    <p
                      className="m-0 mb-1.5 uppercase tracking-[0.2em] font-semibold text-[#7ed5e6]"
                      style={{ fontSize: "0.66rem" }}>
                      {n.location}
                    </p>
                    <p
                      className="m-0 font-bold text-white"
                      style={{ fontSize: "1.2rem", lineHeight: 1.15 }}>
                      {n.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Gradient backdrop — sits behind main, matches the carousel→detail
          transition panel so the page lands seamlessly. */}
      <div
        aria-hidden
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, #c0dbe2 0%, #e9e2d8 100%)",
        }}
      />
    </>
  );
}

// Visualization of the PickUpWall cabinet — vertical front-view with
// "lockers" grid. Master variant adds a prominent screen band at eye
// level; slave is just the grid. `position` rounds only the outer-most
// edges of a row, so adjacent units read as one continuous installation.
type ModulePosition = "first" | "middle" | "last" | "only";
function ModuleDiagram({
  variant,
  position = "only",
}: {
  variant: "master" | "slave";
  position?: ModulePosition;
}) {
  const isMaster = variant === "master";
  const color = isMaster ? "#0086b0" : "#7ed5e6";
  const cols = 4;
  const rows = 10;
  const screenStartRow = 2;
  const screenEndRow = 3;

  const radiusOuter = 6;
  const roundLeft = position === "first" || position === "only";
  const roundRight = position === "last" || position === "only";

  return (
    <div
      className="flex-1"
      style={{
        aspectRatio: "1025 / 1970",
        maxWidth: 130,
        background: "#f5f7f9",
        borderTop: `1.5px solid ${color}`,
        borderBottom: `1.5px solid ${color}`,
        borderLeft: `1.5px solid ${color}`,
        borderRight:
          position === "last" || position === "only"
            ? `1.5px solid ${color}`
            : "none",
        borderTopLeftRadius: roundLeft ? radiusOuter : 0,
        borderBottomLeftRadius: roundLeft ? radiusOuter : 0,
        borderTopRightRadius: roundRight ? radiusOuter : 0,
        borderBottomRightRadius: roundRight ? radiusOuter : 0,
        padding: 5,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        position: "relative",
      }}>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} style={{ flex: 1, display: "flex", gap: 3 }}>
          {Array.from({ length: cols }).map((_, col) => (
            <div
              key={col}
              style={{
                flex: 1,
                background: `${color}22`,
                border: `0.5px solid ${color}66`,
                borderRadius: 1,
              }}
            />
          ))}
        </div>
      ))}
      {isMaster && (
        <div
          style={{
            position: "absolute",
            left: "30%",
            right: "30%",
            top: `${(screenStartRow / rows) * 100}%`,
            bottom: `${((rows - screenEndRow - 1) / rows) * 100}%`,
            background: color,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}>
          <span
            style={{
              color: "#fff",
              fontSize: 8,
              fontWeight: 800,
              letterSpacing: "0.1em",
            }}>
            EKRAN
          </span>
        </div>
      )}
    </div>
  );
}

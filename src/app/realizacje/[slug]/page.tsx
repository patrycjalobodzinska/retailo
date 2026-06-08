import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactCtaForm from "@/components/ContactCtaForm";
import RealizationsCarousel from "@/components/RealizationsCarousel";
import LockerWallDiagram, {
  LockerDevicesDiagram,
  RealizationModuleLegend,
} from "@/components/LockerWallDiagram";
import RealizationGallery from "@/components/RealizationGallery";
import { PortableText } from "next-sanity";
import { BODY_COMPONENTS } from "@/components/portableTextComponents";
import {
  getRealizationBySlug,
  getRealizationsList,
} from "@/lib/sanity/fetch";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const list = await getRealizationsList();
    return list.map((r) => ({ slug: r.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const r = await getRealizationBySlug(slug);
  if (!r) return { title: "Realizacja · Retailo" };
  const title = `${r.title} · Realizacje · Retailo`;
  const description =
    r.description ||
    `Wdrożenie PickUpWall: ${r.title}${r.location ? `, ${r.location}` : ""}. Automatyczny system odbioru przesyłek pick-up in store.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(r.image ? { images: [{ url: r.image }] } : {}),
    },
  };
}

export default async function RealizacjaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [r, all] = await Promise.all([
    getRealizationBySlug(slug),
    getRealizationsList(),
  ]);
  if (!r) notFound();

  const config = r.config;

  const hasDevices = !!r.devices?.length;
  const hasWall = hasDevices || !!r.modules?.length;
  const allModules = hasDevices
    ? r.devices!.flatMap((d) => d.modules)
    : (r.modules ?? []);

  const META_ROWS: Array<[string, string]> = [
    ["Lokalizacja", r.location],
    ["Rok wdrozenia", r.year ? String(r.year) : "-"],
    ["Liczba skrytek", config?.lockers ? String(config.lockers) : "-"],
    ...(r.specs ?? []).map((s) => [s.label, s.value] as [string, string]),
  ];

  return (
    <>
      <div className="realization-header-in">
        <Header />
      </div>

      <main className="relative z-[1] w-full bg-white text-[#0a2a2e]">
        <section className="relative w-full lg:min-h-[100vh]">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[40vh] z-0 overflow-hidden pointer-events-none lg:h-[380px]"
            style={{
              background:
                "linear-gradient(180deg, #c0dbe2 0%, #d6e4e9 50%, #ffffff 85%)",
            }}>
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 70% 70% at 5% 100%, rgba(0,134,176,0.22) 0%, rgba(0,134,176,0) 60%), radial-gradient(ellipse 60% 65% at 95% -5%, rgba(126,213,230,0.35) 0%, rgba(126,213,230,0) 60%)",
                WebkitMaskImage:
                  "linear-gradient(180deg, #000 45%, transparent 85%)",
                maskImage:
                  "linear-gradient(180deg, #000 45%, transparent 85%)",
              }}
            />
            <svg
              className="absolute max-md:hidden"
              style={{ bottom: "12%", right: "5vw", opacity: 0.5 }}
              width="120"
              height="80"
              viewBox="0 0 120 80">
              {Array.from({ length: 6 }).map((_, row) =>
                Array.from({ length: 9 }).map((_, col) => (
                  <circle
                    key={`${row}-${col}`}
                    cx={col * 14 + 4}
                    cy={row * 14 + 4}
                    r="1.4"
                    fill="#0086b0"
                  />
                )),
              )}
            </svg>
            <p
              className="absolute m-0 font-black select-none"
              style={{
                bottom: "6%",
                left: "-1vw",
                fontSize: "clamp(3rem, 12vw, 13rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.05em",
                color: "rgba(255,255,255,0.34)",
              }}>
              realizacje.
            </p>
          </div>

          <div className="realization-block-in realization-block-in-1 relative z-[1] flex flex-col lg:grid lg:grid-cols-2 gap-10 items-start px-[6vw] pt-[120px] pb-[8vh] max-w-[1500px] mx-auto max-lg:pt-[64px] max-lg:gap-6 max-lg:pb-[4vh]">
            <div className="lg:col-start-1 lg:row-start-1">
              <div className="lg:min-h-[260px]">
                <Link
                  href="/realizacje"
                className="inline-flex items-center gap-2 text-[#3a5a60] no-underline hover:text-[#0a2a2e] transition-colors mt-6 mb-2"
                style={{
                  fontSize: "0.78rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}>
                <span aria-hidden="true">&larr;</span>
                Realizacje
              </Link>
              {r.client && r.client !== "-" && (
                <p
                  className="m-0 mb-2 font-bold uppercase tracking-[0.14em] text-[#0a2a2e]"
                  style={{ fontSize: "clamp(1rem, 1.4vw, 1.35rem)" }}>
                  {r.client}
                </p>
              )}
              <p
                className="m-0 mb-2 uppercase tracking-[0.22em] font-semibold text-[#0086b0]"
                style={{ fontSize: "clamp(0.72rem, 0.85vw, 0.85rem)" }}>
                {r.location}
              </p>
              <h1
                className="m-0 font-bold tracking-tight text-[#0a2a2e]"
                style={{
                  fontSize: "clamp(2rem, 5vw, 4.5rem)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.02em",
                }}>
                {r.title}
              </h1>
              </div>
            </div>

            <div className="lg:col-start-2 lg:row-start-1 lg:row-span-3">
              <img
                src={r.image}
                alt={r.title}
                className="realization-image-in block h-auto w-full max-w-[780px] max-h-[660px] object-contain lg:ml-auto max-lg:mx-auto max-lg:max-w-[560px]"
              />
            </div>

            <div className="lg:col-start-1 lg:row-start-2">
              {r.description && (
                <p
                  className="m-0 text-[#3a5a60] leading-relaxed max-w-[560px]"
                  style={{ fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)" }}>
                  {r.description}
                </p>
              )}
              <div className="mt-8 flex flex-wrap items-center gap-3 max-lg:mt-6">
                <Link
                  href="/#kontakt"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0a2a2e] px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-[#0086b0]">
                  Porozmawiajmy o podobnym wdrozeniu
                  <span aria-hidden="true">&rarr;</span>
                </Link>
                <Link
                  href="/realizacje"
                  className="inline-flex items-center rounded-full border border-[#0a2a2e]/15 px-5 py-2.5 text-sm font-semibold text-[#0a2a2e] no-underline transition hover:border-[#0086b0] hover:text-[#0086b0]">
                  Inne realizacje
                </Link>
              </div>
              <svg
                aria-hidden="true"
                className="mt-12 max-lg:hidden"
                style={{ opacity: 0.3 }}
                width="190"
                height="106"
                viewBox="0 0 190 106">
                {Array.from({ length: 7 }).map((_, row) =>
                  Array.from({ length: 13 }).map((_, col) => (
                    <circle
                      key={`${row}-${col}`}
                      cx={col * 14 + 4}
                      cy={row * 14 + 4}
                      r="1.3"
                      fill="#0086b0"
                    />
                  )),
                )}
              </svg>
            </div>

            {!hasWall && (
            <div className="lg:col-start-1 lg:row-start-3">
              <p
                className="m-0 mb-3 uppercase tracking-[0.22em] font-semibold text-[#0086b0]"
                style={{ fontSize: "0.85rem" }}>
                Dane wdrozenia
              </p>
              <dl className="m-0 grid grid-cols-2 gap-x-8 gap-y-5 max-w-[560px]">
                {META_ROWS.map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-1">
                    <dt
                      className="m-0 font-medium uppercase tracking-widest"
                      style={{ fontSize: "0.74rem", color: "#0086b0" }}>
                      {label}
                    </dt>
                    <dd className="m-0 text-[#0a2a2e] font-semibold text-[0.85rem] lg:text-[1.05rem]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            )}
          </div>
        </section>

        {hasWall && (
          <section className="relative realization-block-in realization-block-in-2 px-[6vw] pt-[2vh] pb-[12vh] max-w-[1500px] mx-auto">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div
              className="absolute"
              style={{
                top: "8%",
                left: "-8%",
                width: "46%",
                height: "62%",
                background:
                  "radial-gradient(ellipse at center, rgba(0,134,176,0.10) 0%, rgba(0,134,176,0) 70%)",
                filter: "blur(12px)",
              }}
            />
            <div
              className="absolute"
              style={{
                bottom: "4%",
                right: "-6%",
                width: "44%",
                height: "58%",
                background:
                  "radial-gradient(ellipse at center, rgba(126,213,230,0.18) 0%, rgba(126,213,230,0) 70%)",
                filter: "blur(12px)",
              }}
            />
            <svg
              className="absolute max-md:hidden"
              style={{ top: "14%", right: "5%", opacity: 0.16 }}
              width="170"
              height="130"
              viewBox="0 0 170 130">
              {Array.from({ length: 9 }).map((_, row) =>
                Array.from({ length: 12 }).map((_, col) => (
                  <circle
                    key={`${row}-${col}`}
                    cx={col * 14 + 4}
                    cy={row * 14 + 4}
                    r="1.3"
                    fill="#0086b0"
                  />
                )),
              )}
            </svg>
          </div>
          <div className="relative flex flex-col gap-10">
              {hasWall ? (
                <div className="realization-block-in realization-block-in-3">
                  <p
                    className="m-0 mb-6 uppercase tracking-[0.18em] font-semibold text-[#0086b0]"
                    style={{ fontSize: "clamp(1rem, 1.5vw, 1.35rem)" }}>
                    Konfiguracja wdrozenia
                  </p>
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-center gap-8 lg:gap-14">
                    <div className="flex flex-col gap-5 lg:w-fit lg:max-w-full lg:shrink-0">
                      <div className="rounded-2xl bg-white/70 backdrop-blur-sm p-6 md:p-8 border border-[#0a2a2e]/10 max-lg:-mx-[6vw] max-lg:rounded-none max-lg:border-x-0 max-lg:px-3 max-lg:py-5">
                        {hasDevices ? (
                          <LockerDevicesDiagram
                            devices={r.devices!}
                            showLegend={false}
                          />
                        ) : (
                          <LockerWallDiagram
                            modules={r.modules!}
                            showLegend={false}
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex w-full flex-col gap-5 lg:max-w-[440px] lg:pt-1">
                      <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#0a2a2e]/10 p-6 md:p-7">
                        <p
                          className="m-0 mb-5 uppercase tracking-[0.22em] font-semibold text-[#0086b0]"
                          style={{ fontSize: "0.85rem" }}>
                          Dane wdrozenia
                        </p>
                        <dl className="m-0 grid grid-cols-2 gap-x-8 gap-y-4">
                          {META_ROWS.map(([label, value]) => (
                            <div
                              key={label}
                              className="flex flex-col gap-1 border-b border-[#0a2a2e]/[0.07] pb-3 last:border-b-0 [&:nth-last-child(2):nth-child(odd)]:border-b-0">
                              <dt
                                className="m-0 font-medium uppercase tracking-widest"
                                style={{ fontSize: "0.74rem", color: "#0086b0" }}>
                                {label}
                              </dt>
                              <dd className="m-0 text-[#0a2a2e] font-semibold text-[0.85rem] lg:text-[1.05rem]">
                                {value}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                      <div className="max-lg:order-first">
                        <RealizationModuleLegend
                          modules={allModules}
                          horizontal
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : config?.masterCount !== undefined ? (
                <div className="realization-block-in realization-block-in-3">
                  <p
                    className="m-0 mb-6 uppercase tracking-[0.18em] font-semibold text-[#0086b0]"
                    style={{ fontSize: "clamp(1rem, 1.5vw, 1.35rem)" }}>
                    Konfiguracja wdrozenia
                  </p>
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-center gap-8 lg:gap-14">
                    <div className="rounded-2xl bg-white/70 backdrop-blur-sm p-6 md:p-8 border border-[#0a2a2e]/10 lg:w-fit lg:max-w-full lg:shrink-0 max-lg:-mx-[6vw] max-lg:rounded-none max-lg:border-x-0 max-lg:px-3 max-lg:py-5">
                      <div className="flex items-end justify-center">
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
                    </div>
                    <div className="flex flex-col gap-6 lg:max-w-[360px] lg:pt-1">
                      <p
                        className="m-0 lg:mt-6 text-[#3a5a60] leading-relaxed"
                        style={{ fontSize: "0.95rem" }}>
                        Schematyczny widok od frontu -{" "}
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
                      <div className="flex flex-col gap-3 text-xs uppercase tracking-wider text-[#3a5a60]">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="block shrink-0"
                            style={{
                              width: 14,
                              height: 14,
                              background: "#0086b0",
                              borderRadius: 3,
                            }}
                          />
                          Master - 39 skrytek + ekran
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span
                            className="block shrink-0"
                            style={{
                              width: 14,
                              height: 14,
                              background: "#7ed5e6",
                              borderRadius: 3,
                            }}
                          />
                          Slave - 40 skrytek
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
          </div>
        </section>
        )}

        {r.body && r.body.length > 0 && (
          <section className="realization-block-in px-[6vw] -mt-[6vh] pb-[6vh] max-w-[900px] mx-auto">
            <PortableText value={r.body} components={BODY_COMPONENTS} />
          </section>
        )}

        {r.gallery && r.gallery.length > 0 && (
          <section className="realization-block-in px-[6vw] pb-[12vh] max-w-[1500px] mx-auto">
            <div className="mb-6">
              <p
                className="m-0 mb-2 uppercase tracking-[0.22em] font-semibold text-[#0086b0]"
                style={{ fontSize: "0.72rem" }}>
                Galeria
              </p>
              <h2
                className="m-0 font-bold tracking-tight text-[#0a2a2e]"
                style={{
                  fontSize: "clamp(1.4rem, 2.4vw, 2rem)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.01em",
                }}>
                Zdjecia z wdrozenia.
              </h2>
            </div>
            <RealizationGallery images={r.gallery} title={r.title} />
          </section>
        )}

        <section className="realization-block-in realization-block-in-5 border-t border-[#0a2a2e]/10 pt-[6vh] pb-[2vh] max-lg:pt-[4vh]">
          <div className="max-w-[1500px] mx-auto px-[6vw] mb-2">
            <p
              className="m-0 mb-3 uppercase tracking-[0.22em] font-semibold text-[#0086b0]"
              style={{ fontSize: "0.72rem" }}>
              Zobacz tez
            </p>
            <h2
              className="m-0 font-bold tracking-tight text-[#0a2a2e]"
              style={{
                fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}>
              Inne realizacje.
            </h2>
          </div>
          <RealizationsCarousel showHeader={false} excludeSlug={slug} items={all} />
        </section>
        <ContactCtaForm />
      </main>
      <Footer />

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

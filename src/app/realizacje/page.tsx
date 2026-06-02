import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactCtaForm from "@/components/ContactCtaForm";
import {
  getRealizationsList,
  type Realization,
} from "@/lib/sanity/fetch";

export const metadata = {
  title: "Realizacje · Retailo",
};

export const revalidate = 3600;

async function safeFetch(): Promise<Realization[]> {
  try {
    return await getRealizationsList();
  } catch (e) {
    console.error("[/realizacje] fetch failed:", e);
    return [];
  }
}

export default async function RealizacjePage() {
  const REALIZATIONS = await safeFetch();
  // Promowane (z Sanity) wyświetlają się jako większe karty na górze listy.
  const featured = REALIZATIONS.filter((r) => r.featured);
  const rest = REALIZATIONS.filter((r) => !r.featured);
  return (
    <>
      <Header />
      <main className="relative w-full bg-white text-[#0a2a2e] overflow-hidden">
        {/* HERO — fades smoothly from cyan to white across the full bottom edge */}
        <section
          className="relative w-full flex flex-col justify-end overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, #c0dbe2 0%, #d6e4e9 45%, #ecf1f3 75%, #ffffff 100%)",
          }}>
          {/* Extra bottom-edge fade so the section blends seamlessly into white */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[18vh] pointer-events-none z-[2]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 5% 100%, rgba(0,134,176,0.22) 0%, rgba(0,134,176,0) 60%), radial-gradient(ellipse 60% 55% at 95% -5%, rgba(126,213,230,0.35) 0%, rgba(126,213,230,0) 60%)",
            }}
          />
          <p
            aria-hidden="true"
            className="absolute m-0 font-black select-none pointer-events-none"
            style={{
              bottom: "2vh",
              left: "-2vw",
              fontSize: "clamp(4.5rem, 18vw, 22rem)",
              lineHeight: 1.2,
              letterSpacing: "-0.05em",
              color: "rgba(255,255,255,0.32)",
              zIndex: 0,
            }}>
            realizacje.
          </p>
          <p
            aria-hidden="true"
            className="absolute m-0 uppercase font-semibold tracking-[0.4em] select-none pointer-events-none"
            style={{
              top: "16vh",
              right: "4vw",
              transform: "rotate(90deg)",
              transformOrigin: "right top",
              fontSize: "0.72rem",
              color: "rgba(10,42,46,0.35)",
            }}></p>
          <svg
            aria-hidden="true"
            className="absolute pointer-events-none max-md:hidden"
            style={{ bottom: "8vh", right: "5vw", opacity: 0.5 }}
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

          <div className="relative z-[1] px-[6vw] pb-[5vh] pt-[110px] max-w-[1200px] mx-auto w-full max-lg:pt-[92px] max-lg:pb-[4vh]">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#3a5a60] no-underline hover:text-[#0a2a2e] transition-colors mb-5"
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}>
              <span aria-hidden="true">&larr;</span>
              Strona glowna
            </Link>
            <div className="flex items-center gap-3 mb-3">
              <span
                className="block"
                style={{ width: 30, height: 2, background: "#0086b0" }}
              />
              <p
                className="m-0 uppercase tracking-[0.22em] font-semibold text-[#0086b0]"
                style={{ fontSize: "clamp(0.7rem, 0.8vw, 0.8rem)" }}>
                Realizacje · {REALIZATIONS.length} wdrozen
              </p>
            </div>
            <h1
              className="m-0 mb-4 font-bold tracking-tight text-[#0a2a2e]"
              style={{
                fontSize: "clamp(2rem, 5.2vw, 4.2rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.025em",
              }}>
              PickUpWall <span className="text-[#0a2a2e]/55">w akcji.</span>
            </h1>
            <p
              className="m-0 text-[#3a5a60] leading-relaxed"
              style={{
                fontSize: "clamp(0.95rem, 1.1vw, 1.1rem)",
                maxWidth: "640px",
              }}>
              Zobacz nasze wdrozenia dla{" "}
              <strong className="text-[#0a2a2e]">Empik</strong>,{" "}
              <strong className="text-[#0a2a2e]">Sephora</strong> i innych marek
              premium — od salonu flagowego po biurowiec.
            </p>
          </div>
        </section>

        {/* GRID — image-led cards with same overlay style as the homepage
            carousel cards, so visiting this list feels like a continuation
            of the carousel, not a different page. */}
        <section className="relative w-full -mt-[4vh] pb-[14vh] z-[3]">
          {/* Decorative background — soft blobs + dot grid behind the cards.
              Pełna szerokość: bg leży na całym tle sekcji, nie ograniczony
              do max-w kontenera z kartami. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
            <div
              className="absolute"
              style={{
                top: "10%",
                right: "-12%",
                width: "55%",
                height: "55%",
                background:
                  "radial-gradient(ellipse at center, rgba(0,134,176,0.10) 0%, rgba(0,134,176,0) 70%)",
                filter: "blur(20px)",
              }}
            />
            <div
              className="absolute"
              style={{
                bottom: "12%",
                left: "-10%",
                width: "50%",
                height: "50%",
                background:
                  "radial-gradient(ellipse at center, rgba(126,213,230,0.16) 0%, rgba(126,213,230,0) 70%)",
                filter: "blur(20px)",
              }}
            />
            <svg
              className="absolute"
              style={{
                top: "8%",
                left: "2%",
                opacity: 0.22,
              }}
              width="160"
              height="120"
              viewBox="0 0 160 120">
              {Array.from({ length: 8 }).map((_, row) =>
                Array.from({ length: 11 }).map((_, col) => (
                  <circle
                    key={`${row}-${col}`}
                    cx={col * 14 + 4}
                    cy={row * 14 + 4}
                    r="1.2"
                    fill="#0086b0"
                  />
                )),
              )}
            </svg>
            <svg
              className="absolute"
              style={{
                bottom: "10%",
                right: "4%",
                opacity: 0.18,
              }}
              width="180"
              height="140"
              viewBox="0 0 180 140">
              {Array.from({ length: 9 }).map((_, row) =>
                Array.from({ length: 12 }).map((_, col) => (
                  <circle
                    key={`${row}-${col}`}
                    cx={col * 14 + 4}
                    cy={row * 14 + 4}
                    r="1.2"
                    fill="#0a2a2e"
                  />
                )),
              )}
            </svg>
          </div>

          {/* Inner constrained container — karty mają max-width, ale tło
              powyżej rozciąga się na pełną szerokość ekranu. */}
          <div className="relative max-w-[1300px] mx-auto px-[6vw]">
            {/* Promowane — szersza siatka 2-kolumnowa z większymi kartami */}
            {featured.length > 0 && (
              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                {featured.map((r) => (
                  <RealizationCard key={r.slug} r={r} featured />
                ))}
              </div>
            )}

            {/* Pozostałe realizacje — gęstsza siatka 3-kolumnowa */}
            <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map((r) => (
                <RealizationCard key={r.slug} r={r} />
              ))}
            </div>
          </div>
        </section>

        <ContactCtaForm />
      </main>
      <Footer />
    </>
  );
}

function RealizationCard({
  r,
  featured = false,
}: {
  r: Realization;
  featured?: boolean;
}) {
  const brand = r.client && r.client !== "—" ? r.client : null;
  return (
    <Link
      href={`/realizacje/${r.slug}`}
      className={`relative block rounded-2xl no-underline ${
        featured ? "aspect-[16/14]" : "aspect-[4/5]"
      }`}
      style={{
        background: "rgba(172, 170, 165, 0.48)",
        boxShadow: "0 14px 40px rgba(15,42,46,0.07)",
      }}>
      <div className="flex h-full flex-col p-5 md:p-6">
        <div className="relative w-full flex-1 overflow-hidden rounded-lg">
          <img
            src={r.image}
            alt={r.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {brand && (
            <span
              className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full uppercase tracking-[0.16em] font-bold text-[#0a2a2e]"
              style={{
                fontSize: "0.58rem",
                background: "rgba(255,255,255,0.92)",
                boxShadow: "0 4px 14px rgba(15,21,24,0.18)",
              }}>
              <span
                className="block rounded-full"
                style={{ width: 5, height: 5, background: "#0086b0" }}
              />
              {brand}
            </span>
          )}
        </div>
        <div className="mt-4 flex flex-col items-center gap-1.5 text-center md:mt-5">
          <h3
            className="m-0 font-semibold uppercase tracking-[0.16em] text-[#0a2a2e]"
            style={{ fontSize: "clamp(0.95rem, 1.15vw, 1.15rem)" }}>
            {r.title}
          </h3>
          <p
            className="m-0 font-light leading-snug text-[#3a5a60] line-clamp-2"
            style={{ fontSize: "clamp(0.78rem, 0.9vw, 0.9rem)" }}>
            {r.description}
          </p>
          {r.config?.lockers && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 self-start justify-start">
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full uppercase tracking-[0.12em] font-semibold text-[#0a2a2e]/80"
                style={{
                  fontSize: "0.55rem",
                  background: "rgba(255,255,255,0.55)",
                  border: "1px solid rgba(10,42,46,0.08)",
                }}>
                {r.config.lockers} skrytek
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

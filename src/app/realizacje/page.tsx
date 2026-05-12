import Link from "next/link";
import Header from "@/components/Header";
import { REALIZATIONS } from "@/lib/realizations";

export const metadata = {
  title: "Realizacje · Retailo",
};

export default function RealizacjePage() {
  return (
    <>
      <Header />
      <main className="relative w-full bg-[#f5f7f9] text-[#0a2a2e] overflow-hidden">
        {/* HERO — same visual language as homepage QASection: light blue
            gradient base, giant watermark word, radial accent blobs,
            cyan dot grid + accent stripe. */}
        <section
          className="relative w-full flex flex-col justify-end overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, #c0dbe2 0%, #d9e8ec 60%, #f5f7f9 100%)",
          }}>
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
              bottom: "3vh",
              left: "-2vw",
              fontSize: "clamp(11rem, 22vw, 30rem)",
              lineHeight: 1.2,
              letterSpacing: "-0.05em",
              color: "rgba(255,255,255,0.6)",
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
            }}>
            click & collect · pickup · 24/7
          </p>
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

          <div className="relative z-[1] px-[6vw] pb-[8vh] pt-[140px] max-w-[1200px] mx-auto w-full max-lg:pt-[120px] max-lg:pb-[6vh]">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#3a5a60] no-underline hover:text-[#0a2a2e] transition-colors mb-8"
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}>
              <span aria-hidden="true">&larr;</span>
              Strona glowna
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <span
                className="block"
                style={{ width: 36, height: 2, background: "#0086b0" }}
              />
              <p
                className="m-0 uppercase tracking-[0.22em] font-semibold text-[#0086b0]"
                style={{ fontSize: "clamp(0.72rem, 0.85vw, 0.85rem)" }}>
                Realizacje · {REALIZATIONS.length} wdrozen
              </p>
            </div>
            <h1
              className="m-0 mb-6 font-bold tracking-tight text-[#0a2a2e]"
              style={{
                fontSize: "clamp(2.6rem, 7vw, 5.6rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.025em",
              }}>
              PickUpWall <br />
              <span className="text-[#0a2a2e]/55">w akcji.</span>
            </h1>
            <p
              className="m-0 text-[#3a5a60] leading-relaxed"
              style={{
                fontSize: "clamp(1rem, 1.2vw, 1.2rem)",
                maxWidth: "640px",
              }}>
              Wybrane wdrozenia w punktach sprzedazy, galeriach handlowych,
              biurowcach i osiedlach mieszkaniowych w Polsce i za granica.
              Wiekszosc to uklad{" "}
              <strong className="text-[#0a2a2e]">Master + Slave</strong> — 79
              skrytek przy jednym punkcie obslugi.
            </p>
          </div>
        </section>

        {/* GRID — image-led cards with same overlay style as the homepage
            carousel cards, so visiting this list feels like a continuation
            of the carousel, not a different page. */}
        <section className="relative px-[6vw] pt-[10vh] pb-[14vh] max-w-[1300px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {REALIZATIONS.map((r, i) => {
              const slug = r.slug;
              return (
                <Link
                  key={`${r.title}-${i}`}
                  href={`/realizacje/${slug}`}
                  className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#0f1518] no-underline transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(10,30,38,0.18)]"
                  style={{
                    border: "1px solid rgba(10,42,46,0.06)",
                  }}>
                  <img
                    src={r.image}
                    alt={r.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ opacity: 0.7 }}
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(15,21,24,0.95) 0%, rgba(15,21,24,0.3) 55%, rgba(15,21,24,0) 100%)",
                    }}
                  />
                  <p
                    className="absolute top-5 left-5 m-0 uppercase tracking-widest font-bold text-[#7ed5e6]"
                    style={{ fontSize: "0.72rem" }}>
                    {String(i + 1).padStart(2, "0")} /{" "}
                    {String(REALIZATIONS.length).padStart(2, "0")}
                  </p>
                  <span
                    className="absolute top-5 right-5 inline-flex items-center justify-center text-white/80 transition-all group-hover:bg-[#0086b0] group-hover:text-white group-hover:border-[#0086b0]"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      backdropFilter: "blur(6px)",
                    }}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="M5 19l14-14M8 5h11v11" />
                    </svg>
                  </span>
                  <div className="absolute left-5 right-5 bottom-5 z-[2]">
                    <p
                      className="m-0 mb-1.5 uppercase tracking-[0.2em] font-semibold text-[#7ed5e6]"
                      style={{ fontSize: "0.66rem" }}>
                      {r.location}
                    </p>
                    <h2
                      className="m-0 mb-2 font-bold text-white"
                      style={{
                        fontSize: "1.4rem",
                        lineHeight: 1.15,
                        letterSpacing: "-0.015em",
                      }}>
                      {r.title}
                    </h2>
                    <p
                      className="m-0 text-white/70 leading-snug"
                      style={{ fontSize: "0.86rem" }}>
                      {r.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* CTA strip — dark band echoing the homepage Footer / Kontakt look,
            so the page closes with the same beat as the main scroll. */}
        <section className="relative bg-[#0f1518] text-white px-[6vw] py-[12vh] overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 50% 80% at 100% 50%, rgba(0,134,176,0.22) 0%, rgba(0,134,176,0) 70%)",
            }}
          />
          <div className="relative z-[1] max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <p
                className="m-0 mb-3 uppercase tracking-[0.22em] font-semibold text-[#7ed5e6]"
                style={{ fontSize: "0.72rem" }}>
                Wlasny projekt
              </p>
              <h2
                className="m-0 font-bold tracking-tight"
                style={{
                  fontSize: "clamp(1.8rem, 3.4vw, 3rem)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                }}>
                Planujesz wdrozenie PickUpWall?
              </h2>
              <p
                className="m-0 mt-4 text-white/65 leading-relaxed"
                style={{ fontSize: "1rem", maxWidth: "540px" }}>
                Dostosujemy format urzadzen, liczbe skrytek, obudowe i grafike
                pod potrzeby twojej marki i przestrzeni.
              </p>
            </div>
            <Link
              href="/#kontakt"
              className="inline-flex items-center gap-3 px-7 py-4 rounded-full text-white font-semibold uppercase tracking-[0.18em] no-underline hover:opacity-90 transition-opacity self-start md:self-end"
              style={{
                fontSize: "0.78rem",
                background: "#0086b0",
              }}>
              Porozmawiajmy
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

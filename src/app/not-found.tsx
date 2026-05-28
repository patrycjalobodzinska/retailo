import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "404 · Strona nie znaleziona · Retailo",
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main
        className="relative w-full overflow-hidden"
        style={{
          minHeight: "100dvh",
          background:
            "linear-gradient(45deg, #ffffff 0%, #f4f2ee 35%, #e0ddd8 70%, #cbc8c2 100%)",
          color: "#0a2a2e",
        }}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 50% at 0% 100%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 60%)",
          }}
        />

        {/* Wielki napis "404" w tle */}
        <h1
          aria-hidden="true"
          className="pointer-events-none absolute select-none m-0 font-black tracking-tighter text-[#0f0f0f] leading-[0.78]"
          style={{
            left: "-2vw",
            top: "18vh",
            right: "-2vw",
            fontSize: "clamp(8rem, 28vw, 28rem)",
            letterSpacing: "-0.06em",
            opacity: 0.08,
            zIndex: 1,
            whiteSpace: "nowrap",
            textAlign: "center",
          }}>
          404.
        </h1>

        <div className="relative z-[2] flex min-h-[100dvh] flex-col items-start justify-center px-[6vw] pt-[18vh] pb-[14vh]">
          <div className="mb-5 flex items-center gap-3">
            <span
              className="block h-px w-9"
              style={{ background: "#0086b0" }}
            />
            <span
              className="uppercase font-semibold tracking-[0.3em] text-[#0086b0]"
              style={{ fontSize: "0.62rem" }}>
              Blad 404 · Strona nie znaleziona
            </span>
          </div>

          <h2
            className="m-0 mb-6 max-w-[640px] font-black tracking-tighter text-[#0f0f0f]"
            style={{
              fontSize: "clamp(2.4rem, 5.6vw, 5.6rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.045em",
            }}>
            Tej strony tu nie ma.
          </h2>

          <p
            className="m-0 mb-9 max-w-[460px] font-light leading-relaxed text-[#3a3a3a]"
            style={{ fontSize: "clamp(1rem, 1.15vw, 1.13rem)" }}>
            Strona, ktorej szukasz, mogla zostac przeniesiona, usunieta, albo
            adres jest po prostu niewlasciwy. Sprawdz link albo wroc na strone
            glowna.
          </p>

          <div className="flex items-center gap-3 max-lg:flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-[#0f0f0f] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.22em] text-white no-underline transition hover:bg-[#1a1a1a]">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden>
                <path
                  d="M19 12H5M5 12l6-6M5 12l6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Strona glowna
            </Link>
            <Link
              href="/realizacje"
              className="inline-flex items-center gap-2.5 rounded-2xl border border-[#0a2a2e]/15 bg-white/65 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.22em] text-[#0a2a2e] no-underline backdrop-blur-sm transition hover:border-[#0a2a2e]/35">
              Zobacz realizacje
            </Link>
          </div>

          <div
            className="mt-12 grid max-w-[560px] grid-cols-2 gap-0 overflow-hidden rounded-2xl border border-[#0a2a2e]/8 bg-white/70 backdrop-blur-sm max-lg:grid-cols-1"
            style={{
              boxShadow:
                "0 1px 2px rgba(10,42,46,0.04), 0 12px 32px rgba(10,42,46,0.06)",
            }}>
            <Link
              href="/#kontakt"
              className="flex items-center justify-between gap-4 px-5 py-4 no-underline transition hover:bg-white/85">
              <span className="flex flex-col gap-0.5">
                <span
                  className="uppercase tracking-[0.18em] font-semibold text-[#7a7a7a]"
                  style={{ fontSize: "0.56rem" }}>
                  01 · Kontakt
                </span>
                <span
                  className="font-semibold tracking-tight text-[#0a2a2e]"
                  style={{ fontSize: "0.95rem" }}>
                  Porozmawiajmy
                </span>
              </span>
              <span aria-hidden className="text-[#0a2a2e]/55">
                &rarr;
              </span>
            </Link>
            <Link
              href="/realizacje"
              className="flex items-center justify-between gap-4 border-l border-[#0a2a2e]/8 px-5 py-4 no-underline transition hover:bg-white/85 max-lg:border-l-0 max-lg:border-t">
              <span className="flex flex-col gap-0.5">
                <span
                  className="uppercase tracking-[0.18em] font-semibold text-[#7a7a7a]"
                  style={{ fontSize: "0.56rem" }}>
                  02 · Realizacje
                </span>
                <span
                  className="font-semibold tracking-tight text-[#0a2a2e]"
                  style={{ fontSize: "0.95rem" }}>
                  Zobacz wdrozenia
                </span>
              </span>
              <span aria-hidden className="text-[#0a2a2e]/55">
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

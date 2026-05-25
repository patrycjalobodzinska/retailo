"use client";

// Inline'owy formularz kontaktowy używany na podstronach (np. /realizacje,
// /realizacje/[slug]) — ten sam wygląd co formularz w stopce sekcji
// Global na stronie głównej, tylko osadzony jako pełnoprawna sekcja CTA.

export default function ContactCtaForm() {
  return (
    <section
      id="kontakt"
      className="relative w-full overflow-hidden bg-[#0f1518] px-[6vw] py-[12vh] text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 100% 50%, rgba(0,134,176,0.22) 0%, rgba(0,134,176,0) 70%), radial-gradient(ellipse 40% 60% at 0% 0%, rgba(126,213,230,0.12) 0%, rgba(126,213,230,0) 70%)",
        }}
      />

      <div className="relative z-[1] mx-auto grid max-w-[1200px] grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
        <div>
          <p
            className="m-0 mb-3 uppercase tracking-[0.22em] font-semibold text-[#7ed5e6]"
            style={{ fontSize: "0.72rem" }}>
            Wlasny projekt
          </p>
          <h2
            className="m-0 font-semibold tracking-tight"
            style={{
              fontSize: "clamp(1.8rem, 3.4vw, 3rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}>
            Planujesz wdrozenie PickUpWall?
          </h2>
          <p
            className="m-0 mt-4 text-white/65 leading-relaxed"
            style={{ fontSize: "1rem", maxWidth: "480px" }}>
            Dostosujemy format urzadzen, liczbe skrytek, obudowe i grafike pod
            potrzeby twojej marki i przestrzeni.
          </p>
          <ul className="m-0 mt-6 flex list-none flex-col gap-2 p-0 text-sm text-white/75">
            <li className="flex items-center gap-2">
              <span className="block h-1 w-4 bg-[#7ed5e6]" />
              info@retailo.pl
            </li>
            <li className="flex items-center gap-2">
              <span className="block h-1 w-4 bg-[#7ed5e6]" />
              +48 123 456 789
            </li>
            <li className="flex items-center gap-2">
              <span className="block h-1 w-4 bg-[#7ed5e6]" />
              Odezwiemy sie w ciagu 24h
            </li>
          </ul>
        </div>

        <form
          className="rounded-2xl border border-white/15 bg-white/[0.04] p-5 backdrop-blur-md md:p-6"
          onSubmit={(e) => {
            e.preventDefault();
          }}>
          <div className="mb-4">
            <h3 className="m-0 text-base font-semibold tracking-tight text-white">
              Napisz do nas
            </h3>
            <p className="m-0 mt-1 text-xs text-white/55">
              Wszystkie pola wymagane.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <input
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Imie i nazwisko"
                className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none ring-[#59bfc8]/40 transition focus:border-[#59bfc8]/50 focus:ring-2"
              />
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="E-mail"
                className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none ring-[#59bfc8]/40 transition focus:border-[#59bfc8]/50 focus:ring-2"
              />
            </div>
            <input
              name="company"
              type="text"
              autoComplete="organization"
              placeholder="Firma (opcjonalnie)"
              className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none ring-[#59bfc8]/40 transition focus:border-[#59bfc8]/50 focus:ring-2"
            />
            <textarea
              name="message"
              rows={3}
              placeholder="Opisz krotko temat rozmowy..."
              className="resize-none rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none ring-[#59bfc8]/40 transition focus:border-[#59bfc8]/50 focus:ring-2"
            />
            <button
              type="submit"
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#0086b0] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:opacity-90">
              Porozmawiajmy
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden>
                <path
                  d="M5 12h14M19 12l-6-6M19 12l-6 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

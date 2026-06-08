"use client";

import { useState } from "react";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xojzdpep";

export default function ContactCtaForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle",
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (res.ok) {
        setStatus("ok");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="kontakt"
      className="relative w-full overflow-hidden px-[6vw] py-[12vh] text-[#0a2a2e] max-lg:pt-[6vh] max-lg:pb-[9vh]"
      style={{
        background:
          "linear-gradient(180deg, #ffffff 0%, #eef4f5 55%, #e4eeef 100%)",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 100% 50%, rgba(0,134,176,0.12) 0%, rgba(0,134,176,0) 70%), radial-gradient(ellipse 40% 60% at 0% 0%, rgba(126,213,230,0.18) 0%, rgba(126,213,230,0) 70%)",
        }}
      />

      <div className="relative z-[1] mx-auto grid max-w-[1200px] grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
        <div>
          <p
            className="m-0 mb-3 uppercase tracking-[0.22em] font-semibold text-[#0086b0]"
            style={{ fontSize: "0.72rem" }}
          >
            Wlasny projekt
          </p>
          <h2
            className="m-0 font-semibold tracking-tight text-[#0a2a2e]"
            style={{
              fontSize: "clamp(1.8rem, 3.4vw, 3rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            Planujesz wdrozenie PickUpWall?
          </h2>
          <p
            className="m-0 mt-4 text-[#3a5a60] leading-relaxed"
            style={{ fontSize: "1rem", maxWidth: "480px" }}
          >
            Dostosujemy format urzadzen, liczbe skrytek, obudowe i grafike pod
            potrzeby twojej marki i przestrzeni.
          </p>
          <ul className="m-0 mt-6 flex list-none flex-col gap-2 p-0 text-sm text-[#3a5a60]">
            <li className="flex items-center gap-2">
              <span className="block h-1 w-4 bg-[#0086b0]" />
              kontakt@retailo.pl
            </li>
            <li className="flex items-center gap-2">
              <span className="block h-1 w-4 bg-[#0086b0]" />
              +48 693 731 840
            </li>
            <li className="flex items-center gap-2">
              <span className="block h-1 w-4 bg-[#0086b0]" />
              +48 531 607 626
            </li>
            <li className="flex items-center gap-2">
              <span className="block h-1 w-4 bg-[#0086b0]" />
              Odezwiemy sie w ciagu 24h
            </li>
          </ul>
        </div>

        <form
          className="rounded-2xl border border-[#0a2a2e]/10 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,42,46,0.10)] backdrop-blur-sm md:p-6"
          onSubmit={handleSubmit}
        >
          <div className="mb-4">
            <h3 className="m-0 text-base font-semibold tracking-tight text-[#0a2a2e]">
              Napisz do nas
            </h3>
            <p className="m-0 mt-1 text-xs text-[#3a5a60]/80">
              Wszystkie pola wymagane.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <input
                name="name"
                type="text"
                autoComplete="name"
                aria-label="Imie i nazwisko"
                placeholder="Imie i nazwisko"
                className="rounded-lg border border-[#0a2a2e]/15 bg-white px-3 py-2 text-sm text-[#0a2a2e] placeholder:text-[#0a2a2e]/40 outline-none ring-[#0086b0]/30 transition focus:border-[#0086b0]/60 focus:ring-2"
              />
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-label="E-mail"
                placeholder="E-mail"
                className="rounded-lg border border-[#0a2a2e]/15 bg-white px-3 py-2 text-sm text-[#0a2a2e] placeholder:text-[#0a2a2e]/40 outline-none ring-[#0086b0]/30 transition focus:border-[#0086b0]/60 focus:ring-2"
              />
            </div>
            <input
              name="company"
              type="text"
              autoComplete="organization"
              aria-label="Firma (opcjonalnie)"
              placeholder="Firma (opcjonalnie)"
              className="rounded-lg border border-[#0a2a2e]/15 bg-white px-3 py-2 text-sm text-[#0a2a2e] placeholder:text-[#0a2a2e]/40 outline-none ring-[#0086b0]/30 transition focus:border-[#0086b0]/60 focus:ring-2"
            />
            <textarea
              name="message"
              rows={3}
              aria-label="Opisz krotko temat rozmowy..."
              placeholder="Opisz krotko temat rozmowy..."
              className="resize-none rounded-lg border border-[#0a2a2e]/15 bg-white px-3 py-2 text-sm text-[#0a2a2e] placeholder:text-[#0a2a2e]/40 outline-none ring-[#0086b0]/30 transition focus:border-[#0086b0]/60 focus:ring-2"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#0086b0] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {status === "sending" ? "Wysylanie..." : "Porozmawiajmy"}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M5 12h14M19 12l-6-6M19 12l-6 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {status === "ok" && (
              <p
                role="status"
                className="m-0 text-sm font-medium text-[#0086b0]"
              >
                Dziekujemy! Wiadomosc zostala wyslana.
              </p>
            )}
            {status === "error" && (
              <p role="alert" className="m-0 text-sm font-medium text-red-600">
                Cos poszlo nie tak. Sprobuj ponownie lub napisz na kontakt@retailo.pl.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

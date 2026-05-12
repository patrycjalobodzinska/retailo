"use client";

type Props = {
  bgImage: string;
  title?: string;
  location?: string;
};

export default function RealizationsRevealSection({ bgImage, title, location }: Props) {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      <img
        src={bgImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/55 to-black/85" />
      <div className="relative z-[5] h-full flex flex-col justify-end max-w-[1400px] mx-auto px-[6vw] pb-[12vh]">
        <span className="block text-[0.75rem] tracking-[0.3em] uppercase mb-3" style={{ color: "#0086b0" }}>
          retailo.
        </span>
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white max-w-[16ch]">
          {title ?? "Doswiadczenie w detalu"}
        </h2>
        {location && (
          <p className="mt-4 text-[0.85rem] tracking-[0.2em] uppercase text-white/70">
            {location}
          </p>
        )}
        <p className="mt-6 max-w-[540px] text-white/80 leading-relaxed text-[0.95rem]">
          Kazdy projekt zaczynamy od audytu lokacji. Doradzamy w doborze rozmiaru,
          polozenia i konfiguracji skrytek tak, by skala wdrozenia odpowiadala
          faktycznym potrzebom miejsca.
        </p>
      </div>
    </section>
  );
}

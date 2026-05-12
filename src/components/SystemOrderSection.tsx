export default function SystemOrderSection() {
  return (
    <section className="w-full bg-[#0f1518] text-white py-[12vh] px-[6vw]">
      <div className="max-w-[1200px] mx-auto">
        <h2
          className="font-bold uppercase tracking-tight m-0 mb-6"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.05 }}
        >
          System obslugi zamowien
        </h2>
        <p
          className="text-[#b8c5cb] max-w-[760px] m-0"
          style={{ fontSize: "clamp(1rem, 1.15vw, 1.15rem)", lineHeight: 1.6 }}
        >
          Kompletny stack do obslugi zamowien Click & Collect: integracja z
          systemami sprzedazowymi klienta, panel pracownika, powiadomienia
          serwisowe oraz analityka wykorzystania urzadzenia.
        </p>

        <div
          className="grid gap-8 mt-14"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          {[
            ["Panel pracownika", "Wsparcie procesu pakowania zamowien"],
            ["Notyfikacje", "Smsy / e-maile / push do klienta"],
            ["Integracja", "REST API, middleware, ERP / OMS"],
            ["Analityka", "Wykorzystanie skrytek, lead time, SLA"],
          ].map(([title, desc]) => (
            <div key={title}>
              <h3
                className="m-0 mb-2 font-semibold uppercase tracking-wide text-white"
                style={{ fontSize: "0.95rem" }}
              >
                {title}
              </h3>
              <p
                className="m-0 text-[#8a9aa0]"
                style={{ fontSize: "0.9rem", lineHeight: 1.55 }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { PortableText } from "next-sanity";
import { useLang } from "@/lib/i18n/LanguageProvider";
import type { LegalPage } from "@/lib/sanity/fetch";
import type { PortableTextBlock } from "@portabletext/types";
import { BODY_COMPONENTS } from "@/components/portableTextComponents";
import { CookieSettingsLink } from "@/components/CookieConsent";

const SECTION_TITLE =
  "m-0 mt-10 mb-3 font-bold tracking-tight text-[#0a2a2e] text-[clamp(1.2rem,2vw,1.5rem)]";
const PARA = "m-0 mt-3 text-[#3a5a60] leading-relaxed text-[0.95rem]";
const LIST =
  "m-0 mt-3 pl-5 list-disc text-[#3a5a60] leading-relaxed text-[0.95rem] [&>li]:mt-1.5";

function resolveBlocks(
  page: LegalPage,
  lang: string,
): PortableTextBlock[] | null {
  const translations = page?.body?.translations ?? [];
  const exact = translations.find((t) => t?.language?.code === lang)?.value;
  if (exact?.length) return exact;
  const pl = translations.find((t) => t?.language?.code === "pl")?.value;
  if (pl?.length) return pl;
  const first = translations.find((t) => t?.value?.length)?.value;
  return first ?? null;
}

export default function PrivacyPolicyContent({ page }: { page: LegalPage }) {
  const { lang, t } = useLang();
  const blocks = resolveBlocks(page, lang);
  const title =
    t(page?.title ?? null) || "Polityka prywatności i plików cookies";
  const effectiveDate =
    t(page?.effectiveDate ?? null) || "Obowiązuje od 3 czerwca 2026 r.";

  return (
    <main className="relative w-full bg-white text-[#0a2a2e]">
      <section
        className="relative w-full overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #c0dbe2 0%, #d6e4e9 55%, #ffffff 100%)",
        }}>
        <div className="relative z-[1] mx-auto w-full max-w-[900px] px-[6vw] pb-[6vh] pt-[120px] max-lg:pt-[96px]">
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-2 text-[#3a5a60] no-underline transition-colors hover:text-[#0a2a2e]"
            style={{
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}>
            <span aria-hidden="true">&larr;</span>
            Strona główna
          </Link>
          <h1
            className="m-0 font-bold tracking-tight"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}>
            {title}
          </h1>
          <p className="m-0 mt-3 text-[#3a5a60]" style={{ fontSize: "0.9rem" }}>
            {effectiveDate}
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[900px] px-[6vw] pb-[14vh]">
        {blocks ? (
          <PortableText value={blocks} components={BODY_COMPONENTS} />
        ) : (
          <FallbackPolicyPl />
        )}

        <p className={PARA + " mt-8"}>
          Swoją decyzję dotyczącą cookies możesz w każdej chwili zmienić:{" "}
          <CookieSettingsLink className="border-0 bg-transparent p-0 text-[0.95rem] text-[#0086b0] underline underline-offset-2" />
          .
        </p>
      </section>
    </main>
  );
}

function FallbackPolicyPl() {
  return (
    <>
      <h2 className={SECTION_TITLE}>1. Administrator danych</h2>
      <p className={PARA}>
        Administratorem danych osobowych zbieranych za pośrednictwem serwisu
        retailo.pl (dalej: &bdquo;Serwis&rdquo;) jest{" "}
        <strong className="text-[#0a2a2e]">Retailo sp. z o.o.</strong> z
        siedzibą w Rzeszowie, Pl. Jana Kilińskiego 2, 35-005 Rzeszów, Polska,
        wpisana do rejestru przedsiębiorców Krajowego Rejestru Sądowego pod
        numerem KRS 0000847391, NIP 5170407536, REGON 386366874, kapitał
        zakładowy 5 000 zł (dalej: &bdquo;Administrator&rdquo;).
      </p>
      <p className={PARA}>
        Kontakt w sprawach ochrony danych osobowych: e-mail{" "}
        <a
          href="mailto:kontakt@retailo.pl"
          className="text-[#0086b0] underline underline-offset-2">
          kontakt@retailo.pl
        </a>{" "}
        lub pisemnie na adres siedziby Administratora.
      </p>

      <h2 className={SECTION_TITLE}>2. Zakres i cele przetwarzania</h2>
      <p className={PARA}>
        W zależności od sposobu korzystania z Serwisu przetwarzamy następujące
        kategorie danych w następujących celach:
      </p>
      <ul className={LIST}>
        <li>
          <strong className="text-[#0a2a2e]">Formularz kontaktowy</strong> -
          imię i nazwisko, adres e-mail, numer telefonu oraz treść wiadomości;
          w celu udzielenia odpowiedzi na zapytanie i prowadzenia
          korespondencji (art. 6 ust. 1 lit. f RODO - prawnie uzasadniony
          interes Administratora polegający na obsłudze zapytań, a w przypadku
          zmierzania do zawarcia umowy - art. 6 ust. 1 lit. b RODO).
        </li>
        <li>
          <strong className="text-[#0a2a2e]">
            Statystyki odwiedzin (Google Analytics 4)
          </strong>{" "}
          - dane o sposobie korzystania z Serwisu (m.in. odwiedzone podstrony,
          czas wizyty, przybliżona lokalizacja, typ urządzenia, pseudonimowy
          identyfikator); w celu analizy ruchu i ulepszania Serwisu - wyłącznie
          za Twoją uprzednią zgodą (art. 6 ust. 1 lit. a RODO oraz art. 399
          ustawy z 12 lipca 2024 r. - Prawo komunikacji elektronicznej).
        </li>
        <li>
          <strong className="text-[#0a2a2e]">Dane techniczne</strong> - adres
          IP i dane logowania serwera; w celu zapewnienia bezpieczeństwa i
          prawidłowego działania Serwisu (art. 6 ust. 1 lit. f RODO).
        </li>
      </ul>
      <p className={PARA}>
        Podanie danych jest dobrowolne, ale niezbędne do skorzystania z
        formularza kontaktowego. Nie podejmujemy decyzji opartych wyłącznie na
        zautomatyzowanym przetwarzaniu, w tym profilowaniu, które wywoływałyby
        wobec Ciebie skutki prawne.
      </p>

      <h2 className={SECTION_TITLE}>3. Odbiorcy danych</h2>
      <p className={PARA}>
        Dane mogą być powierzane podmiotom przetwarzającym je na zlecenie
        Administratora, wyłącznie w zakresie niezbędnym do świadczenia usług:
      </p>
      <ul className={LIST}>
        <li>dostawcom hostingu i infrastruktury IT,</li>
        <li>
          Google Ireland Limited / Google LLC - w zakresie usługi Google
          Analytics 4 (wyłącznie po wyrażeniu zgody na cookies analityczne),
        </li>
        <li>
          podmiotom świadczącym usługi księgowe, prawne lub doradcze - w
          zakresie, w jakim jest to niezbędne.
        </li>
      </ul>
      <p className={PARA}>
        W związku z korzystaniem z Google Analytics dane mogą być przekazywane
        do państw trzecich (USA). Przekazanie odbywa się na podstawie decyzji
        Komisji Europejskiej z 10 lipca 2023 r. (EU-US Data Privacy
        Framework), do którego Google LLC przystąpiło, oraz standardowych
        klauzul umownych.
      </p>

      <h2 className={SECTION_TITLE}>4. Okres przechowywania</h2>
      <ul className={LIST}>
        <li>
          dane z formularza kontaktowego - przez czas prowadzenia
          korespondencji, a następnie przez okres przedawnienia ewentualnych
          roszczeń,
        </li>
        <li>dane analityczne (GA4) - maksymalnie 14 miesięcy od zebrania,</li>
        <li>logi serwera - do 12 miesięcy.</li>
      </ul>

      <h2 className={SECTION_TITLE}>5. Twoje prawa</h2>
      <p className={PARA}>Zgodnie z RODO przysługuje Ci prawo do:</p>
      <ul className={LIST}>
        <li>dostępu do swoich danych oraz otrzymania ich kopii,</li>
        <li>sprostowania (poprawiania) danych,</li>
        <li>usunięcia danych,</li>
        <li>ograniczenia przetwarzania,</li>
        <li>przenoszenia danych,</li>
        <li>
          sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym
          interesie,
        </li>
        <li>
          cofnięcia zgody w dowolnym momencie - bez wpływu na zgodność z
          prawem przetwarzania dokonanego przed jej cofnięciem,
        </li>
        <li>
          wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (ul.
          Stawki 2, 00-193 Warszawa, uodo.gov.pl).
        </li>
      </ul>
      <p className={PARA}>
        Aby skorzystać z powyższych praw, skontaktuj się z nami pod adresem
        kontakt@retailo.pl.
      </p>

      <h2 className={SECTION_TITLE}>6. Pliki cookies</h2>
      <p className={PARA}>
        Serwis używa plików cookies (niewielkich plików tekstowych
        zapisywanych na Twoim urządzeniu) oraz podobnych technologii.
        Stosujemy następujące kategorie:
      </p>
      <ul className={LIST}>
        <li>
          <strong className="text-[#0a2a2e]">Niezbędne</strong> - wymagane do
          prawidłowego działania Serwisu, m.in. zapamiętanie Twojej decyzji
          dotyczącej cookies (lokalny zapis
          &bdquo;retailo_cookie_consent_v1&rdquo;, przechowywany do czasu
          usunięcia). Ich stosowanie nie wymaga zgody.
        </li>
        <li>
          <strong className="text-[#0a2a2e]">Analityczne</strong> - cookies
          Google Analytics 4 (m.in. &bdquo;_ga&rdquo;, &bdquo;_ga_*&rdquo;;
          przechowywane do 24 miesięcy), służące do tworzenia anonimowych
          statystyk odwiedzin. Są instalowane{" "}
          <strong className="text-[#0a2a2e]">
            wyłącznie po wyrażeniu przez Ciebie zgody
          </strong>{" "}
          w banerze cookies. Brak zgody lub jej cofnięcie oznacza, że skrypty
          Google Analytics w ogóle się nie ładują.
        </li>
      </ul>
      <p className={PARA}>
        Nie stosujemy cookies marketingowych ani reklamowych. Sygnały
        reklamowe Google (ad_storage, ad_user_data, ad_personalization) są na
        stałe ustawione jako &bdquo;denied&rdquo; (Google Consent Mode v2).
      </p>

      <h2 className={SECTION_TITLE}>7. Zmiany polityki</h2>
      <p className={PARA}>
        Polityka może być aktualizowana, m.in. w razie zmian przepisów lub
        funkcji Serwisu. Aktualna wersja jest zawsze dostępna pod adresem
        retailo.pl/polityka-prywatnosci wraz z datą obowiązywania.
      </p>
    </>
  );
}

// Seed treści prawnych: tworzy dokument legalPage (polityka prywatności,
// PL + EN, rich text) i uzupełnia siteSettings o teksty banera cookies.
// Uruchom: node scripts/seed-legal.mjs
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01",
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// ── Języki ───────────────────────────────────────────────────────────
const langs = await client.fetch(`*[_type == "language"]{ _id, code }`);
const langId = (code) => langs.find((l) => l.code === code)?._id;
const PL = langId("pl");
const EN = langId("en");
if (!PL) {
  console.error("Brak języka 'pl' w Sanity — najpierw zaseeduj języki.");
  process.exit(1);
}

let key = 0;
const block = (text, style = "normal", listItem) => ({
  _type: "block",
  _key: `b${++key}`,
  style,
  ...(listItem ? { listItem, level: 1 } : {}),
  markDefs: [],
  children: [{ _type: "span", _key: `b${key}s`, text, marks: [] }],
});
const li = (text) => block(text, "normal", "bullet");

// ── Treść PL ─────────────────────────────────────────────────────────
const bodyPl = [
  block("1. Administrator danych", "h2"),
  block(
    "Administratorem danych osobowych zbieranych za pośrednictwem serwisu retailo.pl (dalej: „Serwis”) jest Retailo sp. z o.o. z siedzibą w Rzeszowie, Pl. Jana Kilińskiego 2, 35-005 Rzeszów, Polska, wpisana do rejestru przedsiębiorców Krajowego Rejestru Sądowego pod numerem KRS 0000847391, NIP 5170407536, REGON 386366874, kapitał zakładowy 5 000 zł (dalej: „Administrator”).",
  ),
  block(
    "Kontakt w sprawach ochrony danych osobowych: e-mail info@retailo.pl lub pisemnie na adres siedziby Administratora.",
  ),
  block("2. Zakres i cele przetwarzania", "h2"),
  block(
    "W zależności od sposobu korzystania z Serwisu przetwarzamy następujące kategorie danych w następujących celach:",
  ),
  li(
    "Formularz kontaktowy — imię i nazwisko, adres e-mail, numer telefonu oraz treść wiadomości; w celu udzielenia odpowiedzi na zapytanie i prowadzenia korespondencji (art. 6 ust. 1 lit. f RODO — prawnie uzasadniony interes Administratora polegający na obsłudze zapytań, a w przypadku zmierzania do zawarcia umowy — art. 6 ust. 1 lit. b RODO).",
  ),
  li(
    "Statystyki odwiedzin (Google Analytics 4) — dane o sposobie korzystania z Serwisu (m.in. odwiedzone podstrony, czas wizyty, przybliżona lokalizacja, typ urządzenia, pseudonimowy identyfikator); w celu analizy ruchu i ulepszania Serwisu — wyłącznie za Twoją uprzednią zgodą (art. 6 ust. 1 lit. a RODO oraz art. 399 ustawy z 12 lipca 2024 r. — Prawo komunikacji elektronicznej).",
  ),
  li(
    "Dane techniczne — adres IP i dane logowania serwera; w celu zapewnienia bezpieczeństwa i prawidłowego działania Serwisu (art. 6 ust. 1 lit. f RODO).",
  ),
  block(
    "Podanie danych jest dobrowolne, ale niezbędne do skorzystania z formularza kontaktowego. Nie podejmujemy decyzji opartych wyłącznie na zautomatyzowanym przetwarzaniu, w tym profilowaniu, które wywoływałyby wobec Ciebie skutki prawne.",
  ),
  block("3. Odbiorcy danych", "h2"),
  block(
    "Dane mogą być powierzane podmiotom przetwarzającym je na zlecenie Administratora, wyłącznie w zakresie niezbędnym do świadczenia usług:",
  ),
  li("dostawcom hostingu i infrastruktury IT,"),
  li(
    "Google Ireland Limited / Google LLC — w zakresie usługi Google Analytics 4 (wyłącznie po wyrażeniu zgody na cookies analityczne),",
  ),
  li(
    "podmiotom świadczącym usługi księgowe, prawne lub doradcze — w zakresie, w jakim jest to niezbędne.",
  ),
  block(
    "W związku z korzystaniem z Google Analytics dane mogą być przekazywane do państw trzecich (USA). Przekazanie odbywa się na podstawie decyzji Komisji Europejskiej z 10 lipca 2023 r. (EU-US Data Privacy Framework), do którego Google LLC przystąpiło, oraz standardowych klauzul umownych.",
  ),
  block("4. Okres przechowywania", "h2"),
  li(
    "dane z formularza kontaktowego — przez czas prowadzenia korespondencji, a następnie przez okres przedawnienia ewentualnych roszczeń,",
  ),
  li("dane analityczne (GA4) — maksymalnie 14 miesięcy od zebrania,"),
  li("logi serwera — do 12 miesięcy."),
  block("5. Twoje prawa", "h2"),
  block("Zgodnie z RODO przysługuje Ci prawo do:"),
  li("dostępu do swoich danych oraz otrzymania ich kopii,"),
  li("sprostowania (poprawiania) danych,"),
  li("usunięcia danych,"),
  li("ograniczenia przetwarzania,"),
  li("przenoszenia danych,"),
  li("sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie,"),
  li(
    "cofnięcia zgody w dowolnym momencie — bez wpływu na zgodność z prawem przetwarzania dokonanego przed jej cofnięciem,",
  ),
  li(
    "wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa, uodo.gov.pl).",
  ),
  block(
    "Aby skorzystać z powyższych praw, skontaktuj się z nami pod adresem info@retailo.pl.",
  ),
  block("6. Pliki cookies", "h2"),
  block(
    "Serwis używa plików cookies (niewielkich plików tekstowych zapisywanych na Twoim urządzeniu) oraz podobnych technologii. Stosujemy następujące kategorie:",
  ),
  li(
    "Niezbędne — wymagane do prawidłowego działania Serwisu, m.in. zapamiętanie Twojej decyzji dotyczącej cookies (lokalny zapis „retailo_cookie_consent_v1”, przechowywany do czasu usunięcia). Ich stosowanie nie wymaga zgody.",
  ),
  li(
    "Analityczne — cookies Google Analytics 4 (m.in. „_ga”, „_ga_*”; przechowywane do 24 miesięcy), służące do tworzenia anonimowych statystyk odwiedzin. Są instalowane wyłącznie po wyrażeniu przez Ciebie zgody w banerze cookies. Brak zgody lub jej cofnięcie oznacza, że skrypty Google Analytics w ogóle się nie ładują.",
  ),
  block(
    "Nie stosujemy cookies marketingowych ani reklamowych. Sygnały reklamowe Google (ad_storage, ad_user_data, ad_personalization) są na stałe ustawione jako „denied” (Google Consent Mode v2).",
  ),
  block("7. Zmiany polityki", "h2"),
  block(
    "Polityka może być aktualizowana, m.in. w razie zmian przepisów lub funkcji Serwisu. Aktualna wersja jest zawsze dostępna pod adresem retailo.pl/polityka-prywatnosci wraz z datą obowiązywania.",
  ),
];

// ── Treść EN ─────────────────────────────────────────────────────────
const bodyEn = [
  block("1. Data controller", "h2"),
  block(
    "The controller of personal data collected via the retailo.pl website (the “Website”) is Retailo sp. z o.o. with its registered office in Rzeszów, Pl. Jana Kilińskiego 2, 35-005 Rzeszów, Poland, entered in the register of entrepreneurs of the National Court Register under KRS number 0000847391, NIP (tax ID) 5170407536, REGON 386366874, share capital PLN 5,000 (the “Controller”).",
  ),
  block(
    "Contact regarding personal data protection: e-mail info@retailo.pl or in writing to the Controller's registered office.",
  ),
  block("2. Scope and purposes of processing", "h2"),
  block(
    "Depending on how you use the Website, we process the following categories of data for the following purposes:",
  ),
  li(
    "Contact form — name, e-mail address, phone number and the content of your message; to respond to your inquiry and conduct correspondence (Art. 6(1)(f) GDPR — the Controller's legitimate interest in handling inquiries, and where steps are taken towards concluding a contract — Art. 6(1)(b) GDPR).",
  ),
  li(
    "Visit statistics (Google Analytics 4) — data on how you use the Website (pages visited, visit duration, approximate location, device type, pseudonymous identifier); to analyse traffic and improve the Website — solely with your prior consent (Art. 6(1)(a) GDPR and Art. 399 of the Polish Electronic Communications Act of 12 July 2024).",
  ),
  li(
    "Technical data — IP address and server logs; to ensure the security and proper functioning of the Website (Art. 6(1)(f) GDPR).",
  ),
  block(
    "Providing data is voluntary but necessary to use the contact form. We do not make decisions based solely on automated processing, including profiling, that would produce legal effects concerning you.",
  ),
  block("3. Data recipients", "h2"),
  block(
    "Data may be entrusted to processors acting on the Controller's behalf, solely to the extent necessary to provide services:",
  ),
  li("hosting and IT infrastructure providers,"),
  li(
    "Google Ireland Limited / Google LLC — for the Google Analytics 4 service (only after you consent to analytics cookies),",
  ),
  li(
    "entities providing accounting, legal or advisory services — to the extent necessary.",
  ),
  block(
    "In connection with Google Analytics, data may be transferred to third countries (USA). The transfer takes place on the basis of the European Commission's adequacy decision of 10 July 2023 (EU-US Data Privacy Framework), to which Google LLC is certified, and standard contractual clauses.",
  ),
  block("4. Retention periods", "h2"),
  li(
    "contact form data — for the duration of the correspondence and then for the limitation period of potential claims,",
  ),
  li("analytics data (GA4) — up to 14 months from collection,"),
  li("server logs — up to 12 months."),
  block("5. Your rights", "h2"),
  block("Under the GDPR you have the right to:"),
  li("access your data and obtain a copy of it,"),
  li("rectify (correct) your data,"),
  li("erase your data,"),
  li("restrict processing,"),
  li("data portability,"),
  li("object to processing based on legitimate interest,"),
  li(
    "withdraw consent at any time — without affecting the lawfulness of processing carried out before its withdrawal,",
  ),
  li(
    "lodge a complaint with the President of the Polish Personal Data Protection Office (UODO, ul. Stawki 2, 00-193 Warsaw, uodo.gov.pl).",
  ),
  block("To exercise these rights, contact us at info@retailo.pl."),
  block("6. Cookies", "h2"),
  block(
    "The Website uses cookies (small text files stored on your device) and similar technologies. We use the following categories:",
  ),
  li(
    "Necessary — required for the Website to function properly, e.g. remembering your cookie decision (local entry “retailo_cookie_consent_v1”, stored until deleted). Their use does not require consent.",
  ),
  li(
    "Analytics — Google Analytics 4 cookies (e.g. “_ga”, “_ga_*”; stored for up to 24 months) used to produce anonymous visit statistics. They are set only after you give consent in the cookie banner. Without consent, or after its withdrawal, Google Analytics scripts do not load at all.",
  ),
  block(
    "We do not use marketing or advertising cookies. Google advertising signals (ad_storage, ad_user_data, ad_personalization) are permanently set to “denied” (Google Consent Mode v2).",
  ),
  block("7. Changes to this policy", "h2"),
  block(
    "This policy may be updated, e.g. when regulations or Website features change. The current version is always available at retailo.pl/polityka-prywatnosci together with its effective date.",
  ),
];

const tr = (plValue, enValue, type = "string") => ({
  translations: [
    {
      _type: "translation",
      _key: "pl",
      language: { _type: "reference", _ref: PL },
      value: plValue,
    },
    ...(EN
      ? [
          {
            _type: "translation",
            _key: "en",
            language: { _type: "reference", _ref: EN },
            value: enValue,
          },
        ]
      : []),
  ],
});

// ── legalPage ────────────────────────────────────────────────────────
await client.createOrReplace({
  _id: "legalPage-polityka-prywatnosci",
  _type: "legalPage",
  slug: { _type: "slug", current: "polityka-prywatnosci" },
  title: tr(
    "Polityka prywatności i plików cookies",
    "Privacy and cookies policy",
  ),
  effectiveDate: tr(
    "Obowiązuje od 3 czerwca 2026 r.",
    "Effective from 3 June 2026",
  ),
  body: tr(bodyPl, bodyEn),
});
console.log("Zaseedowano legalPage: polityka-prywatnosci (PL+EN)");

// ── siteSettings: teksty banera cookies ─────────────────────────────
const settings = await client.fetch(`*[_type == "siteSettings"][0]{ _id }`);
if (!settings?._id) {
  console.error("Brak dokumentu siteSettings — pomijam teksty banera.");
  process.exit(0);
}

await client
  .patch(settings._id)
  .set({
    cookieTitle: tr("Szanujemy Twoją prywatność", "We respect your privacy"),
    cookieText: tr(
      "Używamy niezbędnych plików cookies, aby strona działała poprawnie. Za Twoją zgodą użyjemy także cookies analitycznych (Google Analytics), aby zrozumieć, jak korzystasz z serwisu. Zgodę możesz wycofać w każdej chwili.",
      "We use necessary cookies to make the site work properly. With your consent we will also use analytics cookies (Google Analytics) to understand how you use the site. You can withdraw your consent at any time.",
    ),
    cookieAcceptLabel: tr("Akceptuję wszystkie", "Accept all"),
    cookieRejectLabel: tr("Odrzucam", "Reject"),
    cookieCustomizeLabel: tr("Dostosuj", "Customise"),
    cookieSaveLabel: tr("Zapisz wybór", "Save choice"),
    cookieSettingsTitle: tr("Ustawienia cookies", "Cookie settings"),
    cookieNecessaryTitle: tr(
      "Niezbędne — zawsze aktywne",
      "Necessary — always active",
    ),
    cookieNecessaryDesc: tr(
      "Wymagane do działania strony (np. zapamiętanie Twojej decyzji o cookies). Nie zbierają danych do analityki ani marketingu.",
      "Required for the site to work (e.g. remembering your cookie decision). They do not collect analytics or marketing data.",
    ),
    cookieAnalyticsTitle: tr(
      "Analityczne (Google Analytics)",
      "Analytics (Google Analytics)",
    ),
    cookieAnalyticsDesc: tr(
      "Anonimowe statystyki odwiedzin (Google Analytics 4) — pomagają nam ulepszać stronę. Dane mogą być przekazywane do Google LLC. Włączane dopiero po Twojej zgodzie.",
      "Anonymous visit statistics (Google Analytics 4) that help us improve the site. Data may be shared with Google LLC. Enabled only after your consent.",
    ),
    cookieSettingsLinkLabel: tr("Ustawienia cookies", "Cookie settings"),
  })
  .commit();
console.log("Zaktualizowano siteSettings o teksty banera cookies (PL+EN).");
console.log("Gotowe.");

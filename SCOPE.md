# retailo. — Zakres prac i specyfikacja techniczna

## 1. Opis projektu

Strona internetowa typu landing page / corporate website dla firmy Retailo — producenta automatow paczkowych PickUpWall. Strona ma charakter wizerunkowy z elementami interaktywnymi, animacjami scroll-driven i sekcja portfolio zarzadzana z CMS.

---

## 2. Zakres prac

### 2.1 Frontend — implementacja i animacje

| Element | Opis | Technologia |
|---|---|---|
| Hero | Fullscreen hero z animacja wejscia (GSAP timeline), obraz tla, typografia animowana | Next.js, GSAP, Tailwind |
| Sekcja QA / Rozwiazanie | Scroll-driven sekcja z pinowana ikona (ScrollTrigger), dynamiczne podswietlanie aktywnego elementu na podstawie pozycji scrolla, animacja rozsuwania/opacity | GSAP ScrollTrigger, IntersectionObserver |
| Product Showcase | Pinowana sekcja (+=500% scroll distance), obraz wjezdza od dolu, zmniejsza sie, mask-based wipe transition miedzy zdjeciami (CSS mask-image + GSAP), sekcja z trescia wjezdza od gory | GSAP ScrollTrigger (pin, scrub), CSS masks |
| Sekcja Global / Glob 3D | Interaktywny glob 3D z granicami panstow (GeoJSON), lukami (arcs) miedzy stolicami, lazy loading (IntersectionObserver — glob renderuje sie tylko gdy widoczny), hover rotation, lista krajow z animacja stagger | react-globe.gl, Three.js, GSAP |
| Sekcja Realizacje (do zrobienia) | Sekcja portfolio/wdrozen z animacja — dane z Sanity CMS, galeria/slider z case studies | Next.js, Sanity, GSAP |
| Header | Fixed header z animacja wejscia, zmiana koloru tekstu w zaleznosci od sekcji | GSAP |
| Footer | Backdrop-blur footer z formularzem kontaktowym (CTA) | Tailwind, Next.js |
| Responsywnosc | Pelna responsywnosc wszystkich sekcji (mobile, tablet, desktop) | Tailwind breakpoints |

### 2.2 System zarzadzania trescia (CMS)

| Element | Opis | Technologia |
|---|---|---|
| Sanity Studio | Konfiguracja Sanity CMS — schemat danych, studio, deployment | Sanity v3 |
| Schema: Realizacje | Typ dokumentu: tytul, opis, zdjecia (galeria), kraj, data, kategoria, status | Sanity Schema |
| Schema: Tresci statyczne | Opcjonalnie: edycja tekstow na stronie z poziomu CMS (hero, QA, specyfikacje) | Sanity + GROQ |
| Integracja Next.js ↔ Sanity | Pobieranie danych przez GROQ, ISR (Incremental Static Regeneration) lub on-demand revalidation | Next.js App Router, Sanity Client |
| Hosting obrazow | Obsluga obrazow przez Sanity CDN (hotspot, crop, responsive sizes) | @sanity/image-url |

### 2.3 SEO

| Element | Opis |
|---|---|
| Meta tagi | title, description, og:image, twitter:card per page |
| Structured Data | JSON-LD: Organization, Product, BreadcrumbList |
| Sitemap | Automatyczny sitemap.xml (next-sitemap lub wbudowany Next.js) |
| robots.txt | Konfiguracja crawlowania |
| Performance SEO | Core Web Vitals: lazy loading obrazow, font preload, minimalizacja CLS |
| Semantic HTML | Prawidlowa struktura naglowkow, aria-labels, alt texty |
| Open Graph | Obrazy OG per strona, podglad w social media |

### 2.4 Analityka

| Element | Opis | Technologia |
|---|---|---|
| Google Analytics 4 | Implementacja GA4 z consent mode | @next/third-parties lub gtag.js |
| Zdarzenia | Scroll depth, klikniecia CTA, otwarcie formularza kontaktowego, interakcja z globem | GA4 custom events |
| Cookie consent | Banner zgody na cookies (RODO) | Wlasny lub cookieyes/cookiebot |

---

## 3. Stack technologiczny

| Warstwa | Technologia | Wersja |
|---|---|---|
| Framework | Next.js (App Router) | 15.x |
| Jezyk | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Animacje | GSAP + ScrollTrigger | 3.x |
| 3D Globe | react-globe.gl + Three.js | latest |
| CMS | Sanity | v3 |
| Hosting | Vercel | — |
| Analityka | Google Analytics 4 | — |
| Font | Archivo (Google Fonts via next/font) | — |

---

## 4. Infrastruktura i deployment

| Element | Opis |
|---|---|
| Hosting | Vercel (zintegrowany z Next.js, edge functions, ISR) |
| Domena | Konfiguracja DNS pod retailo.pl |
| SSL | Automatyczny via Vercel |
| CI/CD | Automatyczny deploy z main branch (GitHub → Vercel) |
| Srodowisko preview | Kazdy PR dostaje preview URL |
| CMS hosting | Sanity Cloud (darmowy plan do 100k API requests/msc) |

---

## 5. Realizacje — szczegoly sekcji (do zrobienia)

Sekcja prezentujaca wdrozenia/case studies. Dane zarzadzane z Sanity CMS.

**Funkcjonalnosc:**
- Lista realizacji z filtracja (kraj, typ wdrozenia)
- Strona szczegolowa per realizacja (dynamiczny routing /realizacje/[slug])
- Galeria zdjec z lightboxem
- Animacja wejscia elementow (GSAP stagger)
- Opcjonalnie: mapa z pinami wdrozen (reuse komponentu globu)

**Sanity schema:**
```
realizacja {
  title: string
  slug: slug
  description: text
  images: array of image
  country: string
  date: date
  category: string (enum: retail, logistics, e-commerce)
  featured: boolean
}
```

---

## 6. Estymacja czasowa

| Zadanie | Godziny |
|---|---|
| Frontend — sekcje z animacjami (zrobione) | ~40h |
| Sekcja Realizacje + animacje | ~12h |
| Sanity CMS — setup, schema, integracja | ~10h |
| SEO — meta, structured data, sitemap, OG | ~4h |
| Google Analytics 4 + eventy + consent | ~4h |
| Responsywnosc — QA i poprawki mobile/tablet | ~8h |
| Testy, bugfixy, optymalizacja performance | ~8h |
| Deployment, DNS, konfiguracja Vercel | ~2h |
| **RAZEM** | **~88h** |

---

## 7. Co jest poza zakresem

- Copywriting (tresci dostarcza klient lub kopiujemy z obecnej strony)
- Projekt graficzny / UI design (strona bazuje na wskazaniach klienta + referencjach)
- Backend / API (poza Sanity CMS)
- Aplikacja mobilna
- System e-commerce / platnosci
- Tlumaczenia (strona w jednej wersji jezykowej)
- Utrzymanie i aktualizacje po wdrozeniu (osobna umowa)

---

## 8. Uwagi techniczne

- **GSAP ScrollTrigger** — uzyty w 3 sekcjach z pin/scrub. Kazda pinowana sekcja dodaje wirtualny scroll distance (np. +=500%), co wydluza strone. Przetestowane pod katem performance (will-change, lazy loading globu, brak rAF loop gdy poza viewport).
- **react-globe.gl / Three.js** — ciezki komponent (~500KB). Renderuje sie TYLKO gdy widoczny (IntersectionObserver). WebGL error boundary zapobiega crashowi strony gdy GPU niedostepne. Fallback: statyczny gradient.
- **Tailwind CSS v4** — wymaga Node.js >= 22 i PostCSS. Brak CSS Modules — wszystko w Tailwind utility classes + inline styles dla dynamicznych wartosci.
- **Next.js App Router** — uzywa "use client" na komponentach z GSAP/Three.js. Server Components dla layoutu i statycznych elementow. Dynamic import z ssr: false dla globu.

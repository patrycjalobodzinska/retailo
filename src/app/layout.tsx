import type { Metadata } from "next";
import { Roboto, Raleway } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { IntlBridge } from "@/lib/i18n/IntlBridge";
import {
  getDefaultLanguage,
  getLanguages,
  getSiteSettings,
} from "@/lib/sanity/fetch";

// Body / UI font — from the brand book (Roboto Regular / Italic / Bold).
const roboto = Roboto({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
});

// Display / logo font — Raleway is the wordmark face in the brand book.
const raleway = Raleway({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-raleway",
});

const FALLBACK_TITLE =
  "Retailo — Automatyczne systemy odbioru przesyłek PickUpWall";
const FALLBACK_DESCRIPTION =
  "PickUpWall — automatyczne, modułowe systemy odbioru przesyłek pick-up in store dla sieci retailu. Projektujemy, produkujemy i wdrażamy w całej Europie.";
const FALLBACK_OG_IMAGE = "/model3_retailo.png";
const FALLBACK_URL = "https://retailo.pl";

export async function generateMetadata(): Promise<Metadata> {
  let settings: Awaited<ReturnType<typeof getSiteSettings>> = null;
  try {
    settings = await getSiteSettings();
  } catch {
    // pad do fallbackow
  }

  const title = settings?.metaTitle || FALLBACK_TITLE;
  const description = settings?.metaDescription || FALLBACK_DESCRIPTION;
  const baseUrl = settings?.siteUrl || FALLBACK_URL;
  const ogImagePath = settings?.ogImage || FALLBACK_OG_IMAGE;
  const ogImageUrl = ogImagePath.startsWith("http")
    ? ogImagePath
    : `${baseUrl.replace(/\/$/, "")}${ogImagePath}`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    openGraph: {
      type: "website",
      url: baseUrl,
      title,
      description,
      siteName: "Retailo",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sanity fetches must never throw at build time — if they do, Next
  // can drop the route from the prerender manifest and Vercel serves
  // its infrastructure 404. Fall back to the safe defaults instead.
  let languages: Awaited<ReturnType<typeof getLanguages>> = [];
  let defaultLang = "pl";
  try {
    [languages, defaultLang] = await Promise.all([
      getLanguages(),
      getDefaultLanguage(),
    ]);
  } catch (e) {
    console.error("[RootLayout] Sanity fetch failed, using fallback:", e);
  }

  return (
    <html
      lang={defaultLang}
      className={`${roboto.variable} ${raleway.variable}`}>
      <head>
        {/* Preload hero image — najważniejszy LCP element strony głównej */}
        <link
          rel="preload"
          as="image"
          href="/model3_retailo.png"
          fetchPriority="high"
        />
        {/* Preload below-the-fold heavy images that cause first-pass lag
            in the spec section. fetchPriority="low" pozwala przeglądarce
            ściągnąć je w tle bez konkurowania z LCP. */}
        <link
          rel="preload"
          as="image"
          href="/pickupwall-photo.png"
          fetchPriority="low"
        />
        <link
          rel="preload"
          as="image"
          href="/pickupwall-sketch.png"
          fetchPriority="low"
        />
        {/* Runs before <body> is parsed so the browser never gets a chance
            to restore the previous scroll position. Without this, hard
            refreshes mid-page land the user at the old scrollY (often
            inside a pinned ScrollTrigger section that hasn't booted yet),
            so they briefly see a broken layout before our React effects
            scroll back to 0. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if('scrollRestoration' in history){history.scrollRestoration='manual';}window.scrollTo(0,0);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-[family-name:var(--font-roboto)]">
        <LanguageProvider languages={languages} defaultLang={defaultLang}>
          <IntlBridge>
            <SmoothScroll />
            {children}
          </IntlBridge>
        </LanguageProvider>
      </body>
    </html>
  );
}

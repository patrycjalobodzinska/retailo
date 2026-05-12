import type { Metadata } from "next";
import { Roboto, Raleway } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
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

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSiteSettings();
    return {
      title: settings?.metaTitle ?? "Retailo",
    };
  } catch {
    return { title: "Retailo" };
  }
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
          <SmoothScroll />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}

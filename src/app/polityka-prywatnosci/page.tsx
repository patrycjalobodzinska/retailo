import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PrivacyPolicyContent from "@/components/PrivacyPolicyContent";
import {
  getLegalPage,
  getSiteSettings,
  type LegalPage,
  type SiteSettings,
} from "@/lib/sanity/fetch";

export const metadata = {
  title: "Polityka prywatności · Retailo",
  description:
    "Polityka prywatności i plików cookies serwisu Retailo sp. z o.o.",
};

export const revalidate = 3600;

async function safeGetPage(): Promise<LegalPage> {
  try {
    return await getLegalPage("polityka-prywatnosci");
  } catch (e) {
    console.error("[/polityka-prywatnosci] fetch failed:", e);
    return null;
  }
}

async function safeGetSettings(): Promise<SiteSettings> {
  try {
    return await getSiteSettings();
  } catch {
    return null;
  }
}

export default async function PolitykaPrywatnosciPage() {
  const [page, settings] = await Promise.all([
    safeGetPage(),
    safeGetSettings(),
  ]);
  return (
    <>
      <Header settings={settings} />
      <PrivacyPolicyContent page={page} />
      <Footer />
    </>
  );
}

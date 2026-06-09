import Link from "next/link";
import { CookieSettingsLink } from "@/components/CookieConsent";

export default function Footer() {
  return (
    <footer
      className="relative z-[10]"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
    >
      <div className="border-t border-white/10">
        <div className="flex items-center justify-between gap-8 px-[5vw] py-12 max-md:flex-col max-md:items-start max-md:py-9">
          <div>
            <img
              src="/retailologo_light.webp"
              alt="retailo."
              style={{ height: 26, width: "auto", display: "block", marginBottom: 10 }}
            />
            <p className="text-white/50 text-sm m-0">Automatyczne systemy odbioru przesyłek</p>
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-6">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest m-0 mb-3">Kontakt</p>
              <p className="text-white/80 text-sm m-0 mb-1">kontakt@retailo.pl</p>
              <p className="text-white/80 text-sm m-0 mb-1">+48 693 731 840</p>
              <p className="text-white/80 text-sm m-0 mb-1">+48 531 607 626</p>
              <a
                href="https://www.retailo.pl"
                className="text-white/80 text-sm no-underline hover:text-white transition-colors"
              >
                www.retailo.pl
              </a>
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest m-0 mb-3">Adres</p>
              <p className="text-white/80 text-sm m-0 mb-1">Pl. Jana Kilińskiego 2</p>
              <p className="text-white/80 text-sm m-0 mb-1">35-005 Rzeszów, Polska</p>
              <p className="text-white/80 text-sm m-0">NIP: 5170407536</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-x-6 gap-y-2 px-[5vw] py-4 border-t border-white/5 max-md:flex-col max-md:items-start">
          <p className="text-white/60 text-xs m-0">&copy; 2026 retailo. Wszelkie prawa zastrzeżone.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/polityka-prywatnosci" className="text-white/60 text-xs no-underline hover:text-white/90 transition-colors">Polityka prywatności</Link>
            <CookieSettingsLink className="cursor-pointer border-0 bg-transparent p-0 text-white/60 text-xs hover:text-white/90 transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
}

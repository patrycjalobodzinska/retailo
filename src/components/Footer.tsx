import Link from "next/link";
import { CookieSettingsLink } from "@/components/CookieConsent";

export default function Footer() {
  return (
    <footer
      className="relative z-[10]"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
    >
      <div className="border-t border-white/10">
        <div className="flex items-center justify-between px-[5vw] py-12">
          <div>
            <img
              src="/retailologo_light.webp"
              alt="retailo."
              style={{ height: 26, width: "auto", display: "block", marginBottom: 10 }}
            />
            <p className="text-white/50 text-sm m-0">Automatyczne systemy odbioru przesylek</p>
          </div>
          <div className="flex gap-12">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest m-0 mb-3">Kontakt</p>
              <p className="text-white/80 text-sm m-0 mb-1">info@retailo.pl</p>
              <p className="text-white/80 text-sm m-0">+48 123 456 789</p>
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest m-0 mb-3">Adres</p>
              <p className="text-white/80 text-sm m-0 mb-1">Pl. Jana Kilinskiego 2</p>
              <p className="text-white/80 text-sm m-0">35-005 Rzeszow</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-[5vw] py-4 border-t border-white/5">
          <p className="text-white/30 text-xs m-0">&copy; 2026 retailo. Wszelkie prawa zastrzezone.</p>
          <div className="flex gap-6">
            <Link href="/polityka-prywatnosci" className="text-white/30 text-xs no-underline hover:text-white/60 transition-colors">Polityka prywatnosci</Link>
            <CookieSettingsLink className="cursor-pointer border-0 bg-transparent p-0 text-white/30 text-xs hover:text-white/60 transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
}

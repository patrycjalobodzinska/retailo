"use client";

import { useLang } from "@/lib/i18n/LanguageProvider";

export default function LanguageSwitcher({
  className,
  variant = "header",
}: {
  className?: string;
  variant?: "header" | "drawer";
}) {
  const { lang, languages, setLang } = useLang();

  if (!languages || languages.length <= 1) return null;

  return (
    <div
      className={`flex items-center gap-1 ${className ?? ""}`}
      style={{ fontSize: "0.7rem", letterSpacing: "0.18em" }}>
      {languages.map((l, i) => (
        <span key={l._id} className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setLang(l.code)}
            aria-current={l.code === lang ? "true" : undefined}
            className={`uppercase font-semibold cursor-pointer p-0 m-0 border-0 bg-transparent transition-opacity ${
              l.code === lang
                ? "text-white opacity-100"
                : variant === "drawer"
                  ? "text-white/45 hover:text-white"
                  : "text-white/55 hover:text-white"
            }`}
            style={{
              textShadow:
                variant === "header" ? "0 1px 10px rgba(0,0,0,0.2)" : undefined,
            }}>
            {l.code}
          </button>
          {i < languages.length - 1 && (
            <span className="text-white/30" aria-hidden="true">
              /
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

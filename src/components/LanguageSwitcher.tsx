"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n/LanguageProvider";

export default function LanguageSwitcher({
  className,
  variant = "header",
}: {
  className?: string;
  variant?: "header" | "drawer";
}) {
  const { lang, languages, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!languages || languages.length <= 1) return null;

  const isDark = variant === "header";
  const current = languages.find((l) => l.code === lang) ?? languages[0];

  const triggerStyle: React.CSSProperties = {
    padding: "5px 10px 5px 12px",
    fontSize: "0.7rem",
    letterSpacing: "0.16em",
    background: isDark ? "rgba(255,255,255,0.1)" : "rgba(10,42,46,0.06)",
    border: isDark
      ? "1px solid rgba(255,255,255,0.18)"
      : "1px solid rgba(10,42,46,0.12)",
    color: isDark ? "#ffffff" : "#0a2a2e",
  };

  const menuStyle: React.CSSProperties = {
    background: isDark ? "rgba(20,28,32,0.95)" : "rgba(255,255,255,0.98)",
    border: isDark
      ? "1px solid rgba(255,255,255,0.15)"
      : "1px solid rgba(10,42,46,0.1)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
  };

  return (
    <div
      ref={rootRef}
      className={`relative inline-block ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 cursor-pointer rounded-full font-semibold uppercase transition-colors"
        style={triggerStyle}>
        <span>{current.code}</span>
        <svg
          width="9"
          height="9"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 200ms",
          }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-2 min-w-[110px] overflow-hidden rounded-xl p-1 list-none"
          style={menuStyle}>
          {languages.map((l) => {
            const active = l.code === lang;
            return (
              <li key={l._id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setLang(l.code);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 cursor-pointer rounded-lg border-0 bg-transparent transition-colors"
                  style={{
                    padding: "7px 10px",
                    fontSize: "0.75rem",
                    color: isDark
                      ? active
                        ? "#ffffff"
                        : "rgba(255,255,255,0.7)"
                      : active
                        ? "#0a2a2e"
                        : "rgba(10,42,46,0.65)",
                    background: active
                      ? isDark
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(10,42,46,0.07)"
                      : "transparent",
                    fontWeight: active ? 600 : 500,
                  }}>
                  <span className="uppercase tracking-[0.16em]">{l.code}</span>
                  <span
                    className="text-[0.7rem] font-normal normal-case opacity-75"
                    style={{ letterSpacing: 0 }}>
                    {l.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

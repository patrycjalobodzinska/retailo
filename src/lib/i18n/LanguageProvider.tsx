"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Language } from "@/lib/sanity/fetch";
import { resolveLocalized, type LocalizedField } from "@/lib/sanity/i18n";

type LanguageContextValue = {
  lang: string;
  defaultLang: string;
  languages: Language[];
  setLang: (code: string) => void;
  t: (field: LocalizedField) => string;
};

const Ctx = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "retailo:lang";

export function LanguageProvider({
  languages,
  defaultLang,
  children,
}: {
  languages: Language[];
  defaultLang: string;
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<string>(defaultLang);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && languages.some((l) => l.code === stored)) {
      setLangState(stored);
      return;
    }
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (fromUrl && languages.some((l) => l.code === fromUrl)) {
      setLangState(fromUrl);
    }
  }, [languages]);

  const setLang = (code: string) => {
    if (!languages.some((l) => l.code === code)) return;
    setLangState(code);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, code);
      document.documentElement.lang = code;
    }
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      defaultLang,
      languages,
      setLang,
      t: (field) => resolveLocalized(field, lang, defaultLang),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, defaultLang, languages],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang(): LanguageContextValue {
  const v = useContext(Ctx);
  if (!v) {
    return {
      lang: "pl",
      defaultLang: "pl",
      languages: [],
      setLang: () => {},
      t: (field) => resolveLocalized(field, "pl", "pl"),
    };
  }
  return v;
}

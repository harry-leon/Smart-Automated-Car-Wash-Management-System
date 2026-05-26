"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { translations, TranslationKey } from "./translations";

type Language = "en" | "vi";

interface I18nContextType {
  lang: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("vi");
  const [mounted, setMounted] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("language") as Language | null;
    if (stored && (stored === "en" || stored === "vi")) {
      setLang(stored);
    }
    setMounted(true);
  }, []);

  const handleSetLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("language", newLang);
  };

  const t = (key: TranslationKey): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang];
  };

  // During SSR/build, return children without context
  // This prevents errors during static generation
  if (!mounted) {
    return (
      <I18nContext.Provider value={{ lang, setLanguage: handleSetLanguage, t }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ lang, setLanguage: handleSetLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    // Return default values instead of throwing error
    // This allows SSR to work without crashing
    return {
      lang: "vi" as Language,
      setLanguage: () => {},
      t: (key: TranslationKey): string => {
        const entry = translations[key];
        return entry ? entry.vi : key;
      },
    };
  }
  return context;
}

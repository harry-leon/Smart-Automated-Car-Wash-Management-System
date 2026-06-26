import { create } from "zustand";

export type Language = "vi" | "en";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: "vi", // Default to Vietnamese
  setLanguage: (lang: Language) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("aura-lang", lang);
      document.documentElement.lang = lang;
    }
    set({ language: lang });
  },
}));

// Translation helper
export function translate(lang: Language, vi: string, en: string): string {
  return lang === "vi" ? vi : en;
}

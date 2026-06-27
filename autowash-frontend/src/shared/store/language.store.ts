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
export function translate(arg1: any, arg2: any, arg3?: any): string {
  if (arg1 === "vi") return arg2;
  if (arg1 === "en") return arg3;
  if (arg3 === "vi") return arg1;
  if (arg3 === "en") return arg2;
  
  // Default fallback
  return arg2;
}

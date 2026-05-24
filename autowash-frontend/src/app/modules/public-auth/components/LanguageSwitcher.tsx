import * as React from "react";
import { Moon, Sun } from "lucide-react";

export type Lang = "en" | "vi";
export type Theme = "light" | "dark";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (en: string, vi: string) => string;
  formatPrice: (price: number) => string;
}

const LanguageContext = React.createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  theme: "light",
  setTheme: () => {},
  t: (en) => en,
  formatPrice: (price) => `${price.toLocaleString()} VND`,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("aura-lang") as Lang) || "en";
    }
    return "en";
  });
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("aura-theme") as Theme) || "light";
    }
    return "light";
  });

  const setLang = React.useCallback((next: Lang) => {
    setLangState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("aura-lang", next);
      document.documentElement.lang = next;
    }
  }, []);

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("aura-theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("aura-lang", lang);
  }, [lang]);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("aura-theme", theme);
  }, [theme]);

  const t = React.useCallback((en: string, vi: string) => (lang === "vi" ? vi : en), [lang]);

  const formatPrice = React.useCallback(
    (price: number) =>
      lang === "vi" ? `${price.toLocaleString("vi-VN")} ₫` : `${price.toLocaleString("en-US")} VND`,
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, theme, setTheme, t, formatPrice }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return React.useContext(LanguageContext);
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={`inline-flex items-center rounded-full border border-border/70 bg-background/80 p-0.5 shadow-sm backdrop-blur-sm dark:bg-card/85 dark:shadow-[0_6px_16px_rgba(0,0,0,0.28)] ${className ?? ""}`}
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
          lang === "en"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-accent hover:text-foreground dark:text-slate-300 dark:hover:bg-slate-700/80 dark:hover:text-white"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("vi")}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
          lang === "vi"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-accent hover:text-foreground dark:text-slate-300 dark:hover:bg-slate-700/80 dark:hover:text-white"
        }`}
      >
        VI
      </button>
    </div>
  );
}

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useLanguage();
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background/80 text-foreground shadow-sm backdrop-blur-sm transition-all hover:bg-accent hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-card/85 dark:text-slate-100 dark:shadow-[0_6px_16px_rgba(0,0,0,0.28)] dark:hover:bg-slate-700/85 ${className ?? ""}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher, ThemeSwitcher, useLanguage } from "./LanguageSwitcher";

export function PublicHeader() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/40 bg-background/90 backdrop-blur-xl shadow-sm py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-md overflow-hidden p-0.5">
            <img
              src="/logo.png"
              alt="AURA CAR CARE"
              className="h-full w-full rounded-[10px] object-cover"
            />
          </div>
          <span className="font-bold text-base tracking-tight group-hover:text-primary transition-colors">
            AURA CAR CARE
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          {[
            { href: "#services", en: "Services", vi: "Dịch Vụ" },
            { href: "#combos", en: "Packages", vi: "Gói Tháng" },
            { href: "#reviews", en: "Reviews", vi: "Đánh Giá" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-foreground transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              {t(item.en, item.vi)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-full border border-border/60 px-4 py-1.5 text-sm font-semibold hover:bg-accent transition-colors"
            >
              {t("Sign In", "Đăng Nhập")}
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
              {t("Register", "Đăng Ký")}
            </Link>
          </div>
          <button
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-3">
          {[
            { href: "#services", en: "Services", vi: "Dịch Vụ" },
            { href: "#combos", en: "Packages", vi: "Gói Tháng" },
            { href: "#reviews", en: "Reviews", vi: "Đánh Giá" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block text-sm font-medium py-2 hover:text-primary transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {t(item.en, item.vi)}
            </a>
          ))}
          <div className="flex gap-2 pt-2">
            <Link
              to="/login"
              className="flex-1 text-center rounded-full border border-border/60 px-4 py-2 text-sm font-semibold hover:bg-accent transition-colors"
            >
              {t("Sign In", "Đăng Nhập")}
            </Link>
            <Link
              to="/register"
              className="flex-1 text-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t("Register", "Đăng Ký")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

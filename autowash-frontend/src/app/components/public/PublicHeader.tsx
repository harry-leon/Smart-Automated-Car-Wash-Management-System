"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function PublicHeader() {
  const { t } = useI18n();
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
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-md overflow-hidden p-0.5 dark:bg-slate-900">
            <div className="h-full w-full rounded-[10px] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-xs">
              AC
            </div>
          </div>
          <span className="font-bold text-base tracking-tight group-hover:text-primary transition-colors hidden sm:inline">
            AURA CAR CARE
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a
            href="#services"
            className="hover:text-foreground transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
          >
            {t("services")}
          </a>
          <a
            href="#packages"
            className="hover:text-foreground transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
          >
            {t("packages")}
          </a>
          <a
            href="#reviews"
            className="hover:text-foreground transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
          >
            {t("reviews")}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
          <div className="hidden md:flex items-center gap-2">
            <Link href="/login">
              <Button variant="outline" size="sm">
                {t("signIn")}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">
                {t("register")}
              </Button>
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
          <a
            href="#services"
            className="block text-sm font-medium py-2 hover:text-primary transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            {t("services")}
          </a>
          <a
            href="#packages"
            className="block text-sm font-medium py-2 hover:text-primary transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            {t("packages")}
          </a>
          <a
            href="#reviews"
            className="block text-sm font-medium py-2 hover:text-primary transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            {t("reviews")}
          </a>
          <div className="flex gap-2 pt-2">
            <Link href="/login" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                {t("signIn")}
              </Button>
            </Link>
            <Link href="/register" className="flex-1">
              <Button size="sm" className="w-full">
                {t("register")}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

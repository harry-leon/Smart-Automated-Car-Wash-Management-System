"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/context";

export function PublicFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-md overflow-hidden p-0.5 dark:bg-slate-900">
                <div className="h-full w-full rounded-[10px] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                  AC
                </div>
              </div>
              <span className="font-bold">AURA CAR CARE</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Professional car wash with German technology in Ho Chi Minh City.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold mb-3">{t("quickLinks")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#services" className="hover:text-foreground transition-colors">
                  {t("services")}
                </a>
              </li>
              <li>
                <a href="#packages" className="hover:text-foreground transition-colors">
                  {t("monthlyPackages")}
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-foreground transition-colors">
                  {t("customerReviews")}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold mb-3">{t("contact")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>📍 {t("address")}</li>
              <li>📞 0901 234 567</li>
              <li>✉️ contact@auracarcare.vn</li>
              <li>🕐 {t("hours")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground">
          © {year} AURA CAR CARE. {t("allRights")}
        </div>
      </div>
    </footer>
  );
}

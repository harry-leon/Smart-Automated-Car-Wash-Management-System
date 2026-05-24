import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import type { ComboPackage } from "../types/homepage.types";
import { useLanguage } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";

export function ComboPreviewCard({ combo }: { combo: ComboPackage }) {
  const { t, formatPrice } = useLanguage();
  const savings = combo.originalPrice - combo.comboPrice;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-3xl border p-6 transition-all hover:-translate-y-1 hover:shadow-2xl",
        combo.highlight
          ? "border-primary bg-primary/5 shadow-xl shadow-primary/20"
          : "border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/40",
      )}
    >
      {/* Badge */}
      {combo.badge && (
        <div
          className={cn(
            "absolute -top-3 left-6 rounded-full px-4 py-1 text-xs font-bold shadow-sm",
            combo.highlight
              ? "bg-primary text-primary-foreground"
              : "bg-foreground text-background",
          )}
        >
          {t(combo.badge, combo.badgeVi ?? combo.badge)}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-extrabold text-foreground">{t(combo.name, combo.nameVi)}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t(combo.description, combo.descriptionVi)}
          </p>
        </div>

        {/* Pricing */}
        <div className="space-y-1">
          <div className="text-3xl font-extrabold text-primary">
            {formatPrice(combo.comboPrice)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(combo.originalPrice)}
            </span>
            <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-bold text-green-600">
              -{t("Save", "Tiết kiệm")} {formatPrice(savings)}
            </span>
          </div>
        </div>

        {/* Services included */}
        <ul className="space-y-2">
          {combo.services.map((s) => (
            <li key={s} className="flex items-center gap-2 text-sm font-medium">
              <Check className="h-4 w-4 text-primary shrink-0" />
              {s}
            </li>
          ))}
        </ul>

        <Link
          to="/login"
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all",
            combo.highlight
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30"
              : "border border-border/60 bg-background/60 hover:bg-accent",
          )}
        >
          {t("Get This Pack", "Mua Gói Này")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

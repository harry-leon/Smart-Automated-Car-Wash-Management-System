import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import type { Service } from "../types/homepage.types";
import { useLanguage } from "./LanguageSwitcher";

export function PackagePreviewCard({ service }: { service: Service }) {
  const { t, formatPrice } = useLanguage();

  return (
    <div className="group relative flex flex-col rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 transition-all hover:border-primary/40 hover:shadow-xl hover:-translate-y-1">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10 space-y-3">
        <div className="text-3xl">{service.icon}</div>
        <div>
          <h3 className="font-bold text-foreground">{t(service.name, service.nameVi)}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t(service.description, service.descriptionVi)}
          </p>
        </div>
        <div className="flex items-center justify-between pt-2">
          <div>
            <div className="text-xl font-extrabold text-primary">{formatPrice(service.price)}</div>
            <div className="text-xs text-muted-foreground">{service.duration}</div>
          </div>
          <Link
            to="/login"
            className="flex items-center gap-1 rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
          >
            {t("Book", "Đặt")} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

import * as React from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Coins,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { KpiMetric } from "../types/dashboard.types";
import styles from "../styles/admin-dashboard.module.css";

const ICONS: Record<KpiMetric["icon"], React.ComponentType<{ className?: string }>> = {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Coins,
  Sparkles,
};

const TONE_STYLES: Record<
  KpiMetric["tone"],
  { ring: string; iconBg: string; iconText: string; accent: string }
> = {
  primary: {
    ring: "border-primary/30",
    iconBg: "bg-primary/10",
    iconText: "text-primary",
    accent: "from-primary/10",
  },
  success: {
    ring: "border-emerald-400/30",
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-600 dark:text-emerald-400",
    accent: "from-emerald-500/10",
  },
  warning: {
    ring: "border-amber-400/30",
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-600 dark:text-amber-400",
    accent: "from-amber-500/10",
  },
  info: {
    ring: "border-sky-400/30",
    iconBg: "bg-sky-500/10",
    iconText: "text-sky-600 dark:text-sky-400",
    accent: "from-sky-500/10",
  },
  purple: {
    ring: "border-violet-400/30",
    iconBg: "bg-violet-500/10",
    iconText: "text-violet-600 dark:text-violet-400",
    accent: "from-violet-500/10",
  },
};

export function KpiCard({ metric }: { metric: KpiMetric }) {
  const Icon = ICONS[metric.icon];
  const tone = TONE_STYLES[metric.tone];
  const isPositive = metric.delta >= 0;
  const DeltaIcon = isPositive ? TrendingUp : TrendingDown;
  const valueLabel =
    typeof metric.value === "number" ? metric.value.toLocaleString("vi-VN") : metric.value;

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card/60 p-5 shadow-lg backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-xl",
        tone.ring,
        styles.kpiCard,
      )}
    >
      <div
        className={cn("absolute inset-0 bg-gradient-to-br to-transparent opacity-60", tone.accent)}
      />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {metric.label}
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold tracking-tight text-foreground">{valueLabel}</span>
            {metric.unit ? (
              <span className="text-xs font-semibold text-muted-foreground">{metric.unit}</span>
            ) : null}
          </div>
          <div
            className={cn(
              "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
              isPositive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
            )}
          >
            <DeltaIcon className="h-3 w-3" />
            {isPositive ? "+" : ""}
            {metric.delta}% so hôm qua
          </div>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            tone.iconBg,
            tone.iconText,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

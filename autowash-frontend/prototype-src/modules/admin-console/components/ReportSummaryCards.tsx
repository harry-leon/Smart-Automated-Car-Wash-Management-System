import { CalendarDays, CalendarRange, AlertTriangle, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ReportSummary } from "../types/report.types";
import styles from "../styles/reports.module.css";

interface Props {
  summary: ReportSummary;
}

export function ReportSummaryCards({ summary }: Props) {
  const items = [
    {
      label: "Daily bookings",
      value: summary.dailyBookings.toLocaleString("vi-VN"),
      hint: `${summary.monthlyBookings.toLocaleString("vi-VN")} this month`,
      icon: CalendarDays,
      tone: "text-primary",
    },
    {
      label: "Daily revenue",
      value: `${(summary.dailyRevenue / 1_000_000).toFixed(1)}M ₫`,
      hint: `${(summary.monthlyRevenue / 1_000_000).toFixed(1)}M ₫ monthly`,
      icon: CalendarRange,
      tone: "text-emerald-600",
    },
    {
      label: "No-show rate",
      value: `${summary.noShowRate.toFixed(1)}%`,
      hint: "Last 30 days",
      icon: AlertTriangle,
      tone: "text-amber-600",
    },
    {
      label: "Promotion usage",
      value: summary.promotionUsage.toLocaleString("vi-VN"),
      hint: "Total redemptions",
      icon: Sparkles,
      tone: "text-violet-600",
    },
  ];

  return (
    <div className={styles.summaryGrid}>
      {items.map((item) => (
        <Card key={item.label} className="border-border/50 bg-card/60 shadow-lg backdrop-blur-xl">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </div>
                <div className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
                  {item.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{item.hint}</div>
              </div>
              <item.icon className={`h-5 w-5 ${item.tone}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

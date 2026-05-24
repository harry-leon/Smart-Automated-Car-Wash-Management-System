import { TimerReset } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/modules/public-auth/components/LanguageSwitcher";
import {
  formatOperationDateTimeByLocale,
  formatOperationTimeByLocale,
} from "../mock/operations.mock";
import type { OperationBooking } from "../types/operations.types";

export function EstimatedFinishCard({ booking }: { booking: OperationBooking }) {
  const { lang, t } = useLanguage();
  const locale = lang === "vi" ? "vi-VN" : "en-US";

  return (
    <Card className="rounded-lg border-border/50 bg-card/70 shadow-lg">
      <CardHeader className="p-5">
        <CardTitle className="flex items-center gap-2 text-base">
          <TimerReset className="text-primary" />
          {t("Estimated finish", "Dự kiến hoàn tất")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="text-3xl font-bold tracking-tight text-foreground">
          {formatOperationTimeByLocale(booking.estimatedFinishTime, locale)}
        </div>
        <div className="mt-2 text-sm font-medium text-muted-foreground">
          {t("Check-in", "Check-in")}:{" "}
          {formatOperationDateTimeByLocale(booking.checkinTime, locale)}
        </div>
        <div className="mt-4 rounded-lg border border-border/50 bg-background/60 p-4 text-sm font-semibold">
          {t("Package duration", "Thời lượng gói")}: {booking.packageDurationMinutes}{" "}
          {t("minutes", "phút")}
        </div>
      </CardContent>
    </Card>
  );
}

import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/modules/public-auth/components/LanguageSwitcher";
import { formatOperationDateTimeByLocale } from "../mock/operations.mock";
import type { OperationBooking } from "../types/operations.types";
import styles from "../styles/checkin.module.css";

interface CompleteWashPanelProps {
  booking: OperationBooking;
  onCompleteWash: () => void;
}

export function CompleteWashPanel({ booking, onCompleteWash }: CompleteWashPanelProps) {
  const canComplete = booking.status === "IN_PROGRESS";
  const { lang, t } = useLanguage();
  const locale = lang === "vi" ? "vi-VN" : "en-US";

  return (
    <section className={styles.panel}>
      <div className="flex flex-col gap-4">
        <div>
          <div className={styles.panelTitle}>{t("Complete wash", "Hoàn tất rửa xe")}</div>
          <p className={styles.panelText}>
            {t(
              `Finish the wash session for ${booking.vehiclePlate}.`,
              `Kết thúc ca rửa cho xe ${booking.vehiclePlate}.`,
            )}
          </p>
        </div>
        {canComplete && (
          <Button onClick={onCompleteWash} className="h-11 rounded-lg font-bold">
            <CheckCheck data-icon="inline-start" />
            {t("Complete wash", "Hoàn tất rửa xe")}
          </Button>
        )}
        {booking.status === "COMPLETED" && (
          <div className={styles.lockedNotice}>
            {t(
              `Completed at ${formatOperationDateTimeByLocale(booking.completedTime, locale)}. Point transaction ${
                booking.pointTransaction?.id ?? "-"
              } was recorded.`,
              `Đã hoàn tất lúc ${formatOperationDateTimeByLocale(booking.completedTime, locale)}. Giao dịch điểm ${
                booking.pointTransaction?.id ?? "-"
              } đã được ghi nhận.`,
            )}
          </div>
        )}
        {!canComplete && booking.status !== "COMPLETED" && (
          <div className={styles.lockedNotice}>
            {t(
              "Complete wash is available only for vehicles in progress.",
              "Chỉ có thể hoàn tất rửa xe với các xe đang được xử lý.",
            )}
          </div>
        )}
      </div>
    </section>
  );
}

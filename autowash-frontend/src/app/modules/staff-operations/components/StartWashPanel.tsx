import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/app/modules/public-auth/components/LanguageSwitcher";
import type { OperationBooking } from "../types/operations.types";
import styles from "../styles/checkin.module.css";

interface StartWashPanelProps {
  booking: OperationBooking;
  onStartWash: () => void;
}

export function StartWashPanel({ booking, onStartWash }: StartWashPanelProps) {
  const canStart = booking.status === "CHECKED_IN";
  const { t } = useLanguage();

  return (
    <section className={styles.panel}>
      <div className="flex flex-col gap-4">
        <div>
          <div className={styles.panelTitle}>{t("Wash start", "Bắt đầu rửa")}</div>
          <p className={styles.panelText}>
            {t(
              `Move ${booking.vehiclePlate} into active washing.`,
              `Đưa xe ${booking.vehiclePlate} vào ca rửa đang hoạt động.`,
            )}
          </p>
        </div>
        {canStart ? (
          <Button onClick={onStartWash} className="h-11 rounded-lg font-bold">
            <Play data-icon="inline-start" />
            {t("Start washing", "Bắt đầu rửa")}
          </Button>
        ) : (
          <div className={styles.lockedNotice}>
            {t(
              "Start washing is available after successful check-in.",
              "Chỉ có thể bắt đầu rửa sau khi check-in thành công.",
            )}
          </div>
        )}
      </div>
    </section>
  );
}

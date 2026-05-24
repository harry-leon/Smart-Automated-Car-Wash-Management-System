import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/modules/public-auth/components/LanguageSwitcher";
import type { OperationBooking } from "../types/operations.types";
import styles from "../styles/checkin.module.css";

interface CheckinPanelProps {
  booking: OperationBooking;
  onCheckIn: () => void;
}

export function CheckinPanel({ booking, onCheckIn }: CheckinPanelProps) {
  const [plateVerified, setPlateVerified] = React.useState(false);
  const canCheckIn = booking.status === "CONFIRMED";
  const { t } = useLanguage();

  return (
    <section className={styles.panel}>
      <div className="flex flex-col gap-4">
        <div>
          <div className={styles.panelTitle}>{t("Check-in", "Check-in")}</div>
          <p className={styles.panelText}>
            {t(
              `Confirm arrival for booking ${booking.bookingCode}.`,
              `Xác nhận khách đã đến cho booking ${booking.bookingCode}.`,
            )}
          </p>
        </div>

        {canCheckIn ? (
          <>
            <label className={styles.plateCheck}>
              <Checkbox
                checked={plateVerified}
                onCheckedChange={(value) => setPlateVerified(value === true)}
              />
              <span className="text-sm font-bold text-foreground">
                {t(
                  `Plate ${booking.vehiclePlate} verified`,
                  `Đã xác minh biển số ${booking.vehiclePlate}`,
                )}
              </span>
            </label>
            <Button
              onClick={onCheckIn}
              disabled={!plateVerified}
              className="h-11 rounded-lg font-bold"
            >
              <CheckCircle2 data-icon="inline-start" />
              {t("Check-in", "Check-in")}
            </Button>
          </>
        ) : (
          <div className={styles.lockedNotice}>
            {t(
              "Check-in is only available for confirmed bookings.",
              "Chỉ có thể check-in với các booking đã xác nhận.",
            )}
          </div>
        )}
      </div>
    </section>
  );
}

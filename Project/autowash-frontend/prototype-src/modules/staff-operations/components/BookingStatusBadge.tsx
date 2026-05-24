import { cn } from "@/lib/utils";
import { useLanguage } from "@/modules/public-auth/components/LanguageSwitcher";
import {
  STAFF_BOOKING_STATUS_LABELS,
  STAFF_BOOKING_STATUS_LABELS_VI,
  type StaffBookingStatus,
} from "../types/status.types";
import styles from "../styles/operations-board.module.css";

const statusClasses: Record<StaffBookingStatus, string> = {
  CONFIRMED: styles.statusConfirmed,
  CHECKED_IN: styles.statusCheckedIn,
  IN_PROGRESS: styles.statusInProgress,
  COMPLETED: styles.statusCompleted,
  CANCELLED: styles.statusCancelled,
  NO_SHOW: styles.statusNoShow,
};

export function BookingStatusBadge({ status }: { status: StaffBookingStatus }) {
  const { t } = useLanguage();

  return (
    <span className={cn(styles.statusBadge, statusClasses[status])}>
      <span className={styles.statusDot} />
      {t(STAFF_BOOKING_STATUS_LABELS[status], STAFF_BOOKING_STATUS_LABELS_VI[status])}
    </span>
  );
}

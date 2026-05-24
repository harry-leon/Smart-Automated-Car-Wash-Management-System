import { WashTable } from "../components/WashTable";
import { useCustomerBooking } from "../routes";
import type { WashHistoryRecord } from "../types/history.types";
import styles from "../styles/history.module.css";

export function WashHistoryPage() {
  const { bookings } = useCustomerBooking();
  const completedWashes: WashHistoryRecord[] = bookings.filter(
    (booking): booking is WashHistoryRecord => booking.status === "COMPLETED",
  );

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span>History</span>
          <h1>Wash History</h1>
          <p>
            Completed washes only, including a clear badge for any wash paid with combo credits.
          </p>
        </div>
      </header>
      <WashTable washes={completedWashes} />
    </main>
  );
}

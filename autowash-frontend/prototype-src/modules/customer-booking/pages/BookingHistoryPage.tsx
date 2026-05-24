import { BookingTable } from "../components/BookingTable";
import { useCustomerBooking } from "../routes";
import styles from "../styles/history.module.css";

export function BookingHistoryPage() {
  const { bookings } = useCustomerBooking();

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span>History</span>
          <h1>Booking History</h1>
          <p>
            All bookings across confirmed, checked-in, in-progress, completed, cancelled, and
            no-show lifecycles.
          </p>
        </div>
      </header>
      <BookingTable bookings={bookings} />
    </main>
  );
}

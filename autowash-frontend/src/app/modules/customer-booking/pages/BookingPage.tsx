import { BookingForm } from "../components/BookingForm";
import styles from "../styles/booking.module.css";

export function BookingPage() {
  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <span>Checkout</span>
          <h1>Book a Wash</h1>
          <p>Select a vehicle, wash package, schedule, and payment option in one clean flow.</p>
        </div>
      </header>
      <BookingForm />
    </main>
  );
}

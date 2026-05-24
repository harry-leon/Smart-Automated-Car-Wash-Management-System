import { TransactionTable } from "../components/TransactionTable";
import { useCustomerBooking } from "../routes";
import styles from "../styles/history.module.css";

export function PointTransactionsPage() {
  const { pointTransactions } = useCustomerBooking();

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span>History</span>
          <h1>Point Transactions</h1>
          <p>A dedicated ledger for earn, redeem, bonus, adjustment, and expire transactions.</p>
        </div>
      </header>
      <TransactionTable transactions={pointTransactions} />
    </main>
  );
}

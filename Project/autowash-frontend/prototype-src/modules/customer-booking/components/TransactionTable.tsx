import type { PointTransaction } from "../types/history.types";
import styles from "../styles/history.module.css";

interface TransactionTableProps {
  transactions: PointTransaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.historyTable}>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Type</th>
            <th>Description</th>
            <th>Booking</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{new Date(transaction.createdAt).toLocaleString()}</td>
              <td>
                <span
                  className={`${styles.statusBadge} ${styles[`transaction${transaction.type}`]}`}
                >
                  {transaction.type}
                </span>
              </td>
              <td>{transaction.description}</td>
              <td>{transaction.bookingCode ?? "-"}</td>
              <td
                className={transaction.points >= 0 ? styles.pointsPositive : styles.pointsNegative}
              >
                {transaction.points > 0 ? "+" : ""}
                {transaction.points.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import type { WashHistoryRecord } from "../types/history.types";
import styles from "../styles/history.module.css";

interface WashTableProps {
  washes: WashHistoryRecord[];
}

export function WashTable({ washes }: WashTableProps) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.historyTable}>
        <thead>
          <tr>
            <th>Wash</th>
            <th>Vehicle</th>
            <th>Package</th>
            <th>Completed On</th>
            <th>Payment</th>
          </tr>
        </thead>
        <tbody>
          {washes.map((wash) => (
            <tr key={wash.id}>
              <td>{wash.bookingCode}</td>
              <td>{wash.vehicle.licensePlate}</td>
              <td>{wash.package.name}</td>
              <td>
                {wash.scheduledDate} {wash.scheduledTime}
              </td>
              <td>
                {wash.payment.paidViaCombo ? (
                  <span className={styles.comboBadge}>Paid via Combo</span>
                ) : (
                  `${wash.payment.finalAmount.toLocaleString()} VND`
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

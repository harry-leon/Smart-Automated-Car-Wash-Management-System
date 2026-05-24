import { useState } from "react";
import type { Booking } from "../types/booking.types";
import styles from "../styles/history.module.css";

interface BookingTableProps {
  bookings: Booking[];
}

export function BookingTable({ bookings }: BookingTableProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  return (
    <>
      <div className={styles.tableWrap}>
        <table className={styles.historyTable}>
          <thead>
            <tr>
              <th>Booking code</th>
              <th>Vehicle plate</th>
              <th>Package</th>
              <th>Schedule</th>
              <th>Status</th>
              <th>Final Amount</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className={styles.clickableRow}
                onClick={() => setSelectedBooking(booking)}
              >
                <td>{booking.bookingCode}</td>
                <td>{booking.vehicle.licensePlate}</td>
                <td>{booking.package.name}</td>
                <td>
                  {booking.scheduledDate} {booking.scheduledTime}
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[`status${booking.status}`]}`}>
                    {booking.status.replaceAll("_", " ")}
                  </span>
                </td>
                <td>{booking.payment.finalAmount.toLocaleString()} VND</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedBooking ? (
        <div className={styles.drawerOverlay} onClick={() => setSelectedBooking(null)}>
          <aside className={styles.detailDrawer} onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className={styles.drawerClose}
              onClick={() => setSelectedBooking(null)}
            >
              Close
            </button>
            <span>Booking detail</span>
            <h2>{selectedBooking.bookingCode}</h2>
            <dl className={styles.drawerList}>
              <div>
                <dt>Vehicle plate</dt>
                <dd>{selectedBooking.vehicle.licensePlate}</dd>
              </div>
              <div>
                <dt>Service package</dt>
                <dd>{selectedBooking.package.name}</dd>
              </div>
              <div>
                <dt>Scheduled date/time</dt>
                <dd>
                  {selectedBooking.scheduledDate} {selectedBooking.scheduledTime}
                </dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{selectedBooking.status.replaceAll("_", " ")}</dd>
              </div>
              <div>
                <dt>Voucher applied</dt>
                <dd>{selectedBooking.payment.voucherCode ?? "None"}</dd>
              </div>
              <div>
                <dt>Payment method</dt>
                <dd>{selectedBooking.payment.paymentMethod ?? "Combo credit"}</dd>
              </div>
              <div>
                <dt>Payment status</dt>
                <dd>{selectedBooking.payment.paymentStatus}</dd>
              </div>
              <div>
                <dt>Final amount</dt>
                <dd>{selectedBooking.payment.finalAmount.toLocaleString()} VND</dd>
              </div>
            </dl>
          </aside>
        </div>
      ) : null}
    </>
  );
}

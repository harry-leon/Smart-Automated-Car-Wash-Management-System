import Link from "next/link";

export default function CustomerBookingPage() {
  return (
    <main>
      <h1>Customer Booking</h1>
      <p>Booking shell placeholder for customer workflows.</p>
      <div style={{ marginTop: 24 }}>
        <Link href="/customer">Back to customer home</Link>
      </div>
    </main>
  );
}

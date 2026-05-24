import Link from "next/link";

export default function CustomerPage() {
  return (
    <main>
      <h1>Customer Portal</h1>
      <p>Welcome to the customer workspace. Access bookings and account features here.</p>
      <div style={{ marginTop: 24, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Link href="/customer/booking">Go to Booking</Link>
        <Link href="/login">Sign in</Link>
      </div>
    </main>
  );
}

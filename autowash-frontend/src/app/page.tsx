import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>AutoWash Pro</h1>
      <p>Next.js App Router skeleton is ready with auth, customer, staff, and admin groups.</p>
      <ul>
        <li>
          <Link href="/login">/login</Link>
        </li>
        <li>
          <Link href="/register">/register</Link>
        </li>
        <li>
          <Link href="/verify-otp">/verify-otp</Link>
        </li>
        <li>
          <Link href="/customer">/customer</Link>
        </li>
        <li>
          <Link href="/customer/booking">/customer/booking</Link>
        </li>
        <li>
          <Link href="/staff">/staff</Link>
        </li>
        <li>
          <Link href="/admin">/admin</Link>
        </li>
      </ul>
    </main>
  );
}

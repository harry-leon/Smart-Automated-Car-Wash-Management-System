import type { ReactNode } from "react";
import Link from "next/link";

export default function CustomerGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "2rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <nav style={{ display: "flex", gap: "1rem" }}>
          <Link href="/customer">Customer Home</Link>
          <Link href="/customer/booking">Booking</Link>
          <Link href="/">Back to home</Link>
        </nav>
      </header>
      <main style={{ maxWidth: 960, margin: "0 auto", background: "white", borderRadius: 20, padding: "2rem" }}>
        {children}
      </main>
    </div>
  );
}

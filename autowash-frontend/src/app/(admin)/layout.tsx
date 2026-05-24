import type { ReactNode } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <header
        style={{
          borderBottom: "1px solid #e5e7eb",
          background: "#fff"
        }}
      >
        <div
          style={{
            margin: "0 auto",
            maxWidth: 960,
            padding: "16px 24px",
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <strong>Admin workspace</strong>
          <nav style={{ display: "flex", gap: 12 }}>
            <Link href="/admin/dashboard">Dashboard</Link>
            <Link href="/admin/bookings">Bookings</Link>
            <Link href="/admin/customers">Customers</Link>
            <Link href="/admin/operations">Operations</Link>
            <Link href="/admin/reports">Reports</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

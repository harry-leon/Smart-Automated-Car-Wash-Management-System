import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", padding: 24 }}>
      <section
        style={{
          margin: "0 auto",
          maxWidth: 960,
          border: "1px solid #e5e7eb",
          borderRadius: 20,
          padding: 32,
          background: "#fff"
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#6b7280",
            textTransform: "uppercase",
            fontSize: 12,
            letterSpacing: 1.2
          }}
        >
          AutoWash Pro
        </p>
        <h1 style={{ margin: "12px 0 8px", fontSize: 40, lineHeight: 1.1 }}>
          Frontend skeleton
        </h1>
        <p style={{ margin: 0, color: "#374151", maxWidth: 680 }}>
          Next.js 14 App Router base with auth, customer, staff, and admin workspaces.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
          <Link href="/login">Login</Link>
          <Link href="/customer/home">Customer workspace</Link>
          <Link href="/staff/dashboard">Staff workspace</Link>
          <Link href="/admin/dashboard">Admin workspace</Link>
        </div>
      </section>
    </main>
  );
}

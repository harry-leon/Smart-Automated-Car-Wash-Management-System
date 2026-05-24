import type { ReactNode } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#fff7ed", padding: "2rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <nav style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <Link href="/admin">Admin Home</Link>
          <Link href="/">Home</Link>
        </nav>
      </header>
      <main style={{ maxWidth: 960, margin: "0 auto", background: "#fff", borderRadius: 20, padding: "2rem" }}>
        {children}
      </main>
    </div>
  );
}

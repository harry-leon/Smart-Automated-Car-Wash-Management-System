import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", padding: "2.5rem", background: "#f8fafc" }}>
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "2rem", background: "#fff", borderRadius: 24, boxShadow: "0 24px 64px rgba(15, 23, 42, 0.08)" }}>
        {children}
      </div>
    </div>
  );
}

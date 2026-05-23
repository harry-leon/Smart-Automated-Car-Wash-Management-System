import Link from "next/link";

export default function InternalLoginIndexPage() {
  return (
    <main style={{ maxWidth: 520, margin: "72px auto", padding: 24 }}>
      <h1>Internal Login</h1>
      <p>Choose the workspace you need to access.</p>
      <nav style={{ display: "flex", gap: 12 }}>
        <Link href="/operations/login">Staff login</Link>
        <Link href="/admin/login">Admin login</Link>
      </nav>
    </main>
  );
}

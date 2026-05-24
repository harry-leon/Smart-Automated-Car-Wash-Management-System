import Link from "next/link";

export default function AdminPage() {
  return (
    <main>
      <h1>Admin Dashboard</h1>
      <p>Admin shell placeholder for management and analytics.</p>
      <div style={{ marginTop: 24 }}>
        <Link href="/">Back to home</Link>
      </div>
    </main>
  );
}

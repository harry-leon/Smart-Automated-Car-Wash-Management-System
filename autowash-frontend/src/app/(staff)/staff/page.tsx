import Link from "next/link";

export default function StaffPage() {
  return (
    <main>
      <h1>Staff Workspace</h1>
      <p>This is the staff landing page shell for operational workflows.</p>
      <div style={{ marginTop: 24 }}>
        <Link href="/">Back to home</Link>
      </div>
    </main>
  );
}

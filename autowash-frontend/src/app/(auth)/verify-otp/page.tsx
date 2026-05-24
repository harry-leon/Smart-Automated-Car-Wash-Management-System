import Link from "next/link";

export default function VerifyOtpPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 420,
          border: "1px solid #e5e7eb",
          borderRadius: 18,
          padding: 24,
          background: "#fff"
        }}
      >
        <p style={{ margin: 0, color: "#6b7280", fontSize: 12, textTransform: "uppercase" }}>
          Auth workspace
        </p>
        <h1 style={{ margin: "12px 0 8px", fontSize: 28 }}>Verify OTP</h1>
        <p style={{ margin: 0, color: "#374151" }}>
          Placeholder route for OTP verification under the Next.js App Router skeleton.
        </p>
        <div style={{ marginTop: 20 }}>
          <Link href="/login">Back to login</Link>
        </div>
      </section>
    </main>
  );
}

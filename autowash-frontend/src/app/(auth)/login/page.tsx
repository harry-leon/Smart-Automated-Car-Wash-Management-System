import Link from "next/link";

export default function LoginPage() {
  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 420 }}>
      <h1>Login</h1>
      <p>Use this placeholder login page for the auth route shell.</p>
      <div style={{ marginTop: 24 }}>
        <Link href="/register">Register</Link>
      </div>
      <div style={{ marginTop: 12 }}>
        <Link href="/verify-otp">Verify OTP</Link>
      </div>
    </main>
  );
}

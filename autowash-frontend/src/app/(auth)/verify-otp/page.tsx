import Link from "next/link";

export default function VerifyOtpPage() {
  return (
    <main>
      <h1>Verify OTP</h1>
      <p>Enter the one-time code sent to your device to continue.</p>
      <div style={{ marginTop: 24 }}>
        <Link href="/login">Back to login</Link>
      </div>
    </main>
  );
}

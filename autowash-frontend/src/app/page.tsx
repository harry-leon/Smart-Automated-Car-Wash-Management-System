import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>AutoWash Pro</h1>
      <p>Frontend auth data layer foundation is ready.</p>
      <p>
        Continue with the customer sign-in flow at{" "}
        <Link href="/login">/login</Link>.
      </p>
    </main>
  );
}

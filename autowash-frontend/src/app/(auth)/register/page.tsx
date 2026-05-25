import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { PublicAuthShell } from "@/components/auth/public-auth-shell";

export default function RegisterPage() {
  return (
    <PublicAuthShell
      title="Create an account"
      description="Join AutoWash Pro to manage your vehicles, bookings, and loyalty rewards."
      footer={
        <div>
          <span className="text-slate-100/80">Already have an account? </span>
          <Link href="/login" className="font-semibold text-white transition hover:opacity-80">
            Sign in instead
          </Link>
        </div>
      }
    >
      <RegisterForm />
    </PublicAuthShell>
  );
}

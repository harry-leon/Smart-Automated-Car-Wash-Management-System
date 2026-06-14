import Link from "next/link";
import { VerifyOtpForm } from "@/features/auth/components/verify-otp-form";
import { PublicAuthShell } from "@/features/auth/components/public-auth-shell";

export default function VerifyOtpPage({
  searchParams,
}: {
  searchParams?: {
    email?: string;
    phone?: string;
    autoSend?: string;
    expiresIn?: string;
  };
}) {
  const expiresIn = Number(searchParams?.expiresIn ?? "300");
  return (
    <PublicAuthShell
      title="Verify your email"
      description="Confirm the 6-digit OTP sent to your email to activate your account."
      footer={
        <div>
          <span className="text-slate-500">Need to restart? </span>
          <Link href="/register" className="font-semibold text-sky-600 transition hover:text-sky-700 hover:underline">
            Back to registration
          </Link>
        </div>
      }
    >
      <VerifyOtpForm
        autoSend={searchParams?.autoSend === "1"}
        initialEmail={searchParams?.email ?? ""}
        initialPhone={searchParams?.phone ?? ""}
        initialExpiresIn={Number.isFinite(expiresIn) ? expiresIn : 300}
      />
    </PublicAuthShell>
  );
}

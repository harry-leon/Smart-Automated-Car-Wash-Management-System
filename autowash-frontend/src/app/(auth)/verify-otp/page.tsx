import Link from "next/link";
import { VerifyOtpForm } from "@/components/auth/verify-otp-form";
import { PublicAuthShell } from "@/components/auth/public-auth-shell";

export default function VerifyOtpPage({
  searchParams,
}: {
  searchParams?: {
    phone?: string;
    autoSend?: string;
  };
}) {
  return (
    <PublicAuthShell
      title="Verify your number"
      description="Confirm the 6-digit OTP to activate your account."
      footer={
        <div>
          <span className="text-slate-100/80">Need to restart? </span>
          <Link href="/register" className="font-semibold text-white transition hover:opacity-80">
            Back to registration
          </Link>
        </div>
      }
    >
      <VerifyOtpForm
        autoSend={searchParams?.autoSend === "1"}
        initialPhone={searchParams?.phone ?? ""}
      />
    </PublicAuthShell>
  );
}

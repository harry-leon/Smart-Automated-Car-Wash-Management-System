import Link from "next/link";
import { AuthButton, AuthCard, AuthField, AuthForm } from "../../../components/auth";

export default function VerifyPage() {
  return (
    <AuthCard
      title="Verify OTP"
      description="Enter the 6 digit code sent to your phone."
      footer={
        <p className="text-slate-600">
          Wrong phone number?{" "}
          <Link className="font-semibold text-cyan-700 hover:text-cyan-800" href="/register">
            Register again
          </Link>
        </p>
      }
    >
      <AuthForm>
        <AuthField
          label="Phone number"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="0901234567"
        />
        <AuthField
          label="OTP code"
          name="otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          hint="OTP must contain exactly 6 digits."
        />
        <AuthButton type="submit">Verify account</AuthButton>
      </AuthForm>
    </AuthCard>
  );
}

import Link from "next/link";
import { AuthButton, AuthCard, AuthField, AuthForm } from "../../../components/auth";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset password"
      description="Request an OTP and set a new password for your account."
      footer={
        <p className="text-slate-600">
          Remembered it?{" "}
          <Link className="font-semibold text-cyan-700 hover:text-cyan-800" href="/login">
            Back to sign in
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
        />
        <AuthField
          label="New password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Create a new password"
          hint="At least 8 characters with uppercase, lowercase, number, and special character."
        />
        <AuthField
          label="Confirm new password"
          name="newPasswordConfirm"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your new password"
        />
        <AuthButton type="submit">Reset password</AuthButton>
      </AuthForm>
    </AuthCard>
  );
}

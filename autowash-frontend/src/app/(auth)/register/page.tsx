import Link from "next/link";
import { AuthButton, AuthCard, AuthField, AuthForm } from "../../../components/auth";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create account"
      description="Register as a customer and verify your phone with OTP."
      footer={
        <p className="text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-cyan-700 hover:text-cyan-800" href="/login">
            Sign in
          </Link>
        </p>
      }
    >
      <AuthForm>
        <AuthField
          label="Full name"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="Nguyen Van A"
        />
        <AuthField
          label="Phone number"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="0901234567"
          hint="Must start with 0 and contain exactly 10 digits."
        />
        <AuthField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          hint="Optional in the API contract."
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Create a strong password"
          hint="At least 8 characters with uppercase, lowercase, number, and special character."
        />
        <AuthField
          label="Confirm password"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
        />
        <AuthButton type="submit">Create account</AuthButton>
      </AuthForm>
    </AuthCard>
  );
}

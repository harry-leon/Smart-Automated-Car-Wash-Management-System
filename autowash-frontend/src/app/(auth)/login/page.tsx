import Link from "next/link";
import { AuthButton, AuthCard, AuthField, AuthForm } from "../../../components/auth";

export default function LoginPage() {
  return (
    <AuthCard
      title="Sign in"
      description="Use your phone number and password to continue."
      footer={
        <p className="text-slate-600">
          New customer?{" "}
          <Link className="font-semibold text-cyan-700 hover:text-cyan-800" href="/register">
            Create an account
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
          hint="Vietnamese local format: 0 followed by 9 digits."
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input className="h-4 w-4 rounded border-slate-300 text-cyan-700" name="rememberMe" type="checkbox" />
            Remember me
          </label>
          <Link className="font-semibold text-cyan-700 hover:text-cyan-800" href="/forgot-password">
            Forgot password?
          </Link>
        </div>
        <AuthButton type="submit">Sign in</AuthButton>
      </AuthForm>
    </AuthCard>
  );
}

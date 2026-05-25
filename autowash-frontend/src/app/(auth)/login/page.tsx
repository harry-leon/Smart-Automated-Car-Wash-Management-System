"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { EyeOff, Loader2, Mail } from "lucide-react";
import { PublicAuthShell } from "@/components/auth/public-auth-shell";
import { getDisplayErrorMessage } from "@/lib/api-errors";
import { getAuthRedirectPath } from "@/lib/auth-session";
import { useCustomerLogin } from "@/hooks/use-auth";
import { phonePattern } from "@/lib/validators";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useCustomerLogin();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const errorMessage = useMemo(
    () => (loginMutation.error ? getDisplayErrorMessage(loginMutation.error) : null),
    [loginMutation.error],
  );

  useEffect(() => {
    if (accessToken && user) {
      router.replace(getAuthRedirectPath(user.role));
    }
  }, [accessToken, router, user]);

  const phoneValidationMessage =
    phone.length > 0 && !phonePattern.test(phone)
      ? "Phone must use Vietnamese format 0XXXXXXXXX."
      : null;
  const passwordValidationMessage =
    password.length > 0 && password.length < 8 ? "Password must have at least 8 characters." : null;
  const canSubmit = phonePattern.test(phone) && password.length >= 8 && !loginMutation.isPending;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!phonePattern.test(phone) || password.length < 8) return;

    await loginMutation.mutateAsync({
      phone,
      password,
      rememberMe,
    });
  };

  return (
    <PublicAuthShell
      title="LOGIN"
      footer={
        <>
          <span className="text-slate-100/80">Don&apos;t have an Account?</span>
          <Link href="/register" className="font-semibold text-white transition hover:opacity-80">
            Register
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-7">
        <div className="space-y-7">
          <Field
            label="Email"
            icon={<Mail className="h-5 w-5" />}
            value={phone}
            onChange={(event) => setPhone(event.target.value.replace(/\s/g, ""))}
            placeholder=""
            autoComplete="tel"
            inputMode="tel"
          />
          {phoneValidationMessage ? <p className="text-sm text-rose-200">{phoneValidationMessage}</p> : null}

          <div className="space-y-2">
            <Field
              label="Password"
              icon={<EyeOff className="h-5 w-5" />}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder=""
              type="password"
              autoComplete="current-password"
            />
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm font-medium text-slate-950/90 transition hover:opacity-75">
                Forgot Password?
              </Link>
            </div>
          </div>
          {passwordValidationMessage ? (
            <p className="text-sm text-rose-200">{passwordValidationMessage}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3 text-lg font-medium text-slate-950">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white/65 shadow-sm ring-1 ring-white/75">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-md border-2 border-sky-200 bg-white/80 text-sky-700 transition",
                  rememberMe && "bg-sky-200 text-slate-950",
                )}
              >
                {rememberMe ? "✓" : ""}
              </span>
            </span>
            Remember Me
          </label>
        </div>

        <div className="pt-2">
          <button
            disabled={!canSubmit}
            type="submit"
            className={cn(
              "mx-auto flex h-14 min-w-[300px] items-center justify-center gap-2 rounded-xl bg-[linear-gradient(180deg,#88b8ff_0%,#5d95ea_100%)] px-10 text-[18px] font-semibold text-white shadow-[0_12px_24px_rgba(39,91,164,0.45)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70",
            )}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </div>

        {errorMessage ? <p className="text-center text-sm text-rose-200">{errorMessage}</p> : null}
      </form>
    </PublicAuthShell>
  );
}

function Field({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  inputMode,
}: {
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "numeric" | "tel" | "search" | "url" | "none" | "decimal";
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 border-b border-slate-700/50 pb-2">
        <label className="text-[18px] font-medium text-slate-950">{label}</label>
        <span className="text-slate-950/80">{icon}</span>
      </div>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className="h-8 w-full bg-transparent text-[16px] text-slate-950 outline-none placeholder:text-transparent"
      />
    </div>
  );
}

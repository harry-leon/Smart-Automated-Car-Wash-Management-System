"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, LockKeyhole, Sparkles, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { getDisplayErrorMessage } from "@/shared/lib/api-errors";
import { getAuthRedirectPath } from "@/features/auth/lib/auth-session";
import {
  getLoginIdentifierValidationMessage,
  normalizeLoginIdentifier,
} from "@/features/auth/lib/login-identifier";
import { useCustomerLogin } from "@/features/auth/hooks/use-auth";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { cn } from "@/shared/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useCustomerLogin();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const errorMessage = useMemo(() => {
    return loginMutation.error ? getDisplayErrorMessage(loginMutation.error) : null;
  }, [loginMutation.error]);

  useEffect(() => {
    if (accessToken && user) {
      router.replace(getAuthRedirectPath(user.role));
    }
  }, [accessToken, router, user]);

  const normalizedIdentifier = normalizeLoginIdentifier(identifier);
  const identifierValidationMessage = getLoginIdentifierValidationMessage(normalizedIdentifier);
  const passwordValidationMessage =
    password.length > 0 && password.length < 8
      ? "Mật khẩu phải có ít nhất 8 ký tự."
      : null;

  const canSubmit =
    identifierValidationMessage === null && password.length >= 8 && !loginMutation.isPending;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (identifierValidationMessage !== null || password.length < 8) {
      return;
    }

    loginMutation.mutate({
      identifier: normalizedIdentifier,
      password,
      rememberMe,
    });
  };

  const handleContinueWithGoogle = () => {
    const returnUrl = `${window.location.origin}/auth/google/callback`;
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1"}/auth/google/start?returnUrl=${encodeURIComponent(returnUrl)}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-2">
        <Label htmlFor="identifier" className="text-sm font-semibold text-slate-700">
          Số điện thoại hoặc email
        </Label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="identifier"
            autoComplete="username"
            inputMode="text"
            name="identifier"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value.replace(/\s/g, ""))}
            placeholder="0901234567 hoặc you@gmail.com"
            className="h-12 rounded-md border-slate-200 bg-slate-50/70 pl-10 text-base shadow-none transition focus:border-teal-400 focus:bg-white focus:ring-teal-200"
          />
        </div>
        {identifierValidationMessage ? (
          <p className="text-sm text-rose-600">{identifierValidationMessage}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
          Mật khẩu
        </Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="password"
            autoComplete="current-password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="h-12 rounded-md border-slate-200 bg-slate-50/70 pl-10 text-base shadow-none transition focus:border-teal-400 focus:bg-white focus:ring-teal-200"
          />
        </div>
        {passwordValidationMessage ? (
          <p className="text-sm text-rose-600">{passwordValidationMessage}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3">
        <label className="flex items-center gap-3 text-sm text-slate-600">
          <Checkbox checked={rememberMe} onCheckedChange={(checked) => setRememberMe(Boolean(checked))} />
          Ghi nhớ đăng nhập
        </label>
        <Link href="/register" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
          Tạo tài khoản
        </Link>
      </div>

      <div className="rounded-lg border border-teal-100 bg-teal-50/70 p-4 text-sm text-slate-600">
        <div className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
          <Sparkles className="h-4 w-4 text-teal-700" />
          Đăng nhập bằng số điện thoại hoặc email
        </div>
        <div>Sau khi đăng nhập, hệ thống tự chuyển đến khu vực khách hàng.</div>
      </div>

      <button
        type="button"
        onClick={handleContinueWithGoogle}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-slate-200 bg-white text-sm font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-black text-white">G</span>
        Continue with Google
      </button>

      <Button
        type="submit"
        size="lg"
        disabled={!canSubmit}
        className={cn(
          "h-12 w-full rounded-md bg-slate-900 text-base font-semibold text-white shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:bg-slate-800",
          "disabled:translate-y-0 disabled:shadow-none",
        )}
      >
        {loginMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang đăng nhập...
          </>
        ) : (
          <>
            Đăng nhập
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}
    </form>
  );
}

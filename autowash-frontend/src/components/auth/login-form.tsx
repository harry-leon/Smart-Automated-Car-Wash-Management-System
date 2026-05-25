"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, LockKeyhole, Phone, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDisplayErrorMessage } from "@/lib/api-errors";
import { getAuthRedirectPath } from "@/lib/auth-session";
import { useCustomerLogin } from "@/hooks/use-auth";
import { phonePattern } from "@/lib/validators";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useCustomerLogin();
  const [phone, setPhone] = useState("");
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

  const phoneValidationMessage =
    phone.length > 0 && !phonePattern.test(phone)
      ? "Phone must use Vietnamese format 0XXXXXXXXX."
      : null;
  const passwordValidationMessage =
    password.length > 0 && password.length < 8
      ? "Password must have at least 8 characters."
      : null;

  const canSubmit =
    phonePattern.test(phone) && password.length >= 8 && !loginMutation.isPending;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!phonePattern.test(phone) || password.length < 8) {
      return;
    }

    await loginMutation.mutateAsync({
      phone,
      password,
      rememberMe,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-2">
        <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">
          Phone
        </Label>
        <div className="relative">
          <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="phone"
            autoComplete="tel"
            inputMode="tel"
            name="phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value.replace(/\s/g, ""))}
            placeholder="0901234567"
            className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-10 text-base shadow-none transition focus:border-sky-400 focus:bg-white focus:ring-sky-200"
          />
        </div>
        {phoneValidationMessage ? (
          <p className="text-sm text-rose-600">{phoneValidationMessage}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
          Password
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
            className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-10 text-base shadow-none transition focus:border-sky-400 focus:bg-white focus:ring-sky-200"
          />
        </div>
        {passwordValidationMessage ? (
          <p className="text-sm text-rose-600">{passwordValidationMessage}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
        <label className="flex items-center gap-3 text-sm text-slate-600">
          <Checkbox checked={rememberMe} onCheckedChange={(checked) => setRememberMe(Boolean(checked))} />
          Remember me
        </label>
        <Link href="/register" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
          Create account
        </Link>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50 p-4 text-sm text-slate-600">
        <div className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
          <Sparkles className="h-4 w-4 text-sky-600" />
          Sign in with your phone number
        </div>
        <div>Customer login redirects to the customer workspace automatically.</div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={!canSubmit}
        className={cn(
          "h-12 w-full rounded-xl bg-slate-900 text-base font-semibold text-white shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:bg-slate-800",
          "disabled:translate-y-0 disabled:shadow-none",
        )}
      >
        {loginMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Sign in
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}
    </form>
  );
}

"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { getDisplayErrorMessage, getFieldErrorMessage } from "@/shared/lib/api-errors";
import { useCustomerRegister } from "@/features/auth/hooks/use-auth";
import { emailPattern, passwordPattern, phonePattern } from "@/shared/lib/validators";
import { cn } from "@/shared/lib/utils";

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useCustomerRegister();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const fieldErrors = registerMutation.error?.fieldErrors;
  const fullNameError =
    (fullName.length > 0 && fullName.trim().length === 0 ? "Full name is required." : null) ??
    getFieldErrorMessage(fieldErrors, "fullName");
  const phoneError =
    (phone.length > 0 && !phonePattern.test(phone)
      ? "Phone must use Vietnamese format 0XXXXXXXXX."
      : null) ?? getFieldErrorMessage(fieldErrors, "phone");
  const emailError =
    (email.length > 0 && !emailPattern.test(email) ? "Email không hợp lệ." : null) ??
    getFieldErrorMessage(fieldErrors, "email");
  const passwordError =
    (password.length > 0 && !passwordPattern.test(password)
      ? "Mật khẩu cần có chữ hoa, chữ thường, số, ký tự đặc biệt và tối thiểu 8 ký tự."
      : null) ?? getFieldErrorMessage(fieldErrors, "password");
  const passwordConfirmError =
    (passwordConfirm.length > 0 && passwordConfirm !== password
      ? "Mật khẩu xác nhận phải khớp với mật khẩu."
      : null) ?? getFieldErrorMessage(fieldErrors, "passwordConfirm");

  const canSubmit = useMemo(() => {
    return (
      fullName.trim().length > 0 &&
      phonePattern.test(phone) &&
      emailPattern.test(email) &&
      passwordPattern.test(password) &&
      passwordConfirm === password &&
      !registerMutation.isPending
    );
  }, [email, fullName, password, passwordConfirm, phone, registerMutation.isPending]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    const response = await registerMutation.mutateAsync({
      fullName: fullName.trim(),
      phone,
      email,
      password,
      passwordConfirm,
    });

    router.push(`/verify-otp?email=${encodeURIComponent(response.email)}&expiresIn=${response.otpExpiresIn}`);
  };

  const errorMessage = registerMutation.error
    ? getDisplayErrorMessage(registerMutation.error)
    : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-bold tracking-wide text-slate-700">
            Full name
          </label>
          <div className="relative flex items-center">
            <input
              id="fullName"
              autoComplete="name"
              name="fullName"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Nguyen Van A"
              className="h-12 w-full rounded-2xl border border-sky-100 bg-white/70 pl-11 pr-4 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur-sm transition-all duration-300 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-500/10"
            />
            <div className="absolute left-4 flex items-center justify-center text-slate-400">
              <UserRound className="h-4 w-4" />
            </div>
          </div>
          {fullNameError ? (
            <p className="text-xs font-semibold text-rose-600 pl-1">{fullNameError}</p>
          ) : null}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-bold tracking-wide text-slate-700">
            Phone
          </label>
          <div className="relative flex items-center">
            <input
              id="phone"
              autoComplete="tel"
              inputMode="tel"
              name="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value.replace(/\s/g, ""))}
              placeholder="0901234567"
              className="h-12 w-full rounded-2xl border border-sky-100 bg-white/70 pl-11 pr-4 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur-sm transition-all duration-300 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-500/10"
            />
            <div className="absolute left-4 flex items-center justify-center text-slate-400">
              <Phone className="h-4 w-4" />
            </div>
          </div>
          {phoneError ? (
            <p className="text-xs font-semibold text-rose-600 pl-1">{phoneError}</p>
          ) : null}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-bold tracking-wide text-slate-700">
            Email
          </label>
          <div className="relative flex items-center">
            <input
              id="email"
              autoComplete="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              className="h-12 w-full rounded-2xl border border-sky-100 bg-white/70 pl-11 pr-4 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur-sm transition-all duration-300 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-500/10"
            />
            <div className="absolute left-4 flex items-center justify-center text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
          </div>
          {emailError ? (
            <p className="text-xs font-semibold text-rose-600 pl-1">{emailError}</p>
          ) : null}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-bold tracking-wide text-slate-700">
            Mật khẩu
          </label>
          <div className="relative flex items-center">
            <input
              id="password"
              autoComplete="new-password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="h-12 w-full rounded-2xl border border-sky-100 bg-white/70 pl-11 pr-4 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur-sm transition-all duration-300 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-500/10"
            />
            <div className="absolute left-4 flex items-center justify-center text-slate-400">
              <LockKeyhole className="h-4 w-4" />
            </div>
          </div>
          {passwordError ? (
            <p className="text-xs font-semibold text-rose-600 pl-1">{passwordError}</p>
          ) : null}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label htmlFor="passwordConfirm" className="text-sm font-bold tracking-wide text-slate-700">
            Xác nhận mật khẩu
          </label>
          <div className="relative flex items-center">
            <input
              id="passwordConfirm"
              autoComplete="new-password"
              name="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              placeholder="••••••••"
              className="h-12 w-full rounded-2xl border border-sky-100 bg-white/70 pl-11 pr-4 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur-sm transition-all duration-300 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-500/10"
            />
            <div className="absolute left-4 flex items-center justify-center text-slate-400">
              <LockKeyhole className="h-4 w-4" />
            </div>
          </div>
          {passwordConfirmError ? (
            <p className="text-xs font-semibold text-rose-600 pl-1">{passwordConfirmError}</p>
          ) : null}
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={!canSubmit}
          className="h-12 w-full rounded-full text-sm font-bold shadow-[0_12px_32px_rgba(37,99,235,0.24)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              Creating account...
            </>
          ) : (
            <>
              Đăng ký
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {errorMessage ? (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-center text-xs font-bold text-rose-600 animate-pulse">
          {errorMessage}
        </div>
      ) : null}
    </form>
  );
}

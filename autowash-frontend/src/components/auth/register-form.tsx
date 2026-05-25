"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDisplayErrorMessage, getFieldErrorMessage } from "@/lib/api-errors";
import { useCustomerRegister } from "@/hooks/use-auth";
import { emailPattern, passwordPattern, phonePattern } from "@/lib/validators";
import { cn } from "@/lib/utils";

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
    (email.length > 0 && !emailPattern.test(email) ? "Email format is invalid." : null) ??
    getFieldErrorMessage(fieldErrors, "email");
  const passwordError =
    (password.length > 0 && !passwordPattern.test(password)
      ? "Password must contain upper, lower, number, special character, and 8+ chars."
      : null) ?? getFieldErrorMessage(fieldErrors, "password");
  const passwordConfirmError =
    (passwordConfirm.length > 0 && passwordConfirm !== password
      ? "Password confirmation must match password."
      : null) ?? getFieldErrorMessage(fieldErrors, "passwordConfirm");

  const canSubmit = useMemo(() => {
    return (
      fullName.trim().length > 0 &&
      phonePattern.test(phone) &&
      (email.length === 0 || emailPattern.test(email)) &&
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
      email: email || undefined,
      password,
      passwordConfirm,
    });

    router.push(`/verify-otp?phone=${encodeURIComponent(response.phone)}&autoSend=1`);
  };

  const errorMessage = registerMutation.error
    ? getDisplayErrorMessage(registerMutation.error)
    : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-2">
        <Label htmlFor="fullName" className="text-sm font-semibold text-slate-700">
          Full name
        </Label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="fullName"
            autoComplete="name"
            name="fullName"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Nguyen Van A"
            className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-10 text-base shadow-none transition focus:border-sky-400 focus:bg-white focus:ring-sky-200"
          />
        </div>
        {fullNameError ? <p className="text-sm text-rose-600">{fullNameError}</p> : null}
      </div>

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
        {phoneError ? <p className="text-sm text-rose-600">{phoneError}</p> : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
          Email
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="email"
            autoComplete="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-10 text-base shadow-none transition focus:border-sky-400 focus:bg-white focus:ring-sky-200"
          />
        </div>
        {emailError ? <p className="text-sm text-rose-600">{emailError}</p> : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
          Password
        </Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="password"
            autoComplete="new-password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-10 text-base shadow-none transition focus:border-sky-400 focus:bg-white focus:ring-sky-200"
          />
        </div>
        {passwordError ? <p className="text-sm text-rose-600">{passwordError}</p> : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="passwordConfirm" className="text-sm font-semibold text-slate-700">
          Confirm password
        </Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="passwordConfirm"
            autoComplete="new-password"
            name="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            placeholder="••••••••"
            className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-10 text-base shadow-none transition focus:border-sky-400 focus:bg-white focus:ring-sky-200"
          />
        </div>
        {passwordConfirmError ? (
          <p className="text-sm text-rose-600">{passwordConfirmError}</p>
        ) : null}
      </div>

      <div className="grid gap-3 rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-sm text-slate-600">
        <div className="font-semibold text-slate-900">New customer defaults</div>
        <div>Account status: PENDING until OTP verification completes.</div>
        <div>Tier: MEMBER, points: 0, workspace: Customer.</div>
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
        {registerMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          <>
            Register
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}
    </form>
  );
}

"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDisplayErrorMessage, getFieldErrorMessage } from "@/lib/api-errors";
import { useSendCustomerOtp, useVerifyCustomerOtp } from "@/hooks/use-auth";
import { otpPattern, phonePattern } from "@/lib/validators";
import { cn } from "@/lib/utils";

const OTP_LENGTH = 6;

export function VerifyOtpForm({
  autoSend,
  initialPhone,
}: {
  autoSend: boolean;
  initialPhone: string;
}) {
  const [phone, setPhone] = useState(initialPhone);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [lastOtpExpiry, setLastOtpExpiry] = useState<number | null>(null);
  const hasAutoSentRef = useRef(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const sendOtpMutation = useSendCustomerOtp();
  const verifyOtpMutation = useVerifyCustomerOtp();

  useEffect(() => {
    setPhone(initialPhone);
  }, [initialPhone]);

  useEffect(() => {
    if (!lastOtpExpiry) {
      return undefined;
    }

    const syncTimer = () => {
      const nextSecondsLeft = Math.max(0, Math.ceil((lastOtpExpiry - Date.now()) / 1000));
      setSecondsLeft(nextSecondsLeft);
    };

    syncTimer();
    const timer = setInterval(syncTimer, 1000);
    return () => clearInterval(timer);
  }, [lastOtpExpiry]);

  const otp = digits.join("");
  const expired = secondsLeft === 0 && lastOtpExpiry !== null;
  const ready = otpPattern.test(otp) && phonePattern.test(phone) && !expired;

  const phoneError =
    (phone.length > 0 && !phonePattern.test(phone)
      ? "Phone must use Vietnamese format 0XXXXXXXXX."
      : null) ?? getFieldErrorMessage(sendOtpMutation.error?.fieldErrors, "phone");
  const otpError =
    (otp.length > 0 && !otpPattern.test(otp) ? "OTP must be exactly 6 digits." : null) ??
    getFieldErrorMessage(verifyOtpMutation.error?.fieldErrors, "otp");
  const sendErrorMessage = useMemo(() => {
    return sendOtpMutation.error ? getDisplayErrorMessage(sendOtpMutation.error) : null;
  }, [sendOtpMutation.error]);
  const verifyErrorMessage = useMemo(() => {
    return verifyOtpMutation.error ? getDisplayErrorMessage(verifyOtpMutation.error) : null;
  }, [verifyOtpMutation.error]);

  const handleDigitChange = (index: number, value: string) => {
    const nextDigit = value.replace(/\D/g, "").slice(-1);

    setDigits((prev) => {
      const next = [...prev];
      next[index] = nextDigit;
      return next;
    });

    if (nextDigit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    event.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    for (let index = 0; index < pasted.length; index += 1) {
      next[index] = pasted[index];
    }
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleSendOtp = useCallback(async () => {
    if (!phonePattern.test(phone)) {
      return;
    }

    const response = await sendOtpMutation.mutateAsync({ phone });
    setLastOtpExpiry(Date.now() + response.otpExpiresIn * 1000);
    setDigits(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
  }, [phone, sendOtpMutation]);

  useEffect(() => {
    if (!autoSend || hasAutoSentRef.current || !phonePattern.test(phone)) {
      return;
    }

    hasAutoSentRef.current = true;
    handleSendOtp().catch(() => undefined);
  }, [autoSend, handleSendOtp, phone]);

  const handleVerify = async () => {
    if (!ready) {
      return;
    }

    setVerifying(true);
    try {
      await verifyOtpMutation.mutateAsync({ phone, otp });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 shadow-sm">
          <ShieldCheck className="h-7 w-7" />
        </div>
      </div>

      <div className="space-y-2 text-center">
        <h3 className="text-2xl font-black tracking-tight text-slate-900">Verify OTP</h3>
        <p className="text-sm leading-6 text-slate-600">
          Enter the 6-digit OTP sent to <span className="font-semibold text-slate-900">{phone || "your phone"}</span> to activate the account.
        </p>
      </div>

      <div className="grid gap-2">
        <label htmlFor="phone" className="text-sm font-semibold text-slate-700">
          Phone
        </label>
        <input
          id="phone"
          autoComplete="tel"
          inputMode="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value.replace(/\s/g, ""))}
          className="h-12 rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-base shadow-none transition focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
          placeholder="0901234567"
        />
        {phoneError ? <p className="text-sm text-rose-600">{phoneError}</p> : null}
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700">OTP</label>
        <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              value={digit}
              onChange={(event) => handleDigitChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              inputMode="numeric"
              maxLength={1}
              className={cn(
                "h-12 w-10 rounded-xl border bg-white text-center text-xl font-semibold shadow-sm transition sm:h-14 sm:w-12",
                "focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100",
                digit ? "border-sky-300 bg-sky-50 text-slate-900" : "border-slate-200",
              )}
            />
          ))}
        </div>
        {otpError ? <p className="text-center text-sm text-rose-600">{otpError}</p> : null}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm">
        <div className="text-slate-600">
          {secondsLeft > 0 ? (
            <>
              OTP expires in <span className="font-semibold text-slate-900">{secondsLeft}s</span>
            </>
          ) : (
            <span className="font-medium text-slate-500">You can resend a new code now.</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => void handleSendOtp()}
          disabled={sendOtpMutation.isPending || !phonePattern.test(phone)}
          className="font-semibold text-sky-700 hover:text-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sendOtpMutation.isPending ? "Sending..." : "Resend code"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          asChild
        >
          <Link href="/register" className="inline-flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to registration
          </Link>
        </Button>

        <Button
          type="button"
          size="lg"
          disabled={!ready || verifying}
          onClick={handleVerify}
          className="h-12 rounded-xl bg-slate-900 text-base font-semibold text-white shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:bg-slate-800 disabled:translate-y-0 disabled:shadow-none"
        >
          {verifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify & Complete"
          )}
        </Button>
      </div>

      {sendErrorMessage ? <p className="text-sm text-rose-600">{sendErrorMessage}</p> : null}
      {verifyErrorMessage ? <p className="text-sm text-rose-600">{verifyErrorMessage}</p> : null}
    </div>
  );
}

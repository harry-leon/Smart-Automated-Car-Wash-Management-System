"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { getDisplayErrorMessage, getFieldErrorMessage } from "@/lib/api-errors";
import { useSendCustomerOtp, useVerifyCustomerOtp } from "@/hooks/use-auth";
import { otpPattern, phonePattern } from "@/lib/validators";

export function VerifyOtpForm({
  autoSend,
  initialPhone,
}: {
  autoSend: boolean;
  initialPhone: string;
}) {
  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState("");
  const [otpInfoMessage, setOtpInfoMessage] = useState<string | null>(null);
  const hasAutoSentRef = useRef(false);
  const sendOtpMutation = useSendCustomerOtp();
  const verifyOtpMutation = useVerifyCustomerOtp();

  useEffect(() => {
    setPhone(initialPhone);
  }, [initialPhone]);

  useEffect(() => {
    if (!autoSend || hasAutoSentRef.current || !phonePattern.test(phone)) {
      return;
    }

    hasAutoSentRef.current = true;
    sendOtpMutation
      .mutateAsync({ phone })
      .then((response) => {
        setOtpInfoMessage(
          response.message ?? `OTP sent. Expires in ${response.otpExpiresIn} seconds.`
        );
      })
      .catch(() => undefined);
  }, [autoSend, phone, sendOtpMutation]);

  const phoneError =
    (phone.length > 0 && !phonePattern.test(phone)
      ? "Phone must use Vietnamese format 0XXXXXXXXX."
      : null) ?? getFieldErrorMessage(sendOtpMutation.error?.fieldErrors, "phone");
  const otpError =
    (otp.length > 0 && !otpPattern.test(otp)
      ? "OTP must be exactly 6 digits."
      : null) ??
    getFieldErrorMessage(verifyOtpMutation.error?.fieldErrors, "otp");

  const verifyErrorMessage = useMemo(() => {
    return verifyOtpMutation.error
      ? getDisplayErrorMessage(verifyOtpMutation.error)
      : null;
  }, [verifyOtpMutation.error]);

  const sendErrorMessage = useMemo(() => {
    return sendOtpMutation.error ? getDisplayErrorMessage(sendOtpMutation.error) : null;
  }, [sendOtpMutation.error]);

  const handleSendOtp = async () => {
    if (!phonePattern.test(phone)) {
      return;
    }

    const response = await sendOtpMutation.mutateAsync({ phone });
    setOtpInfoMessage(
      response.message ?? `OTP sent. Expires in ${response.otpExpiresIn} seconds.`
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!phonePattern.test(phone) || !otpPattern.test(otp)) {
      return;
    }

    await verifyOtpMutation.mutateAsync({ phone, otp });
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 420,
          border: "1px solid #e5e7eb",
          borderRadius: 18,
          padding: 24,
          background: "#fff"
        }}
      >
        <p style={{ margin: 0, color: "#6b7280", fontSize: 12, textTransform: "uppercase" }}>
          Auth workspace
        </p>
        <h1 style={{ margin: "12px 0 8px", fontSize: 28 }}>Verify OTP</h1>
        <p style={{ margin: "0 0 16px", color: "#374151" }}>
          Enter the 6-digit OTP sent to your phone to activate the account.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <label>
            <span>Phone</span>
            <input
              autoComplete="tel"
              name="phone"
              onChange={(event) => setPhone(event.target.value)}
              placeholder="0901234567"
              value={phone}
            />
          </label>
          {phoneError ? <p style={{ color: "crimson", margin: 0 }}>{phoneError}</p> : null}

          <label>
            <span>OTP</span>
            <input
              inputMode="numeric"
              maxLength={6}
              name="otp"
              onChange={(event) => setOtp(event.target.value)}
              placeholder="123456"
              value={otp}
            />
          </label>
          {otpError ? <p style={{ color: "crimson", margin: 0 }}>{otpError}</p> : null}

          <div style={{ display: "flex", gap: 12 }}>
            <button
              disabled={sendOtpMutation.isPending || !phonePattern.test(phone)}
              onClick={handleSendOtp}
              type="button"
            >
              {sendOtpMutation.isPending ? "Sending..." : "Send OTP"}
            </button>
            <button
              disabled={
                verifyOtpMutation.isPending ||
                !phonePattern.test(phone) ||
                !otpPattern.test(otp)
              }
              type="submit"
            >
              {verifyOtpMutation.isPending ? "Verifying..." : "Verify"}
            </button>
          </div>
        </form>

        {otpInfoMessage ? (
          <p style={{ color: "#0f766e", marginTop: 12 }}>{otpInfoMessage}</p>
        ) : null}
        {sendErrorMessage ? (
          <p style={{ color: "crimson", marginTop: 12 }}>{sendErrorMessage}</p>
        ) : null}
        {verifyErrorMessage ? (
          <p style={{ color: "crimson", marginTop: 12 }}>{verifyErrorMessage}</p>
        ) : null}

        <div style={{ marginTop: 20 }}>
          <Link href="/login">Back to login</Link>
        </div>
      </section>
    </main>
  );
}

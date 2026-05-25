"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerLogin } from "@/hooks/use-auth";
import { getDisplayErrorMessage } from "@/lib/api-errors";
import { getAuthRedirectPath } from "@/lib/auth-session";
import { phonePattern } from "@/lib/validators";
import { useAuthStore } from "@/store/auth.store";

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useCustomerLogin();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const errorMessage = useMemo(() => {
    return loginMutation.error
      ? getDisplayErrorMessage(loginMutation.error)
      : null;
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!phonePattern.test(phone) || password.length < 8) {
      return;
    }

    await loginMutation.mutateAsync({
      phone,
      password,
      rememberMe: false
    });
  };

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 420 }}>
      <h1>Customer Login</h1>
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
        {phoneValidationMessage ? (
          <p style={{ color: "crimson", margin: 0 }}>{phoneValidationMessage}</p>
        ) : null}

        <label>
          <span>Password</span>
          <input
            autoComplete="current-password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>
        {passwordValidationMessage ? (
          <p style={{ color: "crimson", margin: 0 }}>{passwordValidationMessage}</p>
        ) : null}

        <button
          disabled={
            loginMutation.isPending ||
            Boolean(phoneValidationMessage) ||
            Boolean(passwordValidationMessage) ||
            !phone ||
            !password
          }
          type="submit"
        >
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {errorMessage ? (
        <p style={{ color: "crimson", marginTop: 12 }}>{errorMessage}</p>
      ) : null}

      <p style={{ marginTop: 12 }}>
        New customer? <a href="/register">Create an account</a>
      </p>
    </main>
  );
}

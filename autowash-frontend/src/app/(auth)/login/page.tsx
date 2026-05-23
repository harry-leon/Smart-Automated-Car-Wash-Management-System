"use client";

import { FormEvent, useMemo, useState } from "react";
import { useCustomerLogin } from "@/hooks/use-auth";
import { getDisplayErrorMessage } from "@/lib/api-errors";

export default function LoginPage() {
  const loginMutation = useCustomerLogin();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const errorMessage = useMemo(() => {
    return loginMutation.error
      ? getDisplayErrorMessage(loginMutation.error)
      : null;
  }, [loginMutation.error]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

        <button disabled={loginMutation.isPending} type="submit">
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {errorMessage ? (
        <p style={{ color: "crimson", marginTop: 12 }}>{errorMessage}</p>
      ) : null}
    </main>
  );
}

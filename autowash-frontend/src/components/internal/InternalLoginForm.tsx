"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getDisplayErrorMessage } from "@/lib/api-errors";
import { apiRequest } from "@/lib/api";
import { saveInternalSession, toAuthSession } from "@/services/internalAuth";
import type {
  InternalRole,
  InternalLoginCredentials,
  InternalLoginResponseData
} from "@/types/auth.types";

interface InternalLoginFormProps {
  expectedRole: InternalRole;
  title: string;
  redirectTo: string;
}

export function InternalLoginForm({ expectedRole, title, redirectTo }: InternalLoginFormProps) {
  const router = useRouter();
  const [credentials, setCredentials] = useState<InternalLoginCredentials>({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const identifier = credentials.email.trim();
      const response = await apiRequest<InternalLoginResponseData, InternalLoginCredentials & { phone?: string }>({
        method: "POST",
        url: "/auth/login",
        data: {
          ...credentials,
          phone: /^0[0-9]{9}$/.test(identifier) ? identifier : undefined
        }
      });
      const session = toAuthSession(response);

      if (session.user.role !== expectedRole) {
        setError("Tai khoan nay khong co quyen truy cap khu vuc nay.");
        return;
      }

      saveInternalSession(session);
      router.replace(redirectTo);
    } catch (requestError) {
      setError(getDisplayErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "72px auto", padding: 24 }}>
      <h1>{title}</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Email or phone
          <input
            type="email"
            value={credentials.email}
            onChange={(event) => setCredentials((current) => ({ ...current, email: event.target.value }))}
            required
            autoComplete="email"
            style={{ padding: 10 }}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          Password
          <input
            type="password"
            value={credentials.password}
            onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
            required
            autoComplete="current-password"
            style={{ padding: 10 }}
          />
        </label>
        {error ? <p role="alert" style={{ color: "#b91c1c", margin: 0 }}>{error}</p> : null}
        <button type="submit" disabled={isSubmitting} style={{ padding: 10 }}>
          {isSubmitting ? "Dang dang nhap..." : "Dang nhap"}
        </button>
      </form>
    </main>
  );
}

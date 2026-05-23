"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, ApiError } from "@/services/api";
import { saveInternalSession, toAuthSession } from "@/services/internalAuth";
import type {
  ApiResponse,
  BackendLoginData,
  InternalRole,
  LoginCredentials
} from "@/types/auth.types";

interface InternalLoginFormProps {
  expectedRole: InternalRole;
  title: string;
  redirectTo: string;
}

export function InternalLoginForm({ expectedRole, title, redirectTo }: InternalLoginFormProps) {
  const router = useRouter();
  const [credentials, setCredentials] = useState<LoginCredentials>({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await apiRequest<ApiResponse<BackendLoginData>>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials)
      });
      const session = toAuthSession(response.data);

      if (session.user.role !== expectedRole) {
        setError("Tai khoan nay khong co quyen truy cap khu vuc nay.");
        return;
      }

      saveInternalSession(session);
      router.replace(redirectTo);
    } catch (requestError) {
      if (requestError instanceof ApiError && (requestError.status === 400 || requestError.status === 401)) {
        setError(requestError.message);
      } else if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError("Dang nhap that bai. Vui long thu lai.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "72px auto", padding: 24 }}>
      <h1>{title}</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Email
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

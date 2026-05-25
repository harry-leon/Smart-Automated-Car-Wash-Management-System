"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getDisplayErrorMessage, getFieldErrorMessage } from "@/lib/api-errors";
import { useCustomerRegister } from "@/hooks/use-auth";
import { emailPattern, passwordPattern, phonePattern } from "@/lib/validators";

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useCustomerRegister();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const fieldErrors = registerMutation.error?.fieldErrors;
  const fullNameError =
    (fullName.length > 0 && fullName.trim().length === 0
      ? "Full name is required."
      : null) ?? getFieldErrorMessage(fieldErrors, "fullName");
  const phoneError =
    (phone.length > 0 && !phonePattern.test(phone)
      ? "Phone must use Vietnamese format 0XXXXXXXXX."
      : null) ?? getFieldErrorMessage(fieldErrors, "phone");
  const emailError =
    (email.length > 0 && !emailPattern.test(email)
      ? "Email format is invalid."
      : null) ?? getFieldErrorMessage(fieldErrors, "email");
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
      passwordConfirm === password
    );
  }, [email, fullName, password, passwordConfirm, phone]);

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

    router.push(
      `/verify-otp?phone=${encodeURIComponent(response.phone)}&autoSend=1`
    );
  };

  const errorMessage = registerMutation.error
    ? getDisplayErrorMessage(registerMutation.error)
    : null;

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 420 }}>
      <h1>Create customer account</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          <span>Full name</span>
          <input
            name="fullName"
            onChange={(event) => setFullName(event.target.value)}
            value={fullName}
          />
        </label>
        {fullNameError ? <p style={{ color: "crimson", margin: 0 }}>{fullNameError}</p> : null}

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
          <span>Email</span>
          <input
            autoComplete="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            value={email}
          />
        </label>
        {emailError ? <p style={{ color: "crimson", margin: 0 }}>{emailError}</p> : null}

        <label>
          <span>Password</span>
          <input
            autoComplete="new-password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>
        {passwordError ? <p style={{ color: "crimson", margin: 0 }}>{passwordError}</p> : null}

        <label>
          <span>Confirm password</span>
          <input
            autoComplete="new-password"
            name="passwordConfirm"
            onChange={(event) => setPasswordConfirm(event.target.value)}
            type="password"
            value={passwordConfirm}
          />
        </label>
        {passwordConfirmError ? (
          <p style={{ color: "crimson", margin: 0 }}>{passwordConfirmError}</p>
        ) : null}

        <button disabled={registerMutation.isPending || !canSubmit} type="submit">
          {registerMutation.isPending ? "Creating account..." : "Register"}
        </button>
      </form>

      {errorMessage ? (
        <p style={{ color: "crimson", marginTop: 12 }}>{errorMessage}</p>
      ) : null}
    </main>
  );
}

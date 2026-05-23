import type { ReactNode } from "react";

type AuthAlertProps = {
  children: ReactNode;
  tone?: "error" | "info" | "success";
};

const toneClasses = {
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-cyan-200 bg-cyan-50 text-cyan-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export function AuthAlert({ children, tone = "error" }: AuthAlertProps) {
  return (
    <div className={`rounded-md border px-3 py-2 text-sm leading-6 ${toneClasses[tone]}`} role="alert">
      {children}
    </div>
  );
}

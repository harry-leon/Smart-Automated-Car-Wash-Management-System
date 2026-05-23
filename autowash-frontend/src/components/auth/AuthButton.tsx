import type { ButtonHTMLAttributes, ReactNode } from "react";

type AuthButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  loading?: boolean;
};

export function AuthButton({ children, loading = false, disabled, className = "", ...props }: AuthButtonProps) {
  return (
    <button
      className={[
        "inline-flex h-11 w-full items-center justify-center rounded-md bg-cyan-700 px-4 text-sm font-semibold text-white shadow-sm transition",
        "hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-700/30 disabled:cursor-not-allowed disabled:bg-slate-300",
        className,
      ].join(" ")}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}

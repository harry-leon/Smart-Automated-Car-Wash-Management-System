import type { InputHTMLAttributes } from "react";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function AuthField({ label, error, hint, id, className = "", ...props }: AuthFieldProps) {
  const inputId = id ?? props.name;
  const helpId = inputId ? `${inputId}-help` : undefined;
  const errorId = inputId ? `${inputId}-error` : undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-800">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errorId : hint ? helpId : undefined}
        className={[
          "block h-11 w-full rounded-md border bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition",
          "placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-600/20",
          error
            ? "border-red-500 focus:border-red-600"
            : "border-slate-300 focus:border-cyan-700",
          className,
        ].join(" ")}
        {...props}
      />
      {hint && !error ? (
        <p id={helpId} className="text-xs leading-5 text-slate-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium leading-5 text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

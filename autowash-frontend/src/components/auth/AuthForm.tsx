import type { FormHTMLAttributes, ReactNode } from "react";

type AuthFormProps = FormHTMLAttributes<HTMLFormElement> & {
  children: ReactNode;
};

export function AuthForm({ children, className = "", ...props }: AuthFormProps) {
  return (
    <form className={`space-y-4 ${className}`} noValidate {...props}>
      {children}
    </form>
  );
}

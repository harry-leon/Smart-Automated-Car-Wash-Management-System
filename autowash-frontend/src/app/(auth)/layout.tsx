import type { ReactNode } from "react";
import { AuthLayout } from "../../components/auth";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return <AuthLayout>{children}</AuthLayout>;
}

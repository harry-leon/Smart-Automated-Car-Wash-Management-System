"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getAuthRedirectPath } from "@/lib/auth-session";
import { useCustomerLogout } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth.store";

export function CustomerWorkspaceShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const logoutMutation = useCustomerLogout();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!accessToken || !user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "CUSTOMER") {
      router.replace(getAuthRedirectPath(user.role));
    }
  }, [accessToken, router, user]);

  if (!accessToken || !user) {
    return <main style={{ padding: 24 }}>Redirecting to login...</main>;
  }

  if (user.role !== "CUSTOMER") {
    return <main style={{ padding: 24 }}>Redirecting to your workspace...</main>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <header
        style={{
          borderBottom: "1px solid #e5e7eb",
          background: "#fff"
        }}
      >
        <div
          style={{
            margin: "0 auto",
            maxWidth: 960,
            padding: "16px 24px",
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ display: "grid", gap: 4 }}>
            <strong>Customer workspace</strong>
            <span style={{ color: "#64748b", fontSize: 14 }}>
              {user.fullName} | {user.tier ?? "MEMBER"}
            </span>
          </div>
          <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link href="/customer/home">Home</Link>
            <Link href="/customer/bookings/new">Booking</Link>
            <Link href="/customer/vehicles">Vehicles</Link>
            <Link href="/customer/loyalty">Loyalty</Link>
            <Link href="/customer/notifications">Notifications</Link>
            <button
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
              type="button"
            >
              {logoutMutation.isPending ? "Signing out..." : "Logout"}
            </button>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

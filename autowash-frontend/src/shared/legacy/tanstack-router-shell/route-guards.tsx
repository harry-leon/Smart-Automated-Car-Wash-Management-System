import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AccessDenied } from "@/shared/components/access-denied";
import { getHomePath } from "@/shared/lib/auth";
import { type Role, useCarwashStore } from "@/shared/store/carwash-store";

function PendingState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="rounded-xl border border-border bg-card px-6 py-4 text-sm text-muted-foreground shadow-sm">
        {message}
      </div>
    </div>
  );
}

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { hydrated, isAuthenticated, role } = useCarwashStore();

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      navigate({ to: getHomePath(role), replace: true });
    }
  }, [hydrated, isAuthenticated, navigate, role]);

  if (!hydrated) {
    return <PendingState message="Loading your workspace..." />;
  }

  if (isAuthenticated) {
    return <PendingState message="Redirecting to your workspace..." />;
  }

  return <>{children}</>;
}

export function RequireRole({ allowed, children }: { allowed: Role[]; children: React.ReactNode }) {
  const navigate = useNavigate();
  const { hydrated, isAuthenticated, role } = useCarwashStore();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      navigate({ to: "/", replace: true });
    }
  }, [hydrated, isAuthenticated, navigate]);

  if (!hydrated) {
    return <PendingState message="Loading your workspace..." />;
  }

  if (!isAuthenticated) {
    return <PendingState message="Redirecting to public page..." />;
  }

  if (!allowed.includes(role)) {
    return (
      <div className="p-6 md:p-10">
        <AccessDenied
          title="This workspace is restricted"
          description="Switch to the matching demo role or sign in with the correct account."
          role={role}
        />
      </div>
    );
  }

  return <>{children}</>;
}

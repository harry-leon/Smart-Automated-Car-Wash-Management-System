import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export function RouteRedirect({ to }: { to: string }) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to, replace: true });
  }, [navigate, to]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="rounded-xl border border-border bg-card px-6 py-4 text-sm text-muted-foreground shadow-sm">
        Redirecting...
      </div>
    </div>
  );
}

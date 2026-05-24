import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getHomePath } from "@/lib/auth";
import { useCarwashStore } from "@/lib/carwash-store";
import { PublicHomePage } from "@/app/modules/public-auth/pages/PublicHomePage";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useCarwashStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: getHomePath(role), replace: true });
    }
  }, [isAuthenticated, navigate, role]);

  if (isAuthenticated) return <div className="min-h-screen bg-background" />;

  return <PublicHomePage />;
}

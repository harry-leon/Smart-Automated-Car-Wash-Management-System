"use client";

import { useEffect, useState } from "react";
import { apiRequest, ApiError } from "@/services/api";
import type { ApiResponse } from "@/types/auth.types";

type DashboardSummary = Record<string, unknown>;

export function AdminDashboardSummary() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      setIsLoading(true);
      setError("");

      try {
        const response = await apiRequest<ApiResponse<DashboardSummary>>("/admin/dashboard/metrics", {
          method: "GET",
          auth: true
        });

        if (isMounted) {
          setData(response.data);
        }
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        if (requestError instanceof ApiError || requestError instanceof Error) {
          setError(requestError.message);
        } else {
          setError("Khong tai duoc du lieu dashboard.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <p>Dang tai du lieu dashboard...</p>;
  }

  if (error) {
    return <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>;
  }

  return (
    <pre style={{ background: "#ffffff", border: "1px solid #d4d4d8", padding: 16, overflowX: "auto" }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

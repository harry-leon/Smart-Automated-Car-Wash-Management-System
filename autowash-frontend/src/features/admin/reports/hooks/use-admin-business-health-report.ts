"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminBusinessHealthReport } from "@/features/admin/reports/api/admin-reporting-service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { ApiErrorResponse } from "@/shared/types/api.types";
import type {
  AdminBusinessHealthReport,
  ReportAnalysisGroup,
  ReportRangeKey,
} from "@/features/admin/reports/admin-reporting.types";

export function useAdminBusinessHealthReport(
  range: ReportRangeKey,
  analysisGroup: ReportAnalysisGroup,
) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const enabled = Boolean(accessToken && user?.role === "ADMIN");

  return useQuery<AdminBusinessHealthReport, ApiErrorResponse>({
    queryKey: ["admin-reports", "business-health", range, analysisGroup],
    queryFn: () => getAdminBusinessHealthReport({ range, analysisGroup }),
    enabled,
    staleTime: 60_000,
  });
}

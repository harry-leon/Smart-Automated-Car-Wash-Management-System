"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, BellRing, ClipboardCheck } from "lucide-react";
import { getEligibleSessionBookings, getOperationsQueue } from "@/features/staff/operations/lib/operations-service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { cn } from "@/shared/lib/utils";

export function StaffNotificationListener() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const enabled = Boolean(accessToken && user?.role === "STAFF");

  const eligibleQuery = useQuery({
    queryKey: ["staff-notifications", "eligible"],
    queryFn: getEligibleSessionBookings,
    enabled,
    refetchInterval: 10_000,
  });

  const queueQuery = useQuery({
    queryKey: ["staff-notifications", "queue"],
    queryFn: getOperationsQueue,
    enabled,
    refetchInterval: 10_000,
  });

  const eligibleCount = eligibleQuery.data?.length ?? 0;
  const pendingSessions = useMemo(() => {
    if (!queueQuery.data) return [];
    const sessions = queueQuery.data.columns.flatMap((column) => column.sessions);
    return sessions.filter((session) => session.status === "PENDING" || session.status === "QUEUED");
  }, [queueQuery.data]);

  const firstPendingSessionId = pendingSessions[0]?.sessionId ?? null;
  const pendingSessionsCount = pendingSessions.length;
  const hasTasks = eligibleCount > 0 || pendingSessionsCount > 0;

  if (!hasTasks || user?.role !== "STAFF") return null;

  const handleNotificationClick = () => {
    if (firstPendingSessionId) {
      router.push(`/staff/check-in?sessionId=${firstPendingSessionId}`);
      return;
    }
    router.push("/staff/check-in");
  };

  return (
    <button
      type="button"
      onClick={handleNotificationClick}
      className={cn(
        "fixed right-8 top-[116px] z-[60] w-[21rem] max-w-[calc(100vw-2rem)] cursor-pointer rounded-[1.35rem] p-3.5 text-left",
        "border border-orange-200/90 bg-white/96 shadow-[0_0_0_1px_rgba(251,146,60,0.14),0_16px_38px_rgba(249,115,22,0.18)] backdrop-blur-xl",
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-[0_0_0_1px_rgba(251,146,60,0.24),0_20px_48px_rgba(249,115,22,0.24)] active:scale-[0.99]",
        "animate-in fade-in slide-in-from-right-4 duration-300",
      )}
      aria-label="Xem lịch chờ duyệt"
    >
      <div className="flex items-start gap-3">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <BellRing className="h-4.5 w-4.5 animate-swing" />
          <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-black leading-tight text-orange-950">Cần xử lý check-in</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                {eligibleCount > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
                    <ClipboardCheck className="h-3 w-3" />
                    {eligibleCount} booking mới
                  </span>
                ) : null}
                {pendingSessionsCount > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-rose-700">
                    <AlertCircle className="h-3 w-3" />
                    {pendingSessionsCount} phiên chờ
                  </span>
                ) : null}
              </div>
            </div>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>

          {pendingSessions.length > 0 ? (
            <div className="mt-2.5 border-t border-orange-100 pt-2">
              {pendingSessions.slice(0, 1).map((session) => (
                <div key={session.sessionId} className="flex items-center justify-between gap-2 rounded-xl bg-orange-50/70 px-3 py-2 text-[11px]">
                  <span className="min-w-0 truncate font-black tracking-wide text-slate-900">{session.vehiclePlate}</span>
                  <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-orange-700 shadow-sm">
                    {session.status === "PENDING" ? "Chờ duyệt" : "Chờ check-in"}
                  </span>
                </div>
              ))}
              {pendingSessions.length > 1 ? (
                <p className="mt-1.5 text-right text-[10px] font-semibold text-slate-400">
                  +{pendingSessions.length - 1} phiên khác
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}

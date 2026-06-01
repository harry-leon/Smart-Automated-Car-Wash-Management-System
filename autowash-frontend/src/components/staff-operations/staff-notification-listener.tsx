"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, BellRing, ClipboardCheck } from "lucide-react";
import { getEligibleSessionBookings, getOperationsQueue } from "@/lib/operations-service";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

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
        "fixed right-8 top-[174px] z-[9999] flex w-80 cursor-pointer items-start gap-3 rounded-3xl p-4 text-left",
        "border border-orange-200/90 bg-white/95 shadow-[0_0_0_1px_rgba(251,146,60,0.18),0_18px_45px_rgba(249,115,22,0.22)] backdrop-blur-md",
        "transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-[0_0_0_1px_rgba(251,146,60,0.28),0_22px_55px_rgba(249,115,22,0.28)] active:scale-[0.98]",
        "animate-in fade-in slide-in-from-right-6 duration-300",
      )}
      aria-label="Xem lịch chờ duyệt"
    >
      <div className="relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
        <BellRing className="h-5 w-5 animate-swing" />
        <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
        </span>
      </div>

      <div className="min-w-0 flex-1 text-xs font-bold text-slate-800">
        <p className="text-sm font-black text-orange-900">Cần xử lý check-in</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {eligibleCount > 0 ? (
            <span className="flex items-center gap-1 text-amber-700">
              <ClipboardCheck className="h-3.5 w-3.5" />
              {eligibleCount} booking mới
            </span>
          ) : null}
          {eligibleCount > 0 && pendingSessionsCount > 0 ? <span className="font-normal text-slate-300">|</span> : null}
          {pendingSessionsCount > 0 ? (
            <span className="flex items-center gap-1 text-rose-700">
              <AlertCircle className="h-3.5 w-3.5" />
              {pendingSessionsCount} phiên chờ
            </span>
          ) : null}
        </div>

        {pendingSessions.length > 0 ? (
          <div className="mt-3 space-y-1.5 border-t border-orange-100 pt-2 text-[10px] font-medium text-slate-500">
            {pendingSessions.slice(0, 3).map((session) => (
              <div key={session.sessionId} className="flex items-center justify-between gap-2 rounded-xl bg-orange-50/60 p-2">
                <span className="font-black uppercase tracking-wide text-slate-900">{session.vehiclePlate}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold text-orange-700">
                  {session.status === "PENDING" ? "Chờ duyệt" : "Chờ check-in"}
                </span>
              </div>
            ))}
            {pendingSessions.length > 3 ? (
              <p className="mt-1 text-right text-[9px] italic text-slate-400">
                và {pendingSessions.length - 3} phiên khác đang chờ...
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500">
        <ArrowRight className="h-4 w-4" />
      </div>
    </button>
  );
}

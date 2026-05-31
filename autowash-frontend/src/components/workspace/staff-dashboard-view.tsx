"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertCircle, Car, Clock, Eye, RefreshCcw, Search, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WorkspaceEmptyState, WorkspacePage } from "@/components/workspace/workspace-page";
import { getDisplayErrorMessage } from "@/lib/api-errors";
import { getOperationsQueue } from "@/lib/operations-service";
import { cn } from "@/lib/utils";
import type { ApiErrorResponse } from "@/types/api.types";
import type { OperationsQueue, OperationsQueueSession } from "@/types/operation.types";

const METRICS = [
  { label: "Queue total", key: "total" as const, icon: Car, tone: "text-violet-700 bg-violet-50" },
  { label: "Pending", key: "pending" as const, icon: Clock, tone: "text-sky-700 bg-sky-50" },
  { label: "In progress", key: "inProgress" as const, icon: Eye, tone: "text-amber-700 bg-amber-50" },
  { label: "Completed", key: "completed" as const, icon: UserPlus, tone: "text-emerald-700 bg-emerald-50" },
];

export function StaffDashboardView() {
  const [search, setSearch] = useState("");
  const queueQuery = useQuery({
    queryKey: ["staff-dashboard", "queue"],
    queryFn: getOperationsQueue,
    refetchInterval: 30_000,
  });

  const sessions = useMemo(() => flattenSessions(queueQuery.data), [queueQuery.data]);
  const filteredSessions = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) {
      return sessions;
    }

    return sessions.filter(
      (session) =>
        session.vehiclePlate.toLowerCase().includes(needle) ||
        session.bookingId.toLowerCase().includes(needle) ||
        session.customerName.toLowerCase().includes(needle),
    );
  }, [search, sessions]);

  const summary = queueQuery.data?.summary ?? {
    total: 0,
    pending: 0,
    checkedIn: 0,
    inProgress: 0,
    completed: 0,
  };

  return (
    <WorkspacePage className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((metric) => (
          <Card key={metric.label} className="border-border/70 bg-card/95 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {metric.label}
                </p>
                <p className="mt-2 text-3xl font-black tracking-tight">{summary[metric.key]}</p>
              </div>
              <div
                className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", metric.tone)}
              >
                <metric.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/30 px-6 py-4">
            <div>
              <h2 className="text-sm font-bold">Pre-booked arrivals</h2>
              <p className="text-xs text-muted-foreground">
                Search by plate, booking ID, or customer
              </p>
            </div>
            <div className="flex w-full max-w-xs items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search arrivals..."
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => queueQuery.refetch()}>
                <RefreshCcw className={cn("h-4 w-4", queueQuery.isFetching && "animate-spin")} />
              </Button>
            </div>
          </div>

          <div className="space-y-3 p-6">
            {queueQuery.isError ? (
              <WorkspaceEmptyState
                title="Unable to load queue"
                description={getDisplayErrorMessage(queueQuery.error as unknown as ApiErrorResponse)}
              />
            ) : queueQuery.isPending ? (
              <div className="h-56 animate-pulse rounded-3xl bg-slate-100" />
            ) : filteredSessions.length === 0 ? (
              <WorkspaceEmptyState
                title="No arrivals found"
                description="Try another plate number or booking ID."
              />
            ) : (
              filteredSessions.map((session) => <ArrivalRow key={session.sessionId} session={session} />)
            )}
          </div>
        </Card>

        <Card className="border-border/70 bg-card/95 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold">
            <UserPlus className="h-4 w-4 text-violet-700" />
            Live operations entrypoint
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Check in and manage sessions from the live operations board backed by
            `GET /api/v1/operations/queue`.
          </p>
          <div className="mt-5 space-y-3">
            <Button className="w-full" asChild>
              <Link href="/staff/check-in">Open check-in</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/staff/operations">Open operations board</Link>
            </Button>
          </div>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 text-sm text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Walk-in registration still needs a backend endpoint before it can be made live.</span>
          </div>
        </Card>
      </section>
    </WorkspacePage>
  );
}

function ArrivalRow({ session }: { session: OperationsQueueSession }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-4">
      <div>
        <div className="text-sm font-bold">{session.vehiclePlate}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          {session.bookingId} / {session.customerName} / {session.bookingTime}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[11px] font-bold text-violet-700">
          {session.status}
        </span>
        <Button size="sm" asChild>
          <Link href={`/staff/sessions/${session.sessionId}`}>Open</Link>
        </Button>
      </div>
    </div>
  );
}

function flattenSessions(queue?: OperationsQueue) {
  return queue?.columns.flatMap((column) => column.sessions) ?? [];
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, ClipboardList, Loader2, Play, RotateCw, Search, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  checkInWashSession,
  completeWashSession,
  getOperationsQueue,
  queueWashSession,
  startWashSession,
} from "@/lib/operations-service";
import { cn } from "@/lib/utils";
import type { ApiErrorResponse } from "@/types/api.types";
import type { OperationsQueue, OperationsQueueSession, WashSessionStatus } from "@/types/operation.types";

type StaffOperationsFlowProps = {
  mode: "board" | "check-in" | "session";
  sessionId?: string;
};

type ActionType = "queue" | "check-in" | "start" | "complete";
type LifecycleActionResponse = {
  sessionId: string;
  status: WashSessionStatus;
};

const QUEUE_QUERY_KEY = ["staff-operations", "queue"] as const;

const statusMeta: Record<WashSessionStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "border-yellow-200 bg-yellow-50 text-yellow-800" },
  QUEUED: { label: "Queued", className: "border-sky-200 bg-sky-50 text-sky-800" },
  CHECKED_IN: { label: "Checked-in", className: "border-purple-200 bg-purple-50 text-purple-800" },
  IN_PROGRESS: { label: "In progress", className: "border-orange-200 bg-orange-50 text-orange-800" },
  COMPLETED: { label: "Completed", className: "border-green-200 bg-green-50 text-green-800" },
  CANCELLED: { label: "Cancelled", className: "border-slate-200 bg-slate-50 text-slate-700" },
};

export function StaffOperationsFlow({ mode, sessionId }: StaffOperationsFlowProps) {
  const queryClient = useQueryClient();
  const [selectedSessionId, setSelectedSessionId] = useState(sessionId ?? "");
  const [plateVerified, setPlateVerified] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const queueQuery = useQuery({
    queryKey: QUEUE_QUERY_KEY,
    queryFn: getOperationsQueue,
    refetchInterval: 30_000,
  });

  const sessions = useMemo(() => flattenSessions(queueQuery.data), [queueQuery.data]);
  const activeSessionId = mode === "session" ? sessionId : selectedSessionId.trim();
  const activeSession = sessions.find((session) => session.sessionId === activeSessionId);

  const actionMutation = useMutation({
    mutationFn: ({ action, id }: { action: ActionType; id: string }) => runAction(action, id),
    onMutate: () => {
      setNotice(null);
      setActionError(null);
    },
    onSuccess: (response) => {
      setNotice(`Session ${response.sessionId} moved to ${statusMeta[response.status]?.label ?? response.status}.`);
      setPlateVerified(false);
      void queryClient.invalidateQueries({ queryKey: QUEUE_QUERY_KEY });
    },
    onError: (error: ApiErrorResponse) => {
      setActionError(error.message || error.error?.message || "Unable to update wash session.");
    },
  });

  const canAct = !actionMutation.isPending;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Staff Operations</p>
          <h1 className="text-2xl font-semibold text-slate-950">
            {mode === "board" ? "Operations queue" : mode === "check-in" ? "Check-in" : "Wash session"}
          </h1>
        </div>
        <Button variant="outline" onClick={() => queueQuery.refetch()} disabled={queueQuery.isFetching}>
          {queueQuery.isFetching ? <Loader2 className="animate-spin" /> : <RotateCw />}
          Refresh
        </Button>
      </header>

      {queueQuery.isLoading ? <LoadingState /> : null}
      {queueQuery.isError ? <ErrorState message={readError(queueQuery.error)} /> : null}
      {notice ? <StateMessage tone="success" message={notice} /> : null}
      {actionError ? <StateMessage tone="error" message={actionError} /> : null}

      {queueQuery.data && mode === "board" ? (
        <>
          <QueueSummary queue={queueQuery.data} />
          <div className="grid gap-4 xl:grid-cols-5">
            {queueQuery.data.columns.map((column) => (
              <QueueColumn
                key={column.status}
                label={column.label}
                sessions={column.sessions}
                onAction={(action, id) => actionMutation.mutate({ action, id })}
                canAct={canAct}
              />
            ))}
          </div>
        </>
      ) : null}

      {queueQuery.data && mode === "check-in" ? (
        <CheckInPanel
          selectedSessionId={selectedSessionId}
          setSelectedSessionId={setSelectedSessionId}
          plateVerified={plateVerified}
          setPlateVerified={setPlateVerified}
          session={activeSession}
          canSubmit={canAct && Boolean(activeSession) && activeSession?.status === "QUEUED" && plateVerified}
          onSubmit={() => activeSession && actionMutation.mutate({ action: "check-in", id: activeSession.sessionId })}
        />
      ) : null}

      {queueQuery.data && mode === "session" ? (
        <SessionDetail
          session={activeSession}
          requestedSessionId={sessionId ?? ""}
          onAction={(action, id) => actionMutation.mutate({ action, id })}
          canAct={canAct}
        />
      ) : null}
    </section>
  );
}

function QueueSummary({ queue }: { queue: OperationsQueue }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Metric label="Total" value={queue.summary.total} />
      <Metric label="Pending" value={queue.summary.pending} />
      <Metric label="Checked-in" value={queue.summary.checkedIn} />
      <Metric label="In progress" value={queue.summary.inProgress} />
      <Metric label="Completed" value={queue.summary.completed} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card className="rounded-lg shadow-sm">
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
      </CardContent>
    </Card>
  );
}

function QueueColumn({
  label,
  sessions,
  onAction,
  canAct,
}: {
  label: string;
  sessions: OperationsQueueSession[];
  onAction: (action: ActionType, id: string) => void;
  canAct: boolean;
}) {
  return (
    <Card className="min-h-[280px] rounded-lg shadow-sm">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center justify-between text-sm">
          <span>{label}</span>
          <Badge variant="outline">{sessions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-4 pt-0">
        {sessions.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-200 p-4 text-sm text-slate-500">No sessions.</p>
        ) : (
          sessions.map((session) => (
            <SessionCard key={session.sessionId} session={session} onAction={onAction} canAct={canAct} compact />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function CheckInPanel({
  selectedSessionId,
  setSelectedSessionId,
  plateVerified,
  setPlateVerified,
  session,
  canSubmit,
  onSubmit,
}: {
  selectedSessionId: string;
  setSelectedSessionId: (value: string) => void;
  plateVerified: boolean;
  setPlateVerified: (value: boolean) => void;
  session?: OperationsQueueSession;
  canSubmit: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_1fr]">
      <Card className="rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4" />
            Session lookup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={selectedSessionId}
            onChange={(event) => setSelectedSessionId(event.target.value)}
            placeholder="Paste wash session ID"
          />
          <label className="flex items-start gap-3 rounded-md border p-3 text-sm">
            <Checkbox checked={plateVerified} onCheckedChange={(checked) => setPlateVerified(checked === true)} />
            <span>
              I verified the vehicle plate matches this booking.
              {session ? <strong className="ml-1 text-slate-950">{session.vehiclePlate}</strong> : null}
            </span>
          </label>
          <Button className="w-full" disabled={!canSubmit} onClick={onSubmit}>
            <Wrench />
            Check in
          </Button>
          {session && session.status !== "QUEUED" ? (
            <p className="text-sm text-amber-700">Only queued sessions can be checked in.</p>
          ) : null}
        </CardContent>
      </Card>

      {session ? (
        <SessionCard session={session} canAct={false} />
      ) : (
        <EmptyState message="Select a queued session from the operations board or paste a session ID." />
      )}
    </div>
  );
}

function SessionDetail({
  session,
  requestedSessionId,
  onAction,
  canAct,
}: {
  session?: OperationsQueueSession;
  requestedSessionId: string;
  onAction: (action: ActionType, id: string) => void;
  canAct: boolean;
}) {
  if (!session) {
    return <EmptyState message={`Session ${requestedSessionId} was not found in the current queue.`} />;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <SessionCard session={session} onAction={onAction} canAct={canAct} />
      <Card className="rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Lifecycle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <TimelineRow label="Queued" value={formatDateTime(session.queuedAt)} />
          <TimelineRow label="Checked in" value={formatDateTime(session.checkedInAt)} />
          <TimelineRow label="Started" value={formatDateTime(session.startedAt)} />
          <TimelineRow label="Completed" value={formatDateTime(session.completedAt)} />
        </CardContent>
      </Card>
    </div>
  );
}

function SessionCard({
  session,
  onAction,
  canAct,
  compact = false,
}: {
  session: OperationsQueueSession;
  onAction?: (action: ActionType, id: string) => void;
  canAct: boolean;
  compact?: boolean;
}) {
  const action = nextAction(session.status);

  return (
    <article className={cn("rounded-lg border bg-white p-4 shadow-sm", compact ? "space-y-3" : "space-y-4")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-950">{session.vehiclePlate}</p>
          <p className="text-sm text-slate-500">{session.customerName} · {session.customerPhone}</p>
        </div>
        <StatusBadge status={session.status} />
      </div>

      <div className="grid gap-2 text-sm text-slate-700">
        <Info label="Booking" value={session.bookingId} />
        <Info label="Service" value={session.packageId ?? "Package pending"} />
        <Info label="Schedule" value={`${session.bookingDate} ${session.bookingTime}`} />
        <Info label="Duration" value={`${session.estimatedDurationMinutes ?? 0} min`} />
        <Info label="Fee" value={session.feeAmount != null ? formatMoney(session.feeAmount, session.feeCurrency) : "Shown after check-in"} />
        <Info label="Projected points" value={session.projectedLoyaltyPoints != null ? `${session.projectedLoyaltyPoints}` : "Shown after check-in"} />
        {session.awardedLoyaltyPoints != null ? <Info label="Awarded points" value={`${session.awardedLoyaltyPoints}`} /> : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/staff/sessions/${session.sessionId}`}>Open</Link>
        </Button>
        {action && onAction ? (
          <Button size="sm" disabled={!canAct} onClick={() => onAction(action.type, session.sessionId)}>
            {action.type === "start" ? <Play /> : action.type === "complete" ? <CheckCircle2 /> : <ClipboardList />}
            {action.label}
          </Button>
        ) : null}
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: WashSessionStatus }) {
  const meta = statusMeta[status] ?? statusMeta.PENDING;
  return <Badge variant="outline" className={cn("border", meta.className)}>{meta.label}</Badge>;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

function TimelineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b pb-2 last:border-b-0 last:pb-0">
      <span>{label}</span>
      <span className="font-medium text-slate-950">{value}</span>
    </div>
  );
}

function StateMessage({ tone, message }: { tone: "success" | "error"; message: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border p-3 text-sm",
        tone === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800",
      )}
    >
      {tone === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <AlertCircle className="mt-0.5 h-4 w-4" />}
      {message}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-white p-4 text-sm text-slate-600">
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading operations queue...
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return <StateMessage tone="error" message={message} />;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed bg-white p-8 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

function flattenSessions(queue?: OperationsQueue) {
  return queue?.columns.flatMap((column) => column.sessions) ?? [];
}

function nextAction(status: WashSessionStatus): { type: ActionType; label: string } | null {
  if (status === "PENDING") return { type: "queue", label: "Queue" };
  if (status === "QUEUED") return { type: "check-in", label: "Check in" };
  if (status === "CHECKED_IN") return { type: "start", label: "Start" };
  if (status === "IN_PROGRESS") return { type: "complete", label: "Complete" };
  return null;
}

function runAction(action: ActionType, sessionId: string): Promise<LifecycleActionResponse> {
  if (action === "queue") return queueWashSession(sessionId);
  if (action === "check-in") return checkInWashSession(sessionId);
  if (action === "start") return startWashSession(sessionId);
  return completeWashSession(sessionId);
}

function readError(error: unknown) {
  const apiError = error as Partial<ApiErrorResponse>;
  return apiError.message || apiError.error?.message || "Unable to load operations queue.";
}

function formatMoney(amount: number, currency?: string | null) {
  return currency === "VND" || !currency
    ? `${new Intl.NumberFormat("vi-VN").format(amount)} đ`
    : `${amount.toLocaleString()} ${currency}`;
}

function formatDateTime(value?: string | null) {
  if (!value) return "Not yet";
  return new Date(value).toLocaleString();
}

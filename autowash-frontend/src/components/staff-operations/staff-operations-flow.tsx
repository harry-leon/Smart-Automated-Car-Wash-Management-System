"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Filter,
  Loader2,
  Play,
  RotateCw,
  Search,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  checkInWashSession,
  completeWashSession,
  createWashSession,
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
type BoardStatus = "PENDING" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED";
type TimeBucket = "ALL" | "morning" | "afternoon" | "evening";
type LifecycleActionResponse = {
  sessionId: string;
  status: WashSessionStatus;
};

type Filters = {
  statuses: BoardStatus[];
  timeBucket: TimeBucket;
  startHour: string;
  endHour: string;
  staff: string;
  search: string;
};

const QUEUE_QUERY_KEY = ["staff-operations", "queue"] as const;
const STAFF_ALL_VALUE = "__all_staff__";
const UNASSIGNED_STAFF_VALUE = "__unassigned__";
// TODO: WebSocket not implemented — polling only. Ticket: https://github.com/harry-leon/Smart-Automated-Car-Wash-Management-System/issues/new

const BOARD_COLUMNS: Array<{ status: BoardStatus; label: string }> = [
  { status: "PENDING", label: "Pending" },
  { status: "CHECKED_IN", label: "Checked-In" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "COMPLETED", label: "Completed" },
];

const DEFAULT_FILTERS: Filters = {
  statuses: BOARD_COLUMNS.map((column) => column.status),
  timeBucket: "ALL",
  startHour: "",
  endHour: "",
  staff: STAFF_ALL_VALUE,
  search: "",
};

const statusMeta: Record<WashSessionStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "border-yellow-200 bg-yellow-50 text-yellow-800" },
  QUEUED: { label: "Queued", className: "border-blue-200 bg-blue-50 text-blue-800" },
  CHECKED_IN: { label: "Checked-In", className: "border-purple-200 bg-purple-50 text-purple-800" },
  IN_PROGRESS: { label: "In Progress", className: "border-orange-200 bg-orange-50 text-orange-800" },
  COMPLETED: { label: "Completed", className: "border-green-200 bg-green-50 text-green-800" },
  CANCELLED: { label: "Cancelled", className: "border-slate-200 bg-slate-50 text-slate-700" },
};

export function StaffOperationsFlow({ mode, sessionId }: StaffOperationsFlowProps) {
  const queryClient = useQueryClient();
  const [selectedSessionId, setSelectedSessionId] = useState(sessionId ?? "");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [blockedActionMessage, setBlockedActionMessage] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newBookingId, setNewBookingId] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const queueQuery = useQuery({
    queryKey: QUEUE_QUERY_KEY,
    queryFn: getOperationsQueue,
    refetchInterval: 30_000,
  });

  const sessions = useMemo(() => flattenSessions(queueQuery.data), [queueQuery.data]);
  const filteredSessions = useMemo(() => applyFilters(sessions, filters), [sessions, filters]);
  const columns = useMemo(() => buildColumns(filteredSessions), [filteredSessions]);
  const staffOptions = useMemo(() => buildStaffOptions(sessions), [sessions]);
  const activeSessionId = mode === "session" ? sessionId : selectedSessionId;
  const activeSession = sessions.find((session) => session.sessionId === activeSessionId);

  const createSessionMutation = useMutation({
    mutationFn: ({ bookingId, notes }: { bookingId: string; notes?: string }) =>
      createWashSession(bookingId, notes),
    onMutate: () => {
      setNotice(null);
      setActionError(null);
      setBlockedActionMessage(null);
    },
    onSuccess: (response) => {
      setNotice(`Wash session created for booking ${response.bookingId}.`);
      setCreateDialogOpen(false);
      setNewBookingId("");
      setNewNotes("");
      void queryClient.invalidateQueries({ queryKey: QUEUE_QUERY_KEY });
    },
    onError: (error: ApiErrorResponse) => {
      setActionError(error.message || error.error?.message || "Unable to create wash session.");
    },
  });

  const actionMutation = useMutation({
    mutationFn: ({ action, session }: { action: ActionType; session: OperationsQueueSession }) => runAction(action, session),
    onMutate: () => {
      setNotice(null);
      setActionError(null);
      setBlockedActionMessage(null);
    },
    onSuccess: (response) => {
      setNotice(`Session ${response.sessionId} moved to ${statusMeta[response.status]?.label ?? response.status}.`);
      void queryClient.invalidateQueries({ queryKey: QUEUE_QUERY_KEY });
    },
    onError: (error: ApiErrorResponse) => {
      setActionError(error.message || error.error?.message || "Unable to update wash session.");
    },
  });

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookingId.trim()) return;
    createSessionMutation.mutate({ bookingId: newBookingId.trim(), notes: newNotes.trim() });
  };

  const canAct = !actionMutation.isPending && !createSessionMutation.isPending;
  const handleAction = (action: ActionType, session: OperationsQueueSession) => {
    const blockedReason = getBlockedReason(action, session.status);
    if (blockedReason) {
      setBlockedActionMessage(blockedReason);
      return;
    }
    actionMutation.mutate({ action, session });
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Staff Operations</p>
          <h1 className="text-2xl font-semibold text-slate-950">
            {mode === "board" ? "Operations queue" : mode === "check-in" ? "Check-in" : "Wash session"}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setCreateDialogOpen(true)}>
            Create Session
          </Button>
          <Button variant="outline" onClick={() => queueQuery.refetch()} disabled={queueQuery.isFetching}>
            {queueQuery.isFetching ? <Loader2 className="animate-spin" /> : <RotateCw />}
            Refresh
          </Button>
        </div>
      </header>

      {queueQuery.isLoading ? <LoadingState /> : null}
      {queueQuery.isError ? <ErrorState message={readError(queueQuery.error)} /> : null}
      {notice ? <StateMessage tone="success" message={notice} /> : null}
      {actionError ? <StateMessage tone="error" message={actionError} /> : null}
      {blockedActionMessage ? <StateMessage tone="error" message={blockedActionMessage} /> : null}

      {queueQuery.data && mode !== "session" ? (
        <>
          <QueueSummary queue={queueQuery.data} />
          <QueueFilters filters={filters} setFilters={setFilters} staffOptions={staffOptions} />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
              {BOARD_COLUMNS.map((column) => (
                <QueueColumn
                  key={column.status}
                  label={column.label}
                  sessions={columns[column.status]}
                  selectedSessionId={selectedSessionId}
                  onSelect={setSelectedSessionId}
                  onAction={handleAction}
                  canAct={canAct}
                />
              ))}
            </div>
            <DetailPanel
              session={activeSession}
              onAction={handleAction}
              canAct={canAct}
              emptyMessage="Select a board card to view details and run lifecycle actions."
            />
          </div>
        </>
      ) : null}

      {queueQuery.data && mode === "session" ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <SessionLifecyclePanel
            session={activeSession}
            requestedSessionId={sessionId ?? ""}
            onAction={handleAction}
            canAct={canAct}
          />
          <DetailPanel
            session={activeSession}
            onAction={handleAction}
            canAct={canAct}
            emptyMessage={`Session ${sessionId ?? ""} was not found in the current queue.`}
          />
        </div>
      ) : null}

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Wash Session</DialogTitle>
            <DialogDescription>
              Enter a confirmed booking ID to initialize a new wash session.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSession} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bookingId">Booking ID</Label>
              <Input
                id="bookingId"
                placeholder="BK_..."
                value={newBookingId}
                onChange={(e) => setNewBookingId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Optional notes for staff..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createSessionMutation.isPending}>
                {createSessionMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function QueueSummary({ queue }: { queue: OperationsQueue }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Metric label="Total" value={queue.summary.total} />
      <Metric label="Pending" value={queue.summary.pending} />
      <Metric label="Checked-In" value={queue.summary.checkedIn} />
      <Metric label="In Progress" value={queue.summary.inProgress} />
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

function QueueFilters({
  filters,
  setFilters,
  staffOptions,
}: {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  staffOptions: Array<{ value: string; label: string }>;
}) {
  const toggleStatus = (status: BoardStatus, checked: boolean) => {
    const nextStatuses = checked
      ? Array.from(new Set([...filters.statuses, status]))
      : filters.statuses.filter((item) => item !== status);
    setFilters({ ...filters, statuses: nextStatuses });
  };

  return (
    <Card className="rounded-lg shadow-sm">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="h-4 w-4" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-4 pt-0 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
        <div className="space-y-2">
          <Label>Status</Label>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {BOARD_COLUMNS.map((column) => (
              <label key={column.status} className="flex items-center gap-2 rounded-md border px-3 py-2">
                <Checkbox
                  checked={filters.statuses.includes(column.status)}
                  onCheckedChange={(checked) => toggleStatus(column.status, checked === true)}
                />
                {column.label}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Time bucket</Label>
          <select
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
            value={filters.timeBucket}
            onChange={(event) => setFilters({ ...filters, timeBucket: event.target.value as TimeBucket })}
          >
            <option value="ALL">All day</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Hour range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="time"
              value={filters.startHour}
              onChange={(event) => setFilters({ ...filters, startHour: event.target.value })}
              aria-label="Start hour"
            />
            <Input
              type="time"
              value={filters.endHour}
              onChange={(event) => setFilters({ ...filters, endHour: event.target.value })}
              aria-label="End hour"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Assigned staff</Label>
          <select
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
            value={filters.staff}
            onChange={(event) => setFilters({ ...filters, staff: event.target.value })}
          >
            <option value={STAFF_ALL_VALUE}>All staff</option>
            {staffOptions.map((staff) => (
              <option key={staff.value} value={staff.value}>
                {staff.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Search</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9"
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value })}
              placeholder="Booking, customer, plate"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QueueColumn({
  label,
  sessions,
  selectedSessionId,
  onSelect,
  onAction,
  canAct,
}: {
  label: string;
  sessions: OperationsQueueSession[];
  selectedSessionId: string;
  onSelect: (sessionId: string) => void;
  onAction: (action: ActionType, session: OperationsQueueSession) => void;
  canAct: boolean;
}) {
  return (
    <Card className="min-h-[420px] rounded-lg shadow-sm">
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
            <SessionCard
              key={session.sessionId}
              session={session}
              selected={selectedSessionId === session.sessionId}
              onSelect={onSelect}
              onAction={onAction}
              canAct={canAct}
              compact
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function DetailPanel({
  session,
  onAction,
  canAct,
  emptyMessage,
}: {
  session?: OperationsQueueSession;
  onAction: (action: ActionType, session: OperationsQueueSession) => void;
  canAct: boolean;
  emptyMessage: string;
}) {
  if (!session) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <Card className="rounded-lg shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Session detail</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SessionCard session={session} onAction={onAction} canAct={canAct} />
        <div className="space-y-3 text-sm text-slate-700">
          <TimelineRow label="Queued" value={formatDateTime(session.queuedAt)} />
          <TimelineRow label="Checked in" value={formatDateTime(session.checkedInAt)} />
          <TimelineRow label="Started" value={formatDateTime(session.startedAt)} />
          <TimelineRow label="Completed" value={formatDateTime(session.completedAt)} />
        </div>
      </CardContent>
    </Card>
  );
}

function SessionLifecyclePanel({
  session,
  requestedSessionId,
  onAction,
  canAct,
}: {
  session?: OperationsQueueSession;
  requestedSessionId: string;
  onAction: (action: ActionType, session: OperationsQueueSession) => void;
  canAct: boolean;
}) {
  if (!session) {
    return <EmptyState message={`Session ${requestedSessionId} was not found in the current queue.`} />;
  }

  return <SessionCard session={session} onAction={onAction} canAct={canAct} />;
}

function SessionCard({
  session,
  onSelect,
  onAction,
  canAct,
  compact = false,
  selected = false,
}: {
  session: OperationsQueueSession;
  onSelect?: (sessionId: string) => void;
  onAction?: (action: ActionType, session: OperationsQueueSession) => void;
  canAct: boolean;
  compact?: boolean;
  selected?: boolean;
}) {
  const primaryAction = nextAction(session.status);
  const queueReason = getBlockedReason("queue", session.status);
  const checkInReason = getBlockedReason("check-in", session.status);
  const startReason = getBlockedReason("start", session.status);
  const completeReason = getBlockedReason("complete", session.status);

  return (
    <article
      className={cn(
        "rounded-lg border bg-white p-4 shadow-sm",
        compact ? "space-y-3" : "space-y-4",
        selected ? "border-slate-950 ring-2 ring-slate-200" : "border-slate-200",
      )}
    >
      <button type="button" className="block w-full text-left" onClick={() => onSelect?.(session.sessionId)}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-950">{session.bookingId}</p>
            <p className="text-sm text-slate-500">
              {session.customerName} · {session.vehiclePlate}
            </p>
          </div>
          <StatusBadge status={session.status} />
        </div>
      </button>

      <div className="grid gap-2 text-sm text-slate-700">
        <Info label="Booking code" value={session.bookingId} />
        <Info label="Customer" value={session.customerName} />
        <Info label="Plate" value={session.vehiclePlate} />
        <Info label="Service package" value={getServicePackage(session)} />
        <Info label="Assigned staff" value={getAssignedStaff(session)} />
        <Info label="Scheduled time" value={formatSchedule(session)} />
        <Info label="Check-in time" value={formatDateTime(session.checkedInAt)} />
        <Info label="Estimated finish" value={formatEstimatedFinish(session)} />
        {!compact ? (
          <>
            <Info label="Fee" value={session.feeAmount != null ? formatMoney(session.feeAmount, session.feeCurrency) : "Shown after check-in"} />
            <Info label="Projected points" value={session.projectedLoyaltyPoints != null ? `${session.projectedLoyaltyPoints}` : "Shown after check-in"} />
            {session.awardedLoyaltyPoints != null ? <Info label="Awarded points" value={`${session.awardedLoyaltyPoints}`} /> : null}
          </>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/staff/sessions/${session.sessionId}`}>Open</Link>
        </Button>
        {primaryAction && onAction ? (
          <Button
            size="sm"
            disabled={!canAct || Boolean(getBlockedReason(primaryAction.type, session.status))}
            title={getBlockedReason(primaryAction.type, session.status) ?? primaryAction.label}
            onClick={() => onAction(primaryAction.type, session)}
          >
            {primaryAction.type === "start" ? <Play /> : primaryAction.type === "complete" ? <CheckCircle2 /> : primaryAction.type === "check-in" ? <Wrench /> : <ClipboardList />}
            {primaryAction.label}
          </Button>
        ) : null}
        {!primaryAction ? (
          <Button size="sm" disabled title="No next action available">
            No action
          </Button>
        ) : null}
        {onAction ? (
          <>
            {primaryAction?.type !== "queue" ? (
              <Button
                size="sm"
                variant="outline"
                disabled={!canAct || Boolean(queueReason)}
                title={queueReason ?? "Queue"}
                onClick={() => onAction("queue", session)}
              >
                <ClipboardList />
                Queue
              </Button>
            ) : null}
            {primaryAction?.type !== "check-in" ? (
              <Button
                size="sm"
                variant="outline"
                disabled={!canAct || Boolean(checkInReason)}
                title={checkInReason ?? "Check In"}
                onClick={() => onAction("check-in", session)}
              >
                <Wrench />
                Check In
              </Button>
            ) : null}
            {primaryAction?.type !== "start" ? (
              <Button
                size="sm"
                variant="outline"
                disabled={!canAct || Boolean(startReason)}
                title={startReason ?? "Start service"}
                onClick={() => onAction("start", session)}
              >
                <Play />
                Start
              </Button>
            ) : null}
            {primaryAction?.type !== "complete" ? (
              <Button
                size="sm"
                variant="outline"
                disabled={!canAct || Boolean(completeReason)}
                title={completeReason ?? "Complete service"}
                onClick={() => onAction("complete", session)}
              >
                <CheckCircle2 />
                Complete
              </Button>
            ) : null}
          </>
        ) : null}
      </div>
      {queueReason ? <p className="text-xs text-amber-700">Queue disabled: {queueReason}</p> : null}
      {checkInReason ? <p className="text-xs text-amber-700">Check In disabled: {checkInReason}</p> : null}
      {startReason ? <p className="text-xs text-amber-700">Start disabled: {startReason}</p> : null}
      {completeReason ? <p className="text-xs text-amber-700">Complete disabled: {completeReason}</p> : null}
    </article>
  );
}

function StatusBadge({ status }: { status: WashSessionStatus }) {
  const meta = statusMeta[status] ?? statusMeta.PENDING;
  return (
    <Badge variant="outline" className={cn("border", meta.className)}>
      {meta.label}
    </Badge>
  );
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

function buildColumns(sessions: OperationsQueueSession[]) {
  return BOARD_COLUMNS.reduce<Record<BoardStatus, OperationsQueueSession[]>>(
    (columns, column) => {
      columns[column.status] = sessions.filter((session) => toBoardStatus(session.status) === column.status);
      return columns;
    },
    { PENDING: [], CHECKED_IN: [], IN_PROGRESS: [], COMPLETED: [] },
  );
}

function applyFilters(sessions: OperationsQueueSession[], filters: Filters) {
  const search = filters.search.trim().toLowerCase();
  return sessions.filter((session) => {
    const boardStatus = toBoardStatus(session.status);
    if (!boardStatus || !filters.statuses.includes(boardStatus)) return false;
    if (!matchesTimeBucket(session.bookingTime, filters.timeBucket)) return false;
    if (!matchesHourRange(session.bookingTime, filters.startHour, filters.endHour)) return false;
    if (!matchesStaff(session, filters.staff)) return false;
    if (!matchesSearch(session, search)) return false;
    return true;
  });
}

function toBoardStatus(status: WashSessionStatus): BoardStatus | null {
  if (status === "PENDING") return "PENDING";
  // QUEUED → Pending (pre-assignment state, treated as not yet actionable)
  if (status === "QUEUED") return "PENDING";
  if (status === "CHECKED_IN") return "CHECKED_IN";
  if (status === "IN_PROGRESS") return "IN_PROGRESS";
  if (status === "COMPLETED") return "COMPLETED";
  return null;
}

function matchesTimeBucket(time: string, bucket: TimeBucket) {
  if (bucket === "ALL") return true;
  const hour = readHour(time);
  if (bucket === "morning") return hour >= 6 && hour < 12;
  if (bucket === "afternoon") return hour >= 12 && hour < 18;
  return hour >= 18 || hour < 6;
}

function matchesHourRange(time: string, startHour: string, endHour: string) {
  if (!startHour && !endHour) return true;
  const minutes = readMinutes(time);
  const start = startHour ? readMinutes(startHour) : 0;
  const end = endHour ? readMinutes(endHour) : 24 * 60 - 1;
  return minutes >= start && minutes <= end;
}

function matchesStaff(session: OperationsQueueSession, staff: string) {
  if (staff === STAFF_ALL_VALUE) return true;
  const staffValue = session.assignedStaffId ?? session.assignedStaffName ?? UNASSIGNED_STAFF_VALUE;
  return staffValue === staff;
}

function matchesSearch(session: OperationsQueueSession, search: string) {
  if (!search) return true;
  return [session.bookingId, session.customerName, session.vehiclePlate]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(search));
}

function buildStaffOptions(sessions: OperationsQueueSession[]) {
  const values = new Map<string, string>();
  for (const session of sessions) {
    const value = session.assignedStaffId ?? session.assignedStaffName;
    if (value) {
      values.set(value, session.assignedStaffName ?? value);
    }
  }
  // TODO: assignedStaff — no backend contract yet, ticket: https://github.com/harry-leon/Smart-Automated-Car-Wash-Management-System/issues/new
  if (values.size === 0) {
    values.set(UNASSIGNED_STAFF_VALUE, "Unassigned");
  }
  return Array.from(values, ([value, label]) => ({ value, label }));
}

function nextAction(status: WashSessionStatus): { type: ActionType; label: string } | null {
  if (status === "PENDING") return { type: "queue", label: "Queue" };
  if (status === "QUEUED") return { type: "check-in", label: "Check In" };
  if (status === "CHECKED_IN") return { type: "start", label: "Start" };
  if (status === "IN_PROGRESS") return { type: "complete", label: "Complete" };
  return null;
}

function getBlockedReason(action: ActionType, status: WashSessionStatus) {
  if (action === "queue" && status !== "PENDING") return "Must be pending";
  if (action === "check-in" && status !== "QUEUED") return "Must be queued first";
  if (action === "start" && status !== "CHECKED_IN") return "Must check in first";
  if (action === "complete" && status !== "IN_PROGRESS") return "Must start service first";
  return null;
}

async function runAction(action: ActionType, session: OperationsQueueSession): Promise<LifecycleActionResponse> {
  if (action === "queue") return queueWashSession(session.sessionId);
  if (action === "check-in") return checkInWashSession(session.sessionId);
  if (action === "start") return startWashSession(session.sessionId);
  return completeWashSession(session.sessionId);
}

function readError(error: unknown) {
  const apiError = error as Partial<ApiErrorResponse>;
  return apiError.message || apiError.error?.message || "Unable to load operations queue.";
}

function getServicePackage(session: OperationsQueueSession) {
  // TODO: servicePackage — no backend contract yet, ticket: https://github.com/harry-leon/Smart-Automated-Car-Wash-Management-System/issues/new
  return session.servicePackage ?? session.packageId ?? "Package pending";
}

function getAssignedStaff(session: OperationsQueueSession) {
  // TODO: assignedStaff — no backend contract yet, ticket: https://github.com/harry-leon/Smart-Automated-Car-Wash-Management-System/issues/new
  return session.assignedStaffName ?? "Unassigned";
}

function formatSchedule(session: OperationsQueueSession) {
  return `${session.bookingDate} ${session.bookingTime}`;
}

function formatEstimatedFinish(session: OperationsQueueSession) {
  const duration = session.estimatedDurationMinutes ?? 0;
  const base = session.startedAt ? new Date(session.startedAt) : new Date(`${session.bookingDate}T${session.bookingTime}`);
  if (Number.isNaN(base.getTime()) || duration <= 0) return "Not available";
  base.setMinutes(base.getMinutes() + duration);
  return base.toLocaleString();
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

function readHour(time: string) {
  return Number.parseInt(time.split(":")[0] ?? "0", 10);
}

function readMinutes(time: string) {
  const [hour = "0", minute = "0"] = time.split(":");
  return Number.parseInt(hour, 10) * 60 + Number.parseInt(minute, 10);
}

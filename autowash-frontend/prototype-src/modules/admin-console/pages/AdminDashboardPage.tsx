import * as React from "react";
import { CalendarDays, ChevronLeft, ChevronRight, LayoutDashboard, X } from "lucide-react";
import { toast } from "sonner";
import { getStaffAvailability } from "@/lib/staff-availability";
import { useCarwashStore, type Booking, type StaffRecord } from "@/lib/carwash-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookingDetailDrawer } from "../components/BookingDetailDrawer";
import { KpiCard } from "../components/KpiCard";
import type { BookingStatus as DashboardStatus, KpiMetric } from "../types/dashboard.types";
import styles from "../styles/admin-dashboard.module.css";

const STATUS_TONE: Record<DashboardStatus, string> = {
  CONFIRMED: "bg-sky-500/10 text-sky-600 border-sky-500/30",
  CHECKED_IN: "bg-violet-500/10 text-violet-600 border-violet-500/30",
  IN_PROGRESS: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  COMPLETED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  CANCELLED: "bg-zinc-500/10 text-zinc-600 border-zinc-500/30",
  NO_SHOW: "bg-rose-500/10 text-rose-600 border-rose-500/30",
};

const PAGE_SIZE = 8;

type DashboardRow = Booking & {
  staffName: string;
  checkInTime: string;
  dashboardStatus: DashboardStatus;
  assignedStaffId?: string;
  sessionId?: string;
  sessionStatus?: string;
};

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function offsetISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function pctDelta(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}

function toDashboardStatus(booking: Booking, sessionStatus?: string): DashboardStatus {
  if (sessionStatus === "In Progress") {
    return "IN_PROGRESS";
  }
  if (booking.status === "Checked-in" || sessionStatus === "Queued") {
    return "CHECKED_IN";
  }
  if (booking.status === "Completed") {
    return "COMPLETED";
  }
  if (booking.status === "Cancelled") {
    return "CANCELLED";
  }
  if (booking.status === "No-show") {
    return "NO_SHOW";
  }
  return "CONFIRMED";
}

export function AdminDashboardPage() {
  const {
    bookings,
    transactions,
    promotions,
    washSessions,
    staffMembers,
    assignStaffToSession,
    hydrated,
  } = useCarwashStore();
  const [dateFilter, setDateFilter] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selectedBookingId, setSelectedBookingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPage(1);
  }, [dateFilter]);

  const today = todayISO();
  const yesterday = offsetISO(-1);

  const kpis = React.useMemo<KpiMetric[]>(() => {
    const todays = bookings.filter((b) => b.dateISO === today);
    const yesterdays = bookings.filter((b) => b.dateISO === yesterday);
    const completedToday = todays.filter((b) => b.status === "Completed").length;
    const completedYesterday = yesterdays.filter((b) => b.status === "Completed").length;
    const noShowToday = todays.filter((b) => b.status === "No-show").length;
    const noShowYesterday = yesterdays.filter((b) => b.status === "No-show").length;

    const pointsToday = transactions
      .filter((tx) => tx.date.slice(0, 10) === today)
      .reduce((sum, tx) => sum + tx.pointsEarned, 0);
    const pointsYesterday = transactions
      .filter((tx) => tx.date.slice(0, 10) === yesterday)
      .reduce((sum, tx) => sum + tx.pointsEarned, 0);

    const nowISO = new Date().toISOString().slice(0, 10);
    const activePromos = promotions.filter(
      (p) => p.active && p.startDate <= nowISO && p.endDate >= nowISO,
    ).length;

    return [
      {
        id: "today-bookings",
        label: "Today bookings",
        value: todays.length,
        delta: pctDelta(todays.length, yesterdays.length),
        icon: "Calendar",
        tone: "primary",
      },
      {
        id: "completed-washes",
        label: "Completed washes",
        value: completedToday,
        delta: pctDelta(completedToday, completedYesterday),
        icon: "CheckCircle2",
        tone: "success",
      },
      {
        id: "no-show",
        label: "No-show count",
        value: noShowToday,
        delta: pctDelta(noShowToday, noShowYesterday),
        icon: "AlertTriangle",
        tone: "warning",
      },
      {
        id: "points-issued",
        label: "Points issued",
        value: pointsToday,
        delta: pctDelta(pointsToday, pointsYesterday),
        unit: "pts",
        icon: "Coins",
        tone: "info",
      },
      {
        id: "active-promotions",
        label: "Active promotions",
        value: activePromos,
        delta: 0,
        icon: "Sparkles",
        tone: "purple",
      },
    ];
  }, [bookings, transactions, promotions, today, yesterday]);

  const sortedBookings = React.useMemo(() => {
    return [...bookings].sort((a, b) => {
      const da = new Date(`${a.dateISO} ${a.timeSlot}`).getTime();
      const db = new Date(`${b.dateISO} ${b.timeSlot}`).getTime();
      return db - da;
    });
  }, [bookings]);

  const filtered = React.useMemo(() => {
    if (!dateFilter) return sortedBookings;
    return sortedBookings.filter((b) => b.dateISO === dateFilter);
  }, [sortedBookings, dateFilter]);

  const selectedBooking = React.useMemo(
    () => bookings.find((booking) => booking.id === selectedBookingId) ?? null,
    [bookings, selectedBookingId],
  );

  const selectedSession = React.useMemo(
    () => washSessions.find((session) => session.bookingId === selectedBookingId) ?? null,
    [washSessions, selectedBookingId],
  );

  const staffAvailability = React.useMemo(
    () => getStaffAvailability(staffMembers, washSessions),
    [staffMembers, washSessions],
  );

  const dashboardRows = React.useMemo<DashboardRow[]>(
    () =>
      filtered.map((booking) => {
        const session = washSessions.find((item) => item.bookingId === booking.id);
        return {
          ...booking,
          dashboardStatus: toDashboardStatus(booking, session?.status),
          staffName: session?.staffName ?? "Not assigned",
          assignedStaffId: session?.staffId || undefined,
          sessionId: session?.id,
          sessionStatus: session?.status,
          checkInTime: booking.checkInAt
            ? new Date(booking.checkInAt).toLocaleString()
            : "Not checked in",
        };
      }),
    [filtered, washSessions],
  );

  const selectedRow = React.useMemo(
    () => dashboardRows.find((row) => row.id === selectedBookingId) ?? null,
    [dashboardRows, selectedBookingId],
  );

  const getAssignableStaffOptions = React.useCallback(
    (assignedStaffId?: string) =>
      staffAvailability.filter(
        (staff) => staff.availability === "Available" || staff.id === assignedStaffId,
      ),
    [staffAvailability],
  );

  const handleAssignStaff = React.useCallback(
    (sessionId: string, staffId: string) => {
      try {
        assignStaffToSession(sessionId, staffId);
        toast.success("Staff assignment updated.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to reassign staff.");
      }
    },
    [assignStaffToSession],
  );

  const totalPages = Math.max(1, Math.ceil(dashboardRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = dashboardRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className={`p-4 md:p-8 lg:p-10 ${styles.page}`}>
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-md">
            <LayoutDashboard className="h-3.5 w-3.5" /> Admin Workspace
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Check-in Center
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
            Snapshot of today&apos;s bookings, staff assignments, and check-in flow. Numbers update
            in real time as bookings, transactions, and promotions change across the app.
          </p>
        </div>

        <div className={styles.kpiGrid}>
          {kpis.map((metric) => (
            <KpiCard key={metric.id} metric={metric} />
          ))}
        </div>

        <Card className="overflow-hidden border-border/50 bg-card/60 shadow-xl backdrop-blur-xl">
          <CardHeader className="flex-col gap-3 border-b border-border/50 bg-accent/20 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Check-in Center</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Track checked-in flow, assigned staff, and active wash sessions. Click a row to open
                the detail drawer.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <CalendarDays className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-[170px] pl-8"
                  aria-label="Filter bookings by date"
                />
              </div>
              {dateFilter ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDateFilter("")}
                  className="h-9 px-2"
                  aria-label="Clear date filter"
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!hydrated ? (
              <EmptyState message="Loading bookings..." />
            ) : filtered.length === 0 ? (
              <EmptyState
                message={
                  dateFilter
                    ? `No bookings on ${dateFilter}.`
                    : "No bookings have been created yet."
                }
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Check-in Time</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.map((row) => (
                      <BookingRow
                        key={row.id}
                        row={row}
                        staffOptions={getAssignableStaffOptions(row.assignedStaffId)}
                        onAssignStaff={handleAssignStaff}
                        onSelect={() => setSelectedBookingId(row.id)}
                      />
                    ))}
                  </TableBody>
                </Table>
                <PagerBar
                  page={safePage}
                  totalPages={totalPages}
                  totalRows={dashboardRows.length}
                  pageSize={PAGE_SIZE}
                  onPrev={() => setPage((p) => Math.max(1, p - 1))}
                  onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
                />
              </>
            )}
          </CardContent>
        </Card>

        <BookingDetailDrawer
          open={Boolean(selectedBooking)}
          onOpenChange={(open) => {
            if (!open) setSelectedBookingId(null);
          }}
          booking={selectedBooking}
          session={selectedSession ?? undefined}
          currentStatus={selectedRow?.dashboardStatus}
          staffMembers={staffMembers}
          onAssignStaff={(staffId) => {
            if (selectedSession) {
              handleAssignStaff(selectedSession.id, staffId);
            }
          }}
        />
      </div>
    </div>
  );
}

function BookingRow({
  row,
  staffOptions,
  onAssignStaff,
  onSelect,
}: {
  row: DashboardRow;
  staffOptions: Array<Pick<StaffRecord, "id" | "name">>;
  onAssignStaff: (sessionId: string, staffId: string) => void;
  onSelect: () => void;
}) {
  const canReassignStaff = row.dashboardStatus === "IN_PROGRESS" && Boolean(row.sessionId);

  return (
    <TableRow className="cursor-pointer hover:bg-accent/10" onClick={onSelect}>
      <TableCell className="font-semibold">{row.id}</TableCell>
      <TableCell>{row.customerName ?? "-"}</TableCell>
      <TableCell className="font-mono text-xs">{row.vehiclePlate}</TableCell>
      <TableCell>{row.services.join(", ")}</TableCell>
      <TableCell className="text-xs text-muted-foreground">{row.checkInTime}</TableCell>
      <TableCell onClick={(event) => event.stopPropagation()}>
        {canReassignStaff && row.sessionId ? (
          <Select
            value={row.assignedStaffId ?? ""}
            onValueChange={(staffId) => onAssignStaff(row.sessionId!, staffId)}
          >
            <SelectTrigger className="h-8 w-[180px] text-xs">
              <SelectValue placeholder={row.staffName} />
            </SelectTrigger>
            <SelectContent>
              {staffOptions.map((staff) => (
                <SelectItem key={staff.id} value={staff.id} className="text-xs">
                  {staff.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-sm">{row.staffName}</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Badge
          variant="outline"
          className={`border font-semibold ${STATUS_TONE[row.dashboardStatus]}`}
        >
          {row.dashboardStatus.replaceAll("_", " ")}
        </Badge>
      </TableCell>
    </TableRow>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center px-6 py-12 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function PagerBar({
  page,
  totalPages,
  totalRows,
  pageSize,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  totalRows: number;
  pageSize: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const start = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(totalRows, page * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 px-4 py-3 text-xs text-muted-foreground">
      <span>
        Showing <strong className="text-foreground">{start}</strong>-
        <strong className="text-foreground">{end}</strong> of {totalRows}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={page <= 1}>
          <ChevronLeft className="mr-1 h-3.5 w-3.5" />
          Prev
        </Button>
        <span className="font-semibold text-foreground">
          {page} / {totalPages}
        </span>
        <Button variant="outline" size="sm" onClick={onNext} disabled={page >= totalPages}>
          Next
          <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

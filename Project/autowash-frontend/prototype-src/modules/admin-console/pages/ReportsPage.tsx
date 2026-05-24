import * as React from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MessageSquareWarning,
  Star,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCarwashStore } from "@/lib/carwash-store";

const PAGE_SIZE = 8;

type StaffDailyRow = {
  dateISO: string;
  staffId: string;
  staffName: string;
  completedWashes: number;
  activeAssignments: number;
  totalSessions: number;
};

export function ReportsPage() {
  const { staffMembers, reviews, bookings, washSessions, acknowledgeReview } = useCarwashStore();
  const [staffDateFilter, setStaffDateFilter] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [, tick] = React.useState(0);

  React.useEffect(() => {
    const timer = window.setInterval(() => tick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const staffLeaderboard = React.useMemo(() => {
    return staffMembers
      .map((staff) => {
        const staffReviews = reviews.filter((review) => review.staffId === staff.id);
        const avgRating =
          staffReviews.length === 0
            ? 0
            : staffReviews.reduce((sum, review) => sum + review.starRating, 0) /
              staffReviews.length;
        return {
          ...staff,
          avgRating,
          totalReviews: staffReviews.length,
          reviews: staffReviews,
          flaggedReviews: staffReviews.filter((review) => review.isFlagged),
        };
      })
      .sort((a, b) => a.avgRating - b.avgRating || a.name.localeCompare(b.name));
  }, [reviews, staffMembers]);

  const flaggedReviews = React.useMemo(
    () =>
      reviews
        .filter((review) => review.isFlagged)
        .sort((a, b) => (a.alertStatus > b.alertStatus ? -1 : 1)),
    [reviews],
  );

  const unacknowledgedCount = flaggedReviews.filter(
    (review) => review.alertStatus === "OPEN",
  ).length;
  const totalReviews = reviews.length;
  const overallAvgRating =
    totalReviews === 0
      ? 0
      : reviews.reduce((sum, review) => sum + review.starRating, 0) / totalReviews;

  const waitingRows = React.useMemo(
    () =>
      bookings
        .filter(
          (booking) => booking.status === "Completed" && booking.completedAt && !booking.pickedUpAt,
        )
        .map((booking) => {
          const waitMinutes = Math.max(
            0,
            Math.round((Date.now() - new Date(booking.completedAt!).getTime()) / 60000),
          );
          return {
            id: booking.id,
            customerName: booking.customerName ?? "—",
            service: booking.services.join(", "),
            washDoneAt: booking.completedAt!,
            waitMinutes,
            reminderSent: Boolean(booking.reminderSent),
          };
        })
        .sort((a, b) => b.waitMinutes - a.waitMinutes),
    [bookings],
  );

  const avgWait =
    waitingRows.length === 0
      ? 0
      : Math.round(waitingRows.reduce((sum, row) => sum + row.waitMinutes, 0) / waitingRows.length);
  const longestWait = waitingRows.length === 0 ? 0 : waitingRows[0].waitMinutes;

  const staffDailyRows = React.useMemo(() => {
    const rows = new Map<string, StaffDailyRow>();
    const sessions = washSessions.filter((session) =>
      staffDateFilter
        ? localDateISO(new Date(session.startedAt)) === staffDateFilter ||
          (session.completedAt
            ? localDateISO(new Date(session.completedAt)) === staffDateFilter
            : false)
        : true,
    );

    sessions.forEach((session) => {
      const dateISO = session.completedAt
        ? localDateISO(new Date(session.completedAt))
        : localDateISO(new Date(session.startedAt));
      const key = `${dateISO}:${session.staffId}`;
      const current = rows.get(key);
      rows.set(key, {
        dateISO,
        staffId: session.staffId,
        staffName: session.staffName,
        completedWashes: (current?.completedWashes ?? 0) + (session.completedAt ? 1 : 0),
        activeAssignments: (current?.activeAssignments ?? 0) + (session.completedAt ? 0 : 1),
        totalSessions: (current?.totalSessions ?? 0) + 1,
      });
    });

    const list = Array.from(rows.values()).sort((a, b) => {
      if (a.dateISO !== b.dateISO) return b.dateISO.localeCompare(a.dateISO);
      if (b.completedWashes !== a.completedWashes) return b.completedWashes - a.completedWashes;
      return a.staffName.localeCompare(b.staffName);
    });

    if (!staffDateFilter) return list;

    const existingStaff = new Set(list.map((row) => row.staffId));
    return [
      ...list,
      ...staffMembers
        .filter((staff) => !existingStaff.has(staff.id))
        .map((staff) => ({
          dateISO: staffDateFilter,
          staffId: staff.id,
          staffName: staff.name,
          completedWashes: 0,
          activeAssignments: 0,
          totalSessions: 0,
        })),
    ].sort((a, b) => a.staffName.localeCompare(b.staffName));
  }, [staffDateFilter, staffMembers, washSessions]);

  React.useEffect(() => {
    setPage(1);
  }, [staffDateFilter]);

  const totalPages = Math.max(1, Math.ceil(staffDailyRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedRows = staffDailyRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-md">
            <BarChart3 className="h-3.5 w-3.5" /> Admin reports
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Reviews, live wait tracking, and staff workload
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
            Monitor low ratings, unpicked completed vehicles, and daily wash counts in one admin
            report center.
          </p>
        </div>

        {unacknowledgedCount > 0 ? (
          <Card className="rounded-xl border border-rose-200 bg-rose-50 shadow-md">
            <CardContent className="flex items-center gap-3 p-4 text-rose-700">
              <AlertTriangle className="h-5 w-5" />
              <div className="font-medium">
                {unacknowledgedCount} flagged review{unacknowledgedCount > 1 ? "s" : ""} need
                acknowledgement.
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Total reviews" value={`${totalReviews}`} icon={Users} />
          <SummaryCard label="Average rating" value={overallAvgRating.toFixed(1)} icon={Star} />
          <SummaryCard label="Longest wait" value={`${longestWait} min`} icon={Clock3} />
        </div>

        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Staff leaderboard</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 xl:grid-cols-2">
            {staffLeaderboard.map((staff) => (
              <Card key={staff.id} className="rounded-xl border border-border/60 shadow-none">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{staff.name}</div>
                        <div className="text-sm text-muted-foreground">{staff.id}</div>
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700">
                      {staff.avgRating.toFixed(1)} / 5
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Progress value={(staff.avgRating / 5) * 100} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {staff.totalReviews} review(s)
                    </div>
                  </div>

                  <div className="space-y-3">
                    {staff.reviews.length === 0 ? (
                      <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                        No customer reviews yet.
                      </div>
                    ) : (
                      staff.reviews.map((review) => (
                        <div
                          key={review.id}
                          className={`rounded-xl border p-4 ${
                            review.isFlagged
                              ? "border-rose-200 bg-rose-50"
                              : "border-border/60 bg-background/70"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-medium text-foreground">{review.customerName}</div>
                            <div className="flex items-center gap-1 text-amber-500">
                              {Array.from({ length: review.starRating }).map((_, index) => (
                                <Star key={index} className="h-4 w-4 fill-amber-400" />
                              ))}
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            {review.comment ?? "No comment."}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="rounded-xl shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Flagged reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {flaggedReviews.length === 0 ? (
                <EmptyState message="No flagged reviews right now." />
              ) : (
                flaggedReviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-foreground">{review.bookingId}</div>
                        <div className="text-sm text-muted-foreground">
                          {review.customerName} / {review.staffName}
                        </div>
                      </div>
                      <Badge
                        className={
                          review.alertStatus === "OPEN"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-slate-100 text-slate-600"
                        }
                      >
                        {review.alertStatus}
                      </Badge>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">
                      {review.comment ?? "No comment."}
                    </div>
                    <Button
                      className="mt-4"
                      size="sm"
                      variant="outline"
                      disabled={review.alertStatus === "ACKNOWLEDGED"}
                      onClick={() => {
                        acknowledgeReview(review.id);
                        toast.success("Flagged review acknowledged.");
                      }}
                    >
                      Acknowledge
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Live pickup tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard
                  label="Total waiting"
                  value={`${waitingRows.length}`}
                  icon={Clock3}
                  compact
                />
                <SummaryCard
                  label="Avg wait today"
                  value={`${avgWait} min`}
                  icon={Clock3}
                  compact
                />
                <SummaryCard
                  label="Longest wait"
                  value={`${longestWait} min`}
                  icon={Clock3}
                  compact
                />
              </div>

              {waitingRows.length === 0 ? (
                <EmptyState message="No completed vehicles are waiting for pickup." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Wash done at</TableHead>
                      <TableHead>Waiting</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {waitingRows.map((row) => (
                      <TableRow
                        key={row.id}
                        className={
                          row.waitMinutes > 30
                            ? "bg-rose-50"
                            : row.waitMinutes >= 15
                              ? "bg-amber-50"
                              : "bg-emerald-50"
                        }
                      >
                        <TableCell>{row.customerName}</TableCell>
                        <TableCell>{row.service}</TableCell>
                        <TableCell>{new Date(row.washDoneAt).toLocaleString()}</TableCell>
                        <TableCell>{row.waitMinutes} min</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-2">
                            <WaitBadge waitMinutes={row.waitMinutes} />
                            {row.reminderSent ? (
                              <Badge className="bg-blue-100 text-blue-700">Reminder Sent</Badge>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-xl shadow-md">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Daily staff wash counts</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Completed washes and active assignments per staff by day.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <CalendarDays className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  value={staffDateFilter}
                  onChange={(event) => setStaffDateFilter(event.target.value)}
                  className="w-[170px] pl-8"
                />
              </div>
              {staffDateFilter ? (
                <Button variant="ghost" size="sm" onClick={() => setStaffDateFilter("")}>
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pagedRows.length === 0 ? (
              <EmptyState message="No staff activity found for the selected date filter." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead className="text-right">Completed washes</TableHead>
                    <TableHead className="text-right">Active assignments</TableHead>
                    <TableHead className="text-right">Total sessions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedRows.map((row) => (
                    <TableRow key={`${row.dateISO}:${row.staffId}`}>
                      <TableCell>{row.dateISO}</TableCell>
                      <TableCell>{row.staffName}</TableCell>
                      <TableCell className="font-mono text-xs">{row.staffId}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {row.completedWashes}
                      </TableCell>
                      <TableCell className="text-right">{row.activeAssignments}</TableCell>
                      <TableCell className="text-right">{row.totalSessions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>
                Showing{" "}
                <strong className="text-foreground">
                  {staffDailyRows.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}
                </strong>
                -
                <strong className="text-foreground">
                  {Math.min(staffDailyRows.length, safePage * PAGE_SIZE)}
                </strong>{" "}
                of {staffDailyRows.length}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                  Prev
                </Button>
                <span className="font-semibold text-foreground">
                  {safePage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                >
                  Next
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  compact = false,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  compact?: boolean;
}) {
  return (
    <Card className="rounded-xl shadow-md">
      <CardContent className={`${compact ? "p-4" : "p-6"} flex items-start justify-between gap-3`}>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</div>
        </div>
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}

function WaitBadge({ waitMinutes }: { waitMinutes: number }) {
  if (waitMinutes > 30) return <Badge className="bg-rose-100 text-rose-700">Over 30 min</Badge>;
  if (waitMinutes >= 15) return <Badge className="bg-amber-100 text-amber-700">15-30 min</Badge>;
  return <Badge className="bg-emerald-100 text-emerald-700">Under 15 min</Badge>;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/70 p-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function localDateISO(date: Date) {
  const tzOffsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 10);
}

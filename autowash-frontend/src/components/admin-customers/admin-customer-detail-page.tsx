"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  CalendarClock,
  CircleCheck,
  Clock3,
  Mail,
  Medal,
  Phone,
  RefreshCcw,
  TimerReset,
  UserCircle2,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDisplayErrorMessage } from "@/lib/api-errors";
import type { ApiErrorResponse } from "@/types/api.types";
import type { AdminCustomerStatus } from "@/types/admin-reporting.types";
import {
  useAdminBookings,
  useAdminCustomerDetail,
  useAdminCustomerPointTransactions,
  useAdminCustomerTierHistory,
  useAdminCustomerVehicles,
  useAdminCustomerWashHistory,
  useUpdateAdminCustomerStatus,
} from "@/hooks/use-admin-reporting";

type AdminCustomerDetailPageContentProps = {
  customerId: string;
};

type CustomerTab =
  | "overview"
  | "vehicles"
  | "bookings"
  | "wash-history"
  | "point-transactions"
  | "tier-history";

type DateRangeDraft = {
  dateFrom: string;
  dateTo: string;
};

const PAGE_LIMIT = 20;

const CUSTOMER_TABS: Array<{ id: CustomerTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "vehicles", label: "Vehicles" },
  { id: "bookings", label: "Bookings" },
  { id: "wash-history", label: "Wash history" },
  { id: "point-transactions", label: "Point transactions" },
  { id: "tier-history", label: "Tier history" },
];

export function AdminCustomerDetailPageContent({ customerId }: AdminCustomerDetailPageContentProps) {
  const [activeTab, setActiveTab] = useState<CustomerTab>("overview");
  const [vehiclesPage, setVehiclesPage] = useState(1);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [washPage, setWashPage] = useState(1);
  const [pointPage, setPointPage] = useState(1);
  const [tierPage, setTierPage] = useState(1);
  const [statusDraft, setStatusDraft] = useState<AdminCustomerStatus>("ACTIVE");
  const [statusReasonDraft, setStatusReasonDraft] = useState("");
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const [washDateDraft, setWashDateDraft] = useState<DateRangeDraft>({ dateFrom: "", dateTo: "" });
  const [washDateRange, setWashDateRange] = useState<DateRangeDraft>({ dateFrom: "", dateTo: "" });

  const [pointTypeDraft, setPointTypeDraft] = useState("");
  const [pointDateDraft, setPointDateDraft] = useState<DateRangeDraft>({ dateFrom: "", dateTo: "" });
  const [pointFilters, setPointFilters] = useState({
    type: "",
    dateFrom: "",
    dateTo: "",
  });

  const detailQuery = useAdminCustomerDetail(customerId);
  const vehiclesQuery = useAdminCustomerVehicles(
    customerId,
    { page: vehiclesPage, limit: PAGE_LIMIT },
    { enabled: activeTab === "vehicles" },
  );
  const bookingsQuery = useAdminBookings(
    { customerId },
    bookingsPage,
    PAGE_LIMIT,
    { enabled: activeTab === "bookings" },
  );
  const washHistoryQuery = useAdminCustomerWashHistory(
    customerId,
    {
      page: washPage,
      limit: PAGE_LIMIT,
      dateFrom: washDateRange.dateFrom || undefined,
      dateTo: washDateRange.dateTo || undefined,
    },
    { enabled: activeTab === "wash-history" },
  );
  const pointTransactionsQuery = useAdminCustomerPointTransactions(
    customerId,
    {
      page: pointPage,
      limit: PAGE_LIMIT,
      type: pointFilters.type || undefined,
      dateFrom: pointFilters.dateFrom || undefined,
      dateTo: pointFilters.dateTo || undefined,
    },
    { enabled: activeTab === "point-transactions" },
  );
  const tierHistoryQuery = useAdminCustomerTierHistory(
    customerId,
    { page: tierPage, limit: PAGE_LIMIT },
    { enabled: activeTab === "tier-history" },
  );
  const updateStatusMutation = useUpdateAdminCustomerStatus(customerId);
  const profile = detailQuery.data?.profile;

  useEffect(() => {
    if (!detailQuery.data?.profile.status) {
      return;
    }

    if (detailQuery.data.profile.status === "BLOCKED" || detailQuery.data.profile.status === "SUSPENDED") {
      setStatusDraft(detailQuery.data.profile.status);
      return;
    }

    setStatusDraft("ACTIVE");
  }, [detailQuery.data?.profile.status]);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Admin / Accounts / Customer
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              {profile?.fullName ?? "Customer detail"}
            </h1>
            <p className="text-sm text-slate-500">Track profile, bookings, wash sessions, and loyalty activity.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="h-9 gap-2">
              <Link href="/admin/accounts">
                <ArrowLeft className="h-4 w-4" />
                Back to list
              </Link>
            </Button>
            <Button type="button" variant="outline" className="h-9 gap-2" onClick={() => void refreshActiveTab(activeTab)}>
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <CustomerProfilePanel
            query={detailQuery}
            statusDraft={statusDraft}
            statusReasonDraft={statusReasonDraft}
            onStatusDraftChange={setStatusDraft}
            onStatusReasonDraftChange={setStatusReasonDraft}
            onSubmitStatus={async () => {
              setStatusFeedback(null);
              try {
                await updateStatusMutation.mutateAsync({
                  status: statusDraft,
                  reason: statusReasonDraft.trim() || undefined,
                });
                await detailQuery.refetch();
                setStatusFeedback("Customer status updated.");
              } catch (error) {
                setStatusFeedback(getDisplayErrorMessage(error));
              }
            }}
            isUpdatingStatus={updateStatusMutation.isPending}
            statusFeedback={statusFeedback}
          />

          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="border-b border-slate-200 px-5 pt-4">
                <div className="flex flex-wrap gap-1">
                  {CUSTOMER_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`border-b-2 px-3 py-2 text-sm font-medium transition ${
                        activeTab === tab.id
                          ? "border-sky-600 text-sky-700"
                          : "border-transparent text-slate-500 hover:text-slate-900"
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5">
                {activeTab === "overview" ? <OverviewTab query={detailQuery} /> : null}

                {activeTab === "vehicles" ? (
                  <VehiclesTab query={vehiclesQuery} page={vehiclesPage} onPageChange={setVehiclesPage} />
                ) : null}

                {activeTab === "bookings" ? (
                  <BookingsTab query={bookingsQuery} page={bookingsPage} onPageChange={setBookingsPage} />
                ) : null}

                {activeTab === "wash-history" ? (
                  <WashHistoryTab
                    query={washHistoryQuery}
                    page={washPage}
                    onPageChange={setWashPage}
                    draft={washDateDraft}
                    onDraftChange={setWashDateDraft}
                    onApply={() => {
                      setWashDateRange(washDateDraft);
                      setWashPage(1);
                    }}
                    onClear={() => {
                      const emptyRange = { dateFrom: "", dateTo: "" };
                      setWashDateDraft(emptyRange);
                      setWashDateRange(emptyRange);
                      setWashPage(1);
                    }}
                  />
                ) : null}

                {activeTab === "point-transactions" ? (
                  <PointTransactionsTab
                    query={pointTransactionsQuery}
                    page={pointPage}
                    onPageChange={setPointPage}
                    typeDraft={pointTypeDraft}
                    dateDraft={pointDateDraft}
                    onTypeDraftChange={setPointTypeDraft}
                    onDateDraftChange={setPointDateDraft}
                    onApply={() => {
                      setPointFilters({
                        type: pointTypeDraft,
                        dateFrom: pointDateDraft.dateFrom,
                        dateTo: pointDateDraft.dateTo,
                      });
                      setPointPage(1);
                    }}
                  />
                ) : null}

                {activeTab === "tier-history" ? (
                  <TierHistoryTab query={tierHistoryQuery} page={tierPage} onPageChange={setTierPage} />
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  async function refreshActiveTab(tab: CustomerTab) {
    if (tab === "overview") {
      await detailQuery.refetch();
      return;
    }
    if (tab === "vehicles") {
      await vehiclesQuery.refetch();
      return;
    }
    if (tab === "bookings") {
      await bookingsQuery.refetch();
      return;
    }
    if (tab === "wash-history") {
      await washHistoryQuery.refetch();
      return;
    }
    if (tab === "point-transactions") {
      await pointTransactionsQuery.refetch();
      return;
    }
    await tierHistoryQuery.refetch();
  }
}

function CustomerProfilePanel({
  query,
  statusDraft,
  statusReasonDraft,
  onStatusDraftChange,
  onStatusReasonDraftChange,
  onSubmitStatus,
  isUpdatingStatus,
  statusFeedback,
}: {
  query: ReturnType<typeof useAdminCustomerDetail>;
  statusDraft: AdminCustomerStatus;
  statusReasonDraft: string;
  onStatusDraftChange: (value: AdminCustomerStatus) => void;
  onStatusReasonDraftChange: (value: string) => void;
  onSubmitStatus: () => Promise<void>;
  isUpdatingStatus: boolean;
  statusFeedback: string | null;
}) {
  if (query.isPending) {
    return (
      <Card className="rounded-md border-slate-200 bg-white shadow-sm">
        <CardContent className="p-5">
          <LoadingInline message="Loading customer profile..." />
        </CardContent>
      </Card>
    );
  }

  if (query.isError) {
    return (
      <Card className="rounded-md border-rose-200 bg-white shadow-sm">
        <CardContent className="p-5">
          <ErrorInline message={getDisplayErrorMessage(query.error)} />
        </CardContent>
      </Card>
    );
  }

  if (!query.data) {
    return (
      <Card className="rounded-md border-slate-200 bg-white shadow-sm">
        <CardContent className="p-5">
          <EmptyInline message="Customer not found." />
        </CardContent>
      </Card>
    );
  }

  const { profile, loyalty, summary } = query.data;

  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <UserCircle2 className="h-9 w-9" />
          </div>
          <h2 className="mt-3 text-lg font-semibold text-slate-950">{profile.fullName}</h2>
          <p className="text-sm text-slate-500">{profile.phone}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <StatusBadge value={profile.status} />
            <StatusBadge value={profile.tier} />
          </div>
        </div>

        <div className="space-y-3 border-t border-slate-200 pt-4 text-sm">
          <IconInfo icon={<Mail className="h-4 w-4" />} label="Email" value={profile.email ?? "No email"} />
          <IconInfo icon={<Phone className="h-4 w-4" />} label="Phone" value={profile.phone} />
          <IconInfo icon={<Medal className="h-4 w-4" />} label="Loyalty points" value={String(loyalty.currentPoints)} />
          <IconInfo icon={<CalendarClock className="h-4 w-4" />} label="Registered" value={formatDate(profile.registeredAt)} />
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
          <MiniStat label="Bookings" value={String(summary.totalBookings)} />
          <MiniStat label="Sessions" value={String(summary.totalWashSessions)} />
          <MiniStat label="Spent" value={formatVnd(summary.totalSpent)} />
          <MiniStat label="Earned" value={String(summary.totalPointsEarned)} />
        </div>

        <div className="space-y-3 border-t border-slate-200 pt-4">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500">Account status</span>
            <select
              className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm"
              value={statusDraft}
              onChange={(event) => onStatusDraftChange(event.target.value as AdminCustomerStatus)}
            >
              <option value="ACTIVE">Active</option>
              <option value="BLOCKED">Blocked</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </label>
          <Input
            placeholder="Reason (optional)"
            value={statusReasonDraft}
            onChange={(event) => onStatusReasonDraftChange(event.target.value)}
          />
          <Button type="button" className="w-full" onClick={() => void onSubmitStatus()} disabled={isUpdatingStatus}>
            {isUpdatingStatus ? "Updating..." : "Update status"}
          </Button>
          {statusFeedback ? <p className="text-xs text-slate-600">{statusFeedback}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function IconInfo({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-slate-400">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="truncate font-medium text-slate-900">{value}</div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-950">{value}</div>
    </div>
  );
}

function OverviewTab({
  query,
}: {
  query: ReturnType<typeof useAdminCustomerDetail>;
}) {
  if (query.isPending) {
    return <LoadingInline message="Loading customer detail..." />;
  }
  if (query.isError) {
    return <ErrorInline message={getDisplayErrorMessage(query.error)} />;
  }
  if (!query.data) {
    return <EmptyInline message="Customer not found." />;
  }

  const { profile, loyalty, summary } = query.data;
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-slate-950">Profile information</h2>
        <div className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <DetailField label="Full name" value={profile.fullName} />
          <DetailField label="Phone number" value={profile.phone} />
          <DetailField label="Email address" value={profile.email ?? "No email"} />
          <DetailField label="Registered date" value={formatDateTime(profile.registeredAt)} />
          <DetailField label="Status" value={<StatusBadge value={profile.status} />} />
          <DetailField label="Loyalty tier" value={<StatusBadge value={profile.tier} />} />
        </div>
      </div>

      <div className="border-t border-slate-200 pt-5">
        <h2 className="text-base font-semibold text-slate-950">Activity summary</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <MetricBox label="Bookings" value={String(summary.totalBookings)} />
          <MetricBox label="Completed" value={String(summary.completedBookings)} />
          <MetricBox label="Cancelled" value={String(summary.cancelledBookings)} />
          <MetricBox label="Wash sessions" value={String(summary.totalWashSessions)} />
          <MetricBox label="Total spent" value={formatVnd(summary.totalSpent)} />
          <MetricBox label="Points balance" value={String(loyalty.currentPoints)} />
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-950">{value}</div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-950">{value}</div>
    </div>
  );
}

function VehiclesTab({
  query,
  page,
  onPageChange,
}: {
  query: ReturnType<typeof useAdminCustomerVehicles>;
  page: number;
  onPageChange: (page: number) => void;
}) {
  if (query.isPending) {
    return <LoadingInline message="Loading customer vehicles..." />;
  }
  if (query.isError) {
    return (
      <ApiGapAwareError
        error={query.error}
        fallbackMessage="Failed to load customer vehicles."
      />
    );
  }
  if (!query.data || query.data.items.length === 0) {
    return <EmptyInline message="No vehicles for this customer." />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-slate-950">Vehicles</h2>
      <div className="overflow-hidden rounded-md border border-slate-200">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Plate</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Primary</TableHead>
              <TableHead>Last service</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data.items.map((vehicle) => (
              <TableRow key={vehicle.vehicleId}>
                <TableCell>{vehicle.plate}</TableCell>
                <TableCell>{vehicle.type}</TableCell>
                <TableCell>{[vehicle.brand, vehicle.model].filter(Boolean).join(" ") || "N/A"}</TableCell>
                <TableCell>
                  <StatusBadge value={vehicle.status} />
                </TableCell>
                <TableCell>{vehicle.isPrimary ? "Yes" : "No"}</TableCell>
                <TableCell>{vehicle.lastServiceDate ? formatDateTime(vehicle.lastServiceDate) : "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Pagination
        page={page}
        hasMore={query.data.pagination.hasMore}
        onPrevious={() => onPageChange(Math.max(1, page - 1))}
        onNext={() => onPageChange(page + 1)}
      />
    </div>
  );
}

function BookingsTab({
  query,
  page,
  onPageChange,
}: {
  query: ReturnType<typeof useAdminBookings>;
  page: number;
  onPageChange: (page: number) => void;
}) {
  if (query.isPending) {
    return <LoadingInline message="Loading customer bookings..." />;
  }
  if (query.isError) {
    return <ErrorInline message={getDisplayErrorMessage(query.error)} />;
  }
  if (!query.data || query.data.items.length === 0) {
    return <EmptyInline message="No bookings for this customer." />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-slate-950">Customer bookings</h2>
      <div className="overflow-hidden rounded-md border border-slate-200">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Booking</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data.items.map((booking) => (
              <TableRow key={booking.bookingId}>
                <TableCell>{booking.bookingId}</TableCell>
                <TableCell>{booking.servicePackageName ?? booking.servicePackageId ?? "N/A"}</TableCell>
                <TableCell>
                  {booking.bookingDate} {booking.bookingTime}
                </TableCell>
                <TableCell>
                  <StatusBadge value={booking.status} />
                </TableCell>
                <TableCell>
                  <StatusBadge value={booking.paymentStatus} />
                </TableCell>
                <TableCell className="text-right">{formatVnd(booking.finalAmount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Pagination
        page={page}
        hasMore={query.data.pagination.hasMore}
        onPrevious={() => onPageChange(Math.max(1, page - 1))}
        onNext={() => onPageChange(page + 1)}
      />
    </div>
  );
}

function WashHistoryTab({
  query,
  page,
  onPageChange,
  draft,
  onDraftChange,
  onApply,
  onClear,
}: {
  query: ReturnType<typeof useAdminCustomerWashHistory>;
  page: number;
  onPageChange: (page: number) => void;
  draft: DateRangeDraft;
  onDraftChange: (next: DateRangeDraft) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  const items = query.data?.items ?? [];
  const activeSessions = items.filter((item) => item.status !== "COMPLETED" && item.status !== "CANCELLED").length;
  const completedSessions = items.filter((item) => item.status === "COMPLETED").length;
  const totalPoints = items.reduce((sum, item) => sum + (item.pointsAwarded ?? 0), 0);
  const totalFees = items.reduce((sum, item) => sum + (item.fee.amount ?? 0), 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-950">Wash tracking history</h2>
        <p className="mt-1 text-sm text-slate-500">
          Follow each wash session by booking, vehicle, status, and service timing.
        </p>
      </div>
        <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] md:items-end">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500">Started from</span>
            <Input
              type="datetime-local"
              value={draft.dateFrom}
              onChange={(event) => onDraftChange({ ...draft, dateFrom: event.target.value })}
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500">Started to</span>
            <Input
              type="datetime-local"
              value={draft.dateTo}
              onChange={(event) => onDraftChange({ ...draft, dateTo: event.target.value })}
            />
          </label>
          <Button type="button" onClick={onApply}>
            Apply
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClear}
          >
            Clear
          </Button>
        </div>

        {query.isPending ? (
          <LoadingInline message="Loading wash history..." />
        ) : query.isError ? (
          <ErrorInline message={getDisplayErrorMessage(query.error)} />
        ) : !query.data || items.length === 0 ? (
          <EmptyInline message="No wash sessions for this customer." />
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-4">
              <TrackingMetric icon={<Clock3 className="h-4 w-4" />} label="Sessions on page" value={String(items.length)} />
              <TrackingMetric icon={<TimerReset className="h-4 w-4" />} label="Active sessions" value={String(activeSessions)} />
              <TrackingMetric icon={<CircleCheck className="h-4 w-4" />} label="Completed" value={String(completedSessions)} />
              <TrackingMetric icon={<CalendarClock className="h-4 w-4" />} label="Fees / points" value={`${formatVnd(totalFees)} / ${totalPoints}`} />
            </div>

            <div className="overflow-hidden rounded-md border border-slate-200">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Booking</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead className="text-right">Fee</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.sessionId} className="align-top hover:bg-slate-50/70">
                      <TableCell className="min-w-[190px]">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <StatusBadge value={item.status} />
                            <span className="text-xs text-slate-500">{shortId(item.sessionId)}</span>
                          </div>
                          <WashProgress status={item.status} startedAt={item.startedAt} completedAt={item.completedAt} />
                          <div className="text-xs text-slate-500">{durationLabel(item.startedAt, item.completedAt)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="link" className="h-auto p-0 text-sky-700">
                          <Link href={`/admin/bookings/${item.bookingId}`}>{shortId(item.bookingId)}</Link>
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{item.vehiclePlate}</TableCell>
                      <TableCell>{item.servicePackage.name ?? item.servicePackage.id ?? "N/A"}</TableCell>
                      <TableCell>
                        <div>{formatDate(item.bookingDate)}</div>
                        <div className="text-xs text-slate-500">{item.bookingTime}</div>
                      </TableCell>
                      <TableCell>{item.startedAt ? formatDateTime(item.startedAt) : "Not started"}</TableCell>
                      <TableCell>{item.completedAt ? formatDateTime(item.completedAt) : "In progress"}</TableCell>
                      <TableCell className="text-right">
                        {item.fee.amount != null ? formatMoney(item.fee.amount, item.fee.currency) : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">{item.pointsAwarded ?? 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pagination
              page={page}
              hasMore={query.data.pagination.hasMore}
              onPrevious={() => onPageChange(Math.max(1, page - 1))}
              onNext={() => onPageChange(page + 1)}
            />
          </>
        )}
    </div>
  );
}

function TrackingMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-700">
        {icon}
      </div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-base font-semibold text-slate-950">{value}</div>
      </div>
    </div>
  );
}

function WashProgress({
  status,
  startedAt,
  completedAt,
}: {
  status: string;
  startedAt: string | null;
  completedAt: string | null;
}) {
  const steps = [
    { key: "queued", label: "Queued", active: Boolean(startedAt || completedAt || status !== "PENDING") },
    { key: "started", label: "Started", active: Boolean(startedAt || completedAt) },
    { key: "done", label: "Done", active: Boolean(completedAt || status === "COMPLETED") },
  ];

  return (
    <div className="grid grid-cols-3 gap-1">
      {steps.map((step) => (
        <div key={step.key} className="space-y-1">
          <div className={`h-1.5 rounded-full ${step.active ? "bg-emerald-500" : "bg-slate-200"}`} />
          <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{step.label}</div>
        </div>
      ))}
    </div>
  );
}

function PointTransactionsTab({
  query,
  page,
  onPageChange,
  typeDraft,
  dateDraft,
  onTypeDraftChange,
  onDateDraftChange,
  onApply,
}: {
  query: ReturnType<typeof useAdminCustomerPointTransactions>;
  page: number;
  onPageChange: (page: number) => void;
  typeDraft: string;
  dateDraft: DateRangeDraft;
  onTypeDraftChange: (value: string) => void;
  onDateDraftChange: (next: DateRangeDraft) => void;
  onApply: () => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-slate-950">Point transaction history</h2>
      <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-4">
        <select
          className="h-9 rounded-md border border-input bg-white px-3 text-sm shadow-sm"
          value={typeDraft}
          onChange={(event) => onTypeDraftChange(event.target.value)}
        >
          <option value="">All types</option>
          <option value="EARN">EARN</option>
          <option value="REDEEM">REDEEM</option>
          <option value="TIER_UPGRADE">TIER_UPGRADE</option>
          <option value="ADJUST">ADJUST</option>
          <option value="EXPIRE">EXPIRE</option>
        </select>
        <Input
          type="datetime-local"
          value={dateDraft.dateFrom}
          onChange={(event) => onDateDraftChange({ ...dateDraft, dateFrom: event.target.value })}
        />
        <Input
          type="datetime-local"
          value={dateDraft.dateTo}
          onChange={(event) => onDateDraftChange({ ...dateDraft, dateTo: event.target.value })}
        />
        <Button type="button" onClick={onApply}>
          Apply
        </Button>
      </div>

      {query.isPending ? (
        <LoadingInline message="Loading point transactions..." />
      ) : query.isError ? (
        <ErrorInline message={getDisplayErrorMessage(query.error)} />
      ) : !query.data || query.data.items.length === 0 ? (
        <EmptyInline message="No point transactions for this customer." />
      ) : (
        <>
          <div className="overflow-hidden rounded-md border border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Balance after</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Created at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.items.map((item) => (
                  <TableRow key={item.transactionId}>
                    <TableCell>
                      <StatusBadge value={item.type} />
                    </TableCell>
                    <TableCell>{item.points}</TableCell>
                    <TableCell>{item.balanceAfter}</TableCell>
                    <TableCell>{item.reason}</TableCell>
                    <TableCell>{item.referenceId ?? "N/A"}</TableCell>
                    <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination
            page={page}
            hasMore={query.data.pagination.hasMore}
            onPrevious={() => onPageChange(Math.max(1, page - 1))}
            onNext={() => onPageChange(page + 1)}
          />
        </>
      )}
    </div>
  );
}

function TierHistoryTab({
  query,
  page,
  onPageChange,
}: {
  query: ReturnType<typeof useAdminCustomerTierHistory>;
  page: number;
  onPageChange: (page: number) => void;
}) {
  if (query.isPending) {
    return <LoadingInline message="Loading tier history..." />;
  }
  if (query.isError) {
    return (
      <ApiGapAwareError
        error={query.error}
        fallbackMessage="Failed to load tier history."
      />
    );
  }
  if (!query.data || query.data.items.length === 0) {
    return <EmptyInline message="No tier history for this customer." />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-slate-950">Tier history</h2>
      <div className="overflow-hidden rounded-md border border-slate-200">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>From tier</TableHead>
              <TableHead>To tier</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Changed at</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.fromTier ? <StatusBadge value={item.fromTier} /> : "N/A"}</TableCell>
                <TableCell>
                  <StatusBadge value={item.toTier} />
                </TableCell>
                <TableCell>{item.pointsAtChange ?? "N/A"}</TableCell>
                <TableCell>{item.reason ?? "N/A"}</TableCell>
                <TableCell>{formatDateTime(item.changedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Pagination
        page={page}
        hasMore={query.data.pagination.hasMore}
        onPrevious={() => onPageChange(Math.max(1, page - 1))}
        onNext={() => onPageChange(page + 1)}
      />
    </div>
  );
}

function ApiGapAwareError({
  error,
  fallbackMessage,
}: {
  error: ApiErrorResponse;
  fallbackMessage: string;
}) {
  if (error.statusCode === 404 || error.statusCode === 405) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="font-semibold">Data source unavailable</div>
        <p className="mt-1">{fallbackMessage}</p>
        <p className="mt-1">The related admin data source is not available yet.</p>
      </div>
    );
  }

  return <ErrorInline message={fallbackMessage} />;
}

function Pagination({
  page,
  hasMore,
  onPrevious,
  onNext,
}: {
  page: number;
  hasMore: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-between border-t pt-3">
      <p className="text-sm text-slate-500">Page {page}</p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" disabled={page <= 1} onClick={onPrevious}>
          Previous
        </Button>
        <Button type="button" variant="outline" disabled={!hasMore} onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}

function LoadingInline({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm text-slate-600">
      <Loader2 className="h-4 w-4 animate-spin" />
      {message}
    </div>
  );
}

function ErrorInline({ message }: { message: string }) {
  return <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{message}</p>;
}

function EmptyInline({ message }: { message: string }) {
  return <p className="rounded-md border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">{message}</p>;
}

function StatusBadge({ value }: { value: string }) {
  const tone = STATUS_TONE[value] ?? "border-slate-300 bg-slate-100 text-slate-700";

  return (
    <Badge className={tone} variant="outline">
      {value}
    </Badge>
  );
}

function shortId(value: string) {
  return value.length > 12 ? `${value.slice(0, 8)}...${value.slice(-4)}` : value;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatVnd(amount: number) {
  return `${amount.toLocaleString("en-US")} VND`;
}

function formatMoney(amount: number, currency: string | null) {
  if (!currency || currency === "VND") {
    return formatVnd(amount);
  }
  return `${amount.toLocaleString("en-US")} ${currency}`;
}

function durationLabel(startedAt: string | null, completedAt: string | null) {
  if (!startedAt) {
    return "Waiting for start";
  }

  const start = new Date(startedAt).getTime();
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();

  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return "Duration unavailable";
  }

  const totalMinutes = Math.max(1, Math.round((end - start) / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  return `${hours}h ${minutes}m`;
}

const STATUS_TONE: Record<string, string> = {
  PENDING: "border-amber-300 bg-amber-100 text-amber-800",
  CONFIRMED: "border-sky-300 bg-sky-100 text-sky-800",
  CHECKED_IN: "border-violet-300 bg-violet-100 text-violet-800",
  IN_PROGRESS: "border-orange-300 bg-orange-100 text-orange-800",
  COMPLETED: "border-emerald-300 bg-emerald-100 text-emerald-800",
  CANCELLED: "border-rose-300 bg-rose-100 text-rose-800",
  NO_SHOW: "border-slate-400 bg-slate-200 text-slate-800",
  ACTIVE: "border-emerald-300 bg-emerald-100 text-emerald-800",
  BLOCKED: "border-rose-300 bg-rose-100 text-rose-800",
  SUSPENDED: "border-amber-300 bg-amber-100 text-amber-800",
  MEMBER: "border-slate-300 bg-slate-100 text-slate-800",
  SILVER: "border-zinc-300 bg-zinc-100 text-zinc-800",
  GOLD: "border-yellow-300 bg-yellow-100 text-yellow-800",
  PLATINUM: "border-indigo-300 bg-indigo-100 text-indigo-800",
  EARN: "border-emerald-300 bg-emerald-100 text-emerald-800",
  REDEEM: "border-rose-300 bg-rose-100 text-rose-800",
  TIER_UPGRADE: "border-indigo-300 bg-indigo-100 text-indigo-800",
  ADJUST: "border-violet-300 bg-violet-100 text-violet-800",
  EXPIRE: "border-slate-400 bg-slate-200 text-slate-800",
  FAILED: "border-rose-300 bg-rose-100 text-rose-800",
  REFUNDED: "border-zinc-300 bg-zinc-100 text-zinc-800",
};

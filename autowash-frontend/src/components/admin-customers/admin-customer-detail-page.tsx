"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Loader2, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Customer Detail</CardTitle>
              <CardDescription>
                Tabs follow admin customer detail scope: overview, vehicles, bookings, wash history, point transactions, tier history.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/admin/bookings">Back to bookings</Link>
              </Button>
              <Button type="button" variant="outline" onClick={() => void refreshActiveTab(activeTab)}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {CUSTOMER_TABS.map((tab) => (
                <Button
                  key={tab.id}
                  type="button"
                  variant={activeTab === tab.id ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {activeTab === "overview" ? (
          <OverviewTab
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
        ) : null}

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

function OverviewTab({
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
    return <LoadingCard message="Loading customer detail..." />;
  }
  if (query.isError) {
    return <ErrorCard message={getDisplayErrorMessage(query.error)} />;
  }
  if (!query.data) {
    return <EmptyCard message="Customer not found." />;
  }

  const { profile, loyalty, summary } = query.data;
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <InfoRow label="Name" value={profile.fullName} />
          <InfoRow label="Phone" value={profile.phone} />
          <InfoRow label="Email" value={profile.email ?? "N/A"} />
          <InfoRow label="Status" value={<StatusBadge value={profile.status} />} />
          <InfoRow label="Tier" value={<StatusBadge value={profile.tier} />} />
          <InfoRow label="Registered" value={formatDateTime(profile.registeredAt)} />
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Loyalty</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <InfoRow label="Current points" value={String(loyalty.currentPoints)} />
          <InfoRow label="Tier" value={<StatusBadge value={loyalty.tier} />} />
          <InfoRow label="Updated" value={formatDateTime(loyalty.updatedAt)} />
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <InfoRow label="Total bookings" value={String(summary.totalBookings)} />
          <InfoRow label="Completed bookings" value={String(summary.completedBookings)} />
          <InfoRow label="Cancelled bookings" value={String(summary.cancelledBookings)} />
          <InfoRow label="Total wash sessions" value={String(summary.totalWashSessions)} />
          <InfoRow label="Total spent" value={formatVnd(summary.totalSpent)} />
          <InfoRow label="Points earned" value={String(summary.totalPointsEarned)} />
          <InfoRow label="Points spent" value={String(summary.totalPointsSpent)} />
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white lg:col-span-3">
        <CardHeader>
          <CardTitle>Customer status</CardTitle>
          <CardDescription>Update customer account state when backend endpoint supports it.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4">
          <select
            className="h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
            value={statusDraft}
            onChange={(event) => onStatusDraftChange(event.target.value as AdminCustomerStatus)}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="BLOCKED">BLOCKED</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
          <Input
            placeholder="Reason (optional)"
            value={statusReasonDraft}
            onChange={(event) => onStatusReasonDraftChange(event.target.value)}
          />
          <Button type="button" onClick={() => void onSubmitStatus()} disabled={isUpdatingStatus}>
            {isUpdatingStatus ? "Updating..." : "Update status"}
          </Button>
          <div className="text-xs text-slate-500">
            Endpoint: <code>PUT /api/v1/admin/customers/:customerId/status</code>
          </div>
        </CardContent>
        {statusFeedback ? (
          <CardContent className="pt-0">
            <p className="text-sm text-slate-700">{statusFeedback}</p>
          </CardContent>
        ) : null}
      </Card>
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
    return <LoadingCard message="Loading customer vehicles..." />;
  }
  if (query.isError) {
    return (
      <ApiGapAwareError
        error={query.error}
        fallbackMessage="Failed to load customer vehicles."
        endpoint="/api/v1/admin/customers/:customerId/vehicles"
      />
    );
  }
  if (!query.data || query.data.items.length === 0) {
    return <EmptyCard message="No vehicles for this customer." />;
  }

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle>Vehicles</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
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
        <Pagination
          page={page}
          hasMore={query.data.pagination.hasMore}
          onPrevious={() => onPageChange(Math.max(1, page - 1))}
          onNext={() => onPageChange(page + 1)}
        />
      </CardContent>
    </Card>
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
    return <LoadingCard message="Loading customer bookings..." />;
  }
  if (query.isError) {
    return <ErrorCard message={getDisplayErrorMessage(query.error)} />;
  }
  if (!query.data || query.data.items.length === 0) {
    return <EmptyCard message="No bookings for this customer." />;
  }

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle>Customer bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
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
        <Pagination
          page={page}
          hasMore={query.data.pagination.hasMore}
          onPrevious={() => onPageChange(Math.max(1, page - 1))}
          onNext={() => onPageChange(page + 1)}
        />
      </CardContent>
    </Card>
  );
}

function WashHistoryTab({
  query,
  page,
  onPageChange,
  draft,
  onDraftChange,
  onApply,
}: {
  query: ReturnType<typeof useAdminCustomerWashHistory>;
  page: number;
  onPageChange: (page: number) => void;
  draft: DateRangeDraft;
  onDraftChange: (next: DateRangeDraft) => void;
  onApply: () => void;
}) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle>Wash history</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            type="datetime-local"
            value={draft.dateFrom}
            onChange={(event) => onDraftChange({ ...draft, dateFrom: event.target.value })}
          />
          <Input
            type="datetime-local"
            value={draft.dateTo}
            onChange={(event) => onDraftChange({ ...draft, dateTo: event.target.value })}
          />
          <Button type="button" onClick={onApply}>
            Apply
          </Button>
        </div>

        {query.isPending ? (
          <LoadingInline message="Loading wash history..." />
        ) : query.isError ? (
          <ErrorInline message={getDisplayErrorMessage(query.error)} />
        ) : !query.data || query.data.items.length === 0 ? (
          <EmptyInline message="No wash sessions for this customer." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.items.map((item) => (
                  <TableRow key={item.sessionId}>
                    <TableCell>{item.sessionId}</TableCell>
                    <TableCell>{item.bookingId}</TableCell>
                    <TableCell>{item.servicePackage.name ?? item.servicePackage.id ?? "N/A"}</TableCell>
                    <TableCell>
                      <StatusBadge value={item.status} />
                    </TableCell>
                    <TableCell>{item.startedAt ? formatDateTime(item.startedAt) : "N/A"}</TableCell>
                    <TableCell>{item.completedAt ? formatDateTime(item.completedAt) : "N/A"}</TableCell>
                    <TableCell className="text-right">
                      {item.fee.amount != null ? formatMoney(item.fee.amount, item.fee.currency) : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">{item.pointsAwarded ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              page={page}
              hasMore={query.data.pagination.hasMore}
              onPrevious={() => onPageChange(Math.max(1, page - 1))}
              onNext={() => onPageChange(page + 1)}
            />
          </>
        )}
      </CardContent>
    </Card>
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
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle>Point transaction history</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <select
            className="h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
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
            <Table>
              <TableHeader>
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
            <Pagination
              page={page}
              hasMore={query.data.pagination.hasMore}
              onPrevious={() => onPageChange(Math.max(1, page - 1))}
              onNext={() => onPageChange(page + 1)}
            />
          </>
        )}
      </CardContent>
    </Card>
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
    return <LoadingCard message="Loading tier history..." />;
  }
  if (query.isError) {
    return (
      <ApiGapAwareError
        error={query.error}
        fallbackMessage="Failed to load tier history."
        endpoint="/api/v1/admin/customers/:customerId/tier-history"
      />
    );
  }
  if (!query.data || query.data.items.length === 0) {
    return <EmptyCard message="No tier history for this customer." />;
  }

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle>Tier history</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
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
        <Pagination
          page={page}
          hasMore={query.data.pagination.hasMore}
          onPrevious={() => onPageChange(Math.max(1, page - 1))}
          onNext={() => onPageChange(page + 1)}
        />
      </CardContent>
    </Card>
  );
}

function ApiGapAwareError({
  error,
  fallbackMessage,
  endpoint,
}: {
  error: ApiErrorResponse;
  fallbackMessage: string;
  endpoint: string;
}) {
  if (error.statusCode === 404 || error.statusCode === 405) {
    return (
      <Card className="border-amber-300 bg-amber-50">
        <CardHeader>
          <CardTitle>API Contract Gap</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-amber-900">
          <p>Endpoint chưa sẵn sàng từ backend: <code>{endpoint}</code>.</p>
          <p>Tab này đã được giữ lại để đúng scope customer detail tabs của issue #78.</p>
        </CardContent>
      </Card>
    );
  }

  return <ErrorCard message={fallbackMessage} />;
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

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b pb-1 last:border-b-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

function LoadingCard({ message }: { message: string }) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardContent className="p-4">
        <LoadingInline message={message} />
      </CardContent>
    </Card>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <Card className="border-rose-200 bg-white">
      <CardContent className="p-4">
        <ErrorInline message={message} />
      </CardContent>
    </Card>
  );
}

function EmptyCard({ message }: { message: string }) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardContent className="p-4">
        <EmptyInline message={message} />
      </CardContent>
    </Card>
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

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("vi-VN");
}

function formatVnd(amount: number) {
  return `${amount.toLocaleString("vi-VN")} VND`;
}

function formatMoney(amount: number, currency: string | null) {
  if (!currency || currency === "VND") {
    return formatVnd(amount);
  }
  return `${amount.toLocaleString("vi-VN")} ${currency}`;
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

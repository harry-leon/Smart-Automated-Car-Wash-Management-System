import * as React from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Search, Shield, Users, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCarwashStore } from "@/lib/carwash-store";
import { CustomerTable, ROLE_TONE, STATUS_TONE, TIER_TONE } from "../components/CustomerTable";
import { CustomerDetailPage } from "./CustomerDetailPage";
import { storeAccountsToRows } from "../lib/customer-mapping";
import type {
  CustomerRole,
  CustomerRow,
  CustomerStatus,
  CustomerTier,
} from "../types/customer.types";
import styles from "../styles/customers.module.css";

const TIERS: ("ALL" | CustomerTier)[] = ["ALL", "MEMBER", "SILVER", "GOLD", "DIAMOND", "N/A"];
const ROLES: ("ALL" | CustomerRole)[] = ["ALL", "CUSTOMER", "STAFF", "ADMIN"];
const PAGE_SIZE = 10;

export function CustomersPage() {
  const { customers, staffMembers, authAccounts, ledger, hydrated } = useCarwashStore();
  const [search, setSearch] = React.useState("");
  const [tierFilter, setTierFilter] = React.useState<"ALL" | CustomerTier>("ALL");
  const [roleFilter, setRoleFilter] = React.useState<"ALL" | CustomerRole>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "ACTIVE" | "SUSPENDED">("ALL");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);

  const rows = React.useMemo<CustomerRow[]>(
    () => storeAccountsToRows(customers, staffMembers, authAccounts, ledger),
    [authAccounts, customers, ledger, staffMembers],
  );

  const selectedRow = React.useMemo(
    () => rows.find((row) => row.id === selectedId) ?? null,
    [rows, selectedId],
  );

  const filtered = React.useMemo<CustomerRow[]>(() => {
    return rows.filter((row) => {
      if (tierFilter !== "ALL" && row.tier !== tierFilter) return false;
      if (roleFilter !== "ALL" && row.role !== roleFilter) return false;
      if (statusFilter !== "ALL" && row.status !== statusFilter) return false;
      if (search) {
        const needle = search.toLowerCase();
        const haystack = `${row.name} ${row.email} ${row.phone} ${row.role}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [roleFilter, rows, search, statusFilter, tierFilter]);

  React.useEffect(() => {
    setPage(1);
  }, [search, tierFilter, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (selectedRow?.accountType === "CUSTOMER") {
    return <CustomerDetailPage customerId={selectedRow.id} onBack={() => setSelectedId(null)} />;
  }

  if (selectedRow) {
    return <AccountDetailPanel row={selectedRow} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-md">
            <Users className="h-3.5 w-3.5" /> Accounts
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Account directory
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
            Browse every account in the system, including customers, staff and admin access. Filter
            by role, tier or status, then open a detail view to review activity.
          </p>
        </div>

        <Card className="border-border/50 bg-card/60 p-4 shadow-lg backdrop-blur-xl md:p-6">
          <div className={styles.searchRow}>
            <div className="min-w-[240px] flex-1 space-y-1.5">
              <Label
                htmlFor="account-search"
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="account-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Name, email, phone or role"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-[160px] space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Role
              </Label>
              <Select
                value={roleFilter}
                onValueChange={(next) => setRoleFilter(next as typeof roleFilter)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role === "ALL" ? "All roles" : role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[160px] space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tier
              </Label>
              <Select
                value={tierFilter}
                onValueChange={(next) => setTierFilter(next as typeof tierFilter)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIERS.map((tier) => (
                    <SelectItem key={tier} value={tier}>
                      {tier === "ALL" ? "All tiers" : tier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[160px] space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </Label>
              <Select
                value={statusFilter}
                onValueChange={(next) => setStatusFilter(next as typeof statusFilter)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Showing <strong className="text-foreground">{filtered.length}</strong> of {rows.length}{" "}
            accounts
          </div>
        </Card>

        {!hydrated ? (
          <Card className="border-border/50 bg-card/60 p-10 text-center text-sm text-muted-foreground backdrop-blur-xl">
            Loading accounts...
          </Card>
        ) : (
          <>
            <CustomerTable rows={pageRows} onOpenDetail={setSelectedId} />

            <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
              <span>
                Page <strong className="text-foreground">{safePage}</strong> of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                >
                  <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                >
                  Next
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AccountDetailPanel({ row, onBack }: { row: CustomerRow; onBack: () => void }) {
  const { bookings, washSessions, reviews } = useCarwashStore();

  const relatedBookings = React.useMemo(() => {
    if (row.accountType === "STAFF") {
      return bookings.filter((booking) => booking.assignedStaffId === row.id);
    }
    return [];
  }, [bookings, row.accountType, row.id]);

  const activeSessions = React.useMemo(
    () =>
      washSessions.filter(
        (session) => session.staffId === row.id && session.status !== "Completed",
      ),
    [row.id, washSessions],
  );

  const staffReviews = React.useMemo(
    () => reviews.filter((review) => review.staffId === row.id),
    [reviews, row.id],
  );

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-md">
              {row.role === "ADMIN" ? (
                <Shield className="h-3.5 w-3.5" />
              ) : (
                <Wrench className="h-3.5 w-3.5" />
              )}
              Account detail
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {row.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              ID: <span className="font-mono">{row.id}</span>
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" /> Back to list
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <Card className="border-border/50 bg-card/60 p-6 shadow-lg backdrop-blur-xl">
            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Account summary
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline" className={`border font-bold ${ROLE_TONE[row.role]}`}>
                    {row.role}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`border font-semibold ${STATUS_TONE[row.status]}`}
                  >
                    {row.status}
                  </Badge>
                  <Badge variant="outline" className={`border font-bold ${TIER_TONE[row.tier]}`}>
                    {row.tier}
                  </Badge>
                </div>
              </div>

              <Info label="Email" value={row.email} />
              <Info label="Phone" value={row.phone} mono />
              <Info label="Joined" value={row.joinedAt} />
              <Info label="Available points" value={row.availablePoints.toLocaleString("vi-VN")} />
              <Info label="Lifetime points" value={row.lifetimePoints.toLocaleString("vi-VN")} />
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/50 bg-card/60 p-6 shadow-lg backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-foreground">Operational snapshot</h2>
                <div className="text-xs text-muted-foreground">{row.role} account</div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Metric label="Assigned bookings" value={String(relatedBookings.length)} />
                <Metric label="Active sessions" value={String(activeSessions.length)} />
                <Metric label="Reviews received" value={String(staffReviews.length)} />
              </div>
            </Card>

            <Card className="border-border/50 bg-card/60 p-6 shadow-lg backdrop-blur-xl">
              <div className="mb-4 text-lg font-bold text-foreground">Recent assignments</div>
              {relatedBookings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
                  No related bookings for this account yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {relatedBookings.slice(0, 6).map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-xl border border-border/50 bg-background/40 px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-semibold text-foreground">{booking.id}</div>
                        <div className="text-xs text-muted-foreground">{booking.status}</div>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {booking.customerName ?? booking.customerId} • {booking.services.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/40 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/40 p-4">
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={`mt-1.5 text-sm font-semibold text-foreground ${mono ? "font-mono" : ""}`}>
        {value}
      </div>
    </div>
  );
}

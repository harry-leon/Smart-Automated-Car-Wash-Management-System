"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, RefreshCcw, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminAccounts } from "@/hooks/use-admin-reporting";
import { getDisplayErrorMessage } from "@/lib/api-errors";
import type {
  AdminAccount,
  AdminAccountRole,
  AdminAccountStatus,
  AdminAccountsFilters,
} from "@/types/admin-reporting.types";

const PAGE_LIMIT = 20;
const ROLE_OPTIONS: AdminAccountRole[] = ["CUSTOMER", "STAFF", "ADMIN", "GUEST"];
const STATUS_OPTIONS: AdminAccountStatus[] = ["PENDING", "ACTIVE", "BLOCKED", "SUSPENDED", "DELETED"];

export function AdminAccountsPageContent() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AdminAccountsFilters>({});
  const [draftFilters, setDraftFilters] = useState({
    searchQuery: "",
    role: "",
    status: "",
  });

  const normalizedFilters = useMemo<AdminAccountsFilters>(
    () => ({
      searchQuery: filters.searchQuery || undefined,
      role: filters.role,
      status: filters.status,
    }),
    [filters],
  );

  const accountsQuery = useAdminAccounts(normalizedFilters, page, PAGE_LIMIT);
  const accounts = accountsQuery.data?.items ?? [];
  const pagination = accountsQuery.data?.pagination;

  const applyFilters = () => {
    setFilters({
      searchQuery: draftFilters.searchQuery.trim() || undefined,
      role: draftFilters.role ? (draftFilters.role as AdminAccountRole) : undefined,
      status: draftFilters.status ? (draftFilters.status as AdminAccountStatus) : undefined,
    });
    setPage(1);
  };

  const clearFilters = () => {
    setDraftFilters({ searchQuery: "", role: "", status: "" });
    setFilters({});
    setPage(1);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin / Accounts</p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Customer directory</h1>
            <p className="max-w-2xl text-sm text-slate-500">
              Manage account records, statuses, and customer details from a single directory.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-9 gap-2"
            onClick={() => accountsQuery.refetch()}
            disabled={accountsQuery.isFetching}
          >
            <RefreshCcw className={`h-4 w-4 ${accountsQuery.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_160px_auto_auto] md:items-end">
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-slate-500">Customer name</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="h-9 pl-9"
                    placeholder="Search by name, phone, or email"
                    value={draftFilters.searchQuery}
                    onChange={(event) =>
                      setDraftFilters((previous) => ({ ...previous, searchQuery: event.target.value }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        applyFilters();
                      }
                    }}
                  />
                </div>
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-medium text-slate-500">Type</span>
                <select
                  className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm"
                  value={draftFilters.role}
                  onChange={(event) => setDraftFilters((previous) => ({ ...previous, role: event.target.value }))}
                >
                  <option value="">All types</option>
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {formatEnumLabel(role)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-medium text-slate-500">Status</span>
                <select
                  className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm"
                  value={draftFilters.status}
                  onChange={(event) => setDraftFilters((previous) => ({ ...previous, status: event.target.value }))}
                >
                  <option value="">All status</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {formatEnumLabel(status)}
                    </option>
                  ))}
                </select>
              </label>

              <Button type="button" className="h-9" onClick={applyFilters}>
                Apply
              </Button>
              <Button type="button" variant="outline" className="h-9" onClick={clearFilters}>
                Clear
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-950">Customer list</h2>
                <p className="text-xs text-slate-500">
                  {pagination ? `${pagination.total.toLocaleString("en-US")} records` : "Loading records"}
                </p>
              </div>

              <div className="overflow-hidden rounded-md border border-slate-200">
                {accountsQuery.isPending ? (
                  <StatePanel icon={<Loader2 className="h-4 w-4 animate-spin" />} message="Loading accounts..." />
                ) : accountsQuery.isError ? (
                  <StatePanel tone="danger" message={getDisplayErrorMessage(accountsQuery.error)} />
                ) : accounts.length === 0 ? (
                  <StatePanel message="No accounts match the current filters." />
                ) : (
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Customer name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Joined date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.map((account) => (
                        <TableRow key={account.accountId} className="hover:bg-slate-50/70">
                          <TableCell>
                            <div className="font-medium text-slate-950">{account.fullName}</div>
                            <div className="text-xs text-slate-500">{shortId(account.accountId)}</div>
                          </TableCell>
                          <TableCell className="text-slate-600">{account.email ?? "No email"}</TableCell>
                          <TableCell className="font-medium text-slate-700">{account.phone}</TableCell>
                          <TableCell>
                            <RoleBadge role={account.role} />
                          </TableCell>
                          <TableCell>{formatEnumLabel(account.tier)}</TableCell>
                          <TableCell>{formatDate(account.createdAt)}</TableCell>
                          <TableCell>
                            <StatusBadge status={account.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            {account.role === "CUSTOMER" ? (
                              <Button asChild size="sm" variant="ghost" className="h-8 gap-1.5 px-2">
                                <Link href={`/admin/customers/${account.accountId}`}>
                                  Details
                                  <ChevronRight className="h-4 w-4" />
                                </Link>
                              </Button>
                            ) : (
                              <span className="text-xs text-slate-400">Internal</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>

            {pagination ? (
              <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={!pagination.hasMore}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatePanel({
  icon,
  message,
  tone = "neutral",
}: {
  icon?: ReactNode;
  message: string;
  tone?: "neutral" | "danger";
}) {
  return (
    <div
      className={
        tone === "danger"
          ? "flex items-center justify-center gap-2 bg-rose-50 p-8 text-sm text-rose-700"
          : "flex items-center justify-center gap-2 bg-white p-8 text-sm text-slate-500"
      }
    >
      {icon}
      {message}
    </div>
  );
}

function RoleBadge({ role }: { role: AdminAccount["role"] }) {
  return (
    <Badge className={ROLE_TONE[role]} variant="outline">
      {formatEnumLabel(role)}
    </Badge>
  );
}

function StatusBadge({ status }: { status: AdminAccount["status"] }) {
  const tone = STATUS_TONE[status] ?? "border-slate-300 bg-slate-100 text-slate-700";

  return (
    <Badge className={tone} variant="outline">
      {formatEnumLabel(status)}
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

function formatEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

const ROLE_TONE: Record<AdminAccount["role"], string> = {
  CUSTOMER: "border-sky-300 bg-sky-100 text-sky-800",
  STAFF: "border-violet-300 bg-violet-100 text-violet-800",
  ADMIN: "border-orange-300 bg-orange-100 text-orange-800",
  GUEST: "border-slate-300 bg-slate-100 text-slate-700",
};

const STATUS_TONE: Record<AdminAccount["status"], string> = {
  PENDING: "border-amber-300 bg-amber-100 text-amber-800",
  ACTIVE: "border-emerald-300 bg-emerald-100 text-emerald-800",
  BLOCKED: "border-rose-300 bg-rose-100 text-rose-800",
  SUSPENDED: "border-slate-400 bg-slate-200 text-slate-800",
  DELETED: "border-zinc-400 bg-zinc-200 text-zinc-800",
};

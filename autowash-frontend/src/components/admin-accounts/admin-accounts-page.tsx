"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Loader2, RefreshCcw, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    role: "",
    status: "",
    searchQuery: "",
  });

  const normalizedFilters = useMemo<AdminAccountsFilters>(() => {
    return {
      role: filters.role,
      status: filters.status,
      searchQuery: filters.searchQuery || undefined,
    };
  }, [filters]);

  const accountsQuery = useAdminAccounts(normalizedFilters, page, PAGE_LIMIT);

  const applyFilters = () => {
    setFilters({
      role: draftFilters.role ? (draftFilters.role as AdminAccountRole) : undefined,
      status: draftFilters.status ? (draftFilters.status as AdminAccountStatus) : undefined,
      searchQuery: draftFilters.searchQuery.trim() || undefined,
    });
    setPage(1);
  };

  const clearFilters = () => {
    setDraftFilters({ role: "", status: "", searchQuery: "" });
    setFilters({});
    setPage(1);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Accounts</CardTitle>
              <CardDescription>Customer, staff, admin, and guest account directory.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => accountsQuery.refetch()}
              disabled={accountsQuery.isFetching}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_160px_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search name, phone, or email"
                value={draftFilters.searchQuery}
                onChange={(event) =>
                  setDraftFilters((prev) => ({ ...prev, searchQuery: event.target.value }))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    applyFilters();
                  }
                }}
              />
            </div>
            <select
              className="h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              value={draftFilters.role}
              onChange={(event) => setDraftFilters((prev) => ({ ...prev, role: event.target.value }))}
            >
              <option value="">All roles</option>
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <select
              className="h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              value={draftFilters.status}
              onChange={(event) => setDraftFilters((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <Button type="button" onClick={applyFilters}>
              Apply
            </Button>
            <Button type="button" variant="outline" onClick={clearFilters}>
              Clear
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Account List</CardTitle>
            <CardDescription>
              {accountsQuery.data
                ? `${accountsQuery.data.pagination.total.toLocaleString("en-US")} accounts found`
                : "Loading account data"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {accountsQuery.isPending ? (
              <div className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading accounts...
              </div>
            ) : accountsQuery.isError ? (
              <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {getDisplayErrorMessage(accountsQuery.error)}
              </p>
            ) : !accountsQuery.data || accountsQuery.data.items.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                No accounts found for current filters.
              </p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountsQuery.data.items.map((account) => (
                      <TableRow key={account.accountId}>
                        <TableCell>
                          <div className="font-medium text-slate-900">
                            {account.role === "CUSTOMER" ? (
                              <Link
                                className="text-sky-700 hover:underline"
                                href={`/admin/customers/${account.accountId}`}
                              >
                                {account.fullName}
                              </Link>
                            ) : (
                              account.fullName
                            )}
                          </div>
                          <div className="text-xs text-slate-500">{account.accountId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-700">{account.phone}</div>
                          <div className="text-xs text-slate-500">{account.email ?? "No email"}</div>
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={account.role} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={account.status} />
                        </TableCell>
                        <TableCell>{account.tier}</TableCell>
                        <TableCell>{formatDate(account.createdAt)}</TableCell>
                        <TableCell>{formatDate(account.updatedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <PaginationControls
                  page={accountsQuery.data.pagination.page}
                  totalPages={accountsQuery.data.pagination.totalPages}
                  hasMore={accountsQuery.data.pagination.hasMore}
                  onPrevious={() => setPage((current) => Math.max(1, current - 1))}
                  onNext={() => setPage((current) => current + 1)}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PaginationControls({
  page,
  totalPages,
  hasMore,
  onPrevious,
  onNext,
}: {
  page: number;
  totalPages: number;
  hasMore: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-between border-t pt-3">
      <p className="text-sm text-slate-500">
        Page {page} / {Math.max(totalPages, 1)}
      </p>
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

function RoleBadge({ role }: { role: AdminAccount["role"] }) {
  const tone = ROLE_TONE[role];

  return (
    <Badge className={tone} variant="outline">
      {role}
    </Badge>
  );
}

function StatusBadge({ status }: { status: AdminAccount["status"] }) {
  const tone = STATUS_TONE[status] ?? "border-slate-300 bg-slate-100 text-slate-700";

  return (
    <Badge className={tone} variant="outline">
      {status}
    </Badge>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
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

"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Plus, RefreshCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { useAdminAccounts, useCreateAdminStaff } from "@/features/admin/reports/hooks/use-admin-reporting";
import { getDisplayErrorMessage, getFieldErrorMessage } from "@/shared/lib/api-errors";
import type { ApiErrorResponse } from "@/shared/types/api.types";
import type {
  AdminAccount,
  AdminAccountRole,
  AdminAccountStatus,
  AdminAccountsFilters,
  CreateAdminStaffPayload,
} from "@/features/admin/reports/admin-reporting.types";

const PAGE_LIMIT = 20;
const ROLE_OPTIONS: AdminAccountRole[] = ["CUSTOMER", "STAFF", "ADMIN", "GUEST"];
const STAFF_ROLE_OPTIONS: AdminAccountRole[] = ["STAFF", "ADMIN"];
const STATUS_OPTIONS: AdminAccountStatus[] = ["PENDING", "ACTIVE", "BLOCKED", "SUSPENDED", "DELETED"];
const EMPTY_STAFF_FORM: CreateAdminStaffPayload = {
  fullName: "",
  phone: "",
  email: "",
  password: "",
};

export function AdminAccountsPageContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"customers" | "staff_admin">("customers");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AdminAccountsFilters>({});
  const [draftFilters, setDraftFilters] = useState({
    searchQuery: "",
    role: "",
    status: "",
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateAdminStaffPayload>(EMPTY_STAFF_FORM);
  const createStaffMutation = useCreateAdminStaff();

  const handleTabChange = (tab: "customers" | "staff_admin") => {
    setActiveTab(tab);
    setPage(1);
    setFilters({});
    setDraftFilters({ searchQuery: "", role: "", status: "" });
  };

  const normalizedFilters = useMemo<AdminAccountsFilters>(
    () => {
      if (activeTab === "customers") {
        return {
          searchQuery: filters.searchQuery || undefined,
          role: "CUSTOMER",
          status: filters.status,
        };
      } else {
        return {
          searchQuery: filters.searchQuery || undefined,
          role: filters.role ? (filters.role as AdminAccountRole) : undefined,
          status: filters.status,
        };
      }
    },
    [filters, activeTab],
  );

  const isStaffClientFiltering = activeTab === "staff_admin" && !normalizedFilters.role;
  const accountsQuery = useAdminAccounts(
    normalizedFilters,
    page,
    isStaffClientFiltering ? 100 : PAGE_LIMIT,
  );
  
  const rawAccounts = accountsQuery.data?.items ?? [];
  const accounts = useMemo(() => {
    if (activeTab === "customers") {
      return rawAccounts;
    } else {
      if (!normalizedFilters.role) {
        return rawAccounts.filter((acc) => acc.role === "STAFF" || acc.role === "ADMIN");
      }
      return rawAccounts;
    }
  }, [rawAccounts, activeTab, normalizedFilters.role]);

  const pagination = accountsQuery.data?.pagination;
  const showPagination = activeTab === "customers" || !!normalizedFilters.role;

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

  const createFormErrors = useMemo(() => validateCreateStaffForm(createForm), [createForm]);
  const canSubmitCreateForm =
    Object.values(createFormErrors).every((value) => value === null) && !createStaffMutation.isPending;

  const handleCreateFieldChange =
    (field: keyof CreateAdminStaffPayload) => (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = field === "phone" ? event.target.value.replace(/\s/g, "") : event.target.value;
      setCreateForm((previous) => ({ ...previous, [field]: nextValue }));
      if (createStaffMutation.isError) {
        createStaffMutation.reset();
      }
    };

  const resetCreateDialog = () => {
    setCreateForm(EMPTY_STAFF_FORM);
    createStaffMutation.reset();
  };

  const handleCreateStaff = async () => {
    if (!canSubmitCreateForm) {
      return;
    }

    try {
      await createStaffMutation.mutateAsync(createForm);
      toast.success("Staff account created successfully.");
      setIsCreateDialogOpen(false);
      resetCreateDialog();
      setPage(1);
      void accountsQuery.refetch();
    } catch (error) {
      toast.error(getDisplayErrorMessage(error));
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin / Accounts</p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              {activeTab === "customers" ? "Customer directory" : "Staff & Admin directory"}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {activeTab === "staff_admin" && (
              <Button
                type="button"
                className="h-9 gap-2"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add account
              </Button>
            )}
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
        </div>

        <div className="flex border-b border-slate-200">
          <button
            type="button"
            className={`border-b-2 px-6 py-3 text-sm font-semibold transition-all ${
              activeTab === "customers"
                ? "border-sky-600 text-sky-700"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
            onClick={() => handleTabChange("customers")}
          >
            Customers
          </button>
          <button
            type="button"
            className={`border-b-2 px-6 py-3 text-sm font-semibold transition-all ${
              activeTab === "staff_admin"
                ? "border-sky-600 text-sky-700"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
            onClick={() => handleTabChange("staff_admin")}
          >
            Staff & Admin
          </button>
        </div>

        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div className={`grid gap-3 ${activeTab === "customers" ? "md:grid-cols-[minmax(0,1fr)_160px_auto_auto]" : "md:grid-cols-[minmax(0,1fr)_160px_160px_auto_auto]"} md:items-end`}>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-slate-500">Search name</span>
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

              {activeTab === "staff_admin" && (
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-500">Role</span>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm"
                    value={draftFilters.role}
                    onChange={(event) => setDraftFilters((previous) => ({ ...previous, role: event.target.value }))}
                  >
                    <option value="">All Staff & Admin</option>
                    {STAFF_ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {formatEnumLabel(role)}
                      </option>
                    ))}
                  </select>
                </label>
              )}

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
                <h2 className="text-sm font-semibold text-slate-950">
                  {activeTab === "customers" ? "Customer list" : "Staff & Admin list"}
                </h2>
                <p className="text-xs text-slate-500">
                  {isStaffClientFiltering
                    ? `${accounts.length.toLocaleString("en-US")} records`
                    : pagination
                    ? `${pagination.total.toLocaleString("en-US")} records`
                    : "Loading records"}
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
                        <TableHead>{activeTab === "customers" ? "Customer name" : "Name"}</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        {activeTab === "customers" ? (
                          <TableHead>Tier</TableHead>
                        ) : (
                          <TableHead>Role</TableHead>
                        )}
                        <TableHead>Joined date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.map((account) => (
                        <TableRow
                          key={account.accountId}
                          className="cursor-pointer hover:bg-slate-50/70"
                          role="link"
                          tabIndex={0}
                          onClick={() => router.push(`/admin/accounts/${account.accountId}`)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              router.push(`/admin/accounts/${account.accountId}`);
                            }
                          }}
                        >
                          <TableCell>
                            <div className="font-medium text-slate-950">{account.fullName}</div>
                            <div className="text-xs text-slate-500">{shortId(account.accountId)}</div>
                          </TableCell>
                          <TableCell className="text-slate-600">{account.email ?? "No email"}</TableCell>
                          <TableCell className="font-medium text-slate-700">{account.phone}</TableCell>
                          {activeTab === "customers" ? (
                            <TableCell>{formatEnumLabel(account.tier)}</TableCell>
                          ) : (
                            <TableCell>
                              <RoleBadge role={account.role} />
                            </TableCell>
                          )}
                          <TableCell>{formatDate(account.createdAt)}</TableCell>
                          <TableCell>
                            <StatusBadge status={account.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>

            {showPagination && pagination ? (
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

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            resetCreateDialog();
          }
        }}
      >
        <DialogContent className="rounded-[24px] border-slate-200 bg-white p-0 shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:max-w-xl">
          <div className="space-y-6 p-6">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-950">
                Add staff account
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-slate-500">
                Backend currently supports creating staff accounts from the admin directory. The new account will appear in the list right after creation.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Full name"
                value={createForm.fullName}
                onChange={handleCreateFieldChange("fullName")}
                placeholder="Nguyen Van A"
                error={resolveFormError("fullName", createFormErrors.fullName, createStaffMutation.error)}
              />
              <FormField
                label="Phone"
                value={createForm.phone}
                onChange={handleCreateFieldChange("phone")}
                placeholder="0901234567"
                error={resolveFormError("phone", createFormErrors.phone, createStaffMutation.error)}
              />
              <FormField
                label="Email"
                value={createForm.email}
                onChange={handleCreateFieldChange("email")}
                placeholder="staff@auracarcare.vn"
                error={resolveFormError("email", createFormErrors.email, createStaffMutation.error)}
              />
              <FormField
                label="Password"
                value={createForm.password}
                onChange={handleCreateFieldChange("password")}
                placeholder="At least 8 characters"
                type="password"
                error={resolveFormError("password", createFormErrors.password, createStaffMutation.error)}
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              This action creates a live <span className="font-semibold text-slate-900">staff</span> account through `POST /api/v1/admin/staff`.
            </div>

            {createStaffMutation.isError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {getDisplayErrorMessage(createStaffMutation.error)}
              </div>
            ) : null}

            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetCreateDialog();
                }}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleCreateStaff} disabled={!canSubmitCreateForm}>
                {createStaffMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Create staff
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
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

function validateCreateStaffForm(form: CreateAdminStaffPayload) {
  return {
    fullName: form.fullName.trim().length === 0 ? "Full name is required." : null,
    phone: /^0[0-9]{9}$/.test(form.phone.trim()) ? null : "Phone must start with 0 and contain 10 digits.",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? null : "Email must be valid.",
    password: form.password.length >= 8 ? null : "Password must be at least 8 characters.",
  };
}

function resolveFormError(
  fieldName: keyof CreateAdminStaffPayload,
  clientError: string | null,
  apiError: ApiErrorResponse | null,
) {
  return clientError ?? getFieldErrorMessage(apiError?.errors, fieldName);
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  error: string | null;
  type?: "text" | "password";
}) {
  return (
    <label className="space-y-2">
      <Label className="text-sm font-semibold text-slate-800">{label}</Label>
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        className="h-11 rounded-xl border-slate-200 bg-white"
      />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </label>
  );
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

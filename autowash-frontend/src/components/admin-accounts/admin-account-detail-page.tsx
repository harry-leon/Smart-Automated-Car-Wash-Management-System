"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ArrowLeft, Loader2, RefreshCcw, UserCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDisplayErrorMessage } from "@/lib/api-errors";
import { useAdminAccountDetail, useUpdateAdminCustomerRole } from "@/hooks/use-admin-reporting";
import type { AdminEditableAccountRole } from "@/types/admin-reporting.types";

type AdminAccountDetailPageContentProps = {
  accountId: string;
};

const ROLE_OPTIONS: AdminEditableAccountRole[] = ["CUSTOMER", "STAFF", "ADMIN"];

export function AdminAccountDetailPageContent({ accountId }: AdminAccountDetailPageContentProps) {
  const router = useRouter();
  const detailQuery = useAdminAccountDetail(accountId);
  const updateRoleMutation = useUpdateAdminCustomerRole(accountId);
  const [roleDraft, setRoleDraft] = useState<AdminEditableAccountRole>("CUSTOMER");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (detailQuery.data?.role) {
      setRoleDraft(detailQuery.data.role as AdminEditableAccountRole);
    }
  }, [detailQuery.data?.role]);

  const account = detailQuery.data;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin / Accounts</p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Account detail</h1>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="h-9 gap-2">
              <Link href="/admin/accounts">
                <ArrowLeft className="h-4 w-4" />
                Back to list
              </Link>
            </Button>
            <Button type="button" variant="outline" className="h-9 gap-2" onClick={() => void detailQuery.refetch()}>
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {detailQuery.isPending ? (
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <LoadingInline message="Loading account..." />
            </CardContent>
          </Card>
        ) : detailQuery.isError ? (
          <Card className="rounded-md border-rose-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <ErrorInline message={getDisplayErrorMessage(detailQuery.error)} />
            </CardContent>
          </Card>
        ) : !account ? (
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <EmptyInline message="Account not found." />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-5 p-5">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <UserCircle2 className="h-9 w-9" />
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-slate-950">{account.fullName}</h2>
                  <p className="text-sm text-slate-500">{account.phone}</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <StatusBadge value={account.role} />
                    <StatusBadge value={account.status} />
                    <StatusBadge value={account.tier} />
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-200 pt-4 text-sm">
                  <InfoRow label="Email" value={account.email ?? "No email"} />
                  <InfoRow label="Joined" value={formatDateTime(account.createdAt)} />
                  <InfoRow label="Updated" value={formatDateTime(account.updatedAt)} />
                </div>

                <div className="space-y-3 border-t border-slate-200 pt-4">
                  <label className="space-y-1.5">
                    <span className="text-xs font-medium text-slate-500">Account role</span>
                    <select
                      className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm"
                      value={roleDraft}
                      onChange={(event) => setRoleDraft(event.target.value as AdminEditableAccountRole)}
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role}>
                          {formatEnumLabel(role)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button
                    type="button"
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      setFeedback(null);
                      void updateRoleMutation
                        .mutateAsync({ role: roleDraft })
                        .then((result) => {
                          setFeedback("Role updated.");
                          if (result.role !== "CUSTOMER") {
                            router.replace("/admin/accounts");
                          } else {
                            void detailQuery.refetch();
                          }
                        })
                        .catch((error) => {
                          setFeedback(getDisplayErrorMessage(error));
                        });
                    }}
                    disabled={updateRoleMutation.isPending}
                  >
                    {updateRoleMutation.isPending ? "Updating..." : "Update role"}
                  </Button>
                  {feedback ? <p className="text-xs text-slate-600">{feedback}</p> : null}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <h2 className="text-base font-semibold text-slate-950">Account information</h2>
                <div className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  <DetailField label="Full name" value={account.fullName} />
                  <DetailField label="Phone number" value={account.phone} />
                  <DetailField label="Email address" value={account.email ?? "No email"} />
                  <DetailField label="Role" value={<StatusBadge value={account.role} />} />
                  <DetailField label="Status" value={<StatusBadge value={account.status} />} />
                  <DetailField label="Tier" value={<StatusBadge value={account.tier} />} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-950">{value}</span>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const tone = STATUS_TONE[value] ?? "border-slate-300 bg-slate-100 text-slate-700";

  return (
    <Badge className={tone} variant="outline">
      {formatEnumLabel(value)}
    </Badge>
  );
}

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

const STATUS_TONE: Record<string, string> = {
  CUSTOMER: "border-sky-300 bg-sky-100 text-sky-800",
  STAFF: "border-violet-300 bg-violet-100 text-violet-800",
  ADMIN: "border-orange-300 bg-orange-100 text-orange-800",
  GUEST: "border-slate-400 bg-slate-200 text-slate-800",
  ACTIVE: "border-emerald-300 bg-emerald-100 text-emerald-800",
  BLOCKED: "border-rose-300 bg-rose-100 text-rose-800",
  SUSPENDED: "border-amber-300 bg-amber-100 text-amber-800",
  MEMBER: "border-slate-300 bg-slate-100 text-slate-800",
  SILVER: "border-zinc-300 bg-zinc-100 text-zinc-800",
  GOLD: "border-yellow-300 bg-yellow-100 text-yellow-800",
  PLATINUM: "border-indigo-300 bg-indigo-100 text-indigo-800",
};

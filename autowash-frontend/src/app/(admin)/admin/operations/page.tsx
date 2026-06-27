"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, PlayCircle, RefreshCcw, ShieldCheck, TimerReset } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/ui/card";
import { getDisplayErrorMessage } from "@/shared/lib/api-errors";
import {
  createWashSession,
  getEligibleSessionBookings,
  getOperationsQueue,
} from "@/features/operations/lib/operations-service";
import type { ApiErrorResponse } from "@/shared/types/api.types";
import type { CreateWashSessionResponse, EligibleSessionBooking, OperationsQueue } from "@/entities/operations";

export default function AdminOperationsPage() {
  const queryClient = useQueryClient();
  const queueQuery = useQuery<OperationsQueue, ApiErrorResponse>({
    queryKey: ["admin-operations", "queue"],
    queryFn: getOperationsQueue,
  });
  const eligibleBookingsQuery = useQuery<EligibleSessionBooking[], ApiErrorResponse>({
    queryKey: ["admin-operations", "eligible"],
    queryFn: getEligibleSessionBookings,
  });
  const createSessionMutation = useMutation<CreateWashSessionResponse, ApiErrorResponse, string>({
    mutationFn: (bookingId) => createWashSession(bookingId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-operations"] }),
        queryClient.invalidateQueries({ queryKey: ["staff-operations"] }),
      ]);
    },
  });

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/95 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Admin operations</CardTitle>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void queueQuery.refetch();
              void eligibleBookingsQuery.refetch();
            }}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard title="Queue total" value={String(queueQuery.data?.summary.total ?? 0)} />
            <MetricCard title="Checked in" value={String(queueQuery.data?.summary.checkedIn ?? 0)} />
            <MetricCard title="In progress" value={String(queueQuery.data?.summary.inProgress ?? 0)} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-base">Live operations queue</CardTitle>
                <CardDescription>Grouped by current wash-session status.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {queueQuery.isPending ? (
                  <LoadingBox />
                ) : queueQuery.isError ? (
                  <ErrorBox message={getDisplayErrorMessage(queueQuery.error)} />
                ) : (
                  queueQuery.data?.columns.map((column) => (
                    <div key={column.status} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="text-sm font-bold text-slate-900">{column.label}</div>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {column.sessions.length}
                        </span>
                      </div>
                      <div className="grid gap-3">
                        {column.sessions.length === 0 ? (
                          <div className="text-sm text-slate-500">No sessions in this state.</div>
                        ) : (
                          column.sessions.map((session) => (
                            <div key={session.sessionId} className="rounded-xl border border-white bg-white p-4 shadow-sm">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="font-semibold text-slate-900">{session.customerName}</div>
                                <span className="text-xs text-slate-500">{session.bookingDate} {session.bookingTime}</span>
                              </div>
                              <div className="mt-2 text-sm text-slate-600">
                                {session.vehiclePlate} · {session.servicePackage ?? "Wash session"}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-base">Bookings ready for session creation</CardTitle>
                <CardDescription>Create wash sessions directly from confirmed bookings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {eligibleBookingsQuery.isPending ? (
                  <LoadingBox />
                ) : eligibleBookingsQuery.isError ? (
                  <ErrorBox message={getDisplayErrorMessage(eligibleBookingsQuery.error)} />
                ) : !eligibleBookingsQuery.data || eligibleBookingsQuery.data.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    No eligible bookings at the moment.
                  </div>
                ) : (
                  eligibleBookingsQuery.data.map((booking) => {
                    const isCreating =
                      createSessionMutation.isPending &&
                      createSessionMutation.variables === booking.bookingId;

                    return (
                      <div key={booking.bookingId} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-slate-900">{booking.customerName}</div>
                            <div className="mt-1 text-sm text-slate-600">
                              {booking.vehiclePlate} · {booking.bookingDate} {booking.bookingTime}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {booking.estimatedDurationMinutes} min · {booking.finalAmount.toLocaleString("vi-VN")} VND
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isCreating}
                            onClick={async () => {
                              try {
                                await createSessionMutation.mutateAsync(booking.bookingId);
                                toast.success("Wash session created.");
                              } catch (error) {
                                toast.error(getDisplayErrorMessage(error));
                              }
                            }}
                          >
                            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                            Create session
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardContent className="flex items-center gap-3 p-5">
        <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
          <div className="text-2xl font-black text-slate-900">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingBox() {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
      <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {message}
    </div>
  );
}

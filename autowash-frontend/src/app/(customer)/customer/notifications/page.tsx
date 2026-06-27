"use client";

import { Bell, BellRing, CheckCheck, Loader2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/ui/card";
import { getDisplayErrorMessage } from "@/shared/lib/api-errors";
import {
  useCustomerNotifications,
  useMarkCustomerNotificationAsRead,
} from "@/features/notifications/hooks/use-customer-notifications";

export default function CustomerNotificationsPage() {
  const notificationsQuery = useCustomerNotifications();
  const markAsReadMutation = useMarkCustomerNotificationAsRead();

  const unreadCount = notificationsQuery.data?.filter((item) => !item.read).length ?? 0;

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/95 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Notifications</CardTitle>
          </div>
          <div className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-right">
            <div className="text-xs font-semibold uppercase tracking-wide text-teal-700">Unread</div>
            <div className="text-2xl font-black text-slate-900">{unreadCount}</div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={() => notificationsQuery.refetch()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {notificationsQuery.isPending ? (
            <div className="flex min-h-48 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
              <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
            </div>
          ) : notificationsQuery.isError ? (
            <Card className="border-rose-200 bg-white">
              <CardHeader>
                <CardTitle className="text-base">Unable to load notifications</CardTitle>
                <CardDescription>{getDisplayErrorMessage(notificationsQuery.error)}</CardDescription>
              </CardHeader>
            </Card>
          ) : !notificationsQuery.data || notificationsQuery.data.length === 0 ? (
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-base">No notifications yet</CardTitle>
                <CardDescription>Your backend inbox is currently empty.</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4">
              {notificationsQuery.data.map((item) => {
                const isMarking = markAsReadMutation.isPending && markAsReadMutation.variables === item.notificationId;
                return (
                  <Card
                    key={item.notificationId}
                    className={`border-slate-200 bg-white shadow-sm ${item.read ? "opacity-80" : "border-teal-200"}`}
                  >
                    <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 rounded-xl p-2 ${item.read ? "bg-slate-100 text-slate-500" : "bg-teal-50 text-teal-700"}`}>
                          {item.read ? <Bell className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-base font-bold text-slate-900">{item.title}</div>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              {item.type}
                            </span>
                            {!item.read ? (
                              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                New
                              </span>
                            ) : null}
                          </div>
                          <p className="text-sm leading-6 text-slate-600">{item.message}</p>
                          <div className="text-xs text-slate-400">
                            {new Date(item.createdAt).toLocaleString("vi-VN")}
                          </div>
                        </div>
                      </div>
                      <div>
                        {item.read ? (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                            <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
                            Read
                          </span>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isMarking}
                            onClick={async () => {
                              try {
                                await markAsReadMutation.mutateAsync(item.notificationId);
                                toast.success("Notification marked as read.");
                              } catch (error) {
                                toast.error(getDisplayErrorMessage(error));
                              }
                            }}
                          >
                            {isMarking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-2 h-4 w-4" />}
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

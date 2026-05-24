import { createFileRoute } from "@tanstack/react-router";
import { AccessDenied } from "@/components/access-denied";
import { RouteRedirect } from "@/components/route-redirect";
import { useMemo, useState } from "react";
import { canAccess } from "@/lib/access-control";
import { useAppStore, formatRelative, type NotifType } from "@/lib/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bell, CalendarCheck, Clock, Gift, Search, Send, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const typeMeta: Record<
  NotifType,
  { label: string; icon: typeof Bell; classes: string; dot: string }
> = {
  Booking: {
    label: "Success: Booking",
    icon: CalendarCheck,
    classes:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900",
    dot: "bg-emerald-500",
  },
  Reminder: {
    label: "Alert: 1-Hour Reminder",
    icon: Clock,
    classes:
      "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-900",
    dot: "bg-indigo-500",
  },
  Loyalty: {
    label: "Warning: Points Expiry",
    icon: Gift,
    classes:
      "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900",
    dot: "bg-amber-500",
  },
};

export function NotificationsPage() {
  const { role, notifications, pushNotification } = useAppStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | NotifType>("All");

  if (!canAccess(role, ["Staff", "Admin"])) {
    return (
      <div className="p-6 md:p-10">
        <AccessDenied
          title="Notifications are restricted"
          description="Only Staff and Admin roles can access the notification center."
          role={role}
        />
      </div>
    );
  }

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (filter !== "All" && n.type !== filter) return false;
      if (query && !`${n.title} ${n.message}`.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [notifications, query, filter]);

  return (
    <div className="p-4 md:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="mb-8 border-b border-border/50 pb-6">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
            Notification Management Hub
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            System logs of outbound customer notifications and live trigger simulator.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Feed */}
          <Card className="overflow-hidden rounded-[1.5rem] border-border/50 bg-card/60 backdrop-blur-xl shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 bg-muted/20 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background shadow-inner text-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight">Notification Center Feed</h2>
                  <div className="text-xs text-muted-foreground font-medium mt-0.5">
                    Showing {filtered.length} logs
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search logs…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-10 w-full sm:w-64 pl-9 rounded-xl border-border/50 bg-background/50 shadow-sm text-sm transition-all focus:bg-background"
                  />
                </div>
                <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-background/50 p-1 shadow-sm overflow-x-auto">
                  <Filter className="ml-2 mr-1 h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {(["All", "Booking", "Reminder", "Loyalty"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap",
                        filter === f
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <ul className="divide-y divide-border/50">
              {filtered.length === 0 && (
                <li className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/50 shadow-inner">
                      <Search className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <div className="text-sm font-bold text-foreground">
                      No matching notifications.
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Try adjusting your search or filters.
                    </div>
                  </div>
                </li>
              )}
              {filtered.map((n) => {
                const m = typeMeta[n.type];
                const Icon = m.icon;
                return (
                  <li
                    key={n.id}
                    className="group flex gap-5 px-6 py-5 transition-colors hover:bg-primary/5"
                  >
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm transition-transform duration-300 group-hover:scale-110",
                        m.classes,
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <span className="text-base font-bold text-foreground">{n.title}</span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm",
                            m.classes,
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", m.dot)} />
                          {m.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed font-medium">
                        {n.message}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-background/50 px-2 py-1 rounded-md border border-border/50">
                        {formatRelative(n.timestamp)}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* Simulation panel */}
          <Card className="h-fit rounded-[1.5rem] border-border/50 bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 transition-transform duration-700 group-hover:scale-150" />
            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-3 border-b border-border/50 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background shadow-inner text-primary">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Simulator</h2>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">
                    Test real-time events
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <Button
                  className="w-full justify-start gap-3 h-14 rounded-xl font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20 shadow-sm transition-all hover:-translate-y-0.5"
                  onClick={() =>
                    pushNotification({
                      type: "Booking",
                      title: "Booking Confirmed",
                      message: `Booking #B${Math.floor(100 + Math.random() * 900)} confirmed for new customer`,
                    })
                  }
                >
                  <CalendarCheck className="h-5 w-5" />
                  Trigger Booking Confirm
                </Button>
                <Button
                  className="w-full justify-start gap-3 h-14 rounded-xl font-bold bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border border-indigo-500/20 shadow-sm transition-all hover:-translate-y-0.5"
                  onClick={() =>
                    pushNotification({
                      type: "Reminder",
                      title: "Upcoming Wash Alert",
                      message: "Vehicle 30A-998.77 is scheduled in 1 hour",
                    })
                  }
                >
                  <Clock className="h-5 w-5" />
                  Trigger 1-Hr Reminder
                </Button>
                <Button
                  className="w-full justify-start gap-3 h-14 rounded-xl font-bold bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/20 shadow-sm transition-all hover:-translate-y-0.5"
                  onClick={() =>
                    pushNotification({
                      type: "Loyalty",
                      title: "Points Expiry Warning",
                      message: "75 points for Customer Liam Park will expire in 7 days",
                    })
                  }
                >
                  <Gift className="h-5 w-5" />
                  Trigger Points Expiry
                </Button>
              </div>
              <div className="mt-8 rounded-xl border border-dashed border-border/50 bg-background/50 p-4 text-xs font-medium text-muted-foreground shadow-inner text-center leading-relaxed">
                Triggers instantly append to the feed and surface as a toast banner globally.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

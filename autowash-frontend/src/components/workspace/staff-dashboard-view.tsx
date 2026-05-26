"use client";

import Link from "next/link";
import {
  AlertCircle,
  Car,
  ClipboardList,
  Clock3,
  Search,
  UserPlus,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkspaceEmptyState, WorkspacePage } from "@/components/workspace/workspace-page";
import { cn } from "@/lib/utils";

const MOCK_ARRIVALS = [
  { id: "BK-2401", plate: "51H-12345", service: "Premium Wash", time: "09:30", status: "CONFIRMED" },
  { id: "BK-2402", plate: "30A-98765", service: "Quick Rinse", time: "10:00", status: "PENDING" },
];

const MOCK_METRICS = [
  { label: "Queue today", value: "8", icon: ClipboardList, tone: "text-violet-700 bg-violet-50" },
  { label: "In progress", value: "3", icon: Wrench, tone: "text-amber-700 bg-amber-50" },
  { label: "Avg wait", value: "12m", icon: Clock3, tone: "text-sky-700 bg-sky-50" },
  { label: "Completed", value: "14", icon: Car, tone: "text-emerald-700 bg-emerald-50" },
];

export function StaffDashboardView() {
  const [search, setSearch] = useState("");
  const filtered = MOCK_ARRIVALS.filter(
    (item) =>
      item.plate.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <WorkspacePage className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {MOCK_METRICS.map((metric) => (
          <Card key={metric.label} className="border-border/70 bg-card/90 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {metric.label}
                </p>
                <p className="mt-2 text-3xl font-black tracking-tight">{metric.value}</p>
              </div>
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", metric.tone)}>
                <metric.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="overflow-hidden border-border/70 bg-card/90">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/20 px-6 py-4">
            <div>
              <h2 className="text-sm font-bold">Pre-booked arrivals</h2>
              <p className="text-xs text-muted-foreground">Search by plate or booking ID</p>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search arrivals..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-3 p-6">
            {filtered.length === 0 ? (
              <WorkspaceEmptyState
                title="No arrivals found"
                description="Try another plate number or booking ID."
              />
            ) : (
              filtered.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-4"
                >
                  <div>
                    <div className="text-sm font-bold">{booking.plate}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {booking.id} • {booking.service} • {booking.time}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[11px] font-bold text-violet-700">
                      {booking.status}
                    </span>
                    <Button size="sm" asChild>
                      <Link href="/staff/check-in">Check in</Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="border-border/70 bg-card/90 p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold">
            <UserPlus className="h-4 w-4 text-violet-700" />
            Walk-in registration
          </div>
          <p className="text-sm text-muted-foreground">
            Register a walk-in customer and send them to the operations board.
          </p>
          <div className="mt-5 space-y-3">
            <Input placeholder="License plate (e.g. 51H-12345)" />
            <Button className="w-full" asChild>
              <Link href="/staff/check-in">Open check-in</Link>
            </Button>
          </div>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 text-sm text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Live queue data will connect to GET /operations/queue when the backend is ready.</span>
          </div>
        </Card>
      </div>
    </WorkspacePage>
  );
}

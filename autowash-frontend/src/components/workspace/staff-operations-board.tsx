"use client";

import Link from "next/link";
import { Clock3, LoaderCircle, TimerReset, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WorkspaceEmptyState, WorkspacePage } from "@/components/workspace/workspace-page";
import { cn } from "@/lib/utils";

type OperationCard = {
  id: string;
  plate: string;
  service: string;
  meta: string;
  priority: "late" | "soon" | "normal";
};

type OperationColumn = {
  id: string;
  title: string;
  tone: string;
  cards: OperationCard[];
};

const COLUMNS: OperationColumn[] = [
  {
    id: "pending",
    title: "Pending",
    tone: "border-amber-200 bg-amber-50/50",
    cards: [{ id: "WS-01", plate: "51H-77889", service: "Deluxe Wash", meta: "09:15 slot", priority: "soon" }],
  },
  {
    id: "checked-in",
    title: "Checked in",
    tone: "border-violet-200 bg-violet-50/50",
    cards: [
      { id: "WS-02", plate: "30A-11223", service: "Premium Wash", meta: "Bay 2", priority: "normal" },
      { id: "WS-03", plate: "43C-55667", service: "Combo Gold", meta: "Bay 4", priority: "late" },
    ],
  },
  {
    id: "in-progress",
    title: "In progress",
    tone: "border-sky-200 bg-sky-50/50",
    cards: [{ id: "WS-04", plate: "59F-99001", service: "Interior + Wax", meta: "Timer 18:42", priority: "normal" }],
  },
  {
    id: "completed",
    title: "Completed",
    tone: "border-emerald-200 bg-emerald-50/50",
    cards: [{ id: "WS-05", plate: "72E-33445", service: "Quick Rinse", meta: "Awaiting pickup", priority: "normal" }],
  },
];

const PRIORITY_DOT = {
  late: "bg-rose-500",
  soon: "bg-amber-500",
  normal: "bg-emerald-500",
};

export function StaffOperationsBoard() {
  return (
    <WorkspacePage className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={Truck} label="Assigned bays" value="4 / 6" />
        <MetricCard icon={LoaderCircle} label="In progress" value="3" />
        <MetricCard icon={TimerReset} label="Avg cycle" value="28m" />
      </section>

      <section className="overflow-x-auto pb-2">
        <div className="flex min-w-[64rem] gap-4">
          {COLUMNS.map((column) => (
            <div key={column.id} className={cn("w-72 shrink-0 rounded-2xl border p-3", column.tone)}>
              <header className="mb-3 px-1">
                <h2 className="text-sm font-bold">{column.title}</h2>
                <p className="text-xs text-muted-foreground">{column.cards.length} sessions</p>
              </header>
              <div className="space-y-3">
                {column.cards.length === 0 ? (
                  <WorkspaceEmptyState title="No sessions" description="This column is empty." />
                ) : (
                  column.cards.map((card) => (
                    <Card key={card.id} className="border-border/70 bg-card p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold">{card.plate}</div>
                          <div className="mt-1 text-xs text-muted-foreground">{card.service}</div>
                        </div>
                        <span
                          className={cn("mt-1 h-2.5 w-2.5 rounded-full", PRIORITY_DOT[card.priority])}
                          title={card.priority}
                        />
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" />
                        {card.meta}
                      </div>
                      <Button className="mt-4 w-full" size="sm" variant="outline" asChild>
                        <Link href={`/staff/sessions/${card.id}`}>Open session</Link>
                      </Button>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        Queue refresh remains scoped to GET /operations/queue. Red means late, amber means arriving soon, green means on track.
      </p>
    </WorkspacePage>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Truck;
  label: string;
  value: string;
}) {
  return (
    <Card className="flex items-center gap-4 border-border/70 bg-card/95 p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-2xl font-black tracking-tight">{value}</p>
      </div>
    </Card>
  );
}

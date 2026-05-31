"use client";

import Link from "next/link";
import { CarFront, ClipboardCheck, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WorkspacePage } from "@/components/workspace/workspace-page";

const MATCHED_BOOKING = {
  id: "BK-2401",
  plate: "51H-12345",
  customer: "Nguyen Van A",
  service: "Premium Wash",
  time: "09:30",
};

export function StaffCheckInView() {
  const [plate, setPlate] = useState("");
  const hasMatch = plate.trim().length >= 3;

  return (
    <WorkspacePage className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-border/70 bg-card/95 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Search className="h-4 w-4 text-violet-700" />
            Plate lookup
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Search a booking or walk-in vehicle before creating a wash session.
          </p>
          <div className="mt-5 space-y-3">
            <Input
              value={plate}
              onChange={(event) => setPlate(event.target.value.toUpperCase())}
              placeholder="Enter license plate"
              aria-label="License plate"
            />
            <Button className="w-full" type="button">
              <ClipboardCheck className="h-4 w-4" />
              Validate check-in
            </Button>
          </div>
          <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-sm text-violet-950">
            API contract stays POST /operations/wash-sessions/:sessionId/check-in.
          </div>
        </Card>

        <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
          <div className="border-b border-border/60 bg-muted/30 px-6 py-4">
            <div className="flex items-center gap-2 text-sm font-bold">
              <CarFront className="h-4 w-4 text-violet-700" />
              Match preview
            </div>
          </div>
          {hasMatch ? (
            <div className="space-y-4 p-6">
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-black tracking-tight">{plate || MATCHED_BOOKING.plate}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{MATCHED_BOOKING.customer}</div>
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    Ready
                  </span>
                </div>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <Info label="Booking" value={MATCHED_BOOKING.id} />
                  <Info label="Service" value={MATCHED_BOOKING.service} />
                  <Info label="Slot" value={MATCHED_BOOKING.time} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link href="/staff/operations">Send to operations</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/staff/sessions/WS-01">Open session detail</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 text-violet-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-bold">Awaiting plate input</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Type at least three characters to preview a matched booking and continue the staff flow.
              </p>
            </div>
          )}
        </Card>
      </section>
    </WorkspacePage>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2">
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}

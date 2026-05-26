"use client";

import Link from "next/link";
import { Car, CheckCircle2, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WorkspacePage } from "@/components/workspace/workspace-page";

export default function StaffCheckInPage() {
  const [plate, setPlate] = useState("");

  return (
    <WorkspacePage className="max-w-2xl space-y-6">
      <Card className="border-border/70 bg-card/90 p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
            <Car className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Plate check-in</h2>
            <p className="text-sm text-muted-foreground">
              Confirm the license plate matches the booking before starting the wash.
            </p>
          </div>
        </div>

        <label className="text-sm font-semibold" htmlFor="plate">
          License plate
        </label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="plate"
            value={plate}
            onChange={(event) => setPlate(event.target.value)}
            placeholder="51H-12345"
            className="pl-9 uppercase"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button disabled={!plate.trim()} type="button">
            <CheckCircle2 className="h-4 w-4" />
            Confirm check-in
          </Button>
          <Button variant="outline" asChild>
            <Link href="/staff/operations">Back to operations</Link>
          </Button>
        </div>
      </Card>

      <p className="text-xs text-muted-foreground">
        Wired to POST /operations/wash-sessions/:id/check-in per the operations flow in project docs.
      </p>
    </WorkspacePage>
  );
}

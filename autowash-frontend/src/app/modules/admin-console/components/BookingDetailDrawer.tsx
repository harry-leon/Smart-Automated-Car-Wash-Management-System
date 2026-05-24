import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Booking, StaffRecord, WashSessionRecord } from "@/lib/carwash-store";
import { STATUS_TONE } from "./AdminBookingsTable";
import type { BookingStatus } from "../types/dashboard.types";

interface BookingDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  session?: WashSessionRecord | null;
  currentStatus?: BookingStatus | null;
  staffMembers: StaffRecord[];
  onAssignStaff?: (staffId: string) => void;
}

const statusMap: Record<string, string> = {
  Pending: "PENDING",
  Confirmed: "CONFIRMED",
  "Checked-in": "CHECKED_IN",
  Completed: "COMPLETED",
  Cancelled: "CANCELLED",
  "No-show": "NO_SHOW",
};

export function BookingDetailDrawer({
  open,
  onOpenChange,
  booking,
  session,
  currentStatus,
  staffMembers,
  onAssignStaff,
}: BookingDetailDrawerProps) {
  const canAssignStaff = Boolean(
    onAssignStaff && session?.status === "In Progress" && staffMembers.length > 0,
  );
  const normalizedStatus =
    currentStatus ?? (booking ? (statusMap[booking.status] ?? booking.status) : "");
  const assignedStaffId = session?.staffId ?? "";
  const activeStaff = staffMembers.filter((staff) => staff.status === "Active");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Booking details</SheetTitle>
          <SheetDescription>
            Review check-in data, assigned staff and current booking status.
          </SheetDescription>
        </SheetHeader>

        {booking ? (
          <div className="space-y-6 py-4">
            <Card className="border-border/50 bg-card/60 p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Booking code
                    </p>
                    <p className="text-base font-semibold">{booking.id}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`border font-semibold ${STATUS_TONE[normalizedStatus as BookingStatus] ?? "border-muted text-muted-foreground"}`}
                  >
                    {normalizedStatus.replaceAll("_", " ")}
                  </Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Customer
                    </p>
                    <p className="text-sm font-semibold">{booking.customerName ?? "Unknown"}</p>
                    {booking.customerPhone ? (
                      <p className="text-sm text-muted-foreground">{booking.customerPhone}</p>
                    ) : null}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Vehicle
                    </p>
                    <p className="text-sm font-semibold">{booking.vehiclePlate}</p>
                    <p className="text-sm text-muted-foreground">{booking.vehicleType}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Service
                    </p>
                    <p className="text-sm">{booking.services.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Check-in time
                    </p>
                    <p className="text-sm">
                      {booking.checkInAt
                        ? new Date(booking.checkInAt).toLocaleString()
                        : "Not checked in"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-border/50 bg-card/60 p-4">
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Assigned staff
                  </p>
                  {canAssignStaff ? (
                    <Select
                      value={assignedStaffId}
                      onValueChange={(value) => onAssignStaff?.(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={session?.staffName ?? "Select staff"} />
                      </SelectTrigger>
                      <SelectContent>
                        {activeStaff.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {session?.staffName ?? "Not assigned"}
                      </p>
                      {session?.status === "Queued" ? (
                        <p className="text-xs text-muted-foreground">
                          Staff reassignment becomes available once the wash is in progress.
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Scheduled
                  </p>
                  <p className="text-sm">{booking.scheduledAt}</p>
                </div>

                {booking.notes ? (
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Notes
                    </p>
                    <p className="text-sm">{booking.notes}</p>
                  </div>
                ) : null}
              </div>
            </Card>
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No booking selected.
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

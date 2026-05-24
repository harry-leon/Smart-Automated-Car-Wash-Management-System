import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ClipboardCheck, Search } from "lucide-react";
import { AccessDenied } from "@/components/access-denied";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { canAccess } from "@/lib/access-control";
import { useCarwashStore } from "@/lib/carwash-store";
import { OperationsFilters } from "@/app/modules/staff-operations/components/OperationsFilters";
import { OperationsTable } from "@/app/modules/staff-operations/components/OperationsTable";
import {
  filterOperationBookings,
  getOperationHourOptions,
  useOperationBookings,
  useOperationStaffOptions,
} from "@/app/modules/staff-operations/mock/operations.mock";
import type { OperationFilters } from "@/app/modules/staff-operations/types/operations.types";

export const Route = createFileRoute("/staff/check-in")({
  component: () => <StaffCheckInPage />,
});

const defaultFilters: OperationFilters = {
  status: "CONFIRMED",
  time: "ALL",
  hour: "ALL",
  staffId: "ALL",
};

export function StaffCheckInPage() {
  const { role } = useCarwashStore();
  const bookings = useOperationBookings();
  const staffOptions = useOperationStaffOptions();
  const navigate = useNavigate();
  const [filters, setFilters] = React.useState<OperationFilters>(defaultFilters);
  const [query, setQuery] = React.useState("");

  const hourOptions = React.useMemo(() => getOperationHourOptions(bookings), [bookings]);
  const visibleBookings = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return filterOperationBookings(bookings, filters).filter((booking) => {
      if (!normalizedQuery) return true;
      return [
        booking.bookingCode,
        booking.customerName,
        booking.customerPhone,
        booking.vehiclePlate,
        booking.vehicleModel,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [bookings, filters, query]);

  if (!canAccess(role, ["Staff"])) {
    return (
      <div className="p-6 md:p-10">
        <AccessDenied
          title="Check-in access is restricted"
          description="Only Staff roles can process booked arrivals."
          role={role}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="border-b border-border/50 pb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <ClipboardCheck />
            Staff Check-in
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Booking arrivals
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Process confirmed customer bookings and open the synced check-in detail from here.
          </p>
        </div>

        <Card className="rounded-lg border-border/50 bg-card/70 shadow-lg">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative max-w-xl flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search booking, customer, phone, or plate"
                    className="h-11 rounded-lg bg-background/70 pl-10"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFilters(defaultFilters);
                    setQuery("");
                  }}
                  className="h-9 rounded-lg font-bold"
                >
                  Reset
                </Button>
              </div>
              <OperationsFilters
                filters={filters}
                hourOptions={hourOptions}
                staffOptions={staffOptions}
                onChange={setFilters}
              />
              <div className="text-sm text-muted-foreground">
                Showing {visibleBookings.length} of {bookings.length} bookings.
              </div>
            </div>
          </CardContent>
        </Card>

        <OperationsTable
          bookings={visibleBookings}
          onOpenBooking={(id) => navigate({ to: "/staff/checkin/$id", params: { id } })}
        />
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState, type ElementType } from "react";
import {
  Calendar as CalIcon,
  Car,
  Check,
  Droplets,
  Gauge,
  Shield,
  Sparkles,
  Star,
  Wind,
  Zap,
} from "lucide-react";
import {
  fmtBookingMoney,
  BookingStatus,
  useAvailableServices,
  useBookings,
  useCurrentVehicles,
} from "@/lib/booking-store";
import { formatDateISO, useCarwashStore } from "@/lib/carwash-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ICONS: Record<string, ElementType> = {
  Droplets,
  Sparkles,
  Wind,
  Shield,
  Star,
  Car,
  Gauge,
  Zap,
};
const SLOTS = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];
const ACTIVE_STATUSES: BookingStatus[] = ["Pending", "Confirmed", "Checked-in"];

export function CustomerBookingForm({ onBooked }: { onBooked: () => void }) {
  const { addBooking, bookings } = useBookings();
  const { customers, currentCustomerId } = useCarwashStore();
  const vehicles = useCurrentVehicles();
  const services = useAvailableServices();
  const [mounted, setMounted] = useState(false);
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const [serviceIds, setServiceIds] = useState<string[]>(services[0] ? [services[0].id] : []);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [slot, setSlot] = useState<string>("09:00 AM");
  const [notes, setNotes] = useState("");

  const vehicle = vehicles.find((item) => item.id === vehicleId) ?? vehicles[0];
  const currentCustomer = customers.find((item) => item.id === currentCustomerId);
  const isPlatinum = currentCustomer?.tier === "Platinum";
  const selectedServices = services.filter((item) => serviceIds.includes(item.id));
  const dateISO = date ? formatDateISO(date) : "";
  const total = useMemo(
    () => selectedServices.reduce((sum, service) => sum + service.price, 0),
    [selectedServices],
  );
  const blockedSlots = useMemo(() => {
    const counts = new Map<string, number>();
    const platinumLoads = new Set<string>();
    const blocked = new Set<string>();

    bookings
      .filter((booking) => booking.dateISO === dateISO && ACTIVE_STATUSES.includes(booking.status))
      .forEach((booking) => {
        const timeSlot = booking.scheduledAt.split(" ").slice(-2).join(" ");
        counts.set(timeSlot, (counts.get(timeSlot) ?? 0) + 1);
        const bookingCustomer = customers.find((item) => item.id === booking.customerId);
        if (bookingCustomer?.tier === "Platinum") {
          platinumLoads.add(timeSlot);
        }
        if (vehicle && booking.vehiclePlate === vehicle.plate) {
          blocked.add(timeSlot);
        }
      });

    for (const [timeSlot, count] of counts.entries()) {
      if (count >= 3) blocked.add(timeSlot);
      if (!isPlatinum && count >= 2 && !platinumLoads.has(timeSlot)) {
        blocked.add(timeSlot);
      }
    }

    return blocked;
  }, [bookings, customers, dateISO, isPlatinum, vehicle]);
  const firstAvailableSlot = SLOTS.find((item) => !blockedSlots.has(item)) ?? "";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (slot && !blockedSlots.has(slot)) return;
    if (firstAvailableSlot && slot !== firstAvailableSlot) {
      setSlot(firstAvailableSlot);
    }
  }, [blockedSlots, firstAvailableSlot, slot]);

  const toggleService = (id: string) =>
    setServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );

  const confirm = () => {
    if (!vehicle || !date || !slot || serviceIds.length === 0) {
      toast.error("Please complete all booking fields.");
      return;
    }

    const dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    try {
      const id = addBooking({
        vehiclePlate: vehicle.plate,
        vehicleName: vehicle.name,
        vehicleType: vehicle.type,
        services: selectedServices.map((item) => item.name),
        totalPrice: total,
        scheduledAt: `${dateLabel} ${slot}`,
        dateISO,
        status: "Pending",
        notes: notes.trim() || undefined,
      });
      toast.success(`Booking ${id} created and waiting for check-in.`);
      onBooked();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create booking.");
    }
  };

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="rounded-[1.5rem] border-border/50 bg-card/60 p-8 backdrop-blur-xl shadow-lg">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Loading booking options
            </h3>
            <p className="text-sm font-medium text-muted-foreground">
              Preparing available vehicles, services, and booking slots.
            </p>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="rounded-[1.5rem] border-border/50 bg-card/60 p-8 backdrop-blur-xl shadow-lg">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Summary
            </h3>
            <p className="text-sm font-medium text-muted-foreground">
              Loading current booking draft...
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <Card className="rounded-[1.5rem] border-border/50 bg-card/60 p-8 backdrop-blur-xl shadow-lg transition-all hover:shadow-xl">
          <h3 className="mb-6 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
              1
            </span>
            Select Vehicle
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {vehicles.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setVehicleId(item.id)}
                className={cn(
                  "group flex items-center gap-4 rounded-[1.2rem] border-2 p-5 text-left transition-all duration-300",
                  vehicleId === item.id
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10 scale-[1.02]"
                    : "border-border/60 bg-background/50 hover:border-primary/40 hover:bg-accent/40",
                )}
              >
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors",
                    vehicleId === item.id
                      ? "bg-primary text-primary-foreground shadow-inner"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary",
                  )}
                >
                  <Car className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "font-bold truncate",
                      vehicleId === item.id ? "text-primary" : "text-foreground",
                    )}
                  >
                    {item.name}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground mt-1 truncate">
                    {item.type} <span className="mx-1 opacity-50">/</span>{" "}
                    <span className="font-mono bg-background px-1 rounded border border-border/50">
                      {item.plate}
                    </span>
                  </div>
                </div>
                {vehicleId === item.id && (
                  <Check className="h-5 w-5 text-primary shrink-0 drop-shadow-sm" />
                )}
              </button>
            ))}
          </div>
        </Card>

        <Card className="rounded-[1.5rem] border-border/50 bg-card/60 p-8 backdrop-blur-xl shadow-lg transition-all hover:shadow-xl">
          <h3 className="mb-6 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
              4
            </span>
            Notes
          </h3>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Special instructions for staff..."
            className="min-h-28 rounded-xl border-border/50 bg-background/50 text-sm shadow-sm"
          />
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            Inappropriate words are automatically masked as *** before the note is saved.
          </p>
        </Card>

        <Card className="rounded-[1.5rem] border-border/50 bg-card/60 p-8 backdrop-blur-xl shadow-lg transition-all hover:shadow-xl">
          <h3 className="mb-6 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
              2
            </span>
            Choose Services
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = ICONS[service.icon] ?? Sparkles;
              const active = serviceIds.includes(service.id);
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggleService(service.id)}
                  className={cn(
                    "group flex flex-col rounded-[1.2rem] border-2 p-5 text-left transition-all duration-300 relative overflow-hidden",
                    active
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                      : "border-border/60 bg-background/50 hover:border-primary/40 hover:bg-accent/40 hover:-translate-y-0.5",
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-300",
                      active ? "opacity-100" : "group-hover:opacity-50",
                    )}
                  />
                  <div className="relative z-10 flex flex-col items-start">
                    <div
                      className={cn(
                        "mb-3 flex h-10 w-10 items-center justify-center rounded-xl shadow-inner transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10 text-primary group-hover:bg-primary/20",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className={cn("font-bold", active ? "text-primary" : "text-foreground")}>
                      {service.name}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-muted-foreground">
                      {fmtBookingMoney(service.price)}
                    </div>
                  </div>
                  {active && <Check className="absolute top-5 right-5 h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="rounded-[1.5rem] border-border/50 bg-card/60 p-8 backdrop-blur-xl shadow-lg transition-all hover:shadow-xl">
          <h3 className="mb-6 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
              3
            </span>
            Pick Date & Time
          </h3>
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <div className="flex justify-center rounded-[1.2rem] border border-border/50 bg-background/50 p-4 shadow-sm">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full max-w-sm"
                classNames={{
                  day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-sm",
                  day_today: "bg-accent text-accent-foreground font-bold",
                }}
              />
            </div>
            <div className="min-w-0 flex flex-col">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                <CalIcon className="h-4 w-4 text-primary" /> Available slots
              </div>
              <div className="grid grid-cols-2 gap-3 flex-1">
                {SLOTS.map((item) => {
                  const unavailable = blockedSlots.has(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      disabled={unavailable}
                      onClick={() => setSlot(item)}
                      className={cn(
                        "rounded-xl border-2 py-3 text-sm font-bold transition-all duration-300",
                        unavailable
                          ? "cursor-not-allowed border-border/50 bg-muted/50 text-muted-foreground/40 line-through"
                          : slot === item
                            ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                            : "border-border/60 bg-background/50 text-foreground hover:border-primary/40 hover:bg-accent/40",
                      )}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
              {!firstAvailableSlot && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-sm font-semibold text-rose-600 border border-rose-200/50">
                  No valid slots remain for this vehicle on the selected date.
                </div>
              )}
              {!isPlatinum && (
                <div className="mt-4 rounded-lg border border-amber-200/60 bg-amber-500/10 p-3 text-xs font-semibold text-amber-700">
                  One bay per slot is reserved for Platinum priority when not yet claimed.
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-6 rounded-[1.5rem] border-border/50 bg-card/60 p-8 backdrop-blur-xl shadow-xl transition-all hover:shadow-2xl">
          <h3 className="mb-6 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Summary
          </h3>
          <div className="space-y-5 text-sm">
            <div className="rounded-xl border border-border/50 bg-background/50 p-4 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Customer
              </div>
              <div className="font-bold text-base text-foreground truncate">
                {currentCustomer?.name ?? "Current customer"}
              </div>
              <div className="font-mono text-muted-foreground mt-0.5 text-xs">
                {currentCustomer?.phone ?? "-"}
              </div>
            </div>
            <div className="rounded-xl border border-border/50 bg-background/50 p-4 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Vehicle
              </div>
              <div className="font-bold text-base text-foreground truncate">{vehicle?.name}</div>
              <div className="font-mono text-primary mt-0.5 text-sm">{vehicle?.plate}</div>
            </div>
            <div className="rounded-xl border border-border/50 bg-background/50 p-4 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Scheduled
              </div>
              <div className="font-bold text-base text-foreground">
                {date?.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <div className="font-bold text-primary mt-0.5">{slot}</div>
            </div>
            <div className="rounded-xl border border-border/50 bg-accent/20 p-4 shadow-sm">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">
                Services
              </div>
              {selectedServices.length === 0 && (
                <div className="italic text-muted-foreground font-medium text-xs">
                  None selected
                </div>
              )}
              <div className="space-y-2">
                {selectedServices.map((service) => (
                  <div key={service.id} className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-foreground/90">{service.name}</span>
                    <span className="font-bold text-muted-foreground">
                      {fmtBookingMoney(service.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-end border-t border-border/50 pt-5 px-1 text-base">
              <span className="font-bold text-foreground">Total</span>
              <span className="text-2xl font-black text-primary tracking-tight">
                {fmtBookingMoney(total)}
              </span>
            </div>
          </div>
          <Button
            className="mt-8 w-full rounded-xl h-12 font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
            size="lg"
            onClick={confirm}
            disabled={!vehicle || !date || !slot || serviceIds.length === 0 || !firstAvailableSlot}
          >
            Confirm Booking
          </Button>
        </Card>
      </div>
    </div>
  );
}

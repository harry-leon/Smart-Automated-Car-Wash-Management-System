import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Bike, Car, CarFront, Check, Truck, User } from "lucide-react";
import { toast } from "sonner";
import { AccessDenied } from "@/components/access-denied";
import { RouteRedirect } from "@/components/route-redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { canAccess } from "@/lib/access-control";
import { useCarwashStore } from "@/lib/carwash-store";
import { cn } from "@/lib/utils";
import { GUEST, fmtMoney, useWashStore } from "@/lib/wash-store";

const VEHICLES = [
  { id: "Sedan", label: "Sedan", icon: Car },
  { id: "SUV", label: "SUV", icon: CarFront },
  { id: "Truck", label: "Truck", icon: Truck },
  { id: "Motorbike", label: "Motorbike", icon: Bike },
];

export function WashSessionPage() {
  const { role } = useCarwashStore();
  const { customers, draft, setDraft } = useWashStore();
  const navigate = useNavigate();
  const [customerId, setCustomerId] = React.useState<string>(
    draft?.customer.id ?? customers[0]?.id ?? "guest",
  );
  const [vehicleType, setVehicleType] = React.useState<string>(draft?.vehicleType ?? "Sedan");
  const [plate, setPlate] = React.useState<string>(draft?.plate ?? "");
  const [selectedServices, setSelectedServices] = React.useState<string[]>(
    draft?.services.map((service) => service.id) ?? [],
  );

  const serviceCatalog = [
    { id: "basic", name: "Basic Wash", price: 120000 },
    { id: "premium", name: "Premium Detail", price: 280000 },
    { id: "vacuum", name: "Interior Vacuum", price: 60000 },
    { id: "ceramic", name: "Ceramic Coating", price: 450000 },
  ];

  const customer = customers.find((item) => item.id === customerId) ?? GUEST;
  const services = serviceCatalog.filter((service) => selectedServices.includes(service.id));
  const subtotal = services.reduce((sum, service) => sum + service.price, 0);

  if (!canAccess(role, ["Staff"])) {
    return (
      <div className="p-6 md:p-10">
        <AccessDenied
          title="Wash session access is restricted"
          description="Only Staff roles can prepare a wash session."
          role={role}
        />
      </div>
    );
  }

  const handleProceed = () => {
    if (!plate.trim() || services.length === 0) {
      toast.error("Please capture plate and service package before checkout.");
      return;
    }

    setDraft({
      bookingId: draft?.bookingId,
      customer,
      vehicleType,
      plate: plate.trim().toUpperCase(),
      services,
      walkIn: draft?.walkIn,
    });
    navigate({ to: "/staff/checkout" });
  };

  return (
    <div className="p-4 md:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 border-b border-border/50 pb-6">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
            Wash session processing
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Confirm the checked-in vehicle, selected services and session subtotal before checkout.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section className="rounded-[1.5rem] border border-border/50 bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10">
                <h3 className="mb-6 text-lg font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Customer
                </h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">
                      Select customer
                    </Label>
                    <Select value={customerId} onValueChange={setCustomerId}>
                      <SelectTrigger className="h-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm shadow-sm font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/50">
                        {customers.map((item) => (
                          <SelectItem
                            key={item.id}
                            value={item.id}
                            className="rounded-lg font-medium"
                          >
                            <span className="flex items-center gap-2">{item.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-background/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:shadow-md hover:bg-background/80">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Selected
                    </div>
                    <div className="mt-1 text-base font-bold text-foreground">{customer.name}</div>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                      {customer.tier} / {customer.points} pts
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-border/50 bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              <div className="relative z-10">
                <h3 className="mb-6 text-lg font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  Vehicle
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {VEHICLES.map((vehicle) => {
                    const active = vehicleType === vehicle.id;
                    const Icon = vehicle.icon;
                    return (
                      <button
                        key={vehicle.id}
                        type="button"
                        onClick={() => setVehicleType(vehicle.id)}
                        className={cn(
                          "flex flex-col items-center gap-3 rounded-xl border p-4 transition-all duration-300",
                          active
                            ? "border-primary bg-primary/5 ring-2 ring-primary/30 shadow-md scale-105"
                            : "border-border/50 bg-background/50 hover:border-primary/40 hover:bg-background hover:-translate-y-1 hover:shadow-sm",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-8 w-8 transition-colors",
                            active ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        <span className="text-sm font-bold">{vehicle.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-8 space-y-2">
                  <Label htmlFor="plate" className="text-xs font-bold uppercase tracking-wider">
                    License plate
                  </Label>
                  <Input
                    id="plate"
                    placeholder="e.g. 79A-12345"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    className="h-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm font-mono text-base font-bold uppercase tracking-widest shadow-sm transition-all focus:bg-background"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-border/50 bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-lg">
              <h3 className="mb-6 text-lg font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                Services
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {serviceCatalog.map((service) => {
                  const active = selectedServices.includes(service.id);
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() =>
                        setSelectedServices((prev) =>
                          prev.includes(service.id)
                            ? prev.filter((id) => id !== service.id)
                            : [...prev, service.id],
                        )
                      }
                      className={cn(
                        "flex items-center justify-between rounded-xl border p-5 text-left transition-all duration-300",
                        active
                          ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/30"
                          : "border-border/50 bg-background/50 hover:border-primary/40 hover:bg-background hover:-translate-y-0.5 hover:shadow-sm",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-md border transition-colors",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/30",
                          )}
                        >
                          {active && <Check className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground">{service.name}</div>
                          <div className="text-xs font-medium text-muted-foreground mt-0.5">
                            Admin-configured
                          </div>
                        </div>
                      </div>
                      <div className="text-base font-bold text-primary">
                        {fmtMoney(service.price)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <div>
            <div className="sticky top-6 rounded-[1.5rem] border border-border/50 bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-xl">
              <div className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border/50 pb-4 mb-4">
                Summary
              </div>
              <div className="space-y-3">
                <Row label="Customer" value={customer.name} />
                <Row label="Vehicle" value={vehicleType} />
                <Row
                  label="Plate"
                  value={plate ? plate.toUpperCase() : "-"}
                  className="font-mono tracking-wider"
                />
                <Row label="Services" value={String(services.length)} />
              </div>
              <div className="mt-6 space-y-2 border-t border-border/50 pt-6">
                {services.map((service) => (
                  <div key={service.id} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">{service.name}</span>
                    <span className="font-bold">{fmtMoney(service.price)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-end justify-between border-t border-border/50 pt-6">
                <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Initial total
                </span>
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  {fmtMoney(subtotal)}
                </span>
              </div>
              <Button
                className="mt-8 w-full h-12 rounded-xl text-base font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                size="lg"
                onClick={handleProceed}
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground font-medium">{label}</span>
      <span className={cn("font-bold text-foreground", className)}>{value}</span>
    </div>
  );
}

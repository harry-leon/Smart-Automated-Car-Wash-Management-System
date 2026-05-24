import * as React from "react";
import { ArrowLeft, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCarwashStore } from "@/lib/carwash-store";
import { CustomerProfilePanel } from "../components/CustomerProfilePanel";
import { CustomerVehiclesTab } from "../components/CustomerVehiclesTab";
import { CustomerBookingsTab } from "../components/CustomerBookingsTab";
import { CustomerWashHistoryTab } from "../components/CustomerWashHistoryTab";
import { CustomerPointsTab } from "../components/CustomerPointsTab";
import { CustomerTierHistoryTab } from "../components/CustomerTierHistoryTab";
import {
  bookingToDisplay,
  completedBookingToHistory,
  displayStatusToStore,
  ledgerEntryToPointTx,
  statusToDisplay,
  storeCustomersToRows,
  tierToDisplay,
  vehicleToDisplay,
} from "../lib/customer-mapping";
import type { CustomerRole, CustomerStatus, TierHistoryItem } from "../types/customer.types";
import styles from "../styles/customers.module.css";

interface Props {
  customerId: string;
  onBack?: () => void;
}

export function CustomerDetailPage({ customerId, onBack }: Props) {
  const { customers, ledger, bookings, vehiclesByCustomer, tierHistory, updateCustomerById } =
    useCarwashStore();

  const customerRecord = customers.find((row) => row.id === customerId);
  const customer = React.useMemo(() => {
    if (!customerRecord) return undefined;
    return storeCustomersToRows([customerRecord], ledger)[0];
  }, [customerRecord, ledger]);

  const [draftRole, setDraftRole] = React.useState<CustomerRole>("CUSTOMER");
  const [draftStatus, setDraftStatus] = React.useState<CustomerStatus>("ACTIVE");

  React.useEffect(() => {
    if (customer) {
      setDraftRole(customer.role);
      setDraftStatus(customer.status);
    }
  }, [customer]);

  const vehicles = React.useMemo(
    () => (vehiclesByCustomer[customerId] ?? []).map(vehicleToDisplay),
    [vehiclesByCustomer, customerId],
  );

  const customerBookings = React.useMemo(
    () =>
      bookings
        .filter((booking) => booking.customerId === customerId)
        .sort(
          (a, b) =>
            new Date(`${b.dateISO} ${b.timeSlot}`).getTime() -
            new Date(`${a.dateISO} ${a.timeSlot}`).getTime(),
        )
        .map(bookingToDisplay),
    [bookings, customerId],
  );

  const history = React.useMemo(
    () =>
      bookings
        .filter((booking) => booking.customerId === customerId && booking.status === "Completed")
        .sort(
          (a, b) =>
            new Date(b.completedAt ?? b.dateISO).getTime() -
            new Date(a.completedAt ?? a.dateISO).getTime(),
        )
        .map(completedBookingToHistory),
    [bookings, customerId],
  );

  const points = React.useMemo(() => {
    const entries = ledger
      .filter((entry) => entry.customerId === customerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(ledgerEntryToPointTx);

    let running = customerRecord?.points ?? 0;
    return entries.map((tx) => {
      const out = { ...tx, availableAfter: running, lifetimeAfter: running };
      running = Math.max(0, running - tx.amount);
      return out;
    });
  }, [ledger, customerId, customerRecord?.points]);

  const tierHistoryForCustomer = React.useMemo<TierHistoryItem[]>(() => {
    if (!customerRecord) return [];
    return tierHistory
      .filter((entry) => entry.customerName === customerRecord.name)
      .map((entry) => ({
        id: entry.id,
        customerId: customerRecord.id,
        customerName: entry.customerName,
        fromTier: tierToDisplay(entry.previousTier),
        toTier: tierToDisplay(entry.newTier),
        changedAt: entry.date,
        reason: entry.trigger,
      }));
  }, [tierHistory, customerRecord]);

  if (!customer || !customerRecord) {
    return (
      <div className="p-6 md:p-10">
        <div className="rounded-2xl border border-border/50 bg-card/60 p-8 text-center backdrop-blur-xl">
          <p className="text-sm text-muted-foreground">Customer not found.</p>
          {onBack ? (
            <Button variant="outline" className="mt-4 gap-2" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" /> Back to list
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  const handleRoleChange = (next: CustomerRole) => {
    setDraftRole(next);
    toast.info("Role overrides are not persisted in this prototype.");
  };

  const handleStatusChange = (next: CustomerStatus) => {
    setDraftStatus(next);
    const nextStatus = displayStatusToStore(next);
    updateCustomerById(customerRecord.id, { status: nextStatus });
    toast.success(
      next === "ACTIVE"
        ? `${customerRecord.name} is now active.`
        : `${customerRecord.name} has been suspended.`,
    );
  };

  // Reflect any external status updates back into the draft
  React.useEffect(() => {
    if (customerRecord) {
      setDraftStatus(statusToDisplay(customerRecord.status));
    }
  }, [customerRecord]);

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-md">
              <UserCircle2 className="h-3.5 w-3.5" /> Customer detail
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {customer.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              ID: <span className="font-mono">{customer.id}</span>
            </p>
          </div>
          {onBack ? (
            <Button variant="outline" className="gap-2" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" /> Back to list
            </Button>
          ) : null}
        </div>

        <div className={styles.profileGrid}>
          <CustomerProfilePanel
            customer={customer}
            draftRole={draftRole}
            draftStatus={draftStatus}
            onRoleChange={handleRoleChange}
            onStatusChange={handleStatusChange}
          />

          <Tabs defaultValue="profile">
            <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-card/60 p-1 backdrop-blur-xl">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="wash-history">Wash History</TabsTrigger>
              <TabsTrigger value="points">Point Transactions</TabsTrigger>
              <TabsTrigger value="tiers">Tier History</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-4">
              <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-xl">
                <div className="grid gap-4 sm:grid-cols-2">
                  <ProfileField label="Full name" value={customer.name} />
                  <ProfileField label="Email" value={customer.email} />
                  <ProfileField label="Phone" value={customer.phone} mono />
                  <ProfileField label="Joined" value={customer.joinedAt} />
                  <ProfileField label="Tier" value={customer.tier} />
                  <ProfileField
                    label="Available points"
                    value={customer.availablePoints.toLocaleString("vi-VN")}
                  />
                  <ProfileField
                    label="Lifetime points"
                    value={customer.lifetimePoints.toLocaleString("vi-VN")}
                  />
                  <ProfileField label="Role" value={draftRole} />
                  <ProfileField label="Status" value={draftStatus} />
                </div>
                <p className="mt-6 text-xs text-muted-foreground">
                  Status changes persist to the shared store. Role overrides are local to this view
                  in this prototype.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="vehicles" className="mt-4">
              <CustomerVehiclesTab vehicles={vehicles} />
            </TabsContent>

            <TabsContent value="bookings" className="mt-4">
              <CustomerBookingsTab bookings={customerBookings} />
            </TabsContent>

            <TabsContent value="wash-history" className="mt-4">
              <CustomerWashHistoryTab history={history} />
            </TabsContent>

            <TabsContent value="points" className="mt-4">
              <CustomerPointsTab transactions={points} />
            </TabsContent>

            <TabsContent value="tiers" className="mt-4">
              <CustomerTierHistoryTab history={tierHistoryForCustomer} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/40 p-4">
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={`mt-1.5 text-sm font-semibold text-foreground ${mono ? "font-mono" : ""}`}>
        {value}
      </div>
    </div>
  );
}

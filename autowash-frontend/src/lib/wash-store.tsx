import {
  useCarwashStore,
  Service,
  SessionDraft,
  Transaction,
  formatMoney,
} from "@/lib/carwash-store";

export type { Service, Transaction };

export const GUEST = {
  id: "guest",
  name: "Guest",
  tier: "Guest" as const,
  discountPct: 0,
  points: 0,
};

export function useWashStore() {
  const store = useCarwashStore();
  const visibleTransactions =
    store.role === "Customer"
      ? store.transactions.filter(
          (transaction) => transaction.customer.id === store.currentCustomerId,
        )
      : store.transactions;
  return {
    customers: store.customers.map((customer) => {
      const rule = store.tiers.find((tier) => tier.name === customer.tier);
      return {
        id: customer.id,
        name: customer.name,
        tier: customer.tier,
        discountPct: rule?.discountPercent ?? 0,
        points: customer.points,
      };
    }),
    draft: store.sessionDraft
      ? {
          sessionId: store.sessionDraft.sessionId,
          bookingId: store.sessionDraft.bookingId,
          staffId: store.sessionDraft.staffId,
          staffName: store.sessionDraft.staffName,
          customer: {
            id: store.sessionDraft.customerId,
            name: store.sessionDraft.customerName,
            tier: store.sessionDraft.customerTier,
            discountPct:
              store.tiers.find((tier) => tier.name === store.sessionDraft.customerTier)
                ?.discountPercent ?? 0,
            points: store.sessionDraft.customerPoints,
            multiplier:
              store.tiers.find((tier) => tier.name === store.sessionDraft.customerTier)
                ?.multiplier ?? 1,
          },
          vehicleType: store.sessionDraft.vehicleType,
          plate: store.sessionDraft.plate,
          services: store.sessionDraft.services,
          walkIn: store.sessionDraft.walkIn,
        }
      : null,
    setDraft: (
      draft: {
        bookingId?: string;
        customer: {
          id: string;
          name: string;
          tier: "Member" | "Silver" | "Gold" | "Platinum" | "Guest";
          discountPct: number;
          points: number;
          multiplier?: number;
        };
        vehicleType: string;
        plate: string;
        services: Service[];
        walkIn?: boolean;
      } | null,
    ) =>
      store.createOrUpdateSessionDraft(
        draft
          ? ({
              sessionId: store.sessionDraft?.sessionId ?? "",
              bookingId: draft.bookingId,
              staffId: store.sessionDraft?.staffId ?? "",
              staffName: store.sessionDraft?.staffName ?? "",
              customerId: draft.customer.id,
              customerName: draft.customer.name,
              customerTier: draft.customer.tier,
              customerPoints: draft.customer.points,
              vehicleType: draft.vehicleType as SessionDraft["vehicleType"],
              plate: draft.plate,
              services: draft.services,
              walkIn: draft.walkIn,
            } satisfies SessionDraft)
          : null,
      ),
    lastTransaction: store.lastTransaction,
    transactions: visibleTransactions,
    promotions: store.promotions,
    servicesCatalog: store.services,
    staffAvailability: store.staffAvailability,
    assignStaffToSession: store.assignStaffToSession,
    completeCheckout: store.completeCheckout,
    updateCustomerPoints: store.updateCustomerPoints,
  };
}

export function fmtMoney(n: number) {
  return formatMoney(n);
}

export const SERVICES = [] as Service[];
export const PROMOS = {} as Record<string, { type: "flat" | "pct"; value: number; label: string }>;

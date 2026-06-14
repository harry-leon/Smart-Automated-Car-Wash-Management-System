import { useCarwashStore, NotificationType, Role } from "@/shared/store/carwash-store";

export type NotifType = NotificationType;

export function useAppStore() {
  const store = useCarwashStore();
  return {
    role: store.role,
    setRole: (role: Role) => store.setRole(role),
    customers: store.customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      points: customer.points,
    })),
    notifications: store.notifications,
    pushNotification: store.pushNotification,
    adjustments: store.adjustments,
    addAdjustment: store.addAdjustment,
  };
}

export function formatRelative(d: Date) {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

import { apiRequest } from "@/shared/lib/api";
import type { CustomerNotification } from "@/entities/notifications";

export function listCustomerNotifications() {
  return apiRequest<CustomerNotification[]>({
    method: "GET",
    url: "/customers/notifications",
  });
}

export function markCustomerNotificationAsRead(notificationId: string) {
  return apiRequest<CustomerNotification>({
    method: "PUT",
    url: `/customers/notifications/${notificationId}/read`,
  });
}

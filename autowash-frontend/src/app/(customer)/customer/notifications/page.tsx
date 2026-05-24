import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function CustomerNotificationsPage() {
  return (
    <WorkspacePlaceholder
      workspace="Customer"
      title="Notifications"
      description="Notification center shell using the customer-scoped backend contract."
      endpoints={[
        "GET /customers/notifications",
        "PUT /customers/notifications/:notificationId/read"
      ]}
    />
  );
}

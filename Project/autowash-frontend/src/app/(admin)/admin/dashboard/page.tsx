import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function AdminDashboardPage() {
  return (
    <WorkspacePlaceholder
      workspace="Admin"
      title="Admin dashboard"
      description="KPI dashboard shell for bookings, revenue, customers, and operations health."
      endpoints={["GET /admin/dashboard/metrics"]}
    />
  );
}

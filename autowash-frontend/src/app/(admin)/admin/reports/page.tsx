import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function AdminReportsPage() {
  return (
    <WorkspacePlaceholder
      workspace="Admin"
      title="Reports"
      description="Reporting shell for revenue, bookings, staff wash counts, and date filters."
      endpoints={["GET /admin/reports/:reportType"]}
    />
  );
}

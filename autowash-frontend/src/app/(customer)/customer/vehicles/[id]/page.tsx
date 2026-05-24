import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function VehicleDetailPage({ params }: { params: { id: string } }) {
  return (
    <WorkspacePlaceholder
      workspace="Customer"
      title={`Vehicle ${params.id}`}
      description="Vehicle detail shell for customer vehicle management."
      endpoints={["GET /customers/vehicles/:vehicleId", "PUT /customers/vehicles/:vehicleId"]}
    />
  );
}

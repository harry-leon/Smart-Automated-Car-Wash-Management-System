import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function AddVehiclePage() {
  return (
    <WorkspacePlaceholder
      workspace="Customer"
      title="Add vehicle"
      description="Vehicle creation shell with client-side plate validation."
      endpoints={["POST /customers/vehicles"]}
    />
  );
}

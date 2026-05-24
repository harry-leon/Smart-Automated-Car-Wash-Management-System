import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function CustomerVehiclesPage() {
  return (
    <WorkspacePlaceholder
      workspace="Customer"
      title="Vehicles"
      description="Vehicle list shell for customer-owned vehicles."
      endpoints={["GET /customers/vehicles"]}
      links={[{ href: "/customer/vehicles/add", label: "Add vehicle" }]}
    />
  );
}

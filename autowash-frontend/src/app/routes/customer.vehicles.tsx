import { createFileRoute } from "@tanstack/react-router";
import { VehicleFormPage } from "@/app/modules/customer-booking/pages/VehicleFormPage";
import { VehiclesPage } from "@/app/modules/customer-booking/pages/VehiclesPage";

type VehicleSearch = { editId?: string };

export const Route = createFileRoute("/customer/vehicles")({
  validateSearch: (search: Record<string, unknown>): VehicleSearch => ({
    editId: typeof search.editId === "string" ? search.editId : undefined,
  }),
  component: VehiclesRoute,
});

function VehiclesRoute() {
  const { editId } = Route.useSearch();

  if (editId) {
    return <VehicleFormPage vehicleId={editId} />;
  }

  return <VehiclesPage />;
}

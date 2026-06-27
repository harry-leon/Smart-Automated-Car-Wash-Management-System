import { CustomerVehicleDetailClientPage } from "@/features/vehicles/components/vehicle-pages";

export default function VehicleDetailPage({ params }: { params: { id: string } }) {
  return <CustomerVehicleDetailClientPage vehicleId={params.id} />;
}

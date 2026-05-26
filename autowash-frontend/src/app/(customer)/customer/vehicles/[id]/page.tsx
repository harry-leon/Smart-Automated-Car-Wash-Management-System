import { CustomerVehicleDetailClientPage } from "@/components/customer-vehicles/vehicle-pages";

export default function VehicleDetailPage({ params }: { params: { id: string } }) {
  return <CustomerVehicleDetailClientPage vehicleId={params.id} />;
}

import { Link, useNavigate } from "@tanstack/react-router";
import { VehicleForm } from "../components/VehicleForm";
import { useCustomerBooking } from "../routes";
import type { VehicleFormValues } from "../types/vehicle.types";
import styles from "../styles/vehicles.module.css";

interface VehicleFormPageProps {
  vehicleId?: string;
  onDone?: () => void;
}

export function VehicleFormPage({ vehicleId, onDone }: VehicleFormPageProps) {
  const { addVehicle, updateVehicle, vehicles } = useCustomerBooking();
  const navigate = useNavigate();
  const vehicle = vehicleId ? vehicles.find((item) => item.id === vehicleId) : undefined;
  const isEditing = Boolean(vehicleId);

  const handleSubmit = (values: VehicleFormValues) => {
    if (vehicleId) {
      updateVehicle(vehicleId, values);
    } else {
      addVehicle(values);
    }

    if (onDone) {
      onDone();
      return;
    }

    navigate({ to: "/customer/vehicles" });
  };

  const handleCancel = () => {
    if (onDone) {
      onDone();
      return;
    }

    navigate({ to: "/customer/vehicles" });
  };

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span>{isEditing ? "Edit vehicle" : "New vehicle"}</span>
          <h1>{isEditing ? "Update vehicle details" : "Add a vehicle"}</h1>
          <p>
            Brand and model selection automatically locks the vehicle type for consistent booking
            data.
          </p>
        </div>
      </header>
      {isEditing && !vehicle ? (
        <section className={styles.emptyState}>
          <h2>Vehicle not found</h2>
          <Link to="/customer/vehicles">Back to vehicles</Link>
        </section>
      ) : (
        <VehicleForm vehicle={vehicle} onSubmit={handleSubmit} onCancel={handleCancel} />
      )}
    </main>
  );
}

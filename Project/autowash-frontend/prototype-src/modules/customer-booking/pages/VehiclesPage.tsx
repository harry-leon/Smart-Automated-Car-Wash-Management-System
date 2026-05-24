import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { VehicleCard } from "../components/VehicleCard";
import { VehicleFormPage } from "./VehicleFormPage";
import { useCustomerBooking } from "../routes";
import { vehicleImageFallbackByType } from "../mock/vehicles.mock";
import type { BookingStatus } from "../types/booking.types";
import type { Vehicle } from "../types/vehicle.types";
import styles from "../styles/vehicles.module.css";

const activeBookingStatuses: BookingStatus[] = ["CONFIRMED", "CHECKED_IN", "IN_PROGRESS"];

export function VehiclesPage() {
  const { activeCombo, bookings, deleteVehicle, language, setDefaultVehicle, vehicles } =
    useCustomerBooking();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const copy =
    language === "vi"
      ? {
          eyebrow: "Garage khách hàng",
          title: "Xe sẵn sàng để đặt lịch",
          description:
            "Quản lý biển số, mẫu xe, xe mặc định và combo liên kết để mỗi lần đặt lịch đi đúng luồng dịch vụ.",
          add: "Thêm xe",
          defaultVehicle: "Xe thanh toán mặc định",
          notSelected: "Chưa chọn",
          defaultHint: "được chọn sẵn trong luồng đặt lịch.",
          setDefaultHint: "Chọn một xe làm mặc định để đặt lịch nhanh hơn.",
          total: "Tổng số xe",
          active: "Đang có lịch",
          combo: "Có combo",
        }
      : {
          eyebrow: "Customer garage",
          title: "Vehicles ready for booking",
          description:
            "Keep plate, model, default checkout vehicle, and combo linkage accurate so every wash booking starts with the right service logic.",
          add: "Add vehicle",
          defaultVehicle: "Default checkout vehicle",
          notSelected: "Not selected",
          defaultHint: "is preselected in the booking flow.",
          setDefaultHint: "Set a default vehicle to shorten the booking flow.",
          total: "Total vehicles",
          active: "With active booking",
          combo: "Combo linked",
        };

  const handleEdit = (vehicleId: string) => {
    navigate({ to: "/customer/vehicles", search: { editId: vehicleId } });
  };

  if (isAdding) {
    return <VehicleFormPage onDone={() => setIsAdding(false)} />;
  }

  const defaultVehicle = vehicles.find((vehicle) => vehicle.isDefault);
  const vehiclesWithBooking = vehicles.filter((vehicle) =>
    bookings.some(
      (booking) =>
        booking.vehicle.vehicleId === vehicle.id && activeBookingStatuses.includes(booking.status),
    ),
  );

  const getVehicleBookings = (vehicle: Vehicle) =>
    bookings.filter((booking) => booking.vehicle.vehicleId === vehicle.id);

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span>{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </div>
        <button className={styles.primaryButton} type="button" onClick={() => setIsAdding(true)}>
          {copy.add}
        </button>
      </header>

      <section className={styles.garageSummary} aria-label="Garage summary">
        <div className={styles.defaultVehiclePanel}>
          <div>
            <span>{copy.defaultVehicle}</span>
            <strong>{defaultVehicle ? defaultVehicle.licensePlate : copy.notSelected}</strong>
            <p>
              {defaultVehicle
                ? `${defaultVehicle.brand} ${defaultVehicle.model} ${copy.defaultHint}`
                : copy.setDefaultHint}
            </p>
          </div>
          <div className={styles.defaultVehicleVisual} aria-hidden="true">
            {defaultVehicle ? (
              <img
                src={
                  defaultVehicle.imageUrl ?? vehicleImageFallbackByType[defaultVehicle.vehicleType]
                }
                alt=""
                onError={(event) => {
                  if (event.currentTarget.dataset.fallbackApplied === "true") {
                    return;
                  }

                  event.currentTarget.dataset.fallbackApplied = "true";
                  event.currentTarget.src = vehicleImageFallbackByType[defaultVehicle.vehicleType];
                }}
              />
            ) : null}
            <span />
          </div>
        </div>

        <dl className={styles.garageStats}>
          <div>
            <dt>{copy.total}</dt>
            <dd>{vehicles.length}</dd>
          </div>
          <div>
            <dt>{copy.active}</dt>
            <dd>{vehiclesWithBooking.length}</dd>
          </div>
          <div>
            <dt>{copy.combo}</dt>
            <dd>{activeCombo ? "1" : "0"}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.vehicleList}>
        {vehicles.map((vehicle) => {
          const vehicleBookings = getVehicleBookings(vehicle);
          const nextBooking = vehicleBookings.find((booking) =>
            activeBookingStatuses.includes(booking.status),
          );
          const latestBooking = vehicleBookings[0];
          const completedWashCount = vehicleBookings.filter(
            (booking) => booking.status === "COMPLETED",
          ).length;

          return (
            <VehicleCard
              key={vehicle.id}
              activeCombo={activeCombo}
              completedWashCount={completedWashCount}
              latestBooking={latestBooking}
              nextBooking={nextBooking}
              vehicle={vehicle}
              onSetDefault={setDefaultVehicle}
              onEdit={handleEdit}
              onDelete={deleteVehicle}
            />
          );
        })}
      </section>
    </main>
  );
}

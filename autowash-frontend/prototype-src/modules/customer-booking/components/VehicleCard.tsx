import type { Booking } from "../types/booking.types";
import type { ActiveCombo } from "../types/customer.types";
import type { Vehicle } from "../types/vehicle.types";
import { vehicleImageFallbackByType } from "../mock/vehicles.mock";
import { useCustomerBooking } from "../routes";
import styles from "../styles/vehicles.module.css";

interface VehicleCardProps {
  vehicle: Vehicle;
  activeCombo?: ActiveCombo | null;
  latestBooking?: Booking;
  nextBooking?: Booking;
  completedWashCount: number;
  onSetDefault: (vehicleId: string) => void;
  onEdit: (vehicleId: string) => void;
  onDelete: (vehicleId: string) => void;
}

function formatBookingDate(booking?: Booking) {
  if (!booking) {
    return "No booking yet";
  }

  return `${booking.scheduledDate} at ${booking.scheduledTime}`;
}

function getCareRecommendation(vehicle: Vehicle, completedWashCount: number) {
  if (completedWashCount === 0) {
    return "Start with Premium In-Out to create a clean baseline.";
  }

  if (vehicle.vehicleType === "SUV" || vehicle.vehicleType === "Pickup") {
    return "Premium In-Out is recommended for larger cabin and wheel care.";
  }

  return "Express Exterior keeps weekly maintenance quick and cost efficient.";
}

export function VehicleCard({
  activeCombo,
  completedWashCount,
  latestBooking,
  nextBooking,
  onDelete,
  onEdit,
  onSetDefault,
  vehicle,
}: VehicleCardProps) {
  const { language } = useCustomerBooking();
  const copy =
    language === "vi"
      ? {
          default: "Mặc định",
          combo: "Có combo",
          type: "Loại xe",
          color: "Màu xe",
          washes: "Lượt rửa",
          next: "Lịch tiếp theo",
          none: "Chưa có lịch",
          edit: "Sửa",
          delete: "Xóa",
          hint: "Nhấn vào card để đặt làm xe mặc định",
          ready: "Sẵn sàng đặt lịch",
        }
      : {
          default: "Default",
          combo: "Combo linked",
          type: "Type",
          color: "Color",
          washes: "Washes",
          next: "Next booking",
          none: "Not scheduled",
          edit: "Edit",
          delete: "Delete",
          hint: "Click card to set default",
          ready: "Ready to book",
        };
  const isComboLinked =
    activeCombo?.linkedVehicleId === vehicle.id && activeCombo.remainingUses > 0;
  const vehicleImageUrl = vehicle.imageUrl ?? vehicleImageFallbackByType[vehicle.vehicleType];

  return (
    <article
      className={`${styles.vehicleCard} ${vehicle.isDefault ? styles.vehicleCardDefault : ""}`}
      title={copy.hint}
    >
      <div className={styles.vehicleImage} aria-hidden="true">
        <img
          src={vehicleImageUrl}
          alt=""
          onError={(event) => {
            if (event.currentTarget.dataset.fallbackApplied === "true") {
              return;
            }

            event.currentTarget.dataset.fallbackApplied = "true";
            event.currentTarget.src = vehicleImageFallbackByType[vehicle.vehicleType];
          }}
        />
        <span />
      </div>
      <div className={styles.vehicleIdentity}>
        <div className={styles.plateRow}>
          <div>
            <h2 className={styles.licensePlate}>
              <span>VN</span>
              {vehicle.licensePlate}
            </h2>
            <p className={styles.vehicleTitle}>
              {vehicle.brand} {vehicle.model}
            </p>
          </div>
          <div className={styles.vehicleBadges}>
            {vehicle.isDefault ? (
              <span className={styles.defaultBadge}>
                <i aria-hidden="true" />
                {copy.default}
              </span>
            ) : null}
            {isComboLinked ? <span className={styles.comboBadge}>{copy.combo}</span> : null}
          </div>
        </div>

        <dl className={styles.vehicleMeta}>
          <div>
            <dt>{copy.type}</dt>
            <dd>{vehicle.vehicleType}</dd>
          </div>
          <div>
            <dt>{copy.color}</dt>
            <dd>{vehicle.color}</dd>
          </div>
          <div>
            <dt>{copy.washes}</dt>
            <dd>{completedWashCount}</dd>
          </div>
          <div>
            <dt>{copy.next}</dt>
            <dd>
              {nextBooking
                ? `${nextBooking.scheduledDate} ${nextBooking.scheduledTime}`
                : copy.none}
            </dd>
          </div>
        </dl>

        <section className={styles.vehicleCarePanel}>
          <div>
            <span>Care logic</span>
            <p>{getCareRecommendation(vehicle, completedWashCount)}</p>
          </div>
          <dl>
            <div>
              <dt>Latest activity</dt>
              <dd>{formatBookingDate(latestBooking)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{nextBooking ? nextBooking.status.replaceAll("_", " ") : copy.ready}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className={styles.vehicleActions}>
        {!vehicle.isDefault ? (
          <button
            type="button"
            className={styles.defaultActionButton}
            onClick={(event) => {
              event.stopPropagation();
              onSetDefault(vehicle.id);
            }}
          >
            {language === "vi" ? "Đặt làm mặc định" : "Set as default"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(vehicle.id);
          }}
        >
          {copy.edit}
        </button>
        <button
          type="button"
          className={styles.dangerButton}
          onClick={(event) => {
            event.stopPropagation();
            onDelete(vehicle.id);
          }}
        >
          {copy.delete}
        </button>
      </div>
    </article>
  );
}

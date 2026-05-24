import styles from "../styles/booking.module.css";

interface PointsUseOptionProps {
  availablePoints: number;
  value: number;
  disabled?: boolean;
  onChange: (points: number) => void;
}

export function PointsUseOption({
  availablePoints,
  value,
  disabled = false,
  onChange,
}: PointsUseOptionProps) {
  return (
    <label className={`${styles.field} ${styles.pointsField}`}>
      <span>Redeem points</span>
      <input
        type="number"
        min={0}
        max={availablePoints}
        step={10}
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(Math.max(0, Math.min(availablePoints, Number(event.target.value))))
        }
      />
      <small>
        Available: {availablePoints.toLocaleString()} points. Lifetime points never decrease.
      </small>
    </label>
  );
}

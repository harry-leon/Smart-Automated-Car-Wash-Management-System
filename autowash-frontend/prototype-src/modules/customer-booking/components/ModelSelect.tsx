import { brandModelCatalog } from "../mock/vehicles.mock";
import type { VehicleBrand } from "../types/vehicle.types";
import styles from "../styles/vehicles.module.css";

interface ModelSelectProps {
  brand: VehicleBrand;
  value: string;
  onChange: (model: string) => void;
}

export function ModelSelect({ brand, value, onChange }: ModelSelectProps) {
  return (
    <label className={styles.field}>
      <span>Model</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {brandModelCatalog[brand].map((option) => (
          <option key={option.model} value={option.model}>
            {option.model}
          </option>
        ))}
      </select>
    </label>
  );
}

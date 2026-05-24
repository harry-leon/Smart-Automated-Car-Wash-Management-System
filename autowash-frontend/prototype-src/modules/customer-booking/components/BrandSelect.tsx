import { vehicleBrands } from "../mock/vehicles.mock";
import type { VehicleBrand } from "../types/vehicle.types";
import styles from "../styles/vehicles.module.css";

interface BrandSelectProps {
  value: VehicleBrand;
  onChange: (brand: VehicleBrand) => void;
}

export function BrandSelect({ value, onChange }: BrandSelectProps) {
  return (
    <label className={styles.field}>
      <span>Brand</span>
      <select value={value} onChange={(event) => onChange(event.target.value as VehicleBrand)}>
        {vehicleBrands.map((brand) => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </select>
    </label>
  );
}

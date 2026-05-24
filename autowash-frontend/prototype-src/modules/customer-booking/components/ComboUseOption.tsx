import type { ActiveCombo } from "../types/customer.types";
import styles from "../styles/booking.module.css";

interface ComboUseOptionProps {
  activeCombo: ActiveCombo | null;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ComboUseOption({ activeCombo, checked, onChange }: ComboUseOptionProps) {
  const disabled = !activeCombo || activeCombo.remainingUses <= 0;

  return (
    <label className={`${styles.optionBox} ${disabled ? styles.optionDisabled : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <strong>Use active combo</strong>
        <small>
          {activeCombo
            ? `${activeCombo.comboName} / ${activeCombo.remainingUses} uses left. Combo credit is deducted upon staff check-in.`
            : "No active combo available."}
        </small>
      </span>
    </label>
  );
}

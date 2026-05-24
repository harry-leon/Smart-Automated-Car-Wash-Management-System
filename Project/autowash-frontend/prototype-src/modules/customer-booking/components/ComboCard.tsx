import type { ComboPackage } from "../types/customer.types";
import styles from "../styles/customer-home.module.css";

interface ComboCardProps {
  comboPackage: ComboPackage;
  actionLabel?: string;
  isActive?: boolean;
  onSelect?: (comboPackageId: string) => void;
}

export function ComboCard({
  actionLabel,
  comboPackage,
  isActive = false,
  onSelect,
}: ComboCardProps) {
  const content = (
    <>
      <div className={styles.comboCardTopline}>
        <span>
          {comboPackage.totalUses} washes / {comboPackage.validityDays} days
        </span>
        {isActive ? <em>Current combo</em> : null}
      </div>
      <h3>{comboPackage.name}</h3>
      <p>{comboPackage.description}</p>
      <div className={styles.comboPrice}>
        <strong>{comboPackage.price.toLocaleString()} VND</strong>
        <small>{comboPackage.savingsText}</small>
      </div>
      {actionLabel ? <b>{actionLabel}</b> : null}
    </>
  );

  if (onSelect) {
    return (
      <button
        className={`${styles.comboCard} ${isActive ? styles.comboCardActive : ""}`}
        type="button"
        onClick={() => onSelect(comboPackage.id)}
      >
        {content}
      </button>
    );
  }

  return (
    <article className={`${styles.comboCard} ${isActive ? styles.comboCardActive : ""}`}>
      {content}
    </article>
  );
}

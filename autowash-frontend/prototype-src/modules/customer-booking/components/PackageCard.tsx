import type { ServicePackage } from "../types/customer.types";
import styles from "../styles/booking.module.css";

export type PackageCardData =
  | ServicePackage
  | {
      id: string;
      name: string;
      price: number;
      description?: string;
      durationMinutes?: number;
      highlights?: string[];
      recommendedFor?: string;
    };

interface PackageCardProps {
  servicePackage: PackageCardData;
  selected?: boolean;
  onSelect?: (packageId: string) => void;
  actionLabel?: string;
}

export function PackageCard({
  actionLabel,
  servicePackage,
  selected = false,
  onSelect,
}: PackageCardProps) {
  return (
    <button
      className={`${styles.packageCard} ${selected ? styles.packageCardSelected : ""}`}
      type="button"
      onClick={() => onSelect?.(servicePackage.id)}
      aria-pressed={selected}
    >
      <span>{servicePackage.recommendedFor}</span>
      <strong>{servicePackage.name}</strong>
      <p>{servicePackage.description ?? "A premium wash package to fit your needs."}</p>
      <ul className={styles.featureList}>
        {(servicePackage.highlights ?? ["Fast wash", "Professional finish"]).map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
      <div className={styles.cardFooter}>
        <b>{servicePackage.price.toLocaleString()} VND</b>
        <small>{servicePackage.durationMinutes ?? 30} min</small>
      </div>
      {actionLabel ? <em>{actionLabel}</em> : null}
    </button>
  );
}

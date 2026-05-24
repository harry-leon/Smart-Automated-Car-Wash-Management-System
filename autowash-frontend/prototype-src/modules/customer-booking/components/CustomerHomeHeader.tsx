import type { CustomerProfile } from "../types/customer.types";
import styles from "../styles/customer-home.module.css";

export interface TierProgressSummary {
  currentTier: CustomerProfile["tier"];
  nextTier: CustomerProfile["tier"] | "Max";
  currentThreshold: number;
  nextThreshold: number;
  progressPercent: number;
  pointsToNextTier: number;
}

interface CustomerHomeHeaderProps {
  customer: CustomerProfile;
  tierProgress: TierProgressSummary;
  activeBookingsCount: number;
  defaultVehiclePlate?: string;
}

export function CustomerHomeHeader({
  activeBookingsCount,
  customer,
  defaultVehiclePlate,
  tierProgress,
}: CustomerHomeHeaderProps) {
  const tierClassName = `${styles.tierBadge} ${styles[`tier${customer.tier}`]}`;
  const isMaxTier = tierProgress.nextTier === "Max";

  return (
    <header className={styles.homeHeader}>
      <div className={styles.headerIntro}>
        <p className={styles.headerLabel}>Member dashboard</p>
        <h1>Welcome back, {customer.fullName}</h1>
        <p>
          Track your wash credits, loyalty points, and the next best action for your registered
          vehicles.
        </p>
      </div>

      <div className={styles.loyaltyPanel} aria-label="Customer loyalty summary">
        <div className={styles.tierRow}>
          <span className={tierClassName}>{customer.tier} Member</span>
          <strong>
            {isMaxTier
              ? "Top tier active"
              : `${tierProgress.pointsToNextTier.toLocaleString()} pts to ${tierProgress.nextTier}`}
          </strong>
        </div>
        <div
          className={styles.tierProgress}
          aria-label={`Tier progress ${Math.round(tierProgress.progressPercent)} percent`}
        >
          <span style={{ width: `${tierProgress.progressPercent}%` }} />
        </div>
        <div className={styles.tierScale}>
          <span>{tierProgress.currentThreshold.toLocaleString()} pts</span>
          <span>
            {isMaxTier ? "Diamond secured" : `${tierProgress.nextThreshold.toLocaleString()} pts`}
          </span>
        </div>

        <div className={styles.headerStats}>
          <div className={styles.pointsCard}>
            <strong>{customer.availablePoints.toLocaleString()}</strong>
            <span>Available points</span>
          </div>
          <div className={styles.pointsCard}>
            <strong>{customer.lifetimePoints.toLocaleString()}</strong>
            <span>Lifetime points</span>
          </div>
        </div>

        <dl className={styles.memberSnapshot}>
          <div>
            <dt>Default vehicle</dt>
            <dd>{defaultVehiclePlate ?? "Not selected"}</dd>
          </div>
          <div>
            <dt>Upcoming bookings</dt>
            <dd>{activeBookingsCount}</dd>
          </div>
        </dl>
      </div>
    </header>
  );
}

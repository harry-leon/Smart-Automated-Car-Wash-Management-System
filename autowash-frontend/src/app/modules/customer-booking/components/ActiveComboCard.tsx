import { useState } from "react";
import type { ActiveCombo } from "../types/customer.types";
import type { Vehicle } from "../types/vehicle.types";
import styles from "../styles/customer-home.module.css";

interface ActiveComboCardProps {
  combo: ActiveCombo;
  linkedVehicle?: Vehicle;
  onBookWash?: () => void;
}

function getDaysUntil(dateValue: string) {
  const today = new Date();
  const target = new Date(`${dateValue}T23:59:59`);
  const diff = target.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export function ActiveComboCard({ combo, linkedVehicle, onBookWash }: ActiveComboCardProps) {
  const [showBarcode, setShowBarcode] = useState(false);
  const expiresInDays = getDaysUntil(combo.validUntil);
  const bars = combo.qrCodeText.split("").slice(0, 18);

  return (
    <article className={`${styles.activeCombo} ${showBarcode ? styles.activeComboExpanded : ""}`}>
      <div className={styles.activeComboCopy}>
        <span className={styles.sectionEyebrow}>Active combo</span>
        <h2>{combo.comboName}</h2>
        <p>
          {combo.remainingUses} of {combo.totalUses} washes remaining
        </p>
        <dl className={styles.comboMeta}>
          <div>
            <dt>Status</dt>
            <dd>{combo.status.replaceAll("_", " ")}</dd>
          </div>
          <div>
            <dt>Valid until</dt>
            <dd>
              {combo.validUntil} / {expiresInDays} days left
            </dd>
          </div>
          <div>
            <dt>Linked vehicle</dt>
            <dd>{linkedVehicle ? linkedVehicle.licensePlate : "Not linked"}</dd>
          </div>
        </dl>
        <div className={styles.activeComboActions}>
          <button className={styles.comboBookButton} type="button" onClick={onBookWash}>
            Book a wash
          </button>
          <button
            type="button"
            className={styles.barcodeToggleButton}
            onClick={() => setShowBarcode(!showBarcode)}
            aria-expanded={showBarcode}
          >
            {showBarcode ? (
              <>
                <svg
                  className={styles.toggleIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                Hide barcode
              </>
            ) : (
              <>
                <svg
                  className={styles.toggleIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <line x1="7" y1="8" x2="7" y2="16" />
                  <line x1="10" y1="8" x2="10" y2="16" />
                  <line x1="14" y1="8" x2="14" y2="16" />
                  <line x1="17" y1="8" x2="17" y2="16" />
                </svg>
                Show barcode to staff
              </>
            )}
          </button>
        </div>
      </div>
      <div
        className={`${styles.qrZone} ${showBarcode ? styles.qrZoneVisible : styles.qrZoneHidden}`}
        aria-label="Combo QR code"
      >
        <div className={styles.barcode} aria-hidden="true">
          {bars.map((char, index) => (
            <i key={`${char}-${index}`} />
          ))}
        </div>
        <span>QR / BARCODE</span>
        <strong>{combo.qrCodeText}</strong>
      </div>
    </article>
  );
}

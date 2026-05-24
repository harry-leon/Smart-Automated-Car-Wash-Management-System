import { Link } from "@tanstack/react-router";
import styles from "../styles/history.module.css";

type HistoryTab = "bookings" | "washes" | "points";

interface HistoryTabsProps {
  activeTab: HistoryTab;
  onTabChange?: (tab: HistoryTab) => void;
}

const tabs: Array<{ key: HistoryTab; label: string; href: string }> = [
  { key: "bookings", label: "Booking History", href: "/customer/history" },
  { key: "washes", label: "Wash History", href: "/customer/history" },
  { key: "points", label: "Point Transactions", href: "/customer/history" },
];

export function HistoryTabs({ activeTab, onTabChange }: HistoryTabsProps) {
  return (
    <nav className={styles.historyTabs} aria-label="History sections">
      {tabs.map((tab) =>
        onTabChange ? (
          <button
            key={tab.key}
            type="button"
            className={activeTab === tab.key ? styles.tabActive : styles.tab}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ) : (
          <Link
            key={tab.key}
            to={tab.href}
            className={activeTab === tab.key ? styles.tabActive : styles.tab}
          >
            {tab.label}
          </Link>
        ),
      )}
    </nav>
  );
}

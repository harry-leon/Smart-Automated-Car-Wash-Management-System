import { useEffect, useMemo } from "react";
import { useCustomerBooking } from "../routes";
import styles from "../styles/booking.module.css";

const MOCK_BOOKING_MONTH = "2026-05";
const BASE_TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
];
const FULLY_BOOKED_DATES = ["2026-05-04", "2026-05-12", "2026-05-19", "2026-05-28"];
const EXTRA_BLOCKED_SLOTS: Record<string, string[]> = {
  "2026-05-01": ["08:00", "08:30", "14:30", "15:30"],
  "2026-05-02": ["08:30", "10:30", "15:30"],
  "2026-05-03": ["09:00", "10:00", "13:30", "17:30"],
  "2026-05-05": ["09:30", "10:00", "14:00"],
  "2026-05-06": ["08:00", "11:00", "14:30"],
  "2026-05-07": ["09:00", "15:00", "17:00"],
  "2026-05-08": ["10:00", "13:00", "16:00"],
  "2026-05-09": ["08:30", "09:30", "14:30", "16:30"],
  "2026-05-10": ["09:00", "13:00", "15:30"],
  "2026-05-11": ["08:30", "10:30", "16:00"],
  "2026-05-13": ["08:00", "09:00", "14:00", "17:30"],
  "2026-05-14": ["09:30", "10:00", "16:30"],
  "2026-05-15": ["08:30", "13:00", "15:00"],
  "2026-05-16": ["09:30", "10:30", "14:30", "16:00"],
  "2026-05-17": ["08:00", "13:00", "14:00"],
  "2026-05-18": ["09:00", "11:00", "15:30"],
  "2026-05-20": ["08:00", "10:00", "14:30"],
  "2026-05-21": ["08:30", "09:30", "16:30"],
  "2026-05-22": ["09:00", "13:30", "17:00"],
  "2026-05-23": ["08:00", "10:30", "11:00"],
  "2026-05-24": ["08:30", "09:00", "14:00", "15:00"],
  "2026-05-25": ["09:30", "13:30", "17:30"],
  "2026-05-26": ["08:00", "10:00", "15:30"],
  "2026-05-27": ["08:30", "09:30", "16:00"],
  "2026-05-29": ["09:00", "11:00", "14:30"],
  "2026-05-30": ["08:30", "10:30", "13:30"],
  "2026-05-31": ["09:00", "10:00", "15:00", "16:30"],
};
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthGrid(monthValue: string) {
  const [year, month] = monthValue.split("-").map(Number);
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingEmptyCells = (firstDayOfMonth.getDay() + 6) % 7;
  const totalCells = Math.ceil((leadingEmptyCells + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - leadingEmptyCells + 1;

    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return null;
    }

    const date = new Date(year, month - 1, dayNumber);

    return {
      iso: toIsoDate(date),
      dayNumber,
    };
  });
}

function formatDateLabel(isoDate: string) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function getMockOpenSlots(isoDate: string) {
  if (FULLY_BOOKED_DATES.includes(isoDate)) {
    return [];
  }

  const date = new Date(`${isoDate}T00:00:00`);
  const blocked = new Set<string>(["11:00"]);
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  const dayOfMonth = date.getDate();

  if (weekend) {
    ["09:30", "10:00", "14:30"].forEach((slot) => blocked.add(slot));
  }

  if (dayOfMonth % 2 === 0) {
    ["08:00", "16:00"].forEach((slot) => blocked.add(slot));
  }

  if (dayOfMonth % 3 === 0) {
    ["13:00", "17:30"].forEach((slot) => blocked.add(slot));
  }

  (EXTRA_BLOCKED_SLOTS[isoDate] ?? []).forEach((slot) => blocked.add(slot));

  return BASE_TIME_SLOTS.filter((slot) => !blocked.has(slot));
}

function getOpenSlotsForDate(isoDate: string, occupiedSlots: Set<string>) {
  return getMockOpenSlots(isoDate).filter((slot) => !occupiedSlots.has(`${isoDate}|${slot}`));
}

interface BookingTimePickerProps {
  date: string;
  time: string;
  occupiedSlotKeys: string[];
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

export function BookingTimePicker({
  date,
  occupiedSlotKeys,
  time,
  onDateChange,
  onTimeChange,
}: BookingTimePickerProps) {
  const { language } = useCustomerBooking();
  const copy =
    language === "vi"
      ? {
          month: "Tháng đặt lịch",
          scheduleTitle: "Chọn khung giờ còn trống trong ngày",
          scheduleHint: "Chỉ hiển thị giờ còn trống để thao tác nhanh hơn.",
          dayHint: "Ngày mờ là đã kín lịch.",
          openSlots: "khung giờ còn trống",
          fullyBooked: "Kín lịch",
          open: "còn chỗ",
          noSlots: "Không còn giờ trống trong ngày này. Vui lòng chọn ngày khác.",
        }
      : {
          month: "Booking month",
          scheduleTitle: "Choose an open time slot",
          scheduleHint: "Only real open slots are shown to keep the screen clean.",
          dayHint: "Dimmed days are fully booked.",
          openSlots: "open slots",
          fullyBooked: "Full",
          open: "open",
          noSlots: "No open slots left on this date. Please choose another day.",
        };
  const occupiedSlots = useMemo(() => new Set(occupiedSlotKeys), [occupiedSlotKeys]);
  const monthGrid = useMemo(() => getMonthGrid(MOCK_BOOKING_MONTH), []);
  const monthDates = useMemo(
    () => monthGrid.filter(Boolean) as Array<{ iso: string; dayNumber: number }>,
    [monthGrid],
  );
  const selectedDate =
    date.startsWith(MOCK_BOOKING_MONTH) && monthDates.some((entry) => entry.iso === date)
      ? date
      : (monthDates[0]?.iso ?? `${MOCK_BOOKING_MONTH}-01`);
  const dayAvailability = useMemo(
    () =>
      new Map(
        monthDates.map((entry) => [entry.iso, getOpenSlotsForDate(entry.iso, occupiedSlots)]),
      ),
    [monthDates, occupiedSlots],
  );
  const selectedDateSlots = dayAvailability.get(selectedDate) ?? [];

  useEffect(() => {
    const firstBookableDay = monthDates.find(
      (entry) => (dayAvailability.get(entry.iso) ?? []).length > 0,
    );
    const shouldResetDate =
      selectedDate !== date ||
      ((dayAvailability.get(selectedDate) ?? []).length === 0 && !!firstBookableDay);

    if (shouldResetDate && firstBookableDay) {
      onDateChange(firstBookableDay.iso);
      onTimeChange((dayAvailability.get(firstBookableDay.iso) ?? [])[0] ?? "");
      return;
    }

    if (selectedDateSlots.length > 0 && !selectedDateSlots.includes(time)) {
      onTimeChange(selectedDateSlots[0]);
    }
  }, [
    date,
    dayAvailability,
    monthDates,
    onDateChange,
    onTimeChange,
    selectedDate,
    selectedDateSlots,
    time,
  ]);

  const handleDateChange = (isoDate: string) => {
    const nextSlots = dayAvailability.get(isoDate) ?? [];

    if (nextSlots.length === 0) {
      return;
    }

    onDateChange(isoDate);

    if (!nextSlots.includes(time)) {
      onTimeChange(nextSlots[0]);
    }
  };

  return (
    <div className={styles.schedulePicker}>
      <div className={styles.scheduleToolbar}>
        <div className={styles.scheduleMonthBadge}>
          <span>{copy.month}</span>
          <strong>05/2026</strong>
        </div>
        <p>
          {selectedDateSlots.length} {copy.openSlots} on {formatDateLabel(selectedDate)}.{" "}
          {copy.dayHint}
        </p>
      </div>

      <div className={styles.scheduleSplitLayout}>
        <section className={styles.scheduleCalendarPanel}>
          <div className={styles.calendarWeekdays} aria-hidden="true">
            {WEEKDAY_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className={styles.calendarGrid} role="radiogroup" aria-label="Booking dates">
            {monthGrid.map((entry, index) =>
              entry ? (
                <button
                  key={entry.iso}
                  type="button"
                  className={
                    entry.iso === selectedDate
                      ? styles.calendarDaySelected
                      : (dayAvailability.get(entry.iso) ?? []).length === 0
                        ? styles.calendarDayDisabled
                        : styles.calendarDay
                  }
                  onClick={() => handleDateChange(entry.iso)}
                  disabled={(dayAvailability.get(entry.iso) ?? []).length === 0}
                  aria-pressed={entry.iso === selectedDate}
                >
                  <strong>{entry.dayNumber}</strong>
                  <small>
                    {(dayAvailability.get(entry.iso) ?? []).length > 0
                      ? `${(dayAvailability.get(entry.iso) ?? []).length} ${copy.open}`
                      : copy.fullyBooked}
                  </small>
                </button>
              ) : (
                <span
                  key={`blank-${index}`}
                  className={styles.calendarDaySpacer}
                  aria-hidden="true"
                />
              ),
            )}
          </div>
        </section>

        <section className={styles.scheduleSlotPanel}>
          <div className={styles.scheduleSlotHeader}>
            <h3>{copy.scheduleTitle}</h3>
            <p>{copy.scheduleHint}</p>
          </div>

          {selectedDateSlots.length > 0 ? (
            <div className={styles.scheduleSlotGrid} role="radiogroup" aria-label="Booking times">
              {selectedDateSlots.map((slot) => {
                const selected = slot === time;

                return (
                  <button
                    key={slot}
                    type="button"
                    className={selected ? styles.scheduleSlotSelected : styles.scheduleSlot}
                    onClick={() => onTimeChange(slot)}
                    aria-pressed={selected}
                  >
                    <strong>{slot}</strong>
                    <small>{copy.open}</small>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className={styles.scheduleEmptyState}>{copy.noSlots}</div>
          )}
        </section>
      </div>
    </div>
  );
}

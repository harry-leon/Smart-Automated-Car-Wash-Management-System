import { useMemo, useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useCarwashStore } from "@/lib/carwash-store";
import type {
  Booking,
  BookingSelection,
  BookingSummary,
  PaymentMethod,
} from "../types/booking.types";
import { getUsableVouchers, useCustomerBooking } from "../routes";
import { BookingTimePicker } from "./BookingTimePicker";
import { Sparkles, Car, CheckCircle2, Calendar, Clock, Ticket, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "../styles/booking.module.css";

function getTomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

type ResolvedBookingSummary = NonNullable<BookingSummary>;

const paymentMethods: Array<{
  value: PaymentMethod;
  label: string;
  description: string;
}> = [
  {
    value: "CASH_AT_COUNTER",
    label: "Cash at counter",
    description: "Pay when you arrive. Booking status stays confirmed.",
  },
  {
    value: "BANK_TRANSFER",
    label: "Bank transfer",
    description: "Mock online payment. Marked as paid immediately.",
  },
  {
    value: "E_WALLET",
    label: "E-wallet mock",
    description: "Demo wallet payment without a real gateway.",
  },
];

const packageServiceMap: Record<string, string[]> = {
  "pkg-express": ["Basic Wash"],
  "pkg-premium": ["Premium Detail"],
  "pkg-detail": ["Ceramic Coating"],
};

const addonServiceMap: Record<string, string[]> = {
  "addon-extra-cabin-vacuum": ["Interior Vacuum"],
  "addon-interior-deep-clean": ["Interior Vacuum"],
};

function toLegacyServiceNames(summary: ResolvedBookingSummary) {
  const mapped = [
    ...(packageServiceMap[summary.package.id] ?? ["Basic Wash"]),
    ...summary.addOns.flatMap((addon) => addonServiceMap[addon.addonId] ?? []),
  ];

  return Array.from(new Set(mapped));
}

function buildStaffFacingNote(selection: BookingSelection, summary: ResolvedBookingSummary) {
  const lines: string[] = [];

  if (summary.note) {
    lines.push(summary.note);
  }

  if (summary.addOns.length > 0) {
    lines.push(`Add-ons: ${summary.addOns.map((addon) => addon.name).join(", ")}`);
  }

  if (selection.useActiveCombo) {
    lines.push(
      `Booking uses active combo${summary.comboUpgradeName ? ` (${summary.comboUpgradeName})` : ""}.`,
    );
  }

  if (summary.voucherCode) {
    lines.push(`Voucher applied: ${summary.voucherCode}.`);
  }

  return lines.join(" | ") || undefined;
}

export function BookingForm() {
  const {
    activeCombo,
    bookingDraft,
    bookings,
    clearBookingDraft,
    comboPackages,
    confirmBooking,
    customer,
    language,
    serviceAddons,
    servicePackages,
    vehicles,
    vouchers,
  } = useCustomerBooking();
  const defaultVehicle = vehicles.find((vehicle) => vehicle.isDefault) ?? vehicles[0];
  const activeServicePackages = servicePackages.filter(
    (servicePackage) => servicePackage.status === "ACTIVE",
  );
  const activeComboPackage = activeCombo
    ? comboPackages.find((comboPackage) => comboPackage.id === activeCombo.comboPackageId)
    : undefined;
  const comboVehicle = activeCombo
    ? vehicles.find((vehicle) => vehicle.id === activeCombo.linkedVehicleId)
    : undefined;
  const comboPackage =
    activeComboPackage?.packageIds
      .map((packageId) => servicePackages.find((servicePackage) => servicePackage.id === packageId))
      .find(Boolean) ?? servicePackages[0];
  const initialMode =
    bookingDraft.useActiveCombo || bookingDraft.mode === "COMBO" ? "COMBO" : "SINGLE_PACKAGE";
  const [selection, setSelection] = useState<BookingSelection>({
    mode: initialMode,
    vehicleId:
      initialMode === "COMBO"
        ? (comboVehicle?.id ?? defaultVehicle?.id ?? "")
        : (bookingDraft.vehicleId ?? defaultVehicle?.id ?? ""),
    packageId:
      initialMode === "COMBO"
        ? (comboPackage?.id ?? "")
        : (bookingDraft.packageId ?? activeServicePackages[0]?.id ?? servicePackages[0]?.id ?? ""),
    scheduledDate: bookingDraft.scheduledDate ?? getTomorrowDate(),
    scheduledTime: bookingDraft.scheduledTime ?? "10:30",
    note: bookingDraft.note ?? "",
    voucherId: bookingDraft.voucherId ?? "",
    addonIds: bookingDraft.addonIds ?? [],
    comboUpgradePackageId: bookingDraft.comboUpgradePackageId,
    comboUpgradeAmount: bookingDraft.comboUpgradeAmount,
    paymentMethod: bookingDraft.paymentMethod ?? "",
    useActiveCombo: initialMode === "COMBO",
  });
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [manualVoucherCode, setManualVoucherCode] = useState("");
  const [error, setError] = useState("");
  const { createBookingFromLegacy } = useCarwashStore();
  const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);
  const [isPackageDropdownOpen, setIsPackageDropdownOpen] = useState(false);
  const vehicleDropdownRef = useRef<HTMLDivElement>(null);
  const packageDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        vehicleDropdownRef.current &&
        !vehicleDropdownRef.current.contains(event.target as Node)
      ) {
        setIsVehicleDropdownOpen(false);
      }
      if (
        packageDropdownRef.current &&
        !packageDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPackageDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const copy =
    language === "vi"
      ? {
          single: "Đặt gói lẻ",
          combo: "Đặt bằng combo",
          selectVehicle: "Chọn xe",
          vehicle: "Xe",
          ready: "sẵn sàng đặt lịch",
          selectPackage: "Chọn gói rửa và dịch vụ thêm",
          package: "Gói rửa",
          addons: "Dịch vụ đã chọn",
          voucher: "Áp dụng một voucher",
          note: "Ghi chú cho booking",
          notePlaceholder:
            "Ví dụ: xe đến trễ 10 phút, cần hỗ trợ khu vực chờ, lưu ý đồ trong xe...",
          manualVoucher: "Mã voucher",
          enterVoucher: "Nhập mã voucher",
          applyCode: "Áp dụng",
          noVoucher: "Không dùng voucher",
          noVoucherHint: "Thanh toán theo số tiền tiêu chuẩn.",
          payment: "Chọn phương thức thanh toán",
          summary: "Tóm tắt đặt lịch",
          confirm: "Xác nhận đặt lịch",
          success: "Thanh toán thành công",
          history: "Xem lịch sử",
          home: "Về trang chủ",
          none: "Không có",
          comboCredit: "Lượt combo",
          activeCombo: "Đặt bằng combo đang dùng",
          noCombo: "Không có combo hợp lệ.",
          emptyTitle: "Chưa có xe",
          emptyText: "Thêm xe trước khi tạo lịch rửa.",
          addVehicle: "Thêm xe",
        }
      : {
          single: "Single wash booking",
          combo: "Book with active combo",
          selectVehicle: "Select vehicle",
          vehicle: "Vehicle",
          ready: "ready for booking",
          selectPackage: "Select wash package and add-ons",
          package: "Wash package",
          addons: "Selected add-ons",
          voucher: "Apply one voucher",
          note: "Booking note",
          notePlaceholder:
            "Example: arriving 10 minutes late, need waiting-area support, items left in the vehicle...",
          manualVoucher: "Manual voucher code",
          enterVoucher: "Enter voucher code",
          applyCode: "Apply code",
          noVoucher: "No voucher",
          noVoucherHint: "Use the standard checkout amount.",
          payment: "Select payment method",
          summary: "Booking summary",
          confirm: "Confirm booking",
          success: "Payment success",
          history: "View booking history",
          home: "Back home",
          none: "None",
          comboCredit: "Combo credit",
          activeCombo: "Active combo booking",
          noCombo: "No eligible active combo is available.",
          emptyTitle: "No vehicles yet",
          emptyText: "Add a vehicle before creating a booking.",
          addVehicle: "Add vehicle",
        };

  const isComboBooking = selection.mode === "COMBO";
  const selectedVehicle = isComboBooking
    ? comboVehicle
    : vehicles.find((vehicle) => vehicle.id === selection.vehicleId);
  const selectedPackage = isComboBooking
    ? comboPackage
    : (activeServicePackages.find((servicePackage) => servicePackage.id === selection.packageId) ??
      activeServicePackages[0] ??
      servicePackages[0]);
  const selectedAddons = useMemo(
    () =>
      isComboBooking ? [] : serviceAddons.filter((addon) => selection.addonIds.includes(addon.id)),
    [isComboBooking, selection.addonIds, serviceAddons],
  );
  const availableVouchers = isComboBooking ? [] : getUsableVouchers(vouchers, customer);
  const selectedVoucher = availableVouchers.find((voucher) => voucher.id === selection.voucherId);

  const addOnTotal = selectedAddons.reduce((total, addon) => total + addon.price, 0);
  const addOnDuration = selectedAddons.reduce((total, addon) => total + addon.durationMinutes, 0);
  const comboUpgradeAmount = isComboBooking ? 0 : (selection.comboUpgradeAmount ?? 0);
  const comboUpgradeName =
    !isComboBooking && selection.comboUpgradePackageId
      ? comboPackages.find(
          (comboPackageItem) => comboPackageItem.id === selection.comboUpgradePackageId,
        )?.name
      : undefined;
  const baseTotal = (selectedPackage?.price ?? 0) + addOnTotal + comboUpgradeAmount;
  const voucherDiscount =
    selectedVoucher && !isComboBooking ? Math.min(selectedVoucher.discountAmount, baseTotal) : 0;
  const finalAmount = isComboBooking ? 0 : Math.max(0, baseTotal - voucherDiscount);
  const paymentStatus =
    finalAmount === 0 ||
    selection.paymentMethod === "BANK_TRANSFER" ||
    selection.paymentMethod === "E_WALLET"
      ? "PAID"
      : "PAY_AT_COUNTER";
  const summary = useMemo(() => {
    if (!selectedVehicle || !selectedPackage) {
      return null;
    }

    return {
      vehicleLabel: `${selectedVehicle.licensePlate} / ${selectedVehicle.brand} ${selectedVehicle.model}`,
      package: selectedPackage,
      scheduledDate: selection.scheduledDate,
      scheduledTime: selection.scheduledTime,
      note: selection.note.trim() || undefined,
      originalPrice: isComboBooking ? 0 : selectedPackage.price,
      addOns: selectedAddons.map((addon) => ({
        addonId: addon.id,
        name: addon.name,
        price: addon.price,
        durationMinutes: addon.durationMinutes,
      })),
      addOnTotal,
      comboUpgradeAmount,
      comboUpgradeName,
      voucherId: selectedVoucher?.id,
      voucherCode: selectedVoucher?.code,
      voucherLabel: selectedVoucher?.label,
      voucherDiscount,
      paymentMethod: finalAmount > 0 ? selection.paymentMethod || undefined : undefined,
      paymentStatus,
      paidViaCombo: isComboBooking,
      finalAmount,
    };
  }, [
    addOnTotal,
    comboUpgradeAmount,
    comboUpgradeName,
    finalAmount,
    isComboBooking,
    paymentStatus,
    selectedAddons,
    selectedPackage,
    selectedVehicle,
    selectedVoucher,
    selection.paymentMethod,
    selection.note,
    selection.scheduledDate,
    selection.scheduledTime,
    voucherDiscount,
  ]);
  const updateSelection = (patch: Partial<BookingSelection>) => {
    setSelection((current) => ({ ...current, ...patch }));
    setError("");
  };

  const selectMode = (mode: BookingSelection["mode"]) => {
    const nextCombo = mode === "COMBO";

    updateSelection({
      mode,
      useActiveCombo: nextCombo,
      vehicleId: nextCombo ? (comboVehicle?.id ?? "") : (defaultVehicle?.id ?? ""),
      packageId: nextCombo ? (comboPackage?.id ?? "") : (servicePackages[0]?.id ?? ""),
      voucherId: "",
      addonIds: [],
      paymentMethod: nextCombo ? "" : selection.paymentMethod,
    });
  };

  const toggleAddon = (addonId: string) => {
    setSelection((current) => {
      const selected = current.addonIds.includes(addonId);

      return {
        ...current,
        addonIds: selected
          ? current.addonIds.filter((currentAddonId) => currentAddonId !== addonId)
          : [...current.addonIds, addonId],
      };
    });
    setError("");
  };

  const applyManualVoucher = () => {
    const normalizedCode = manualVoucherCode.trim().toUpperCase();
    const voucher = availableVouchers.find((item) => item.code.toUpperCase() === normalizedCode);

    if (!voucher) {
      setError(
        "Voucher code is invalid, expired, already used, or not eligible for this customer.",
      );
      return;
    }

    updateSelection({ voucherId: voucher.id });
  };

  const handleConfirm = () => {
    if (
      !summary ||
      !selection.vehicleId ||
      !selection.packageId ||
      !selection.scheduledDate ||
      !selection.scheduledTime
    ) {
      setError("Please complete the booking details before confirming.");
      return;
    }

    if (isComboBooking && (!activeCombo || activeCombo.remainingUses <= 0)) {
      setError("Active combo is not eligible for booking.");
      return;
    }

    if (!isComboBooking && summary.finalAmount > 0 && !selection.paymentMethod) {
      setError("Please select one payment method before confirming.");
      return;
    }

    let syncedBookingId: string | null = null;

    try {
      syncedBookingId = createBookingFromLegacy({
        vehicleId: selectedVehicle?.id,
        vehiclePlate: selectedVehicle?.licensePlate ?? "",
        vehicleName: `${selectedVehicle?.brand ?? ""} ${selectedVehicle?.model ?? ""}`.trim(),
        vehicleType:
          selectedVehicle?.vehicleType === "Pickup"
            ? "Truck"
            : ((selectedVehicle?.vehicleType as "Sedan" | "SUV" | "Truck" | "Motorbike") ??
              "Sedan"),
        services: toLegacyServiceNames(summary),
        totalPrice: summary.finalAmount,
        scheduledAt: `${summary.scheduledDate} ${summary.scheduledTime}`,
        dateISO: summary.scheduledDate,
        status: "Confirmed",
        notes: buildStaffFacingNote(selection, summary),
      });
    } catch (syncError) {
      setError(
        syncError instanceof Error
          ? syncError.message
          : "Unable to sync this booking to the staff operations board.",
      );
      return;
    }

    const result = confirmBooking(selection, summary, {
      id: syncedBookingId ?? undefined,
      bookingCode: syncedBookingId ?? undefined,
    });
    clearBookingDraft();
    setConfirmedBooking(result.booking);
  };

  const occupiedSlotKeys = bookings
    .filter((booking) => ["CONFIRMED", "CHECKED_IN", "IN_PROGRESS"].includes(booking.status))
    .map((booking) => `${booking.scheduledDate}|${booking.scheduledTime}`);

  if (confirmedBooking) {
    return (
      <section className={styles.successScreen}>
        <span>{copy.success}</span>
        <h1>{confirmedBooking.bookingCode}</h1>
        <div className={styles.successDetails}>
          <p>
            <b>Vehicle:</b> {confirmedBooking.vehicle.licensePlate}
          </p>
          <p>
            <b>Service:</b> {confirmedBooking.package.name}
          </p>
          <p>
            <b>Schedule:</b> {confirmedBooking.scheduledDate} {confirmedBooking.scheduledTime}
          </p>
          <p>
            <b>Voucher:</b>{" "}
            {confirmedBooking.payment.voucherCode
              ? `${confirmedBooking.payment.voucherCode} (-${confirmedBooking.payment.voucherDiscount.toLocaleString()} VND)`
              : copy.none}
          </p>
          <p>
            <b>Payment:</b> {confirmedBooking.payment.paymentMethod ?? copy.comboCredit} /{" "}
            {confirmedBooking.payment.paymentStatus}
          </p>
          <p>
            <b>Status:</b> {confirmedBooking.status}
          </p>
          <p>
            <b>Final amount:</b> {confirmedBooking.payment.finalAmount.toLocaleString()} VND
          </p>
        </div>
        <div className={styles.successActions}>
          <Link to="/customer/history">{copy.history}</Link>
          <Link to="/customer/home">{copy.home}</Link>
        </div>
      </section>
    );
  }

  if (vehicles.length === 0) {
    return (
      <section className={styles.emptyState}>
        <h1>{copy.emptyTitle}</h1>
        <p>{copy.emptyText}</p>
        <Link to="/customer/vehicles">{copy.addVehicle}</Link>
      </section>
    );
  }

  return (
    <div className={styles.bookingLayout}>
      <section className={styles.bookingPanel}>
        <div className={styles.sectionShell}>
          <div className={styles.modeSwitch} aria-label="Booking type">
            <button
              type="button"
              className={!isComboBooking ? styles.modeActive : styles.modeButton}
              onClick={() => selectMode("SINGLE_PACKAGE")}
            >
              {copy.single}
            </button>
            <button
              type="button"
              className={isComboBooking ? styles.modeActive : styles.modeButton}
              onClick={() => selectMode("COMBO")}
              disabled={!activeCombo || activeCombo.remainingUses <= 0}
            >
              {copy.combo}
            </button>
          </div>
        </div>

        <div className={styles.sectionShell}>
          {isComboBooking ? (
            <div className={styles.stepBlock}>
              <span className={styles.stepLabel}>Detail 1</span>
              <h2>{copy.activeCombo}</h2>
              {activeCombo && selectedVehicle && selectedPackage ? (
                <div className={styles.comboBookingBoxPremium}>
                  {/* Top header line with sparkly styling */}
                  <div className={styles.comboPremiumHeader}>
                    <div className={styles.comboTitleContainer}>
                      <span className={styles.comboStatusBadge}>
                        {language === "vi" ? "Combo Đang Hoạt Động" : "Active Combo"}
                      </span>
                      <h3 className={styles.comboNameText}>{activeCombo.comboName}</h3>
                    </div>
                    <span className={styles.comboFreeBadge}>
                      <Ticket
                        size={16}
                        style={{
                          marginRight: "4px",
                          verticalAlign: "middle",
                          display: "inline-block",
                        }}
                      />
                      {language === "vi" ? "Đã áp dụng (0đ)" : "0 VND applied"}
                    </span>
                  </div>

                  {/* Usage stats with progress bar */}
                  <div className={styles.comboUsageProgress}>
                    <div className={styles.progressTextRow}>
                      <span>{language === "vi" ? "Lượt rửa còn lại" : "Washes remaining"}</span>
                      <strong>
                        {activeCombo.remainingUses} / {activeCombo.totalUses}
                      </strong>
                    </div>
                    <div className={styles.progressBarBg}>
                      <div
                        className={styles.progressBarFill}
                        style={{
                          width: `${(activeCombo.remainingUses / activeCombo.totalUses) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Details Grid: Vehicle & Package */}
                  <div className={styles.comboDetailsGrid}>
                    {/* Vehicle block */}
                    <div className={styles.comboDetailSection}>
                      <span className={styles.detailLabel}>
                        <Car
                          size={12}
                          style={{
                            marginRight: "4px",
                            verticalAlign: "middle",
                            display: "inline-block",
                          }}
                        />
                        {language === "vi" ? "Xe đã liên kết" : "Linked Vehicle"}
                      </span>
                      <div className={styles.vehiclePlateWrapper}>
                        <div className={styles.plateDisplay}>{selectedVehicle.licensePlate}</div>
                        <div className={styles.vehicleNameText}>
                          {selectedVehicle.brand} {selectedVehicle.model}
                        </div>
                        <small className={styles.vehicleSubText}>
                          {selectedVehicle.color} • {selectedVehicle.vehicleType}
                        </small>
                      </div>
                    </div>

                    {/* Package block */}
                    <div className={styles.comboDetailSection}>
                      <span className={styles.detailLabel}>
                        <Sparkles
                          size={12}
                          style={{
                            marginRight: "4px",
                            verticalAlign: "middle",
                            display: "inline-block",
                          }}
                        />
                        {language === "vi" ? "Gói rửa bao gồm" : "Included Service"}
                      </span>
                      <div className={styles.comboPackageWrapper}>
                        <strong className={styles.comboPackageName}>{selectedPackage.name}</strong>
                        <div className={styles.comboPackageDuration}>
                          <Clock
                            size={12}
                            style={{
                              marginRight: "4px",
                              verticalAlign: "middle",
                              display: "inline-block",
                            }}
                          />
                          {selectedPackage.durationMinutes} {language === "vi" ? "phút" : "mins"}
                        </div>
                        <p className={styles.comboPackageDesc}>{selectedPackage.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer metadata line */}
                  <div className={styles.comboFooterMeta}>
                    <span className={styles.validityBadge}>
                      <Calendar
                        size={12}
                        style={{
                          marginRight: "4px",
                          verticalAlign: "middle",
                          display: "inline-block",
                        }}
                      />
                      {language === "vi"
                        ? `Có hiệu lực đến ${activeCombo.validUntil}`
                        : `Valid until ${activeCombo.validUntil}`}
                    </span>
                  </div>
                </div>
              ) : (
                <p className={styles.warningText}>{copy.noCombo}</p>
              )}
            </div>
          ) : (
            <>
              <div className={styles.stepBlock} ref={vehicleDropdownRef}>
                <span className={styles.stepLabel}>Detail 1</span>
                <h2>{copy.selectVehicle}</h2>
                {selectedVehicle && (
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full text-left relative overflow-hidden rounded-2xl border-2 border-blue-600 bg-white p-5 shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer hover:shadow-md"
                      onClick={() => setIsVehicleDropdownOpen(!isVehicleDropdownOpen)}
                    >
                      <div className="absolute top-0 right-0 w-0 h-0 border-t-[24px] border-l-[24px] border-t-blue-600 border-l-transparent" />
                      <div className="flex justify-between items-center pr-6">
                        <div className="flex justify-between items-center w-full gap-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <strong className="text-base font-bold text-slate-800">
                                {selectedVehicle.brand} {selectedVehicle.model}
                              </strong>
                              {selectedVehicle.isDefault && (
                                <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-green-100 text-green-800 uppercase">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-slate-500">
                              {selectedVehicle.vehicleType} • {selectedVehicle.color}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="inline-flex border-2 border-slate-800 rounded-lg px-3.5 py-1.5 bg-slate-50 text-slate-900 text-sm font-extrabold tracking-wider shadow-sm uppercase">
                              {selectedVehicle.licensePlate}
                            </div>
                          </div>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-5 w-5 text-slate-400 transition-transform duration-300 ml-4 flex-shrink-0",
                            isVehicleDropdownOpen && "transform rotate-180 text-blue-600",
                          )}
                        />
                      </div>
                    </button>
                  </div>
                )}

                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isVehicleDropdownOpen
                      ? "grid-rows-[1fr] opacity-100 mt-2"
                      : "grid-rows-[0fr] opacity-0 pointer-events-none",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-3 p-1 max-h-[300px] overflow-y-auto">
                      {vehicles
                        .filter((v) => v.id !== selection.vehicleId)
                        .map((vehicle) => (
                          <button
                            key={vehicle.id}
                            type="button"
                            className="w-full text-left rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-slate-50/50 hover:shadow cursor-pointer"
                            onClick={() => {
                              updateSelection({ vehicleId: vehicle.id });
                              setIsVehicleDropdownOpen(false);
                            }}
                          >
                            <div className="flex justify-between items-center w-full gap-4">
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <strong className="text-base font-bold text-slate-800">
                                    {vehicle.brand} {vehicle.model}
                                  </strong>
                                  {vehicle.isDefault && (
                                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-green-100 text-green-800 uppercase">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-slate-500">
                                  {vehicle.vehicleType} • {vehicle.color}
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                <div className="inline-flex border-2 border-slate-800 rounded-lg px-3.5 py-1.5 bg-slate-50 text-slate-900 text-sm font-extrabold tracking-wider shadow-sm uppercase">
                                  {vehicle.licensePlate}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.stepBlock} ref={packageDropdownRef}>
                <span className={styles.stepLabel}>Detail 2</span>
                <h2>{copy.selectPackage}</h2>
                {selectedPackage && (
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full text-left relative overflow-hidden rounded-2xl border-2 border-blue-600 bg-white p-5 shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer hover:shadow-md"
                      onClick={() => setIsPackageDropdownOpen(!isPackageDropdownOpen)}
                    >
                      <div className="absolute top-0 right-0 w-0 h-0 border-t-[24px] border-l-[24px] border-t-blue-600 border-l-transparent" />
                      <div className="flex justify-between items-center pr-6">
                        <div className="flex flex-col gap-3 w-full">
                          <div className="flex justify-between items-center gap-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <strong className="text-base font-bold text-slate-800">
                                {selectedPackage.name}
                              </strong>
                              <span className="inline-flex items-center text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                <Clock className="mr-1 h-3.5 w-3.5" />
                                {selectedPackage.durationMinutes} {language === "vi" ? "phút" : "mins"}
                              </span>
                            </div>
                            <span className="text-base font-extrabold text-blue-600">
                              {selectedPackage.price.toLocaleString()} VND
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 leading-relaxed">
                            {selectedPackage.description}
                          </p>
                          {selectedPackage.highlights && selectedPackage.highlights.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {selectedPackage.highlights.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="text-xs text-slate-400 italic border-t border-slate-100 pt-2.5 mt-1">
                            {language === "vi" ? "Phù hợp cho:" : "Best for:"}{" "}
                            {selectedPackage.recommendedFor}
                          </div>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-5 w-5 text-slate-400 transition-transform duration-300 ml-4 flex-shrink-0",
                            isPackageDropdownOpen && "transform rotate-180 text-blue-600",
                          )}
                        />
                      </div>
                    </button>
                  </div>
                )}

                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isPackageDropdownOpen
                      ? "grid-rows-[1fr] opacity-100 mt-2"
                      : "grid-rows-[0fr] opacity-0 pointer-events-none",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-3 p-1 max-h-[350px] overflow-y-auto">
                      {activeServicePackages
                        .filter((p) => p.id !== selection.packageId)
                        .map((servicePackage) => (
                          <button
                            key={servicePackage.id}
                            type="button"
                            className="w-full text-left rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-slate-50/50 hover:shadow cursor-pointer"
                            onClick={() => {
                              updateSelection({ packageId: servicePackage.id });
                              setIsPackageDropdownOpen(false);
                            }}
                          >
                            <div className="flex flex-col gap-3 w-full">
                              <div className="flex justify-between items-center gap-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <strong className="text-base font-bold text-slate-800">
                                    {servicePackage.name}
                                  </strong>
                                  <span className="inline-flex items-center text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                    <Clock className="mr-1 h-3.5 w-3.5" />
                                    {servicePackage.durationMinutes}{" "}
                                    {language === "vi" ? "phút" : "mins"}
                                  </span>
                                </div>
                                <span className="text-base font-extrabold text-blue-600">
                                  {servicePackage.price.toLocaleString()} VND
                                </span>
                              </div>
                              <p className="text-sm text-slate-500 leading-relaxed">
                                {servicePackage.description}
                              </p>
                              {servicePackage.highlights &&
                                servicePackage.highlights.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {servicePackage.highlights.map((tag) => (
                                      <span
                                        key={tag}
                                        className="inline-flex items-center text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              <div className="text-xs text-slate-400 italic border-t border-slate-100 pt-2.5 mt-1">
                                {language === "vi" ? "Phù hợp cho:" : "Best for:"}{" "}
                                {servicePackage.recommendedFor}
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
                <details className={styles.addonAccordion}>
                  <summary className={styles.addonAccordionTrigger}>
                    <span>
                      <b>Add-ons</b>
                      <small>
                        {selection.addonIds.length > 0
                          ? `${selection.addonIds.length} selected`
                          : "Optional extras for this package"}
                      </small>
                    </span>
                    <em>
                      {addOnTotal.toLocaleString()} VND / +{addOnDuration} min
                    </em>
                  </summary>
                  <div className={styles.addonList}>
                    {serviceAddons.map((addon) => {
                      const checked = selection.addonIds.includes(addon.id);

                      return (
                        <label
                          key={addon.id}
                          className={checked ? styles.addonOptionSelected : styles.addonOption}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleAddon(addon.id)}
                          />
                          <span className={styles.addonRowContent}>
                            <span className={styles.addonTitleRow}>
                              <b>{addon.name}</b>
                              <span
                                className={styles.addonInfo}
                                aria-label={addon.description}
                                role="note"
                                tabIndex={0}
                              >
                                i<span className={styles.addonTooltip}>{addon.description}</span>
                              </span>
                            </span>
                            <small>
                              +{addon.price.toLocaleString()} VND / +{addon.durationMinutes} min
                            </small>
                          </span>
                          <span className={checked ? styles.addonToggleOn : styles.addonToggle}>
                            <span />
                          </span>
                        </label>
                      );
                    })}
                </div>
                </details>
            </>
          )}

          <div className={styles.stepBlock}>
            <span className={styles.stepLabel}>{isComboBooking ? "Detail 2" : "Detail 3"}</span>
            <h2>Pick schedule</h2>
            <BookingTimePicker
              date={selection.scheduledDate}
              occupiedSlotKeys={occupiedSlotKeys}
              time={selection.scheduledTime}
              onDateChange={(scheduledDate) => updateSelection({ scheduledDate })}
              onTimeChange={(scheduledTime) => updateSelection({ scheduledTime })}
            />
          </div>

          {!isComboBooking ? (
            <>
              <div className={styles.stepBlock}>
                <span className={styles.stepLabel}>Detail 4</span>
                <h2>{copy.voucher}</h2>
                <div className={styles.manualVoucher}>
                  <label className={styles.field}>
                    <span>{copy.manualVoucher}</span>
                    <input
                      value={manualVoucherCode}
                      onChange={(event) => setManualVoucherCode(event.target.value)}
                      placeholder={copy.enterVoucher}
                    />
                  </label>
                  <button type="button" onClick={applyManualVoucher}>
                    {copy.applyCode}
                  </button>
                </div>
                <div className={styles.promoGrid}>
                  {availableVouchers.map((voucher) => {
                    const selected = selection.voucherId === voucher.id;

                    return (
                      <button
                        key={voucher.id}
                        type="button"
                        className={selected ? styles.promoCardActive : styles.promoCard}
                        onClick={() => updateSelection({ voucherId: voucher.id })}
                      >
                        <strong>{voucher.code}</strong>
                        <span>{voucher.label}</span>
                        <small>
                          -{voucher.discountAmount.toLocaleString()} VND / until {voucher.expiresAt}
                        </small>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.stepBlock}>
                <span className={styles.stepLabel}>Detail 5</span>
                <h2>{copy.payment}</h2>
                <div className={styles.paymentGrid}>
                  {paymentMethods.map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      className={
                        selection.paymentMethod === method.value
                          ? styles.paymentCardActive
                          : styles.paymentCard
                      }
                      onClick={() => updateSelection({ paymentMethod: method.value })}
                    >
                      <strong>{method.label}</strong>
                      <span>{method.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </section>

      <aside className={styles.summaryPanel}>
        <section className={styles.summarySection}>
          {summary ? (
            <>
              <div className={styles.summaryHero}>
                <strong>{summary.package.name}</strong>
                <span>{summary.paidViaCombo ? "Active combo" : "Single wash booking"}</span>
                <b>{summary.finalAmount.toLocaleString()} VND</b>
              </div>
              <div className={styles.summaryQuickStats}>
                <article>
                  <span>Vehicle</span>
                  <strong>{selectedVehicle?.licensePlate ?? "--"}</strong>
                </article>
                <article>
                  <span>Schedule</span>
                  <strong>{summary.scheduledTime}</strong>
                </article>
                <article>
                  <span>Voucher</span>
                  <strong>{summary.voucherCode ?? copy.none}</strong>
                </article>
              </div>
              <dl className={styles.summaryList}>
                <div>
                  <dt>Booking type</dt>
                  <dd>{summary.paidViaCombo ? "Active combo" : "Single wash"}</dd>
                </div>
                <div>
                  <dt>Vehicle</dt>
                  <dd>{summary.vehicleLabel}</dd>
                </div>
                <div>
                  <dt>Package</dt>
                  <dd>{summary.package.name}</dd>
                </div>
                <div>
                  <dt>Date & time</dt>
                  <dd>
                    {summary.scheduledDate} {summary.scheduledTime}
                  </dd>
                </div>
                <div>
                  <dt>Note</dt>
                  <dd>{summary.note || copy.none}</dd>
                </div>
                <div>
                  <dt>Package price</dt>
                  <dd>{summary.originalPrice.toLocaleString()} VND</dd>
                </div>
                <div>
                  <dt>Add-ons</dt>
                  <dd>
                    {summary.addOns.length > 0
                      ? `${summary.addOns.length} selected / ${summary.addOnTotal.toLocaleString()} VND`
                      : copy.none}
                  </dd>
                </div>
                {summary.comboUpgradeAmount > 0 ? (
                  <div>
                    <dt>Combo upgrade</dt>
                    <dd>
                      {summary.comboUpgradeName ?? "Selected combo"} /{" "}
                      {summary.comboUpgradeAmount.toLocaleString()} VND
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt>Voucher</dt>
                  <dd>
                    {summary.voucherCode
                      ? `${summary.voucherCode} / -${summary.voucherDiscount.toLocaleString()} VND`
                      : "None"}
                  </dd>
                </div>
                <div>
                  <dt>Payment method</dt>
                  <dd>{summary.paymentMethod ?? copy.comboCredit}</dd>
                </div>
                <div>
                  <dt>Payment status</dt>
                  <dd>{summary.paymentStatus}</dd>
                </div>
                <div className={styles.finalAmount}>
                  <dt>Final Amount</dt>
                  <dd>{summary.finalAmount.toLocaleString()} VND</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className={styles.summaryPlaceholder}>
              Complete the booking details to see a complete review before confirming.
            </p>
          )}
          {error ? <p className={styles.warningText}>{error}</p> : null}
          <button className={styles.confirmButton} type="button" onClick={handleConfirm}>
            {copy.confirm}
          </button>
        </section>
      </aside>
    </div>
  );
}

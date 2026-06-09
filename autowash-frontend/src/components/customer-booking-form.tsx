"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDisplayErrorMessage, getFieldErrorMessage } from "@/lib/api-errors";
import {
  CustomerBookingMultiSelect,
  CustomerBookingSelect,
} from "@/components/customer-booking-select";
import {
  BOOKING_TIME_SLOTS,
  buildBookingSummary,
  formatBookingCurrency,
  getModeLabel,
  getPaymentMethodLabel,
  validateBookingDraft,
} from "@/lib/booking-format";
import { getVoucherCodeFormatError, sanitizeVoucherCodeInput, voucherCodeFormatMessage } from "@/lib/validators";
import {
  useActiveCustomerCombos,
  useBookingAddons,
  useBookingCombos,
  useBookingPackages,
  useCreateCustomerBooking,
  useValidateBookingVoucher,
} from "@/hooks/use-bookings";
import { useCustomerVehicles } from "@/hooks/use-customer-vehicles";
import { useBookingStore } from "@/store/booking.store";
import type { BookingDraft, PaymentMethod, VoucherValidationResult } from "@/types/booking.types";

const PAYMENT_METHODS: PaymentMethod[] = ["BANK_TRANSFER", "E_WALLET", "CASH_AT_COUNTER"];

function getTomorrowDate() {
  const next = new Date();
  next.setDate(next.getDate() + 1);
  return next.toISOString().slice(0, 10);
}

export function CustomerBookingForm() {
  const router = useRouter();
  const hasAutoSelectedComboRef = useRef(false);
  const draft = useBookingStore((state) => state.draft);
  const updateDraft = useBookingStore((state) => state.updateDraft);
  const vehiclesQuery = useCustomerVehicles();
  const packagesQuery = useBookingPackages();
  const addonsQuery = useBookingAddons();
  const combosQuery = useBookingCombos();
  const activeCustomerCombosQuery = useActiveCustomerCombos();
  const voucherMutation = useValidateBookingVoucher();
  const createBookingMutation = useCreateCustomerBooking();
  const [validatedVoucher, setValidatedVoucher] = useState<VoucherValidationResult | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [voucherInputError, setVoucherInputError] = useState<string | null>(null);

  const isLoadingCatalog =
    vehiclesQuery.isPending ||
    packagesQuery.isPending ||
    addonsQuery.isPending ||
    combosQuery.isPending ||
    activeCustomerCombosQuery.isPending;
  const catalogError =
    vehiclesQuery.error ??
    packagesQuery.error ??
    addonsQuery.error ??
    combosQuery.error ??
    activeCustomerCombosQuery.error ??
    null;

  const vehicles = vehiclesQuery.data?.items ?? [];
  const packages = packagesQuery.data ?? [];
  const addons = addonsQuery.data ?? [];
  const combos = combosQuery.data ?? [];
  const activeCustomerCombos = activeCustomerCombosQuery.data ?? [];
  const activeOwnedCombos = useMemo(
    () =>
      [...activeCustomerCombos]
        .filter((item) => Number(item.remainingUsages) > 0)
        .sort((left, right) => left.expiresAt.localeCompare(right.expiresAt)),
    [activeCustomerCombos],
  );
  const preferredOwnedComboId = activeOwnedCombos[0]?.comboId ?? "";
  const activeOwnedComboMap = useMemo(
    () => new Map(activeOwnedCombos.map((item) => [item.comboId, item] as const)),
    [activeOwnedCombos],
  );

  useEffect(() => {
    if (!draft.bookingDate) {
      updateDraft({ bookingDate: getTomorrowDate() });
    }
  }, [draft.bookingDate, updateDraft]);

  useEffect(() => {
    if (!draft.vehicleId && vehicles.length > 0) {
      updateDraft({
        vehicleId: vehicles.find((item) => item.isPrimary)?.vehicleId ?? vehicles[0].vehicleId,
      });
    }
  }, [draft.vehicleId, updateDraft, vehicles]);

  useEffect(() => {
    if (draft.mode === "PACKAGE" && !draft.packageId && packages.length > 0) {
      updateDraft({ packageId: packages[0].packageId });
    }
  }, [draft.mode, draft.packageId, packages, updateDraft]);

  useEffect(() => {
    if (draft.mode !== "COMBO") {
      hasAutoSelectedComboRef.current = false;
      return;
    }

    if (combos.length === 0) {
      return;
    }

    const fallbackComboId = preferredOwnedComboId || combos[0]?.comboId || "";
    const availableComboIds = new Set(combos.map((item) => item.comboId));
    const hasValidSelectedCombo = draft.comboId.length > 0 && availableComboIds.has(draft.comboId);

    if (!hasValidSelectedCombo && fallbackComboId) {
      hasAutoSelectedComboRef.current = true;
      updateDraft({ comboId: fallbackComboId });
      return;
    }

    if (
      !hasAutoSelectedComboRef.current &&
      preferredOwnedComboId &&
      draft.comboId !== preferredOwnedComboId
    ) {
      hasAutoSelectedComboRef.current = true;
      updateDraft({ comboId: preferredOwnedComboId });
      return;
    }

    hasAutoSelectedComboRef.current = true;
  }, [combos, draft.comboId, draft.mode, preferredOwnedComboId, updateDraft]);

  const selectedCustomerCombo =
    draft.mode === "COMBO"
      ? activeCustomerCombos.find((item) => item.comboId === draft.comboId) ?? null
      : null;

  const summary = useMemo(
    () =>
      buildBookingSummary(draft, {
        packages,
        addons,
        combos,
        voucher: validatedVoucher,
        ownedComboApplied: Boolean(selectedCustomerCombo),
      }),
    [addons, combos, draft, packages, selectedCustomerCombo, validatedVoucher],
  );

  const errors = useMemo(() => {
    const validationSummary =
      draft.voucherCode.trim().length > 0 && !validatedVoucher
        ? null
        : summary;

    return validateBookingDraft(draft, validationSummary);
  }, [draft, summary, validatedVoucher]);

  const selectedPackageAddons =
    draft.mode === "PACKAGE" && draft.packageId
      ? addons.filter(
          (addon) =>
            addon.status === "ACTIVE" && addon.applicableToPackages.includes(draft.packageId),
        )
      : [];

  const vehicleOptions = vehicles.map((vehicle) => ({
    value: vehicle.vehicleId,
    label: `${vehicle.plate} · ${vehicle.brand} ${vehicle.model}`,
    description: `${vehicle.type}${vehicle.isPrimary ? " · Primary vehicle" : ""}`,
  }));
  const packageOptions = packages.map((item) => ({
    value: item.packageId,
    label: item.name,
    description: item.description,
    helper: `${formatBookingCurrency(item.basePrice)} · ${item.duration} min`,
  }));
  const _comboOptionsCatalog = combos.map((item) => ({
    value: item.comboId,
    label: item.name,
    description: item.description,
    helper: `${formatBookingCurrency(item.basePrice)} · ${item.durationDays} days · max ${item.maxServices} services`,
  }));
  const comboOptions = _comboOptionsCatalog.map((item) => {
    const ownedCombo = activeOwnedComboMap.get(item.value);

    return ownedCombo
      ? {
          ...item,
          description: `Owned combo · ${ownedCombo.remainingUsages} usages left · expires ${new Date(ownedCombo.expiresAt).toLocaleDateString("vi-VN")}`,
        }
      : item;
  });
  const addonOptions = selectedPackageAddons.map((addon) => ({
    value: addon.addonId,
    label: addon.name,
    description: addon.description,
    helper: `${formatBookingCurrency(addon.price)} · ${addon.duration} min`,
  }));

  const validateVoucher = async () => {
    const normalizedCode = sanitizeVoucherCodeInput(draft.voucherCode);
    const formatError = getVoucherCodeFormatError(normalizedCode);

    if (!normalizedCode || !summary) {
      setValidatedVoucher(null);
      setVoucherInputError(null);
      return;
    }

    if (formatError) {
      setValidatedVoucher(null);
      setVoucherInputError(formatError);
      toast.error(formatError);
      return;
    }

    try {
      const result = await voucherMutation.mutateAsync({
        voucherCode: normalizedCode,
        packageId: draft.mode === "PACKAGE" ? draft.packageId : undefined,
        amount: summary.subtotal,
      });
      setValidatedVoucher(result);
      setVoucherInputError(null);
      updateDraft({ voucherCode: result.voucherCode });
      toast.success(`Voucher ${result.voucherCode} applied.`);
    } catch (error) {
      setValidatedVoucher(null);
      toast.error(getDisplayErrorMessage(error));
    }
  };

  const clearVoucher = () => {
    setValidatedVoucher(null);
    setVoucherInputError(null);
    updateDraft({ voucherCode: "" });
    voucherMutation.reset();
  };

  const handleSubmit = async () => {
    setShowValidation(true);
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const booking = await createBookingMutation.mutateAsync(draft);
      toast.success("Booking created successfully.");
      router.push(`/customer/bookings/success?bookingId=${booking.bookingId}`);
    } catch (error) {
      toast.error(getDisplayErrorMessage(error));
    }
  };

  const updateMode = (mode: BookingDraft["mode"]) => {
    setValidatedVoucher(null);
    updateDraft({
      mode,
      packageId: mode === "PACKAGE" ? packages[0]?.packageId ?? "" : "",
      comboId: mode === "COMBO" ? preferredOwnedComboId || combos[0]?.comboId || "" : "",
      addonIds: [],
      voucherCode: "",
    });
  };

  if (isLoadingCatalog) {
    return <BookingPageLoadingState />;
  }

  if (catalogError) {
    return (
      <BookingPageErrorState
        title="Unable to load booking checkout"
        description={getDisplayErrorMessage(catalogError)}
        onRetry={() => {
          void Promise.all([
            vehiclesQuery.refetch(),
            packagesQuery.refetch(),
            addonsQuery.refetch(),
            combosQuery.refetch(),
            activeCustomerCombosQuery.refetch(),
          ]);
        }}
      />
    );
  }

  if (vehicles.length === 0) {
    return (
      <BookingPageErrorState
        title="No active vehicles found"
        description="Add at least one customer vehicle before creating a booking."
        actionHref="/customer/vehicles/add"
        actionLabel="Add vehicle"
      />
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_25%),linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.6fr,1fr]">
        <div className="space-y-6">
          <CheckoutSection step="1" title="Select vehicle">
            <CustomerBookingSelect
              options={vehicleOptions}
              value={draft.vehicleId}
              onValueChange={(vehicleId) => updateDraft({ vehicleId })}
              placeholder="Select a vehicle"
              searchPlaceholder="Search plate, brand, or model..."
              emptyText="No vehicles found."
              renderValue={(option) =>
                option ? (
                  <span className="block">
                    <span className="block truncate font-semibold text-slate-900">
                      {option.label}
                    </span>
                    <span className="block truncate text-xs font-normal text-slate-500">
                      {option.description}
                    </span>
                  </span>
                ) : (
                  "Select a vehicle"
                )
              }
            />
            <FieldError message={showValidation ? errors.vehicleId : null} />
          </CheckoutSection>

          <CheckoutSection step="2" title="Choose booking type">
            <div className="grid gap-3 md:grid-cols-2">
              {(["PACKAGE", "COMBO"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`rounded-2xl border p-4 text-left transition ${
                    draft.mode === mode
                      ? "border-sky-600 bg-sky-50"
                      : "border-slate-200 bg-white hover:border-slate-400"
                  } ${mode === "COMBO" && combos.length === 0 ? "cursor-not-allowed opacity-60" : ""}`}
                  disabled={mode === "COMBO" && combos.length === 0}
                  onClick={() => updateMode(mode)}
                >
                  <div className="text-base font-bold">{getModeLabel(mode)}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {mode === "PACKAGE"
                      ? "Chọn một gói rửa và dịch vụ thêm nếu cần."
                      : "Đặt trực tiếp từ danh sách combo hiện có."}
                  </div>
                </button>
              ))}
            </div>
            {draft.mode === "COMBO" ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Select a combo first. If you already own a valid combo of the same type, the combo
                charge is skipped and the booking uses the remaining usages from that owned combo.
              </div>
            ) : null}
          </CheckoutSection>

          <CheckoutSection
            step="3"
            title={draft.mode === "PACKAGE" ? "Select wash package" : "Select combo"}
          >
            {draft.mode === "PACKAGE" ? (
              <CustomerBookingSelect
                options={packageOptions}
                value={draft.packageId}
                onValueChange={(packageId) =>
                  updateDraft({
                    packageId,
                    addonIds: [],
                    voucherCode: "",
                  })
                }
                placeholder="Select a wash package"
                searchPlaceholder="Search package name or description..."
                emptyText="No packages found."
                renderValue={(option) =>
                  option ? (
                    <span className="block">
                      <span className="block truncate font-semibold text-slate-900">
                        {option.label}
                      </span>
                      <span className="block truncate text-xs font-normal text-slate-500">
                        {option.helper}
                      </span>
                    </span>
                  ) : (
                    "Select a wash package"
                  )
                }
              />
            ) : (
              <CustomerBookingSelect
                options={comboOptions}
                value={draft.comboId}
                onValueChange={(comboId) => updateDraft({ comboId, voucherCode: "" })}
                placeholder="Select a combo"
                searchPlaceholder="Search combo name or description..."
                emptyText="No combos found."
                renderValue={(option) =>
                  option ? (
                    <span className="block">
                      <span className="block truncate font-semibold text-slate-900">
                        {option.label}
                      </span>
                      <span className="block truncate text-xs font-normal text-slate-500">
                        {option.helper}
                      </span>
                    </span>
                  ) : (
                    "Select a combo"
                  )
                }
              />
            )}
            <FieldError
              message={
                showValidation
                  ? draft.mode === "PACKAGE"
                    ? errors.packageId
                    : errors.comboId
                  : null
              }
            />
          </CheckoutSection>

          <CheckoutSection step="4" title="Select add-ons">
            {draft.mode === "COMBO" ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-500">
                  Combo bookings do not use add-ons in this simplified flow.
                </p>
                {selectedCustomerCombo ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                    <div className="font-semibold">Owned combo applied</div>
                    <div className="mt-1">
                      {selectedCustomerCombo.remainingUsages} usages left, expires on{" "}
                      {new Date(selectedCustomerCombo.expiresAt).toLocaleDateString("vi-VN")}.
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    No valid owned combo found. Completing this booking will also purchase the
                    selected combo.
                  </div>
                )}
              </div>
            ) : selectedPackageAddons.length === 0 ? (
              <p className="text-sm text-slate-500">
                No active add-ons are available for the selected package.
              </p>
            ) : (
              <CustomerBookingMultiSelect
                options={addonOptions}
                value={draft.addonIds}
                onValueChange={(addonIds) => updateDraft({ addonIds, voucherCode: "" })}
                placeholder="Select one or more add-ons"
                searchPlaceholder="Search add-on name or description..."
                emptyText="No add-ons found."
              />
            )}
          </CheckoutSection>

          <CheckoutSection step="5" title="Choose schedule">
            <div className="grid gap-4 xl:grid-cols-[220px,1fr]">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Booking date</label>
                <input
                  type="date"
                  min={getTomorrowDate()}
                  value={draft.bookingDate}
                  onChange={(event) => updateDraft({ bookingDate: event.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                />
                <FieldError message={showValidation ? errors.bookingDate : null} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Booking time</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {BOOKING_TIME_SLOTS.map((time) => (
                    <button
                      key={time}
                      type="button"
                      className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                        draft.bookingTime === time
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 bg-white hover:border-slate-500"
                      }`}
                      onClick={() => updateDraft({ bookingTime: time })}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                <FieldError message={showValidation ? errors.bookingTime : null} />
              </div>
            </div>
          </CheckoutSection>

          <CheckoutSection step="6" title="Validate voucher">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={draft.voucherCode}
                onChange={(event) => {
                  const nextValue = sanitizeVoucherCodeInput(event.target.value);
                  setValidatedVoucher(null);
                  setVoucherInputError(getVoucherCodeFormatError(nextValue));
                  updateDraft({ voucherCode: nextValue });
                }}
                placeholder="Nhập mã giảm giá (VD: WELCOME20)"
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium tracking-wide"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => void validateVoucher()}
                disabled={
                  !draft.voucherCode.trim() ||
                  Boolean(voucherInputError) ||
                  voucherMutation.isPending ||
                  !summary
                }
              >
                {voucherMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Validate
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={clearVoucher}
                disabled={!draft.voucherCode && !validatedVoucher}
              >
                Clear
              </Button>
            </div>
            <p className="text-xs text-slate-500">{voucherCodeFormatMessage}</p>
            <p className="text-sm text-slate-500">
              Voucher validation uses the real contract with the current subtotal.
            </p>
            {validatedVoucher ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {validatedVoucher.voucherCode} applied. Discount{" "}
                {formatBookingCurrency(validatedVoucher.discountAmount)}.
              </div>
            ) : null}
            <FieldError
              message={
                voucherInputError ??
                (showValidation
                  ? errors.voucherCode
                  : getFieldErrorMessage(voucherMutation.error?.errors, "voucherCode"))
              }
            />
          </CheckoutSection>

          <CheckoutSection step="7" title="Choose payment and review">
            <div className="grid gap-3 md:grid-cols-3">
              {PAYMENT_METHODS.map((method) => {
                const active = draft.paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    className={`rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 bg-white hover:border-slate-400"
                    }`}
                    onClick={() => updateDraft({ paymentMethod: method })}
                  >
                    <div className="font-semibold text-slate-900">
                      {getPaymentMethodLabel(method)}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Demo checkout only. No real bank or wallet transaction is executed.
                    </div>
                  </button>
                );
              })}
            </div>
            <FieldError message={showValidation ? errors.paymentMethod : null} />
            {createBookingMutation.isError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {getDisplayErrorMessage(createBookingMutation.error)}
              </div>
            ) : null}
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => void handleSubmit()}
              disabled={createBookingMutation.isPending}
            >
              {createBookingMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Submit booking
            </Button>
          </CheckoutSection>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card className="border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <CardTitle>Checkout review</CardTitle>
              <CardDescription>
                The summary reflects the actual API payload and validated voucher result.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary ? (
                <>
                  <SummaryItem label="Booking type" value={getModeLabel(summary.itemType)} />
                  <SummaryItem label="Selected item" value={summary.itemName} />
                  <SummaryItem
                    label="Vehicle"
                    value={vehicles.find((item) => item.vehicleId === draft.vehicleId)?.plate ?? "--"}
                  />
                  <SummaryItem
                    label="Schedule"
                    value={
                      draft.bookingDate && draft.bookingTime
                        ? `${draft.bookingDate} ${draft.bookingTime}`
                        : "--"
                    }
                  />
                  <SummaryItem label="Estimated duration" value={summary.estimatedDurationLabel} />
                  <SummaryItem
                    label="Base amount"
                    value={formatBookingCurrency(summary.baseAmount)}
                  />
                  <SummaryItem label="Add-ons" value={formatBookingCurrency(summary.addonsTotal)} />
                  <SummaryItem label="Subtotal" value={formatBookingCurrency(summary.subtotal)} />
                  <SummaryItem
                    label="Voucher discount"
                    value={formatBookingCurrency(summary.discountAmount)}
                  />
                  {draft.mode === "COMBO" ? (
                    <SummaryItem
                      label="Owned combo"
                      value={
                        selectedCustomerCombo
                          ? `${selectedCustomerCombo.remainingUsages} usages left`
                          : "Will be purchased with booking"
                      }
                    />
                  ) : null}
                  <SummaryItem
                    label="Payment method"
                    value={
                      draft.paymentMethod ? getPaymentMethodLabel(draft.paymentMethod) : "--"
                    }
                  />
                  <SummaryItem
                    label="Final amount"
                    value={formatBookingCurrency(summary.finalAmount)}
                    emphasize
                  />
                </>
              ) : (
                <p className="text-sm text-slate-500">
                  Complete the checkout steps to build a valid booking summary.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CheckoutSection({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <CardHeader>
        <CardDescription>Step {step}</CardDescription>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function SummaryItem({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 text-sm last:border-b-0 last:pb-0">
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={`text-right ${
          emphasize ? "text-base font-bold text-slate-900" : "font-medium text-slate-800"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function FieldError({ message }: { message: string | null | undefined }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-rose-600">{message}</p>;
}

function BookingPageLoadingState() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-48 animate-pulse rounded-3xl bg-slate-100" />
        <div className="h-48 animate-pulse rounded-3xl bg-slate-100" />
        <div className="h-48 animate-pulse rounded-3xl bg-slate-100" />
      </div>
    </div>
  );
}

function BookingPageErrorState({
  title,
  description,
  onRetry,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-3xl border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {onRetry ? (
            <Button type="button" variant="outline" onClick={onRetry}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Thử lại
            </Button>
          ) : null}
          {actionHref && actionLabel ? (
            <Button asChild>
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}



"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDisplayErrorMessage, getFieldErrorMessage } from "@/lib/api-errors";
import {
  BOOKING_TIME_SLOTS,
  buildBookingSummary,
  formatBookingCurrency,
  getModeLabel,
  getPaymentMethodLabel,
  validateBookingDraft,
} from "@/lib/booking-format";
import {
  useBookingAddons,
  useBookingCombos,
  useBookingPackages,
  useCreateCustomerBooking,
  useValidateBookingVoucher,
} from "@/hooks/use-bookings";
import { useCustomerVehicles } from "@/hooks/use-customer-vehicles";
import {
  EMPTY_BOOKING_DRAFT,
  resetBookingDraft,
  setLastCreatedBooking,
  useBookingStore,
} from "@/store/booking.store";
import type { BookingDraft, PaymentMethod, VoucherValidationResult } from "@/types/booking.types";

const PAYMENT_METHODS: PaymentMethod[] = ["BANK_TRANSFER", "E_WALLET", "CASH_AT_COUNTER"];

function getTomorrowDate() {
  const next = new Date();
  next.setDate(next.getDate() + 1);
  return next.toISOString().slice(0, 10);
}

export function CustomerBookingForm() {
  const draft = useBookingStore((state) => state.draft);
  const updateDraft = useBookingStore((state) => state.updateDraft);
  const lastCreatedBooking = useBookingStore((state) => state.lastCreatedBooking);
  const vehiclesQuery = useCustomerVehicles();
  const packagesQuery = useBookingPackages();
  const addonsQuery = useBookingAddons();
  const combosQuery = useBookingCombos();
  const voucherMutation = useValidateBookingVoucher();
  const createBookingMutation = useCreateCustomerBooking();
  const [validatedVoucher, setValidatedVoucher] = useState<VoucherValidationResult | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const isLoadingCatalog =
    vehiclesQuery.isPending ||
    packagesQuery.isPending ||
    addonsQuery.isPending ||
    combosQuery.isPending;
  const catalogError =
    vehiclesQuery.error ?? packagesQuery.error ?? addonsQuery.error ?? combosQuery.error ?? null;

  const vehicles = vehiclesQuery.data?.items ?? [];
  const packages = packagesQuery.data ?? [];
  const addons = addonsQuery.data ?? [];
  const combos = combosQuery.data ?? [];

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
    if (draft.mode === "COMBO" && !draft.comboId && combos.length > 0) {
      updateDraft({ comboId: combos[0].comboId });
    }
  }, [combos, draft.comboId, draft.mode, updateDraft]);

  const summary = useMemo(
    () =>
      buildBookingSummary(draft, {
        packages,
        addons,
        combos,
        voucher: validatedVoucher,
      }),
    [addons, combos, draft, packages, validatedVoucher],
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

  const validateVoucher = async () => {
    if (!draft.voucherCode.trim() || !summary) {
      setValidatedVoucher(null);
      return;
    }

    try {
      const result = await voucherMutation.mutateAsync({
        voucherCode: draft.voucherCode.trim().toUpperCase(),
        packageId: draft.mode === "PACKAGE" ? draft.packageId : undefined,
        amount: summary.subtotal,
      });
      setValidatedVoucher(result);
      updateDraft({ voucherCode: result.voucherCode });
      toast.success(`Voucher ${result.voucherCode} applied.`);
    } catch (error) {
      setValidatedVoucher(null);
      toast.error(getDisplayErrorMessage(error));
    }
  };

  const clearVoucher = () => {
    setValidatedVoucher(null);
    updateDraft({ voucherCode: "" });
    voucherMutation.reset();
  };

  const handleSubmit = async () => {
    setShowValidation(true);
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await createBookingMutation.mutateAsync(draft);
      toast.success("Booking created successfully.");
    } catch (error) {
      toast.error(getDisplayErrorMessage(error));
    }
  };

  const updateMode = (mode: BookingDraft["mode"]) => {
    setValidatedVoucher(null);
    updateDraft({
      mode,
      packageId: mode === "PACKAGE" ? packages[0]?.packageId ?? "" : "",
      comboId: mode === "COMBO" ? combos[0]?.comboId ?? "" : "",
      addonIds: [],
      voucherCode: "",
    });
  };

  if (lastCreatedBooking) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="border-emerald-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <div className="flex items-center gap-3 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
              <CardTitle>Booking created</CardTitle>
            </div>
            <CardDescription>
              The checkout completed with the real booking API. You can review the result immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <dl className="grid gap-4 md:grid-cols-2">
              <SummaryItem label="Booking ID" value={lastCreatedBooking.bookingId} />
              <SummaryItem label="Confirmation" value={lastCreatedBooking.confirmationNumber} />
              <SummaryItem label="Vehicle" value={lastCreatedBooking.vehiclePlate} />
              <SummaryItem label="Service" value={lastCreatedBooking.packageName} />
              <SummaryItem
                label="Schedule"
                value={`${lastCreatedBooking.bookingDate} ${lastCreatedBooking.bookingTime}`}
              />
              <SummaryItem
                label="Payment"
                value={`${getPaymentMethodLabel(lastCreatedBooking.paymentMethod)} / ${lastCreatedBooking.paymentStatus}`}
              />
              <SummaryItem
                label="Final amount"
                value={formatBookingCurrency(lastCreatedBooking.finalAmount)}
              />
              <SummaryItem label="Status" value={lastCreatedBooking.status} />
            </dl>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={`/customer/bookings/${lastCreatedBooking.bookingId}`}>View booking detail</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/customer/bookings">View booking list</Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setLastCreatedBooking(null);
                  resetBookingDraft();
                  setValidatedVoucher(null);
                  setShowValidation(false);
                  updateDraft({
                    ...EMPTY_BOOKING_DRAFT,
                    bookingDate: getTomorrowDate(),
                    vehicleId:
                      vehicles.find((item) => item.isPrimary)?.vehicleId ??
                      vehicles[0]?.vehicleId ??
                      "",
                    packageId: packages[0]?.packageId ?? "",
                  });
                }}
              >
                Create another booking
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <div className="grid gap-3 md:grid-cols-2">
              {vehicles.map((vehicle) => {
                const active = draft.vehicleId === vehicle.vehicleId;
                return (
                  <button
                    key={vehicle.vehicleId}
                    type="button"
                    className={`rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white hover:border-slate-400"
                    }`}
                    onClick={() => updateDraft({ vehicleId: vehicle.vehicleId })}
                  >
                    <div className="text-sm font-semibold uppercase tracking-[0.2em]">
                      {vehicle.plate}
                    </div>
                    <div className="mt-2 text-lg font-bold">
                      {vehicle.brand} {vehicle.model}
                    </div>
                    <div className={`mt-1 text-sm ${active ? "text-slate-200" : "text-slate-500"}`}>
                      {vehicle.type} {vehicle.isPrimary ? "• Primary vehicle" : ""}
                    </div>
                  </button>
                );
              })}
            </div>
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
                      ? "Select one package and optional add-ons."
                      : "Book directly against the available combo catalog."}
                  </div>
                </button>
              ))}
            </div>
          </CheckoutSection>

          <CheckoutSection
            step="3"
            title={draft.mode === "PACKAGE" ? "Select wash package" : "Select combo"}
          >
            <div className="grid gap-3">
              {draft.mode === "PACKAGE"
                ? packages.map((item) => (
                    <button
                      key={item.packageId}
                      type="button"
                      className={`rounded-2xl border p-4 text-left transition ${
                        draft.packageId === item.packageId
                          ? "border-slate-900 bg-white shadow-md"
                          : "border-slate-200 bg-white hover:border-slate-400"
                      }`}
                      onClick={() =>
                        updateDraft({
                          packageId: item.packageId,
                          addonIds: [],
                          voucherCode: "",
                        })
                      }
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-lg font-bold text-slate-900">{item.name}</div>
                          <div className="mt-1 text-sm text-slate-500">{item.duration} min</div>
                        </div>
                        <div className="text-base font-semibold text-slate-900">
                          {formatBookingCurrency(item.basePrice)}
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">{item.description}</p>
                    </button>
                  ))
                : combos.map((item) => (
                    <button
                      key={item.comboId}
                      type="button"
                      className={`rounded-2xl border p-4 text-left transition ${
                        draft.comboId === item.comboId
                          ? "border-slate-900 bg-white shadow-md"
                          : "border-slate-200 bg-white hover:border-slate-400"
                      }`}
                      onClick={() => updateDraft({ comboId: item.comboId, voucherCode: "" })}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-lg font-bold text-slate-900">{item.name}</div>
                          <div className="mt-1 text-sm text-slate-500">
                            {item.durationDays} days • max {item.maxServices} services
                          </div>
                        </div>
                        <div className="text-base font-semibold text-slate-900">
                          {formatBookingCurrency(item.basePrice)}
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">{item.description}</p>
                    </button>
                  ))}
            </div>
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
              <p className="text-sm text-slate-500">
                Add-ons are currently enabled for package bookings only in the mandatory-first checkout scope.
              </p>
            ) : selectedPackageAddons.length === 0 ? (
              <p className="text-sm text-slate-500">
                No active add-ons are available for the selected package.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {selectedPackageAddons.map((addon) => {
                  const active = draft.addonIds.includes(addon.addonId);
                  return (
                    <button
                      key={addon.addonId}
                      type="button"
                      className={`rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-emerald-600 bg-emerald-50"
                          : "border-slate-200 bg-white hover:border-slate-400"
                      }`}
                      onClick={() =>
                        updateDraft({
                          addonIds: active
                            ? draft.addonIds.filter((addonId) => addonId !== addon.addonId)
                            : [...draft.addonIds, addon.addonId],
                          voucherCode: "",
                        })
                      }
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold text-slate-900">{addon.name}</div>
                        <div className="text-sm text-slate-700">
                          {formatBookingCurrency(addon.price)}
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-slate-500">{addon.duration} min</div>
                      <p className="mt-2 text-sm text-slate-600">{addon.description}</p>
                    </button>
                  );
                })}
              </div>
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
                  setValidatedVoucher(null);
                  updateDraft({ voucherCode: event.target.value });
                }}
                placeholder="Enter voucher code"
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm uppercase"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => void validateVoucher()}
                disabled={!draft.voucherCode.trim() || voucherMutation.isPending || !summary}
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
                showValidation
                  ? errors.voucherCode
                  : getFieldErrorMessage(voucherMutation.error?.errors, "voucherCode")
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
              Retry
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

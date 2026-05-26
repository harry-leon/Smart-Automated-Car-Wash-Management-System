"use client";

import {
  CarFront,
  Loader2,
  Save,
  ShieldCheck,
  Sparkles,
  Truck,
  Bike,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CUSTOMER_VEHICLE_TYPES, type CustomerVehicleFormErrors, type CustomerVehicleFormValues } from "@/types/vehicle.types";

const vehicleTypeMeta = {
  CAR: { label: "Car", icon: CarFront },
  SUV: { label: "SUV", icon: CarFront },
  TRUCK: { label: "Truck", icon: Truck },
  MOTORBIKE: { label: "Motorbike", icon: Bike },
  VAN: { label: "Van", icon: Truck },
} as const;

export function CustomerVehicleFormCard({
  title,
  description,
  form,
  errors,
  submitLabel,
  isSubmitting,
  onChange,
  onSubmit,
  onCancel,
  disableIdentityFields = false,
  extraActions,
}: {
  title: string;
  description: string;
  form: CustomerVehicleFormValues;
  errors: CustomerVehicleFormErrors;
  submitLabel: string;
  isSubmitting: boolean;
  onChange: (field: keyof CustomerVehicleFormValues, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  disableIdentityFields?: boolean;
  extraActions?: React.ReactNode;
}) {
  return (
    <Card className="border-slate-200/80 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <CardHeader className="border-b border-slate-200/70 bg-slate-50/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Customer vehicles
            </div>
            <CardTitle className="text-xl font-black text-slate-900">{title}</CardTitle>
            <CardDescription className="max-w-2xl">{description}</CardDescription>
          </div>
          {extraActions}
        </div>
      </CardHeader>
      <CardContent className="space-y-8 p-6">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <VehicleTextField
              label="License plate"
              value={form.plate}
              onChange={(value) => onChange("plate", value.toUpperCase())}
              placeholder="30H-123456"
              error={errors.plate ?? null}
              description="Backend requires exactly two digits, one capital letter, a dash, and six digits."
              disabled={disableIdentityFields}
            />
            <VehicleTextField
              label="Brand"
              value={form.brand}
              onChange={(value) => onChange("brand", value)}
              placeholder="Toyota"
              error={errors.brand ?? null}
            />
            <VehicleTextField
              label="Model"
              value={form.model}
              onChange={(value) => onChange("model", value)}
              placeholder="Cross"
              error={errors.model ?? null}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <VehicleTextField
                label="Year"
                value={form.year}
                onChange={(value) => onChange("year", value.replace(/[^\d]/g, ""))}
                placeholder="2024"
                error={errors.year ?? null}
                inputMode="numeric"
              />
              <VehicleTextField
                label="Color"
                value={form.color}
                onChange={(value) => onChange("color", value)}
                placeholder="White"
                error={errors.color ?? null}
                description="Optional."
              />
            </div>
          </div>

          <div className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#eff6ff_100%)] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Vehicle type</div>
                <div className="text-xs text-slate-500">
                  This maps directly to the backend enum contract.
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CUSTOMER_VEHICLE_TYPES.map((type) => {
                const meta = vehicleTypeMeta[type];
                const Icon = meta.icon;
                const active = form.type === type;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onChange("type", type)}
                    disabled={disableIdentityFields}
                    className={cn(
                      "rounded-2xl border px-4 py-4 text-left transition",
                      active
                        ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                        : "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50",
                      disableIdentityFields && "cursor-not-allowed opacity-70",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="mt-3 text-sm font-bold">{meta.label}</div>
                    <div className={cn("text-xs", active ? "text-slate-200" : "text-slate-500")}>
                      {type}
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.type ? <p className="text-sm text-rose-700">{errors.type}</p> : null}
            {disableIdentityFields ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Plate and type are read-only here because the backend update contract does not
                accept them.
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="outline" className="rounded-xl" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {submitLabel}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function VehicleTextField({
  label,
  value,
  onChange,
  placeholder,
  error,
  description,
  disabled = false,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error: string | null;
  description?: string;
  disabled?: boolean;
  inputMode?: "text" | "email" | "numeric" | "tel" | "search" | "url" | "none" | "decimal";
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-900">{label}</label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        disabled={disabled}
        className="h-12 rounded-2xl border-slate-200 bg-white px-4 text-sm text-slate-900 focus-visible:ring-sky-200"
      />
      {description ? <p className="text-xs text-slate-500">{description}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}

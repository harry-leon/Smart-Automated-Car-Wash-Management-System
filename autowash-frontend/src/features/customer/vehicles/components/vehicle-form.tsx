"use client";

import {
  Loader2,
  Save,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";
import { type CustomerVehicleFormErrors, type CustomerVehicleFormValues } from "@/features/customer/vehicles/vehicle.types";

const BRAND_OPTIONS = ["Toyota", "Honda", "Ford", "VinFast", "Mazda", "Kia", "Hyundai", "Mercedes-Benz", "BMW", "Audi", "Other"];
const MODEL_OPTIONS = ["Vios", "City", "Ranger", "VF8", "CX-5", "Sorento", "Santa Fe", "C-Class", "X5", "A4", "Sedan", "SUV", "Hatchback", "Crossover", "Pickup", "Minivan", "Other"];
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 20 }, (_, i) => String(currentYear - i)).concat(["Older"]);
const COLOR_OPTIONS = ["White", "Black", "Silver", "Gray", "Red", "Blue", "Brown", "Yellow", "Green", "Other"];

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
    <Card className="border-teal-100 bg-white shadow-[0_18px_44px_rgba(15,118,110,0.08)]">
      <CardHeader className="border-b border-slate-200/70 bg-slate-50/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-md border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
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
        <div className="mx-auto max-w-2xl space-y-5">
          <VehicleTextField
            label="License plate"
            value={form.plate}
            onChange={(value) => onChange("plate", value.toUpperCase())}
            placeholder="30H-123456"
            error={errors.plate ?? null}
            disabled={disableIdentityFields}
          />
          <VehicleSelectField
            label="Brand"
            value={form.brand}
            onChange={(value) => onChange("brand", value)}
            placeholder="Select a brand"
            options={BRAND_OPTIONS}
            error={errors.brand ?? null}
          />
          <VehicleSelectField
            label="Model"
            value={form.model}
            onChange={(value) => onChange("model", value)}
            placeholder="Select a model"
            options={MODEL_OPTIONS}
            error={errors.model ?? null}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <VehicleSelectField
              label="Year"
              value={form.year}
              onChange={(value) => onChange("year", value)}
              placeholder="Select year"
              options={YEAR_OPTIONS}
              error={errors.year ?? null}
            />
            <VehicleSelectField
              label="Color"
              value={form.color}
              onChange={(value) => onChange("color", value)}
              placeholder="Select color"
              options={COLOR_OPTIONS}
              error={errors.color ?? null}
              description="Optional."
            />
          </div>

          {disableIdentityFields ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 mt-4">
              Plate is read-only here because the backend update contract does not
              accept it.
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="outline" className="rounded-xl" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-lg bg-teal-600 px-5 text-white hover:bg-teal-700"
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
        className="h-12 rounded-lg border-slate-200 bg-white px-4 text-sm text-slate-900 focus-visible:ring-teal-200"
      />
      {description ? <p className="text-xs text-slate-500">{description}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}

function VehicleSelectField({
  label,
  value,
  onChange,
  placeholder,
  error,
  description,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error: string | null;
  description?: string;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-900">{label}</label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={cn("h-12 rounded-lg border-slate-200 bg-white px-4 text-sm text-slate-900 focus-visible:ring-teal-200", !value && "text-slate-500")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description ? <p className="text-xs text-slate-500">{description}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}

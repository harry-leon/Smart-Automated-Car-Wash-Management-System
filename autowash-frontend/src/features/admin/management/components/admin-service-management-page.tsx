"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Droplets, Layers3, Loader2, Package, Plus, RefreshCcw, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { AdminManagementTabs } from "@/features/admin/management/components/admin-management-tabs";
import { WorkspacePage } from "@/shared/components/workspace/workspace-page";
import { getDisplayErrorMessage } from "@/shared/lib/api-errors";
import {
  useAdminCatalogPackages,
  useAdminCatalogServices,
  useAdminCombosCatalog,
  useCreateAdminCombo,
  useDeleteAdminCombo,
  useCreateAdminService,
  useDeleteAdminService,
  useCreateAdminPackage,
  useDeleteAdminPackage,
} from "@/features/admin/management/hooks/use-admin-service-management";
import type { AdminComboForm, AdminServiceForm, AdminPackageForm } from "@/features/admin/management/management.types";

const EMPTY_COMBO_FORM: AdminComboForm = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  durationMinutes: "",
  durationDays: "",
  maxUsages: "",
  imageUrl: "",
  status: "ACTIVE",
  optionIds: [],
};

export function AdminServiceManagementPage() {
  return (
    <WorkspacePage className="space-y-6">
      <Card className="border-border/70 bg-card/95 shadow-sm">
        <CardHeader className="gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <Layers3 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Service Management</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AdminManagementTabs
            defaultTab="services"
            tabs={[
              {
                value: "services",
                label: "Services",
                content: <LiveServicesPanel />,
              },
              {
                value: "packages",
                label: "Packages",
                content: <LivePackagesPanel />,
              },
              {
                value: "combos",
                label: "Combos",
                content: <LiveCombosPanel />,
              },
            ]}
          />
        </CardContent>
      </Card>
    </WorkspacePage>
  );
}

function LiveServicesPanel() {
  const servicesQuery = useAdminCatalogServices();
  const createServiceMutation = useCreateAdminService();
  const deleteServiceMutation = useDeleteAdminService();
  const [form, setForm] = useState<AdminServiceForm>({
    name: "",
    description: "",
    price: "",
    duration: "",
    status: "ACTIVE",
  });

  const formErrors = useMemo(() => {
    const errors: Partial<Record<keyof AdminServiceForm, string>> = {};
    if (!form.name.trim()) errors.name = "Name is required.";
    if (!form.price.trim() || Number(form.price) < 0) errors.price = "Price must be 0 or greater.";
    if (!form.duration.trim() || Number(form.duration) < 1) errors.duration = "Duration must be at least 1 minute.";
    return errors;
  }, [form]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Create service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} error={formErrors.name} />
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Price" value={form.price} onChange={(value) => setForm((current) => ({ ...current, price: value }))} error={formErrors.price} />
            <FormField label="Duration minutes" value={form.duration} onChange={(value) => setForm((current) => ({ ...current, duration: value }))} error={formErrors.duration} />
          </div>
          <FormField label="Description" value={form.description} onChange={(value) => setForm((current) => ({ ...current, description: value }))} />
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-800">Status</span>
            <select
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as "ACTIVE" | "INACTIVE" }))}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>

          {createServiceMutation.isError ? (
            <ErrorPanel message={getDisplayErrorMessage(createServiceMutation.error)} />
          ) : null}

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={Object.keys(formErrors).length > 0 || createServiceMutation.isPending}
              onClick={async () => {
                try {
                  await createServiceMutation.mutateAsync(form);
                  setForm({
                    name: "",
                    description: "",
                    price: "",
                    duration: "",
                    status: "ACTIVE",
                  });
                  toast.success("Service created successfully.");
                } catch (error) {
                  toast.error(getDisplayErrorMessage(error));
                }
              }}
            >
              {createServiceMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create service
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Services catalog</CardTitle>
          </div>
          <Button type="button" variant="outline" onClick={() => servicesQuery.refetch()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {servicesQuery.isPending ? (
            <LoadingPanel />
          ) : servicesQuery.isError ? (
            <ErrorPanel message={getDisplayErrorMessage(servicesQuery.error)} />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-1">
                {servicesQuery.data?.map((service) => {
                  const isDeleting = deleteServiceMutation.isPending && deleteServiceMutation.variables === service.serviceId;
                  return (
                    <Card key={service.serviceId} className="border-slate-200 bg-slate-50/50">
                      <CardContent className="p-5 flex items-start justify-between gap-3">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="font-bold text-slate-900">{service.name}</div>
                            <StatusBadge active={service.status === "ACTIVE"} />
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                            <span className="rounded-full bg-white px-2.5 py-1">{service.duration} min</span>
                            <span className="rounded-full bg-white px-2.5 py-1">{formatCurrency(service.price)}</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={service.status !== "ACTIVE" || isDeleting}
                          onClick={async () => {
                            try {
                              await deleteServiceMutation.mutateAsync(service.serviceId);
                              toast.success("Service deactivated.");
                            } catch (error) {
                              toast.error(getDisplayErrorMessage(error));
                            }
                          }}
                        >
                          {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                          Deactivate
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LivePackagesPanel() {
  const packagesQuery = useAdminCatalogPackages();
  const createPackageMutation = useCreateAdminPackage();
  const deletePackageMutation = useDeleteAdminPackage();
  const [form, setForm] = useState<AdminPackageForm>({
    name: "",
    description: "",
    basePrice: "",
    duration: "",
    category: "",
    features: "",
    status: "ACTIVE",
  });

  const formErrors = useMemo(() => {
    const errors: Partial<Record<keyof AdminPackageForm, string>> = {};
    if (!form.name.trim()) errors.name = "Name is required.";
    if (!form.basePrice.trim() || Number(form.basePrice) < 0) errors.basePrice = "Base price must be 0 or greater.";
    if (!form.duration.trim() || Number(form.duration) < 1) errors.duration = "Duration must be at least 1 minute.";
    if (!form.category.trim()) errors.category = "Category is required.";
    return errors;
  }, [form]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Create package</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} error={formErrors.name} />
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Base price" value={form.basePrice} onChange={(value) => setForm((current) => ({ ...current, basePrice: value }))} error={formErrors.basePrice} />
            <FormField label="Duration minutes" value={form.duration} onChange={(value) => setForm((current) => ({ ...current, duration: value }))} error={formErrors.duration} />
          </div>
          <FormField label="Category (e.g. Basic, Premium)" value={form.category} onChange={(value) => setForm((current) => ({ ...current, category: value }))} error={formErrors.category} />
          <FormField label="Features (comma separated)" value={form.features} onChange={(value) => setForm((current) => ({ ...current, features: value }))} placeholder="Vacuuming, Hand wash, Tire shine" />
          <FormField label="Description" value={form.description} onChange={(value) => setForm((current) => ({ ...current, description: value }))} />
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-800">Status</span>
            <select
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as "ACTIVE" | "INACTIVE" }))}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>

          {createPackageMutation.isError ? (
            <ErrorPanel message={getDisplayErrorMessage(createPackageMutation.error)} />
          ) : null}

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={Object.keys(formErrors).length > 0 || createPackageMutation.isPending}
              onClick={async () => {
                try {
                  await createPackageMutation.mutateAsync(form);
                  setForm({
                    name: "",
                    description: "",
                    basePrice: "",
                    duration: "",
                    category: "",
                    features: "",
                    status: "ACTIVE",
                  });
                  toast.success("Package created successfully.");
                } catch (error) {
                  toast.error(getDisplayErrorMessage(error));
                }
              }}
            >
              {createPackageMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create package
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Packages catalog</CardTitle>
          </div>
          <Button type="button" variant="outline" onClick={() => packagesQuery.refetch()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {packagesQuery.isPending ? (
            <LoadingPanel />
          ) : packagesQuery.isError ? (
            <ErrorPanel message={getDisplayErrorMessage(packagesQuery.error)} />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-1">
                {packagesQuery.data?.map((pkg) => {
                  const isDeleting = deletePackageMutation.isPending && deletePackageMutation.variables === pkg.packageId;
                  return (
                    <Card key={pkg.packageId} className="border-slate-200 bg-slate-50/50">
                      <CardContent className="p-5 flex items-start justify-between gap-3">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="font-bold text-slate-900">{pkg.name}</div>
                            <StatusBadge active={pkg.status === "ACTIVE"} />
                          </div>
                          <div className="text-xs uppercase tracking-wide text-slate-500">{pkg.category}</div>
                          <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                            <span className="rounded-full bg-white px-2.5 py-1">{pkg.duration} min</span>
                            <span className="rounded-full bg-white px-2.5 py-1">{formatCurrency(pkg.basePrice)}</span>
                            {pkg.popularity ? <span className="rounded-full bg-white px-2.5 py-1">{pkg.popularity}</span> : null}
                          </div>
                          {pkg.features.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {pkg.features.map((feature) => (
                                <span key={feature} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={pkg.status !== "ACTIVE" || isDeleting}
                          onClick={async () => {
                            try {
                              await deletePackageMutation.mutateAsync(pkg.packageId);
                              toast.success("Package deactivated.");
                            } catch (error) {
                              toast.error(getDisplayErrorMessage(error));
                            }
                          }}
                        >
                          {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                          Deactivate
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LiveCombosPanel() {
  const servicesQuery = useAdminCatalogServices();
  const combosQuery = useAdminCombosCatalog();
  const createComboMutation = useCreateAdminCombo();
  const deleteComboMutation = useDeleteAdminCombo();
  const [form, setForm] = useState<AdminComboForm>(EMPTY_COMBO_FORM);

  const formErrors = useMemo(() => {
    const errors: Partial<Record<keyof AdminComboForm, string>> = {};
    if (!form.name.trim()) errors.name = "Name is required.";
    if (!form.price.trim() || Number(form.price) < 0) errors.price = "Price must be 0 or greater.";
    if (!form.durationMinutes.trim() || Number(form.durationMinutes) < 1) errors.durationMinutes = "Duration must be at least 1 minute.";
    if (form.durationDays.trim() && Number(form.durationDays) < 1) errors.durationDays = "Duration days must be at least 1.";
    if (form.maxUsages.trim() && Number(form.maxUsages) < 1) errors.maxUsages = "Max usages must be at least 1.";
    if (form.optionIds.length === 0) errors.optionIds = "Select at least one service.";
    return errors;
  }, [form]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Create combo</CardTitle>
          <CardDescription>
            `POST /api/v1/admin/combos` is wired. Each selected service is sent as a combo option with quantity 1.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} error={formErrors.name} />
            <FormField label="Price" value={form.price} onChange={(value) => setForm((current) => ({ ...current, price: value }))} error={formErrors.price} />
            <FormField label="Original price" value={form.originalPrice} onChange={(value) => setForm((current) => ({ ...current, originalPrice: value }))} />
            <FormField label="Duration minutes" value={form.durationMinutes} onChange={(value) => setForm((current) => ({ ...current, durationMinutes: value }))} error={formErrors.durationMinutes} />
            <FormField label="Duration days" value={form.durationDays} onChange={(value) => setForm((current) => ({ ...current, durationDays: value }))} error={formErrors.durationDays} />
            <FormField label="Max usages" value={form.maxUsages} onChange={(value) => setForm((current) => ({ ...current, maxUsages: value }))} error={formErrors.maxUsages} />
          </div>
          <FormField
            label="Description"
            value={form.description}
            onChange={(value) => setForm((current) => ({ ...current, description: value }))}
          />
          <FormField
            label="Image URL"
            value={form.imageUrl}
            onChange={(value) => setForm((current) => ({ ...current, imageUrl: value }))}
          />
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-800">Status</span>
            <select
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as "ACTIVE" | "INACTIVE" }))}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>

          <div className="grid gap-2">
            <div className="text-sm font-semibold text-slate-800">Services included</div>
            {servicesQuery.isPending ? (
              <LoadingPanel />
            ) : servicesQuery.isError ? (
              <ErrorPanel message={getDisplayErrorMessage(servicesQuery.error)} />
            ) : (
              <div className="grid max-h-64 gap-2 overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
                {servicesQuery.data?.map((service) => {
                  const checked = form.optionIds.includes(service.serviceId);
                  return (
                    <label key={service.serviceId} className="flex items-start gap-3 rounded-xl border border-white bg-white px-3 py-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            optionIds: event.target.checked
                              ? [...current.optionIds, service.serviceId]
                              : current.optionIds.filter((item) => item !== service.serviceId),
                          }))
                        }
                        className="mt-1 h-4 w-4"
                      />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{service.name}</div>
                        <div className="text-xs text-slate-500">{service.duration} min · {formatCurrency(service.price)}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
            {formErrors.optionIds ? <p className="text-sm text-rose-600">{formErrors.optionIds}</p> : null}
          </div>

          {createComboMutation.isError ? (
            <ErrorPanel message={getDisplayErrorMessage(createComboMutation.error)} />
          ) : null}

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={Object.keys(formErrors).length > 0 || createComboMutation.isPending}
              onClick={async () => {
                try {
                  await createComboMutation.mutateAsync(form);
                  setForm(EMPTY_COMBO_FORM);
                  toast.success("Combo created successfully.");
                } catch (error) {
                  toast.error(getDisplayErrorMessage(error));
                }
              }}
            >
              {createComboMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create combo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Live combo catalog</CardTitle>
          </div>
          <Button type="button" variant="outline" onClick={() => combosQuery.refetch()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {combosQuery.isPending ? (
            <LoadingPanel />
          ) : combosQuery.isError ? (
            <ErrorPanel message={getDisplayErrorMessage(combosQuery.error)} />
          ) : !combosQuery.data || combosQuery.data.length === 0 ? (
            <Card className="border-slate-200 bg-slate-50/50">
              <CardContent className="p-5 text-sm text-slate-500">No combos found.</CardContent>
            </Card>
          ) : (
            combosQuery.data.map((combo) => {
              const isDeleting =
                deleteComboMutation.isPending && deleteComboMutation.variables === combo.comboId;

              return (
                <Card key={combo.comboId} className="border-slate-200 bg-slate-50/50">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-lg font-bold text-slate-900">{combo.name}</div>
                          <StatusBadge active={combo.isActive} />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!combo.isActive || isDeleting}
                        onClick={async () => {
                          try {
                            await deleteComboMutation.mutateAsync(combo.comboId);
                            toast.success("Combo deactivated.");
                          } catch (error) {
                            toast.error(getDisplayErrorMessage(error));
                          }
                        }}
                      >
                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Deactivate
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                      <span className="rounded-full bg-white px-2.5 py-1">{formatCurrency(combo.basePrice)}</span>
                      <span className="rounded-full bg-white px-2.5 py-1">{combo.durationDays} days</span>
                      <span className="rounded-full bg-white px-2.5 py-1">{combo.maxServices} services</span>
                    </div>
                    {combo.benefits.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {combo.benefits.map((benefit) => (
                          <span key={`${combo.comboId}-${benefit}`} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryEntryCard({
  icon: Icon,
  title,
  description,
  href,
  cta,
}: {
  icon: typeof Layers3;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <Card className="border-border/70 bg-white shadow-sm">
      <CardContent className="space-y-4 p-6 flex flex-col justify-between h-full">
        <div className="space-y-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">{title}</div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button asChild type="button" className="mt-4 w-full">
          <Link href={href}>{cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function BackendGapNotice({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"
      />
      {error ? <span className="text-sm text-rose-600">{error}</span> : null}
    </label>
  );
}

function LoadingPanel() {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
      <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {message}
    </div>
  );
}

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")} VND`;
}

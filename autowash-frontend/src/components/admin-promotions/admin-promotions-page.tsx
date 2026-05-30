"use client";

import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDisplayErrorMessage } from "@/lib/api-errors";
import {
  useAdminPromotions,
  useCreateAdminPromotion,
  useDeleteAdminPromotion,
  useUpdateAdminPromotion,
} from "@/hooks/use-admin-promotions";
import type { ApiErrorResponse } from "@/types/api.types";
import type {
  Promotion,
  PromotionDiscountType,
  PromotionRequest,
  PromotionStatus,
  PromotionTargetingMode,
} from "@/types/promotion.types";
import type { LoyaltyTier } from "@/types/loyalty.types";

type PromotionFormValues = {
  name: string;
  description: string;
  discountType: PromotionDiscountType;
  discountValue: string;
  startDate: string;
  endDate: string;
  targetingMode: PromotionTargetingMode;
  applicableTiers: LoyaltyTier[];
  maxUsagePerCustomer: string;
  status: PromotionStatus;
};

type PromotionFormErrors = Partial<Record<keyof PromotionFormValues, string>>;

const PAGE_LIMIT = 20;
const ALL_TIERS: LoyaltyTier[] = ["MEMBER", "SILVER", "GOLD", "PLATINUM"];
const EMPTY_FORM: PromotionFormValues = {
  name: "",
  description: "",
  discountType: "PERCENT",
  discountValue: "",
  startDate: "",
  endDate: "",
  targetingMode: "ALL_TIERS",
  applicableTiers: [],
  maxUsagePerCustomer: "",
  status: "ACTIVE",
};

export function AdminPromotionsPageContent() {
  const [page, setPage] = useState(1);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [form, setForm] = useState<PromotionFormValues>(EMPTY_FORM);
  const [showValidation, setShowValidation] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const promotionsQuery = useAdminPromotions(page, PAGE_LIMIT);
  const createMutation = useCreateAdminPromotion();
  const updateMutation = useUpdateAdminPromotion();
  const deleteMutation = useDeleteAdminPromotion();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const activeMutationError = (createMutation.error ?? updateMutation.error) as ApiErrorResponse | null;
  const clientErrors = useMemo(() => validatePromotionForm(form), [form]);
  const displayErrors = mergeFormErrors(clientErrors, activeMutationError, showValidation);

  const isEditing = Boolean(editingPromotion);
  const canGoPrev = page > 1;
  const canGoNext = Boolean(promotionsQuery.data?.pagination.hasMore);

  const handleResetForm = () => {
    setEditingPromotion(null);
    setForm(EMPTY_FORM);
    setShowValidation(false);
    createMutation.reset();
    updateMutation.reset();
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setForm(toFormValues(promotion));
    setShowValidation(false);
    createMutation.reset();
    updateMutation.reset();
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    setShowValidation(true);
    if (Object.keys(clientErrors).length > 0) return;

    const payload = toRequestPayload(form);
    if (!payload) return;

    try {
      if (editingPromotion) {
        await updateMutation.mutateAsync({ promotionId: editingPromotion.promotionId, payload });
        toast.success("Promotion updated.");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Promotion created.");
      }
      handleResetForm();
      setIsModalOpen(false);
    } catch {
      toast.error("Unable to save promotion.");
    }
  };

  const handleDelete = async (promotionId: string) => {
    try {
      await deleteMutation.mutateAsync(promotionId);
      toast.success("Promotion deactivated.");
      setConfirmDeleteId(null);
    } catch {
      toast.error("Unable to delete promotion.");
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Promotions</h1>
            <p className="text-sm text-slate-500 mt-1">Manage promotion campaigns and tier targeting rules.</p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              className="rounded-full shadow-sm"
              onClick={() => {
                handleResetForm();
                setIsModalOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create promotion
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full bg-white shadow-sm"
              onClick={() => promotionsQuery.refetch()}
              disabled={promotionsQuery.isFetching}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit promotion" : "Create promotion"}</DialogTitle>
                <DialogDescription>
                  Fill in campaign details and targeting.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {activeMutationError ? (
                  <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {getDisplayErrorMessage(activeMutationError)}
                  </p>
                ) : null}

              <FormField label="Name" error={displayErrors.name}>
                <Input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Promotion name"
                />
              </FormField>

              <FormField label="Description" error={displayErrors.description}>
                <Textarea
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  rows={3}
                  placeholder="Optional campaign description"
                />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Discount type" error={displayErrors.discountType}>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                    value={form.discountType}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, discountType: event.target.value as PromotionDiscountType }))
                    }
                  >
                    <option value="PERCENT">Percent</option>
                    <option value="FIXED">Fixed</option>
                  </select>
                </FormField>

                <FormField label="Discount value" error={displayErrors.discountValue}>
                  <Input
                    type="number"
                    min={1}
                    value={form.discountValue}
                    onChange={(event) => setForm((prev) => ({ ...prev, discountValue: event.target.value }))}
                    placeholder={form.discountType === "PERCENT" ? "1 - 100" : "VND amount"}
                  />
                </FormField>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Start date" error={displayErrors.startDate}>
                  <Input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
                  />
                </FormField>

                <FormField label="End date" error={displayErrors.endDate}>
                  <Input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
                  />
                </FormField>
              </div>

              <FormField label="Targeting mode" error={displayErrors.targetingMode}>
                <select
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  value={form.targetingMode}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      targetingMode: event.target.value as PromotionTargetingMode,
                      applicableTiers: event.target.value === "ALL_TIERS" ? [] : prev.applicableTiers,
                    }))
                  }
                >
                  <option value="ALL_TIERS">All tiers</option>
                  <option value="SELECTED_TIERS">Selected tiers</option>
                </select>
              </FormField>

              {form.targetingMode === "SELECTED_TIERS" ? (
                <FormField label="Applicable tiers" error={displayErrors.applicableTiers}>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_TIERS.map((tier) => (
                      <label key={tier} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                        <Checkbox
                          checked={form.applicableTiers.includes(tier)}
                          onCheckedChange={(checked) =>
                            setForm((prev) => ({
                              ...prev,
                              applicableTiers: checked === true
                                ? [...prev.applicableTiers, tier]
                                : prev.applicableTiers.filter((value) => value !== tier),
                            }))
                          }
                        />
                        {tier}
                      </label>
                    ))}
                  </div>
                </FormField>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Max usage / customer" error={displayErrors.maxUsagePerCustomer}>
                  <Input
                    type="number"
                    min={1}
                    value={form.maxUsagePerCustomer}
                    onChange={(event) => setForm((prev) => ({ ...prev, maxUsagePerCustomer: event.target.value }))}
                    placeholder="Optional"
                  />
                </FormField>

                <FormField label="Status" error={displayErrors.status}>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                    value={form.status}
                    onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as PromotionStatus }))}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </FormField>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Save changes" : "Create promotion"}
                </Button>
              </div>
            </div>
            </DialogContent>
          </Dialog>

          <Card className="border-border/50 bg-white shadow-sm rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/50 bg-slate-50/50 px-6 py-4">
              <div>
                <CardTitle className="text-lg">Promotion list</CardTitle>
                <CardDescription>All active and inactive campaigns</CardDescription>
              </div>
            </div>
            <CardContent className="space-y-4">
              {promotionsQuery.isPending ? (
                <div className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading promotions...
                </div>
              ) : promotionsQuery.isError ? (
                <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {getDisplayErrorMessage(promotionsQuery.error)}
                </div>
              ) : !promotionsQuery.data || promotionsQuery.data.items.length === 0 ? (
                <div className="rounded-md border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                  No promotions found.
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader className="bg-slate-50/80">
                      <TableRow>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">Name</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">Discount</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">Targeting</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">Date range</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">Status</TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase text-slate-500">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {promotionsQuery.data.items.map((promotion) => (
                        <TableRow key={promotion.promotionId}>
                          <TableCell>
                            <div className="font-medium text-slate-900">{promotion.name}</div>
                            <div className="text-xs text-slate-500">{promotion.promotionId}</div>
                          </TableCell>
                          <TableCell>{formatDiscount(promotion.discountType, promotion.discountValue)}</TableCell>
                          <TableCell>
                            <div className="text-sm">{promotion.targetingMode}</div>
                            <div className="text-xs text-slate-500">
                              {promotion.applicableTiers.length > 0 ? promotion.applicableTiers.join(", ") : "All tiers"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{formatDate(promotion.startDate)}</div>
                            <div className="text-xs text-slate-500">to {formatDate(promotion.endDate)}</div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={promotion.status === "ACTIVE" 
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700" 
                                : "border-slate-200 bg-slate-50 text-slate-600"}
                            >
                              {promotion.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(promotion)}>
                                <Pencil className="mr-2 h-3.5 w-3.5" />
                                Edit
                              </Button>
                              {confirmDeleteId === promotion.promotionId ? (
                                <>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(promotion.promotionId)}
                                    disabled={deleteMutation.isPending}
                                  >
                                    {deleteMutation.isPending ? (
                                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                                    )}
                                    Confirm
                                  </Button>
                                  <Button type="button" size="sm" variant="outline" onClick={() => setConfirmDeleteId(null)}>
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setConfirmDeleteId(promotion.promotionId)}
                                >
                                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                                  Delete
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex items-center justify-between border-t border-border/50 bg-slate-50/30 px-6 py-4">
                    <p className="text-sm text-slate-500 font-medium">
                      Page {promotionsQuery.data.pagination.page} / {Math.max(promotionsQuery.data.pagination.totalPages, 1)}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        className="rounded-full shadow-sm"
                        disabled={!canGoPrev} 
                        onClick={() => setPage((value) => value - 1)}
                      >
                        Previous
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        size="sm"
                        className="rounded-full shadow-sm" 
                        disabled={!canGoNext} 
                        onClick={() => setPage((value) => value + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

function validatePromotionForm(form: PromotionFormValues): PromotionFormErrors {
  const errors: PromotionFormErrors = {};
  const discountValue = Number(form.discountValue);
  const maxUsage = form.maxUsagePerCustomer ? Number(form.maxUsagePerCustomer) : null;

  if (!form.name.trim()) errors.name = "Name is required.";
  if (!form.discountValue || Number.isNaN(discountValue) || discountValue < 1) {
    errors.discountValue = "Discount value must be at least 1.";
  } else if (form.discountType === "PERCENT" && discountValue > 100) {
    errors.discountValue = "Percent discount must be between 1 and 100.";
  }

  if (!form.startDate) errors.startDate = "Start date is required.";
  if (!form.endDate) errors.endDate = "End date is required.";

  if (form.startDate && form.endDate) {
    const start = new Date(form.startDate).getTime();
    const end = new Date(form.endDate).getTime();
    if (start > end) errors.startDate = "Start date must be before or equal to end date.";
  }

  if (form.targetingMode === "SELECTED_TIERS" && form.applicableTiers.length === 0) {
    errors.applicableTiers = "Select at least one tier.";
  }

  if (maxUsage !== null && (!Number.isInteger(maxUsage) || maxUsage < 1)) {
    errors.maxUsagePerCustomer = "Max usage must be an integer greater than 0.";
  }

  return errors;
}

function mergeFormErrors(
  clientErrors: PromotionFormErrors,
  serverError: ApiErrorResponse | null,
  showValidation: boolean,
): PromotionFormErrors {
  const merged: PromotionFormErrors = {};
  const fields = Object.keys(EMPTY_FORM) as (keyof PromotionFormValues)[];
  for (const field of fields) {
    if (showValidation && clientErrors[field]) {
      merged[field] = clientErrors[field];
      continue;
    }
    const fromServer = readServerFieldError(serverError, field);
    if (fromServer) merged[field] = fromServer;
  }
  return merged;
}

function readServerFieldError(
  error: ApiErrorResponse | null,
  field: keyof PromotionFormValues,
): string | null {
  if (!error) return null;
  const fromList = error.errors?.find((item) => item.field === field)?.message ?? null;
  if (fromList) return fromList;

  const errorPayload = (error as ApiErrorResponse & { error?: { field?: string; message?: string } }).error;
  if (errorPayload?.field === field && errorPayload.message) {
    return errorPayload.message;
  }

  return null;
}

function toRequestPayload(form: PromotionFormValues): PromotionRequest | null {
  const discountValue = Number(form.discountValue);
  const maxUsage = form.maxUsagePerCustomer ? Number(form.maxUsagePerCustomer) : null;
  const startDate = new Date(form.startDate);
  const endDate = new Date(form.endDate);

  if (Number.isNaN(discountValue) || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }

  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
    discountType: form.discountType,
    discountValue,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    targetingMode: form.targetingMode,
    applicableTiers: form.targetingMode === "SELECTED_TIERS" ? form.applicableTiers : null,
    maxUsagePerCustomer: maxUsage,
    status: form.status,
  };
}

function toFormValues(promotion: Promotion): PromotionFormValues {
  return {
    name: promotion.name,
    description: promotion.description ?? "",
    discountType: promotion.discountType,
    discountValue: String(promotion.discountValue),
    startDate: toLocalDateTimeInputValue(promotion.startDate),
    endDate: toLocalDateTimeInputValue(promotion.endDate),
    targetingMode: promotion.targetingMode,
    applicableTiers: promotion.applicableTiers,
    maxUsagePerCustomer: promotion.maxUsagePerCustomer ? String(promotion.maxUsagePerCustomer) : "",
    status: promotion.status,
  };
}

function toLocalDateTimeInputValue(value: string) {
  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDiscount(type: PromotionDiscountType, value: number) {
  return type === "PERCENT" ? `${value}%` : `${value.toLocaleString("vi-VN")} VND`;
}


"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Calendar as CalendarIcon,
  Clock3,
  Flame,
  Layers3,
  Loader2,
  Megaphone,
  Pencil,
  Percent,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { promotionNameFormatMessage, sanitizePromotionNameInput } from "@/lib/validators";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDisplayErrorMessage } from "@/lib/api-errors";
import {
  useAdminPromotion,
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

const PAGE_LIMIT = 10;
const FETCH_LIMIT = 100;
const ALL_TIERS: LoyaltyTier[] = ["MEMBER", "SILVER", "GOLD", "PLATINUM"];

type PromotionFilters = {
  name: string;
  status: "ALL" | PromotionStatus;
  date: string;
};

const EMPTY_FORM: PromotionFormValues = {
  name: "",
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
  const [displayPage, setDisplayPage] = useState(1);
  const [filters, setFilters] = useState<PromotionFilters>({ name: "", status: "ALL", date: "" });
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [editingPromotionId, setEditingPromotionId] = useState<string | null>(null);
  const [form, setForm] = useState<PromotionFormValues>(EMPTY_FORM);
  const [showValidation, setShowValidation] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const promotionsQuery = useAdminPromotions(1, FETCH_LIMIT);
  const promotionDetailQuery = useAdminPromotion(editingPromotionId);
  const createMutation = useCreateAdminPromotion();
  const updateMutation = useUpdateAdminPromotion();
  const deleteMutation = useDeleteAdminPromotion();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const activeMutationError = (createMutation.error ?? updateMutation.error) as ApiErrorResponse | null;
  const clientErrors = useMemo(() => validatePromotionForm(form), [form]);
  const displayErrors = mergeFormErrors(clientErrors, activeMutationError, showValidation);

  const filteredPromotions = useMemo(
    () => filterPromotions(promotionsQuery.data?.items ?? [], filters),
    [promotionsQuery.data?.items, filters],
  );

  const totalDisplayPages = Math.max(1, Math.ceil(filteredPromotions.length / PAGE_LIMIT));
  const paginatedPromotions = useMemo(() => {
    const start = (displayPage - 1) * PAGE_LIMIT;
    return filteredPromotions.slice(start, start + PAGE_LIMIT);
  }, [filteredPromotions, displayPage]);

  const isEditing = Boolean(editingPromotion);
  const canGoPrev = displayPage > 1;
  const canGoNext = displayPage < totalDisplayPages;
  const hasActiveFilters = Boolean(filters.name || filters.status !== "ALL" || filters.date);

  const activePromotions = filteredPromotions.filter((promotion) => promotion.status === "ACTIVE");
  const runningPromotions = activePromotions.filter((promotion) => getPromotionPhase(promotion) === "Running");
  const expiringSoonPromotions = activePromotions.filter((promotion) => isPromotionExpiringSoon(promotion));

  useEffect(() => {
    setDisplayPage(1);
  }, [filters]);

  useEffect(() => {
    if (promotionDetailQuery.data) {
      setEditingPromotion(promotionDetailQuery.data);
      setForm(toFormValues(promotionDetailQuery.data));
    }
  }, [promotionDetailQuery.data]);

  const summaryCards = [
    {
      label: "Total campaigns",
      value: filteredPromotions.length,
      description: "Visible in the current view",
      icon: Layers3,
      tone: "from-slate-900 via-slate-800 to-slate-700 text-white shadow-slate-900/20",
    },
    {
      label: "Running now",
      value: runningPromotions.length,
      description: "Active and currently in date range",
      icon: Flame,
      tone: "from-orange-500 via-amber-500 to-yellow-400 text-white shadow-orange-500/25",
    },
    {
      label: "Active",
      value: activePromotions.length,
      description: "Ready to be applied by customers",
      icon: BadgeCheck,
      tone: "from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-emerald-500/25",
    },
    {
      label: "Ending soon",
      value: expiringSoonPromotions.length,
      description: "Need a quick review this week",
      icon: Clock3,
      tone: "from-violet-500 via-fuchsia-500 to-pink-500 text-white shadow-violet-500/25",
    },
  ];

  const handleResetFilters = () => {
    setFilters({ name: "", status: "ALL", date: "" });
  };

  const handleResetForm = () => {
    setEditingPromotion(null);
    setEditingPromotionId(null);
    setForm(EMPTY_FORM);
    setShowValidation(false);
    createMutation.reset();
    updateMutation.reset();
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setEditingPromotionId(promotion.promotionId);
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
      toast.success("Promotion deleted.");
      setConfirmDeleteId(null);
    } catch (error) {
      toast.error(getDisplayErrorMessage(error));
    }
  };

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10),_transparent_24%),linear-gradient(180deg,_#fffdf9_0%,_#f8fafc_48%,_#f7f9fc_100%)] p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="grid gap-8 px-6 py-7 md:px-8 lg:grid-cols-[1.25fr_0.95fr] lg:items-end">
            <div className="space-y-5">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-orange-700">
                Admin Growth Console
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 text-white shadow-[0_18px_38px_rgba(249,115,22,0.35)]">
                  <Megaphone className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                    Promotions
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-[15px]">
                    Shape how customers discover and redeem campaigns. Review what is live,
                    what is ending soon, and where you may want to refresh targeting.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                className="h-11 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-5 text-sm font-semibold shadow-[0_16px_38px_rgba(37,99,235,0.28)] hover:from-blue-500 hover:to-blue-400"
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
                className="h-11 rounded-full border-slate-200 bg-white/90 px-5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                onClick={() => promotionsQuery.refetch()}
                disabled={promotionsQuery.isFetching}
              >
                <RefreshCcw className={cn("mr-2 h-4 w-4", promotionsQuery.isFetching && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid gap-4 border-t border-slate-100/80 bg-slate-50/55 px-6 py-5 md:grid-cols-2 md:px-8 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className={cn(
                    "rounded-[22px] bg-gradient-to-br p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)]",
                    card.tone,
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">
                        {card.label}
                      </p>
                      <p className="mt-3 text-3xl font-black tracking-tight">{card.value}</p>
                      <p className="mt-2 text-xs leading-5 text-white/80">{card.description}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/18 ring-1 ring-white/20">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Card className="rounded-[26px] border border-white/70 bg-white/85 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.07)] backdrop-blur md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="min-w-0 flex-[1.8] space-y-1.5">
              <Label
                htmlFor="filter-name"
                className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500"
              >
                Search campaign
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="filter-name"
                  value={filters.name}
                  onChange={(event) => setFilters((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Search by promotion name..."
                  className="h-11 rounded-2xl border-slate-200 bg-slate-50/80 pl-10 shadow-inner shadow-slate-100/70 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex-1 space-y-1.5">
              <Label
                htmlFor="filter-status"
                className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500"
              >
                Status
              </Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value as PromotionFilters["status"] }))
                }
              >
                <SelectTrigger
                  id="filter-status"
                  className="h-11 rounded-2xl border-slate-200 bg-slate-50/80 shadow-inner shadow-slate-100/70"
                >
                  <SelectValue placeholder="All status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Active on date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-11 w-full justify-start rounded-2xl border-slate-200 bg-slate-50/80 px-4 text-left font-medium text-slate-700 shadow-inner shadow-slate-100/70",
                      !filters.date && "text-slate-400",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.date ? formatFilterDate(filters.date) : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.date ? new Date(filters.date) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, "0");
                        const day = String(date.getDate()).padStart(2, "0");
                        setFilters((prev) => ({ ...prev, date: `${year}-${month}-${day}` }));
                      } else {
                        setFilters((prev) => ({ ...prev, date: "" }));
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2 pb-0.5">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetFilters}
                disabled={!hasActiveFilters}
                className="h-11 rounded-full border-slate-200 bg-white px-4 font-semibold text-slate-600"
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
          </div>
        </Card>

        <Dialog
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) handleResetForm();
          }}
        >
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-[28px] border border-white/70 bg-white/95 shadow-[0_30px_90px_rgba(15,23,42,0.16)]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-950">
                {isEditing ? "Edit promotion" : "Create promotion"}
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-slate-500">
                Set discount details, active dates, and tier targeting before publishing.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-2">
              {promotionDetailQuery.isFetching && editingPromotionId ? (
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading latest promotion details...
                </div>
              ) : null}

              {promotionDetailQuery.isError && editingPromotionId ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {getDisplayErrorMessage(promotionDetailQuery.error)}
                </p>
              ) : null}

              {activeMutationError ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {getDisplayErrorMessage(activeMutationError)}
                </p>
              ) : null}

              <div className="grid gap-5 rounded-[24px] border border-slate-100 bg-slate-50/75 p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Basic Information
                </p>
                <FormField label="Name" error={displayErrors.name}>
                  <Input
                    value={form.name}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, name: sanitizePromotionNameInput(event.target.value) }))
                    }
                    placeholder="VD: SUMMER2026"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                    className="h-11 rounded-2xl border-slate-200 bg-white font-semibold tracking-wide"
                  />
                  <p className="text-xs text-slate-500">{promotionNameFormatMessage}</p>
                </FormField>
              </div>

              <div className="grid gap-5 rounded-[24px] border border-slate-100 bg-slate-50/75 p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Discount Setup
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Discount type" error={displayErrors.discountType}>
                    <select
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
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
                      className="h-11 rounded-2xl border-slate-200 bg-white"
                    />
                  </FormField>
                </div>
              </div>

              <div className="grid gap-5 rounded-[24px] border border-slate-100 bg-slate-50/75 p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Availability
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Start date" error={displayErrors.startDate}>
                    <Input
                      type="datetime-local"
                      value={form.startDate}
                      onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
                      className="h-11 rounded-2xl border-slate-200 bg-white"
                    />
                  </FormField>

                  <FormField label="End date" error={displayErrors.endDate}>
                    <Input
                      type="datetime-local"
                      value={form.endDate}
                      onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
                      className="h-11 rounded-2xl border-slate-200 bg-white"
                    />
                  </FormField>
                </div>
              </div>

              <div className="grid gap-5 rounded-[24px] border border-slate-100 bg-slate-50/75 p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Audience Targeting
                </p>
                <FormField label="Targeting mode" error={displayErrors.targetingMode}>
                  <select
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
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
                        <label
                          key={tier}
                          className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700"
                        >
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
                      className="h-11 rounded-2xl border-slate-200 bg-white"
                    />
                  </FormField>

                  <FormField label="Status" error={displayErrors.status}>
                    <select
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
                      value={form.status}
                      onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as PromotionStatus }))}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </FormField>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" className="rounded-full px-5" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-5 shadow-[0_16px_30px_rgba(37,99,235,0.24)]"
                  onClick={handleSubmit}
                  disabled={isSubmitting || promotionDetailQuery.isFetching}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Save changes" : "Create promotion"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Card className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
          <CardHeader className="border-b border-slate-100 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(248,250,252,0.95))] px-6 py-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <CardTitle className="text-xl font-black tracking-tight text-slate-950">
                  Promotion list
                </CardTitle>
                <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                  {promotionsQuery.data
                    ? `Showing ${paginatedPromotions.length} of ${filteredPromotions.length} promotion${filteredPromotions.length !== 1 ? "s" : ""}`
                    : "All active and inactive campaigns"}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {hasActiveFilters ? (
                  <Badge variant="outline" className="rounded-full border-orange-200 bg-orange-50 px-3 py-1 text-orange-700">
                    Filters applied
                  </Badge>
                ) : null}
                <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
                  {activePromotions.length} active
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {promotionsQuery.isPending ? (
              <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading promotions...
              </div>
            ) : promotionsQuery.isError ? (
              <div className="m-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {getDisplayErrorMessage(promotionsQuery.error)}
              </div>
            ) : filteredPromotions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 p-12 text-center">
                <Megaphone className="h-10 w-10 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">
                  {hasActiveFilters ? "No promotions match your filters." : "No promotions yet."}
                </p>
                <p className="text-xs text-slate-400">
                  {hasActiveFilters
                    ? "Try adjusting search or filter criteria."
                    : "Create your first campaign to get started."}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/90">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-6 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                          Campaign
                        </TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                          Discount
                        </TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                          Audience
                        </TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                          Schedule
                        </TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                          Status
                        </TableHead>
                        <TableHead className="pr-6 text-right text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPromotions.map((promotion) => {
                        const phase = getPromotionPhase(promotion);
                        return (
                          <TableRow key={promotion.promotionId} className="group border-slate-100 hover:bg-orange-50/35">
                            <TableCell className="pl-6 py-4">
                              <div className="font-semibold text-slate-900">{promotion.name}</div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "rounded-full border-0 px-3 py-1 font-bold shadow-sm",
                                  promotion.discountType === "PERCENT"
                                    ? "bg-violet-100 text-violet-700"
                                    : "bg-sky-100 text-sky-700",
                                )}
                              >
                                {promotion.discountType === "PERCENT" ? (
                                  <Percent className="mr-1 inline h-3 w-3" />
                                ) : null}
                                {formatDiscount(promotion.discountType, promotion.discountValue)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {promotion.targetingMode === "ALL_TIERS" ? (
                                <Badge
                                  variant="outline"
                                  className="rounded-full border-slate-200 bg-slate-100 px-3 py-1 text-slate-700"
                                >
                                  All tiers
                                </Badge>
                              ) : (
                                <div className="flex max-w-[220px] flex-wrap gap-1.5">
                                  {promotion.applicableTiers.map((tier) => (
                                    <Badge
                                      key={tier}
                                      variant="outline"
                                      className="rounded-full border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800"
                                    >
                                      {tier}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-slate-700">
                                  {formatDate(promotion.startDate)}
                                </div>
                                <div className="inline-flex items-center gap-1 text-xs text-slate-400">
                                  <ArrowRight className="h-3 w-3" />
                                  {formatDate(promotion.endDate)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "rounded-full border-0 px-3 py-1 font-bold",
                                    promotion.status === "ACTIVE"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-slate-100 text-slate-500",
                                  )}
                                >
                                  {promotion.status === "ACTIVE" ? "Active" : "Inactive"}
                                </Badge>
                                <div className="text-xs font-medium text-slate-400">{phase}</div>
                              </div>
                            </TableCell>
                            <TableCell className="pr-6">
                              <div className="flex justify-end gap-2 opacity-95 transition-opacity group-hover:opacity-100">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-9 rounded-full border-slate-200 bg-white px-3.5 text-slate-700"
                                  onClick={() => handleEdit(promotion)}
                                >
                                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                  Edit
                                </Button>
                                {confirmDeleteId === promotion.promotionId ? (
                                  <>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="destructive"
                                      className="h-9 rounded-full px-3.5"
                                      onClick={() => handleDelete(promotion.promotionId)}
                                      disabled={deleteMutation.isPending}
                                    >
                                      {deleteMutation.isPending ? (
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                      )}
                                      Confirm
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className="h-9 rounded-full px-3.5"
                                      onClick={() => setConfirmDeleteId(null)}
                                    >
                                      Cancel
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-9 rounded-full border-rose-200 bg-rose-50/50 px-3.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                    onClick={() => setConfirmDeleteId(promotion.promotionId)}
                                  >
                                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {totalDisplayPages > 1 ? (
                  <div className="flex justify-center border-t border-slate-100 py-5">
                    <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-2 py-2 shadow-sm">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-full px-5 text-sm font-semibold"
                        disabled={!canGoPrev}
                        onClick={() => setDisplayPage((value) => Math.max(1, value - 1))}
                      >
                        Previous
                      </Button>
                      <span className="min-w-[96px] px-2 text-center text-sm font-semibold text-slate-600">
                        Page {displayPage} / {totalDisplayPages}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-full px-5 text-sm font-semibold"
                        disabled={!canGoNext}
                        onClick={() => setDisplayPage((value) => Math.min(totalDisplayPages, value + 1))}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
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
      <Label className="text-sm font-semibold text-slate-800">{label}</Label>
      {children}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

function validatePromotionForm(form: PromotionFormValues): PromotionFormErrors {
  const errors: PromotionFormErrors = {};
  const discountValue = Number(form.discountValue);
  const maxUsage = form.maxUsagePerCustomer ? Number(form.maxUsagePerCustomer) : null;

  if (!form.name.trim()) {
    errors.name = "Name is required.";
  }
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
    name: sanitizePromotionNameInput(form.name.trim()),
    description: null,
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
    name: sanitizePromotionNameInput(promotion.name),
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
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatFilterDate(value: string) {
  try {
    return new Date(value).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function filterPromotions(items: Promotion[], filters: PromotionFilters): Promotion[] {
  const nameQuery = filters.name.trim().toLowerCase();

  return items.filter((promotion) => {
    if (nameQuery && !promotion.name.toLowerCase().includes(nameQuery)) {
      return false;
    }

    if (filters.status !== "ALL" && promotion.status !== filters.status) {
      return false;
    }

    if (filters.date) {
      const selected = new Date(filters.date);
      selected.setHours(0, 0, 0, 0);
      const start = new Date(promotion.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(promotion.endDate);
      end.setHours(23, 59, 59, 999);

      if (selected < start || selected > end) {
        return false;
      }
    }

    return true;
  });
}

function formatDiscount(type: PromotionDiscountType, value: number) {
  return type === "PERCENT" ? `${value}%` : `${value.toLocaleString("vi-VN")} VND`;
}

function getPromotionPhase(promotion: Promotion) {
  const now = new Date();
  const startDate = new Date(promotion.startDate);
  const endDate = new Date(promotion.endDate);

  if (promotion.status !== "ACTIVE") {
    return "Paused";
  }
  if (now < startDate) {
    return "Upcoming";
  }
  if (now > endDate) {
    return "Expired";
  }
  return "Running";
}

function isPromotionExpiringSoon(promotion: Promotion) {
  if (promotion.status !== "ACTIVE") {
    return false;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endDate = new Date(promotion.endDate);
  const endOfDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);
  const daysLeft = (endOfDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

  return daysLeft >= 0 && daysLeft <= 7;
}

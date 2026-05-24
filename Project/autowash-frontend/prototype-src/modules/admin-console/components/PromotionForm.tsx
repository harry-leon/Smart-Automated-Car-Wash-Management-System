import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { CustomerTier } from "../types/customer.types";
import type { Promotion, PromotionDraft, PromotionType } from "../types/promotion.types";

const ALL_TIERS: CustomerTier[] = ["MEMBER", "SILVER", "GOLD", "DIAMOND"];

const TYPE_LABEL: Record<PromotionType, string> = {
  ALL_MEMBERS: "Apply to all members",
  SELECTED_TIERS: "Apply to selected tiers",
  NEW_CUSTOMERS: "New customers only",
};

const EMPTY_DRAFT: PromotionDraft = {
  name: "",
  type: "ALL_MEMBERS",
  targetTiers: [...ALL_TIERS],
  discountPercent: 10,
  startDate: "",
  endDate: "",
  active: true,
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPromotion?: Promotion | null;
  onSubmit: (draft: PromotionDraft, id?: string) => void;
}

export function PromotionForm({ open, onOpenChange, initialPromotion, onSubmit }: Props) {
  const [draft, setDraft] = React.useState<PromotionDraft>(EMPTY_DRAFT);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setError(null);
      if (initialPromotion) {
        const { id: _id, usageCount: _usageCount, ...rest } = initialPromotion;
        setDraft(rest);
      } else {
        setDraft(EMPTY_DRAFT);
      }
    }
  }, [open, initialPromotion]);

  const isEdit = Boolean(initialPromotion);

  const updateType = (next: PromotionType) => {
    setDraft((prev) => ({
      ...prev,
      type: next,
      targetTiers:
        next === "ALL_MEMBERS"
          ? [...ALL_TIERS]
          : next === "NEW_CUSTOMERS"
            ? ["MEMBER"]
            : prev.targetTiers.length
              ? prev.targetTiers
              : ["GOLD"],
    }));
  };

  const toggleTier = (tier: CustomerTier) => {
    setDraft((prev) => ({
      ...prev,
      targetTiers: prev.targetTiers.includes(tier)
        ? prev.targetTiers.filter((item) => item !== tier)
        : [...prev.targetTiers, tier],
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      setError("Promotion name is required.");
      return;
    }
    if (draft.discountPercent <= 0 || draft.discountPercent > 100) {
      setError("Discount percent must be between 1 and 100.");
      return;
    }
    if (!draft.startDate || !draft.endDate) {
      setError("Start and end dates are required.");
      return;
    }
    if (draft.startDate > draft.endDate) {
      setError("End date must be on/after start date.");
      return;
    }
    if (draft.type === "SELECTED_TIERS" && draft.targetTiers.length === 0) {
      setError("Select at least one target tier.");
      return;
    }
    onSubmit(draft, initialPromotion?.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit promotion" : "Create promotion"}</DialogTitle>
          <DialogDescription>
            Promotions stay in local state only — nothing is saved to the backend.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="promo-name">Promotion name</Label>
            <Input
              id="promo-name"
              value={draft.name}
              onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="e.g. Summer Splash 2026"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="promo-type">Type</Label>
              <Select
                value={draft.type}
                onValueChange={(next) => updateType(next as PromotionType)}
              >
                <SelectTrigger id="promo-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TYPE_LABEL) as PromotionType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      {TYPE_LABEL[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="promo-discount">Discount percent</Label>
              <Input
                id="promo-discount"
                type="number"
                min={1}
                max={100}
                value={draft.discountPercent}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, discountPercent: Number(event.target.value) }))
                }
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="promo-start">Start date</Label>
              <Input
                id="promo-start"
                type="date"
                value={draft.startDate}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, startDate: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="promo-end">End date</Label>
              <Input
                id="promo-end"
                type="date"
                value={draft.endDate}
                onChange={(event) => setDraft((prev) => ({ ...prev, endDate: event.target.value }))}
              />
            </div>
          </div>

          {draft.type === "SELECTED_TIERS" ? (
            <div className="space-y-2 rounded-xl border border-border/50 bg-background/40 p-3">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Target tiers
              </Label>
              <div className="flex flex-wrap gap-3">
                {ALL_TIERS.map((tier) => (
                  <label key={tier} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={draft.targetTiers.includes(tier)}
                      onCheckedChange={() => toggleTier(tier)}
                    />
                    <span className="font-semibold">{tier}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/40 p-3">
            <div>
              <div className="text-sm font-semibold">Active</div>
              <div className="text-xs text-muted-foreground">
                Inactive promotions stay in the list but are not applied at checkout.
              </div>
            </div>
            <Switch
              checked={draft.active}
              onCheckedChange={(checked) => setDraft((prev) => ({ ...prev, active: checked }))}
            />
          </div>

          {error ? (
            <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-600">
              {error}
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Save changes" : "Create promotion"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { TYPE_LABEL as PROMOTION_TYPE_LABEL };

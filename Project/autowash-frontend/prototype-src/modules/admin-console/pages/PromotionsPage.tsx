import * as React from "react";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PromotionForm } from "../components/PromotionForm";
import { PromotionTable } from "../components/PromotionTable";
import { type Promotion as StorePromotion, type Tier, useCarwashStore } from "@/lib/carwash-store";
import type {
  Promotion as DisplayPromotion,
  PromotionDraft,
  PromotionType,
} from "../types/promotion.types";
import { displayTierToStore, tierToDisplay } from "../lib/customer-mapping";

function inferType(tiers: Tier[]): PromotionType {
  if (tiers.length >= 4) return "ALL_MEMBERS";
  if (tiers.length === 1 && tiers[0] === "Member") return "NEW_CUSTOMERS";
  return "SELECTED_TIERS";
}

function storeToDisplay(promotion: StorePromotion): DisplayPromotion {
  const targetTiers = promotion.tiers.map(tierToDisplay);
  return {
    id: promotion.id,
    name: promotion.code,
    type: inferType(promotion.tiers),
    targetTiers,
    discountPercent:
      promotion.discountType === "Percentage"
        ? promotion.amount
        : Math.min(100, Math.round((promotion.amount / 100000) * 10)),
    startDate: promotion.startDate,
    endDate: promotion.endDate,
    active: promotion.active,
    usageCount: 0,
  };
}

function draftToStore(draft: PromotionDraft): Omit<StorePromotion, "id"> {
  const tiers: Tier[] =
    draft.type === "ALL_MEMBERS"
      ? (["Member", "Silver", "Gold", "Platinum"] as Tier[])
      : draft.type === "NEW_CUSTOMERS"
        ? (["Member"] as Tier[])
        : draft.targetTiers.map(displayTierToStore);
  return {
    code: draft.name,
    discountType: "Percentage",
    amount: draft.discountPercent,
    tiers,
    active: draft.active,
    startDate: draft.startDate,
    endDate: draft.endDate,
    stackable: false,
  };
}

export function PromotionsPage() {
  const { promotions, addPromotion, updatePromotion, togglePromotion, hydrated } =
    useCarwashStore();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<DisplayPromotion | null>(null);

  const items = React.useMemo(() => promotions.map(storeToDisplay), [promotions]);

  const handleOpenCreate = () => {
    setEditTarget(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (promotion: DisplayPromotion) => {
    setEditTarget(promotion);
    setDialogOpen(true);
  };

  const handleSubmit = (draft: PromotionDraft, id?: string) => {
    try {
      const payload = draftToStore(draft);
      if (id) {
        updatePromotion(id, payload);
        toast.success(`Updated promotion: ${draft.name}`);
      } else {
        addPromotion(payload);
        toast.success(`Created promotion: ${draft.name}`);
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save promotion.");
    }
  };

  const handleToggleActive = (id: string) => {
    const target = promotions.find((promotion) => promotion.id === id);
    togglePromotion(id);
    if (target) {
      toast.success(`${target.active ? "Deactivated" : "Activated"} ${target.code}`);
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" /> Promotions
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Promotions catalog
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
              Create, edit and deactivate promotions targeting specific tiers or audiences. Edits
              sync with the live store and apply at checkout.
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" /> New promotion
          </Button>
        </div>

        {!hydrated ? (
          <Card className="border-border/50 bg-card/60 p-10 text-center text-sm text-muted-foreground backdrop-blur-xl">
            Loading promotions…
          </Card>
        ) : (
          <PromotionTable
            promotions={items}
            onEdit={handleOpenEdit}
            onToggleActive={handleToggleActive}
          />
        )}

        <PromotionForm
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initialPromotion={editTarget}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

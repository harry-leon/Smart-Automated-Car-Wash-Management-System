import { Pencil, Power } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PROMOTION_TYPE_LABEL } from "./PromotionForm";
import { TIER_TONE } from "./CustomerTable";
import type { Promotion } from "../types/promotion.types";

interface Props {
  promotions: Promotion[];
  onEdit: (promotion: Promotion) => void;
  onToggleActive: (id: string) => void;
}

export function PromotionTable({ promotions, onEdit, onToggleActive }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Target tiers</TableHead>
            <TableHead className="text-right">Discount %</TableHead>
            <TableHead>Start date</TableHead>
            <TableHead>End date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Usage</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {promotions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                No promotions yet.
              </TableCell>
            </TableRow>
          ) : (
            promotions.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell className="font-semibold">{promo.name}</TableCell>
                <TableCell className="text-xs">{PROMOTION_TYPE_LABEL[promo.type]}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {promo.targetTiers.map((tier) => (
                      <Badge
                        key={tier}
                        variant="outline"
                        className={`border font-bold ${TIER_TONE[tier]}`}
                      >
                        {tier}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">{promo.discountPercent}%</TableCell>
                <TableCell className="text-xs text-muted-foreground">{promo.startDate}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{promo.endDate}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`border font-semibold ${
                      promo.active
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : "bg-zinc-500/10 text-zinc-600 border-zinc-500/30"
                    }`}
                  >
                    {promo.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {promo.usageCount.toLocaleString("vi-VN")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(promo)}
                      className="gap-1 text-xs"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggleActive(promo.id)}
                      className="gap-1 text-xs"
                    >
                      <Power className="h-3.5 w-3.5" /> {promo.active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

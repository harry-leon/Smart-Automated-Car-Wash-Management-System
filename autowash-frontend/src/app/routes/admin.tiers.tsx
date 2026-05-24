import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Save, Crown, Award, Medal, Gem } from "lucide-react";
import { toast } from "sonner";
import { AccessDenied } from "@/components/access-denied";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { canAccess } from "@/lib/access-control";
import { useCarwashStore } from "@/lib/carwash-store";
import { cn } from "@/lib/utils";
import { useLoyalty, TierRule, TierName, tierBadgeClass } from "@/lib/loyalty-store";

export const Route = createFileRoute("/admin/tiers")({
  component: () => <TierRulesPage />,
});

const TIER_ICONS: Record<TierName, React.ComponentType<{ className?: string }>> = {
  Member: Medal,
  Silver: Award,
  Gold: Crown,
  Platinum: Gem,
};

function tierStripeClass(tier: TierName) {
  switch (tier) {
    case "Platinum":
      return "from-sky-400 to-fuchsia-600";
    case "Gold":
      return "from-amber-400 to-yellow-600";
    case "Silver":
      return "from-slate-300 to-zinc-500";
    case "Member":
    default:
      return "from-orange-600 to-amber-800";
  }
}

function TierRulesPage() {
  const { role } = useCarwashStore();
  const { tiers, updateTiers, customers } = useLoyalty();
  const [draft, setDraft] = React.useState<TierRule[]>(tiers);

  React.useEffect(() => setDraft(tiers), [tiers]);

  if (!canAccess(role, ["Admin"])) {
    return (
      <div className="p-6 md:p-10">
        <AccessDenied
          title="Tier rules are restricted"
          description="Only Admin can change membership thresholds and multipliers."
          role={role}
        />
      </div>
    );
  }

  const update = (i: number, patch: Partial<TierRule>) =>
    setDraft((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));

  const handleSave = () => {
    for (const t of draft) {
      if (t.threshold < 0) {
        return toast.error(`${t.name}: threshold must be >= 0`);
      }
      if (t.bookingWindowDays < 1) {
        return toast.error(`${t.name}: booking window must be at least 1 day`);
      }
      if (t.discountPercent < 0 || t.discountPercent > 100) {
        return toast.error(`${t.name}: discount percent must be between 0 and 100`);
      }
      if (t.multiplier <= 0) {
        return toast.error(`${t.name}: multiplier must be > 0`);
      }
      if (!t.perks.trim()) {
        return toast.error(`${t.name}: perks description is required`);
      }
    }
    updateTiers(draft);
    toast.success("Tier rules updated", {
      description: "Rules are staged and will apply on the next monthly review cycle.",
    });
  };

  return (
    <div className="p-4 md:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
              Tier Rules Configuration
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Adjust thresholds and accrual multipliers. Changes are staged for the next monthly
              tier review.
            </p>
          </div>
          <Button
            onClick={handleSave}
            size="lg"
            className="rounded-xl shadow-lg shadow-primary/20 font-bold hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Save className="mr-2 h-4 w-4" /> Save & Update Rules
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-4">
          {draft.map((t, i) => {
            const Icon = TIER_ICONS[t.name];
            const memberCount = customers.filter((c) => c.tier === t.name).length;
            return (
              <Card
                key={t.name}
                className="relative overflow-hidden rounded-[1.5rem] border border-border/50 bg-card/60 backdrop-blur-xl shadow-lg transition-all hover:shadow-xl"
              >
                <div
                  className={cn(
                    "absolute inset-x-0 top-0 h-1.5 w-full bg-gradient-to-r",
                    tierStripeClass(t.name),
                  )}
                />
                <div
                  className={cn(
                    "absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-10 blur-3xl bg-gradient-to-r",
                    tierStripeClass(t.name),
                  )}
                />

                <CardContent className="space-y-6 p-6 sm:p-8">
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/80 shadow-inner">
                        <Icon className="h-6 w-6" />
                      </div>
                      <Badge
                        className={cn(
                          "border shadow-sm px-3 py-1 font-bold tracking-wider",
                          tierBadgeClass(t.name),
                        )}
                      >
                        {t.name}
                      </Badge>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-lg bg-accent/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                    </span>
                    {memberCount} Active Members
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Minimum Point Threshold
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        value={t.threshold}
                        onChange={(e) => update(i, { threshold: Number(e.target.value) })}
                        className="h-11 rounded-xl bg-background/50 border-border/60 transition-all focus-visible:ring-primary/30 font-semibold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Point Accrual Multiplier
                      </Label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          step={0.1}
                          min={0.1}
                          value={t.multiplier}
                          onChange={(e) => update(i, { multiplier: Number(e.target.value) })}
                          className="h-11 rounded-xl bg-background/50 border-border/60 transition-all focus-visible:ring-primary/30 font-semibold text-lg text-primary text-center w-24"
                        />
                        <span className="text-lg font-bold text-muted-foreground">x</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Booking Window (Days)
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={t.bookingWindowDays}
                        onChange={(e) => update(i, { bookingWindowDays: Number(e.target.value) })}
                        className="h-11 rounded-xl bg-background/50 border-border/60 transition-all focus-visible:ring-primary/30 font-semibold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Tier Discount Percent
                      </Label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={t.discountPercent}
                          onChange={(e) => update(i, { discountPercent: Number(e.target.value) })}
                          className="h-11 rounded-xl bg-background/50 border-border/60 transition-all focus-visible:ring-primary/30 font-semibold text-lg text-primary text-center w-24"
                        />
                        <span className="text-lg font-bold text-muted-foreground">%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Custom Perks Description
                      </Label>
                      <Textarea
                        rows={4}
                        value={t.perks}
                        onChange={(e) => update(i, { perks: e.target.value })}
                        className="rounded-xl bg-background/50 border-border/60 transition-all focus-visible:ring-primary/30 resize-none font-medium leading-relaxed"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

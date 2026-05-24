import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, ArrowDownRight, ArrowRight, History } from "lucide-react";
import { AccessDenied } from "@/components/access-denied";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { canAccess } from "@/lib/access-control";
import { useCarwashStore } from "@/lib/carwash-store";
import { cn } from "@/lib/utils";
import { useLoyalty, TierName, tierBadgeClass } from "@/lib/loyalty-store";

export const Route = createFileRoute("/admin/tier-history")({
  component: () => <AuditPage />,
});

const TIER_ORDER: Record<TierName, number> = { Member: 0, Silver: 1, Gold: 2, Platinum: 3 };
type Filter = "All" | "Upgrades" | "Downgrades";

function AuditPage() {
  const { role } = useCarwashStore();
  const { audit } = useLoyalty();
  const [filter, setFilter] = React.useState<Filter>("All");

  if (!canAccess(role, ["Admin"])) {
    return (
      <div className="p-6 md:p-10">
        <AccessDenied
          title="Tier history is restricted"
          description="Only Admin can review the tier audit trail."
          role={role}
        />
      </div>
    );
  }

  const filtered = audit.filter((a) => {
    const diff = TIER_ORDER[a.newTier] - TIER_ORDER[a.previousTier];
    if (filter === "Upgrades") {
      return diff > 0;
    }
    if (filter === "Downgrades") {
      return diff < 0;
    }
    return true;
  });

  return (
    <div className="p-4 md:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
              Tier Audit & Evolution Log
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Read-only timeline of every membership change across the system.
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-card/60 backdrop-blur-md p-1.5 shadow-sm">
            {(["All", "Upgrades", "Downgrades"] as Filter[]).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-lg font-bold transition-all",
                  filter === f ? "shadow-md" : "hover:bg-background/80",
                )}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        <Card className="rounded-[1.5rem] border-border/50 bg-card/60 backdrop-blur-xl shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-border/50">
                    <TableHead className="font-bold text-xs uppercase tracking-wider pl-6 py-4">
                      Date / Time
                    </TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider py-4">
                      Customer
                    </TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider py-4">
                      Movement
                    </TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider py-4">
                      Trigger
                    </TableHead>
                    <TableHead className="text-right font-bold text-xs uppercase tracking-wider pr-6 py-4">
                      Authorized By
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/50">
                  {filtered.map((a) => {
                    const diff = TIER_ORDER[a.newTier] - TIER_ORDER[a.previousTier];
                    const isUp = diff > 0;
                    const isDown = diff < 0;
                    return (
                      <TableRow key={a.id} className="hover:bg-primary/5 transition-colors">
                        <TableCell className="pl-6 py-4 font-mono text-sm font-semibold text-muted-foreground">
                          {a.date}
                        </TableCell>
                        <TableCell className="py-4 text-sm font-bold text-foreground">
                          {a.customerName}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <Badge
                              className={cn(
                                "border shadow-sm text-xs font-bold px-2 py-0.5",
                                tierBadgeClass(a.previousTier),
                              )}
                            >
                              {a.previousTier}
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                            <Badge
                              className={cn(
                                "border shadow-sm text-xs font-bold px-2 py-0.5",
                                tierBadgeClass(a.newTier),
                              )}
                            >
                              {a.newTier}
                            </Badge>
                            {isUp && (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 ml-1">
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </div>
                            )}
                            {isDown && (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 ml-1">
                                <ArrowDownRight className="h-3.5 w-3.5" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            variant="outline"
                            className="text-xs font-semibold bg-background/50 text-muted-foreground px-2.5 py-1"
                          >
                            {a.trigger}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6 py-4 text-right font-mono text-sm font-semibold text-muted-foreground">
                          {a.authorizedBy}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-16 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/50 shadow-inner">
                            <History className="h-8 w-8 opacity-40" />
                          </div>
                          <div className="text-sm font-medium">No matching entries.</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AccessDenied } from "@/components/access-denied";
import { canAccess } from "@/lib/access-control";
import { useAppStore, formatRelative } from "@/lib/app-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClipboardList, Plus, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/points-audit")({
  component: () => <AuditPage />,
});

function AuditPage() {
  const { role, customers, adjustments, addAdjustment } = useAppStore();

  if (!canAccess(role, ["Admin"])) {
    return (
      <div className="p-6 md:p-10">
        <AccessDenied
          title="Points audit is restricted"
          description="Only Admin can open the manual points adjustment audit log."
          role={role}
        />
      </div>
    );
  }
  return (
    <div className="p-4 md:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight md:text-4xl text-foreground">
              Points Audit Log
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
                <ShieldCheck className="h-4 w-4" /> Admin
              </span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Immutable ledger of manual point corrections issued by authorized personnel.
            </p>
          </div>
          <AdjustDialog customers={customers} onSubmit={addAdjustment} />
        </div>

        <Card className="rounded-[1.5rem] border-border/50 bg-card/60 backdrop-blur-xl shadow-xl overflow-hidden">
          <div className="flex flex-wrap items-center justify-between border-b border-border/50 bg-accent/20 px-6 sm:px-8 py-5">
            <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-foreground">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background shadow-inner text-primary">
                <ClipboardList className="h-5 w-5" />
              </div>
              Ledger ({adjustments.length})
            </div>
            <span className="rounded-full bg-background/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground shadow-sm border border-border/50">
              Read-only · Sealed
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-bold border-b border-border/50">Timestamp</th>
                  <th className="px-6 py-4 font-bold border-b border-border/50">
                    Authorized Executive
                  </th>
                  <th className="px-6 py-4 font-bold border-b border-border/50">Target Customer</th>
                  <th className="px-6 py-4 font-bold border-b border-border/50">Adjustment</th>
                  <th className="px-6 py-4 font-bold border-b border-border/50">System Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {adjustments.map((a) => (
                  <tr key={a.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className="text-sm font-bold text-foreground">
                        {a.timestamp.toLocaleDateString()}
                      </div>
                      <div className="text-xs font-medium text-muted-foreground mt-0.5">
                        {formatRelative(a.timestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-sm font-medium">{a.executive}</td>
                    <td className="px-6 py-4 align-top text-sm font-bold">{a.customerName}</td>
                    <td className="px-6 py-4 align-top">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold tabular-nums shadow-sm",
                          a.delta > 0
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 border border-rose-500/20",
                        )}
                      >
                        {a.delta > 0 ? "+" : ""}
                        {a.delta} pts
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top text-sm font-medium text-muted-foreground">
                      <div>{a.reason}</div>
                      <div className="mt-1 text-xs">
                        {a.previousBalance} {"->"} {a.nextBalance} pts
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function AdjustDialog({
  customers,
  onSubmit,
}: {
  customers: Array<{ id: string; name: string; points: number }>;
  onSubmit: (a: { executive: string; customerId: string; delta: number; reason: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");

  const submit = () => {
    const n = parseInt(delta, 10);
    if (!customerId || !reason || Number.isNaN(n) || n === 0) return;
    onSubmit({
      executive: "Marcus Lin (Ops Manager)",
      customerId,
      delta: n,
      reason,
    });
    setOpen(false);
    setCustomerId("");
    setDelta("");
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="h-12 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <Plus className="mr-2 h-5 w-5" />
          Manually Adjust Points
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-border/50 bg-card/95 backdrop-blur-2xl p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="px-8 pt-8 pb-4 bg-accent/30 border-b border-border/50">
          <DialogTitle className="text-xl font-bold">Manual Points Adjustment</DialogTitle>
          <DialogDescription className="text-sm font-medium mt-1">
            Applies immediately to customer balance and writes an immutable ledger entry.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 px-8 py-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Target Customer
            </Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border/60 font-semibold transition-all focus-visible:ring-primary/30">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50">
                {customers.map((customer) => (
                  <SelectItem
                    key={customer.id}
                    value={customer.id}
                    className="rounded-lg font-medium"
                  >
                    {customer.name} ({customer.points} pts)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="delta"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Adjustment (positive or negative)
            </Label>
            <Input
              id="delta"
              type="number"
              placeholder="e.g. 50 or -100"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              className="h-11 rounded-xl bg-background/50 border-border/60 font-semibold transition-all focus-visible:ring-primary/30"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="reason"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              System Reason
            </Label>
            <Textarea
              id="reason"
              placeholder="Goodwill, dispute resolution, refund offset…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-xl bg-background/50 border-border/60 font-medium transition-all focus-visible:ring-primary/30 min-h-[100px] resize-none"
            />
          </div>
        </div>
        <DialogFooter className="px-8 pb-8 pt-4 border-t border-border/50 bg-accent/10">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="rounded-xl font-bold hover:bg-background/80"
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            className="rounded-xl font-bold shadow-md shadow-primary/20 hover:shadow-lg"
          >
            Record Adjustment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

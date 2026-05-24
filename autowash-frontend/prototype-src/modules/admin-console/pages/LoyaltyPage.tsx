import * as React from "react";
import { Gift, LoaderCircle, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useCarwashStore, type Tier, type VoucherTemplateRecord } from "@/lib/carwash-store";

type TemplateFormState = {
  id?: string;
  name: string;
  discountLabel: string;
  pointCost: string;
  minTier: Tier;
  expiryDays: string;
  active: boolean;
};

const EMPTY_FORM: TemplateFormState = {
  name: "",
  discountLabel: "",
  pointCost: "100",
  minTier: "Member",
  expiryDays: "14",
  active: true,
};

export function LoyaltyPage() {
  const {
    customers,
    voucherTemplates,
    customerVouchers,
    addVoucherTemplate,
    updateVoucherTemplate,
    toggleVoucherTemplate,
    simulateCustomerSpend,
  } = useCarwashStore();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState<TemplateFormState>(EMPTY_FORM);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const rankDistribution = React.useMemo(
    () =>
      ["Member", "Silver", "Gold", "Platinum"].map((tier) => ({
        tier: tier as Tier,
        count: customers.filter((customer) => customer.tier === tier).length,
      })),
    [customers],
  );

  const maxRankCount = Math.max(...rankDistribution.map((item) => item.count), 1);

  const openCreateDialog = () => {
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (template: VoucherTemplateRecord) => {
    setForm({
      id: template.id,
      name: template.name,
      discountLabel: template.discountLabel,
      pointCost: `${template.pointCost}`,
      minTier: template.minTier,
      expiryDays: `${template.expiryDays}`,
      active: template.active,
    });
    setDialogOpen(true);
  };

  const saveTemplate = async () => {
    try {
      setBusyId(form.id ?? "new-template");
      await delay();
      const payload = {
        name: form.name.trim(),
        discountLabel: form.discountLabel.trim(),
        pointCost: Number(form.pointCost),
        minTier: form.minTier,
        expiryDays: Number(form.expiryDays),
        active: form.active,
      } satisfies Omit<VoucherTemplateRecord, "id">;

      if (
        !payload.name ||
        !payload.discountLabel ||
        payload.pointCost <= 0 ||
        payload.expiryDays <= 0
      ) {
        throw new Error("Please complete all voucher fields with valid values.");
      }

      if (form.id) {
        updateVoucherTemplate(form.id, payload);
        toast.success("Voucher template updated.");
      } else {
        addVoucherTemplate(payload);
        toast.success("Voucher template created.");
      }
      setDialogOpen(false);
      setForm(EMPTY_FORM);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save voucher template.");
    } finally {
      setBusyId(null);
    }
  };

  const awardPoints = async (customerId: string) => {
    const amountText = window.prompt("Enter VND amount to convert into points", "100000");
    if (!amountText) return;
    try {
      setBusyId(customerId);
      await delay();
      simulateCustomerSpend(customerId, Number(amountText));
      toast.success("Customer points updated from simulated spend.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add points.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-md">
            <Gift className="h-3.5 w-3.5" /> Admin loyalty
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Loyalty overview and voucher templates
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
            Manage voucher templates, inspect rank distribution, and simulate customer spending to
            update points and rank automatically.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="rounded-xl shadow-md">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Voucher Template Manager</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Toggle active state, edit an existing template, or add a new one.
                </p>
              </div>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm voucher
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {voucherTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/60 bg-background/70 p-4"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-foreground">{template.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {template.discountLabel} / {template.pointCost} pts / {template.minTier}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        template.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }
                    >
                      {template.active ? "Active" : "Inactive"}
                    </Badge>
                    <Switch
                      checked={template.active}
                      onCheckedChange={() => toggleVoucherTemplate(template.id)}
                    />
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(template)}>
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Customer loyalty overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rankDistribution.map((item) => (
                <div key={item.tier} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-foreground">{item.tier}</span>
                    <span className="text-muted-foreground">{item.count}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(item.count / maxRankCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Customer points and redeemed vouchers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customers.map((customer) => {
              const redeemed = customerVouchers.filter(
                (voucher) => voucher.customerId === customer.id,
              ).length;
              return (
                <div
                  key={customer.id}
                  className="grid gap-4 rounded-xl border border-border/60 bg-background/70 p-4 md:grid-cols-[1fr_auto_auto_auto]"
                >
                  <div>
                    <div className="font-semibold text-foreground">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">{customer.email}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Points
                    </div>
                    <div className="mt-1 font-semibold text-foreground">
                      {customer.points.toLocaleString("vi-VN")}
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Rank
                    </div>
                    <div className="mt-1 font-semibold text-foreground">{customer.tier}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-100 text-blue-700">{redeemed} redeemed</Badge>
                    <Button
                      variant="outline"
                      onClick={() => awardPoints(customer.id)}
                      disabled={busyId === customer.id}
                    >
                      {busyId === customer.id ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Adding
                        </>
                      ) : (
                        "Simulate Add Points"
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Edit voucher template" : "Create voucher template"}
            </DialogTitle>
            <DialogDescription>
              Configure the discount label, point cost, minimum rank, and active state.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <Field label="Name">
              <Input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </Field>
            <Field label="Discount label">
              <Input
                value={form.discountLabel}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, discountLabel: event.target.value }))
                }
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Point cost">
                <Input
                  type="number"
                  value={form.pointCost}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, pointCost: event.target.value }))
                  }
                />
              </Field>
              <Field label="Expiry days">
                <Input
                  type="number"
                  value={form.expiryDays}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, expiryDays: event.target.value }))
                  }
                />
              </Field>
            </div>
            <Field label="Minimum rank">
              <Select
                value={form.minTier}
                onValueChange={(value) => setForm((prev) => ({ ...prev, minTier: value as Tier }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Member", "Silver", "Gold", "Platinum"].map((tier) => (
                    <SelectItem key={tier} value={tier}>
                      {tier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 px-4 py-3">
              <div>
                <div className="font-medium text-foreground">Active template</div>
                <div className="text-sm text-muted-foreground">
                  Inactive templates stay visible to admin only.
                </div>
              </div>
              <Switch
                checked={form.active}
                onCheckedChange={(value) => setForm((prev) => ({ ...prev, active: value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveTemplate} disabled={busyId === (form.id ?? "new-template")}>
              {busyId === (form.id ?? "new-template") ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function delay() {
  return new Promise((resolve) => setTimeout(resolve, 200));
}

"use client";

import { useState, useEffect } from "react";
import { Settings2, Loader2, Save, Clock, Calendar, Coins, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { WorkspacePage } from "@/shared/components/workspace/workspace-page";
import { useSystemSettings, useUpdateSystemSettings } from "@/features/admin/settings/hooks/use-admin-settings";
import type { SystemSettings } from "@/features/admin/settings/lib/admin-settings-service";
import { getDisplayErrorMessage } from "@/shared/lib/api-errors";

type SettingsForm = Omit<SystemSettings, "updatedAt">;

function toForm(data: SystemSettings): SettingsForm {
  return {
    operatingStartTime: data.operatingStartTime,
    operatingEndTime: data.operatingEndTime,
    maxAdvanceBookingDays: data.maxAdvanceBookingDays,
    noShowGraceMinutes: data.noShowGraceMinutes,
    currency: data.currency,
    earnPointsUnitAmount: data.earnPointsUnitAmount,
    vndPerPoint: data.vndPerPoint,
    minRedemptionPoints: data.minRedemptionPoints,
    maxRedemptionPoints: data.maxRedemptionPoints,
    silverThreshold: data.silverThreshold,
    goldThreshold: data.goldThreshold,
    platinumThreshold: data.platinumThreshold,
    silverMultiplier: data.silverMultiplier,
    goldMultiplier: data.goldMultiplier,
    platinumMultiplier: data.platinumMultiplier,
  };
}

export function AdminSettingsPage() {
  const settingsQuery = useSystemSettings();
  const updateMutation = useUpdateSystemSettings();
  const [form, setForm] = useState<SettingsForm | null>(null);

  useEffect(() => {
    if (settingsQuery.data && !form) {
      setForm(toForm(settingsQuery.data));
    }
  }, [settingsQuery.data, form]);

  function updateField<K extends keyof SettingsForm>(field: K, value: SettingsForm[K]) {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  }

  async function handleSave() {
    if (!form) return;
    try {
      await updateMutation.mutateAsync(form);
      toast.success("Settings saved successfully.");
    } catch (error) {
      toast.error(getDisplayErrorMessage(error));
    }
  }

  return (
    <WorkspacePage>
      <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
        <CardHeader className="gap-3 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>System Settings</CardTitle>
              {settingsQuery.data?.updatedAt ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Last updated: {new Date(settingsQuery.data.updatedAt).toLocaleString("vi-VN")}
                </p>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {settingsQuery.isPending ? (
            <div className="flex min-h-48 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : settingsQuery.isError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {getDisplayErrorMessage(settingsQuery.error)}
            </div>
          ) : form ? (
            <div className="space-y-8">
              {/* Operating Hours */}
              <SettingsSection icon={Clock} title="Operating Hours" description="Business hours for accepting bookings.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldInput label="Open time (HH:mm)" value={form.operatingStartTime} onChange={(v) => updateField("operatingStartTime", v)} />
                  <FieldInput label="Close time (HH:mm)" value={form.operatingEndTime} onChange={(v) => updateField("operatingEndTime", v)} />
                </div>
              </SettingsSection>

              {/* Booking Rules */}
              <SettingsSection icon={Calendar} title="Booking Rules" description="Rules governing how far in advance customers can book and no-show policies.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldNumber label="Max advance booking (days)" value={form.maxAdvanceBookingDays} onChange={(v) => updateField("maxAdvanceBookingDays", v)} />
                  <FieldNumber label="No-show grace (minutes)" value={form.noShowGraceMinutes} onChange={(v) => updateField("noShowGraceMinutes", v)} />
                </div>
              </SettingsSection>

              {/* Currency */}
              <SettingsSection icon={Coins} title="Currency & Points" description="Configure currency and the loyalty points earning/redemption rules.">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <FieldInput label="Currency" value={form.currency} onChange={(v) => updateField("currency", v)} />
                  <FieldNumber label="Earn points per (VND)" value={form.earnPointsUnitAmount} onChange={(v) => updateField("earnPointsUnitAmount", v)} />
                  <FieldNumber label="VND per point" value={form.vndPerPoint} onChange={(v) => updateField("vndPerPoint", v)} />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <FieldNumber label="Min redemption points" value={form.minRedemptionPoints} onChange={(v) => updateField("minRedemptionPoints", v)} />
                  <FieldNumber label="Max redemption points" value={form.maxRedemptionPoints} onChange={(v) => updateField("maxRedemptionPoints", v)} />
                </div>
              </SettingsSection>

              {/* Loyalty Tiers */}
              <SettingsSection icon={Trophy} title="Loyalty Tiers" description="Tier thresholds (total earned points) and point multipliers for each tier.">
                <div className="grid gap-4 sm:grid-cols-3">
                  <TierCard tier="Silver" color="bg-slate-100 text-slate-700" threshold={form.silverThreshold} multiplier={form.silverMultiplier} onThresholdChange={(v) => updateField("silverThreshold", v)} onMultiplierChange={(v) => updateField("silverMultiplier", v)} />
                  <TierCard tier="Gold" color="bg-amber-50 text-amber-700" threshold={form.goldThreshold} multiplier={form.goldMultiplier} onThresholdChange={(v) => updateField("goldThreshold", v)} onMultiplierChange={(v) => updateField("goldMultiplier", v)} />
                  <TierCard tier="Platinum" color="bg-violet-50 text-violet-700" threshold={form.platinumThreshold} multiplier={form.platinumMultiplier} onThresholdChange={(v) => updateField("platinumThreshold", v)} onMultiplierChange={(v) => updateField("platinumMultiplier", v)} />
                </div>
              </SettingsSection>

              {/* Save button */}
              {updateMutation.isError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {getDisplayErrorMessage(updateMutation.error)}
                </div>
              ) : null}
              <div className="flex justify-end border-t border-border/60 pt-6">
                <Button type="button" disabled={updateMutation.isPending} onClick={handleSave}>
                  {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save settings
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </WorkspacePage>
  );
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Clock;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function FieldInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function FieldNumber({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function TierCard({
  tier,
  color,
  threshold,
  multiplier,
  onThresholdChange,
  onMultiplierChange,
}: {
  tier: string;
  color: string;
  threshold: number;
  multiplier: number;
  onThresholdChange: (v: number) => void;
  onMultiplierChange: (v: number) => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${color}`}>{tier}</span>
      <FieldNumber label="Threshold (points)" value={threshold} onChange={onThresholdChange} />
      <FieldNumber label="Point multiplier" value={multiplier} onChange={onMultiplierChange} />
    </div>
  );
}

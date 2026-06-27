"use client";

import { useState, useEffect } from "react";
import { Settings2, Loader2, Save, Clock, Calendar, Coins, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/ui/card";
import { Button } from "@/shared/ui/ui/button";
import { WorkspacePage } from "@/shared/ui/workspace/workspace-page";
import { useSystemSettings, useUpdateSystemSettings } from "@/features/settings/hooks/use-admin-settings";
import type { SystemSettings } from "@/features/settings/lib/admin-settings-service";
import { getDisplayErrorMessage } from "@/shared/lib/api-errors";
import { useLanguageStore } from "@/shared/store/language.store";

const ADMIN_SETTINGS_COPY = {
  vi: {
    title: "Cài đặt Hệ thống",
    lastUpdated: "Cập nhật lần cuối",
    successMsg: "Lưu cài đặt thành công.",
    saveBtn: "Lưu cài đặt",
    operatingHours: {
      title: "Giờ hoạt động",
      desc: "Giờ mở cửa để nhận đặt lịch.",
      open: "Giờ mở cửa (HH:mm)",
      close: "Giờ đóng cửa (HH:mm)",
    },
    bookingRules: {
      title: "Quy tắc Đặt lịch",
      desc: "Quy định về thời gian đặt trước tối đa và chính sách vắng mặt.",
      maxAdvance: "Đặt trước tối đa (ngày)",
      noShowGrace: "Thời gian chờ vắng mặt (phút)",
    },
    currencyPoints: {
      title: "Tiền tệ & Điểm",
      desc: "Cấu hình tiền tệ và quy tắc tích lũy/đổi điểm thưởng.",
      currency: "Tiền tệ",
      earnPerVnd: "Tích điểm mỗi (VNĐ)",
      vndPerPoint: "VNĐ mỗi điểm",
      minRedemption: "Điểm đổi tối thiểu",
      maxRedemption: "Điểm đổi tối đa",
    },
    loyaltyTiers: {
      title: "Hạng Thành viên",
      desc: "Mốc điểm (tổng điểm tích lũy) và hệ số nhân điểm cho từng hạng.",
      silver: "Bạc",
      gold: "Vàng",
      platinum: "Bạch kim",
      threshold: "Mốc điểm (điểm)",
      multiplier: "Hệ số nhân điểm",
    },
  },
  en: {
    title: "System Settings",
    lastUpdated: "Last updated",
    successMsg: "Settings saved successfully.",
    saveBtn: "Save settings",
    operatingHours: {
      title: "Operating Hours",
      desc: "Business hours for accepting bookings.",
      open: "Open time (HH:mm)",
      close: "Close time (HH:mm)",
    },
    bookingRules: {
      title: "Booking Rules",
      desc: "Rules governing how far in advance customers can book and no-show policies.",
      maxAdvance: "Max advance booking (days)",
      noShowGrace: "No-show grace (minutes)",
    },
    currencyPoints: {
      title: "Currency & Points",
      desc: "Configure currency and the loyalty points earning/redemption rules.",
      currency: "Currency",
      earnPerVnd: "Earn points per (VND)",
      vndPerPoint: "VND per point",
      minRedemption: "Min redemption points",
      maxRedemption: "Max redemption points",
    },
    loyaltyTiers: {
      title: "Loyalty Tiers",
      desc: "Tier thresholds (total earned points) and point multipliers for each tier.",
      silver: "Silver",
      gold: "Gold",
      platinum: "Platinum",
      threshold: "Threshold (points)",
      multiplier: "Point multiplier",
    },
  },
};

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
  const { language } = useLanguageStore();
  const copy = ADMIN_SETTINGS_COPY[language as keyof typeof ADMIN_SETTINGS_COPY] || ADMIN_SETTINGS_COPY.vi;
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
      toast.success(copy.successMsg);
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
              <CardTitle>{copy.title}</CardTitle>
              {settingsQuery.data?.updatedAt ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {copy.lastUpdated}: {new Date(settingsQuery.data.updatedAt).toLocaleString(language === "vi" ? "vi-VN" : "en-US")}
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
              <SettingsSection icon={Clock} title={copy.operatingHours.title} description={copy.operatingHours.desc}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldInput label={copy.operatingHours.open} value={form.operatingStartTime} onChange={(v) => updateField("operatingStartTime", v)} />
                  <FieldInput label={copy.operatingHours.close} value={form.operatingEndTime} onChange={(v) => updateField("operatingEndTime", v)} />
                </div>
              </SettingsSection>

              {/* Booking Rules */}
              <SettingsSection icon={Calendar} title={copy.bookingRules.title} description={copy.bookingRules.desc}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldNumber label={copy.bookingRules.maxAdvance} value={form.maxAdvanceBookingDays} onChange={(v) => updateField("maxAdvanceBookingDays", v)} />
                  <FieldNumber label={copy.bookingRules.noShowGrace} value={form.noShowGraceMinutes} onChange={(v) => updateField("noShowGraceMinutes", v)} />
                </div>
              </SettingsSection>

              {/* Currency */}
              <SettingsSection icon={Coins} title={copy.currencyPoints.title} description={copy.currencyPoints.desc}>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <FieldInput label={copy.currencyPoints.currency} value={form.currency} onChange={(v) => updateField("currency", v)} />
                  <FieldNumber label={copy.currencyPoints.earnPerVnd} value={form.earnPointsUnitAmount} onChange={(v) => updateField("earnPointsUnitAmount", v)} />
                  <FieldNumber label={copy.currencyPoints.vndPerPoint} value={form.vndPerPoint} onChange={(v) => updateField("vndPerPoint", v)} />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <FieldNumber label={copy.currencyPoints.minRedemption} value={form.minRedemptionPoints} onChange={(v) => updateField("minRedemptionPoints", v)} />
                  <FieldNumber label={copy.currencyPoints.maxRedemption} value={form.maxRedemptionPoints} onChange={(v) => updateField("maxRedemptionPoints", v)} />
                </div>
              </SettingsSection>

              {/* Loyalty Tiers */}
              <SettingsSection icon={Trophy} title={copy.loyaltyTiers.title} description={copy.loyaltyTiers.desc}>
                <div className="grid gap-4 sm:grid-cols-3">
                  <TierCard copy={copy} tier={copy.loyaltyTiers.silver} color="bg-slate-100 text-slate-700" threshold={form.silverThreshold} multiplier={form.silverMultiplier} onThresholdChange={(v) => updateField("silverThreshold", v)} onMultiplierChange={(v) => updateField("silverMultiplier", v)} />
                  <TierCard copy={copy} tier={copy.loyaltyTiers.gold} color="bg-amber-50 text-amber-700" threshold={form.goldThreshold} multiplier={form.goldMultiplier} onThresholdChange={(v) => updateField("goldThreshold", v)} onMultiplierChange={(v) => updateField("goldMultiplier", v)} />
                  <TierCard copy={copy} tier={copy.loyaltyTiers.platinum} color="bg-violet-50 text-violet-700" threshold={form.platinumThreshold} multiplier={form.platinumMultiplier} onThresholdChange={(v) => updateField("platinumThreshold", v)} onMultiplierChange={(v) => updateField("platinumMultiplier", v)} />
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
                  {copy.saveBtn}
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
          <p className="hidden text-xs text-muted-foreground">{description}</p>
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
  copy,
  tier,
  color,
  threshold,
  multiplier,
  onThresholdChange,
  onMultiplierChange,
}: {
  copy: any;
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
      <FieldNumber label={copy.loyaltyTiers.threshold} value={threshold} onChange={onThresholdChange} />
      <FieldNumber label={copy.loyaltyTiers.multiplier} value={multiplier} onChange={onMultiplierChange} />
    </div>
  );
}

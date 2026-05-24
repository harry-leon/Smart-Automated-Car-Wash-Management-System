import * as React from "react";
import { Building2, Coins, Settings as SettingsIcon, ShieldAlert, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCarwashStore } from "@/lib/carwash-store";
import { SettingsSection } from "../components/SettingsSection";
import styles from "../styles/settings.module.css";

export function SettingsPage() {
  const { settings, updateSettings, resetSettings, hydrated } = useCarwashStore();
  const [draft, setDraft] = React.useState(settings);

  React.useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const handleReset = () => {
    resetSettings();
    toast.success("Settings reset to defaults.");
  };

  const handleSave = () => {
    updateSettings(draft);
    toast.success("Settings saved.");
  };

  if (!hydrated) {
    return <div className="p-10 text-center text-sm text-muted-foreground">Loading settings…</div>;
  }

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-md">
              <SettingsIcon className="h-3.5 w-3.5" /> Settings
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Workspace settings
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
              Tune business identity, loyalty conversion and cancellation enforcement. Saved values
              persist across sessions on this device.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              Reset defaults
            </Button>
            <Button onClick={handleSave}>Save changes</Button>
          </div>
        </div>

        <div className={styles.sectionGrid}>
          <SettingsSection
            title="Business information"
            icon={<Building2 className="h-4 w-4 text-primary" />}
            description="Public identity of the carwash network."
          >
            <div className={styles.fieldRow}>
              <Field label="Brand name">
                <Input
                  value={draft.business.brandName}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      business: { ...prev.business, brandName: event.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Hotline">
                <Input
                  value={draft.business.hotline}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      business: { ...prev.business, hotline: event.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={draft.business.email}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      business: { ...prev.business, email: event.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Operating hours">
                <Input
                  value={draft.business.operatingHours}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      business: { ...prev.business, operatingHours: event.target.value },
                    }))
                  }
                />
              </Field>
            </div>
            <Field label="Headquarter">
              <Textarea
                rows={2}
                value={draft.business.headquarter}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    business: { ...prev.business, headquarter: event.target.value },
                  }))
                }
              />
            </Field>
          </SettingsSection>

          <SettingsSection
            title="Cancellation policy"
            icon={<XCircle className="h-4 w-4 text-rose-500" />}
            description="Rules for free/late cancellation and refunds."
          >
            <div className={styles.fieldRow}>
              <Field label="Free cancel hours-before">
                <Input
                  type="number"
                  min={0}
                  value={draft.cancellation.freeCancelHoursBefore}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      cancellation: {
                        ...prev.cancellation,
                        freeCancelHoursBefore: Number(event.target.value),
                      },
                    }))
                  }
                />
              </Field>
              <Field label="Late cancel fee %">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.cancellation.lateCancelFeePercent}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      cancellation: {
                        ...prev.cancellation,
                        lateCancelFeePercent: Number(event.target.value),
                      },
                    }))
                  }
                />
              </Field>
            </div>
            <Field label="Refund policy">
              <Textarea
                rows={3}
                value={draft.cancellation.refundPolicy}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    cancellation: { ...prev.cancellation, refundPolicy: event.target.value },
                  }))
                }
              />
            </Field>
          </SettingsSection>

          <SettingsSection
            title="Point conversion rate"
            icon={<Coins className="h-4 w-4 text-amber-500" />}
            description="How customers earn and redeem loyalty points."
          >
            <div className={styles.fieldRow}>
              <Field label="VND spent per 1 point">
                <Input
                  type="number"
                  min={1}
                  value={draft.point.spendPerPoint}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      point: { ...prev.point, spendPerPoint: Number(event.target.value) },
                    }))
                  }
                />
              </Field>
              <Field label="VND value of 1 point">
                <Input
                  type="number"
                  min={1}
                  value={draft.point.pointValueVnd}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      point: { ...prev.point, pointValueVnd: Number(event.target.value) },
                    }))
                  }
                />
              </Field>
              <Field label="Min redeem points">
                <Input
                  type="number"
                  min={0}
                  value={draft.point.minRedeemPoints}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      point: { ...prev.point, minRedeemPoints: Number(event.target.value) },
                    }))
                  }
                />
              </Field>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Cancellation auto-ban"
            icon={<ShieldAlert className="h-4 w-4 text-orange-500" />}
            description="Temporarily suspend customers who cancel bookings too many times."
          >
            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/40 p-3">
              <div>
                <div className="text-sm font-semibold">Enable auto-ban rule</div>
                <div className="text-xs text-muted-foreground">
                  When a customer hits the threshold within the rolling window, they are blocked for
                  the configured ban period.
                </div>
              </div>
              <Switch
                checked={draft.cancellationAutoBan.enabled}
                onCheckedChange={(checked) =>
                  setDraft((prev) => ({
                    ...prev,
                    cancellationAutoBan: { ...prev.cancellationAutoBan, enabled: checked },
                  }))
                }
              />
            </div>
            <div className={styles.fieldRow}>
              <Field label="Cancellation threshold">
                <Input
                  type="number"
                  min={1}
                  value={draft.cancellationAutoBan.thresholdCount}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      cancellationAutoBan: {
                        ...prev.cancellationAutoBan,
                        thresholdCount: Math.max(1, Number(event.target.value)),
                      },
                    }))
                  }
                />
              </Field>
              <Field label="Rolling window (days)">
                <Input
                  type="number"
                  min={1}
                  value={draft.cancellationAutoBan.windowDays}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      cancellationAutoBan: {
                        ...prev.cancellationAutoBan,
                        windowDays: Math.max(1, Number(event.target.value)),
                      },
                    }))
                  }
                />
              </Field>
              <Field label="Ban duration (days)">
                <Input
                  type="number"
                  min={1}
                  value={draft.cancellationAutoBan.banDays}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      cancellationAutoBan: {
                        ...prev.cancellationAutoBan,
                        banDays: Math.max(1, Number(event.target.value)),
                      },
                    }))
                  }
                />
              </Field>
            </div>
            <p className="text-xs text-muted-foreground">
              Currently set to ban customers who cancel{" "}
              <strong className="text-foreground">
                {draft.cancellationAutoBan.thresholdCount}
              </strong>{" "}
              or more bookings within{" "}
              <strong className="text-foreground">{draft.cancellationAutoBan.windowDays}</strong>{" "}
              days for{" "}
              <strong className="text-foreground">{draft.cancellationAutoBan.banDays}</strong> days.
            </p>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

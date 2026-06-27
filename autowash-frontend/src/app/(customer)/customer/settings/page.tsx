"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCcw, Save, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/ui/card";
import { getDisplayErrorMessage } from "@/shared/lib/api-errors";
import {
  useCustomerPreferences,
  useUpdateCustomerPreferences,
} from "@/features/preferences/hooks/use-customer-preferences";
import type { CustomerPreferences } from "@/entities/preferences";

export default function CustomerSettingsPage() {
  const preferencesQuery = useCustomerPreferences();
  const updatePreferencesMutation = useUpdateCustomerPreferences();
  const [form, setForm] = useState<CustomerPreferences | null>(null);

  useEffect(() => {
    if (preferencesQuery.data) {
      setForm(preferencesQuery.data);
    }
  }, [preferencesQuery.data]);

  const hasChanges = Boolean(
    form &&
      preferencesQuery.data &&
      JSON.stringify(form) !== JSON.stringify(preferencesQuery.data),
  );

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/95 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Customer settings</CardTitle>
          </div>
          <div className="rounded-xl border border-teal-100 bg-teal-50 p-3 text-teal-700">
            <Settings2 className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={() => preferencesQuery.refetch()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {preferencesQuery.isPending || !form ? (
            <div className="flex min-h-56 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
              <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
            </div>
          ) : preferencesQuery.isError ? (
            <Card className="border-rose-200 bg-white">
              <CardHeader>
                <CardTitle className="text-base">Unable to load settings</CardTitle>
                <CardDescription>{getDisplayErrorMessage(preferencesQuery.error)}</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-slate-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-base">Display preferences</CardTitle>
                    <CardDescription>Language and theme values come from the backend profile preferences.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <PreferenceSelect
                      label="Language"
                      value={form.language}
                      options={[
                        { value: "VI", label: "Vietnamese" },
                        { value: "EN", label: "English" },
                      ]}
                      onChange={(value) => setForm((current) => current ? { ...current, language: value as "VI" | "EN" } : current)}
                    />
                    <PreferenceSelect
                      label="Theme"
                      value={form.theme}
                      options={[
                        { value: "LIGHT", label: "Light" },
                        { value: "DARK", label: "Dark" },
                      ]}
                      onChange={(value) => setForm((current) => current ? { ...current, theme: value as "LIGHT" | "DARK" } : current)}
                    />
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-base">Notification preferences</CardTitle>
                    <CardDescription>These toggles map to the backend preference booleans directly.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <PreferenceToggle
                      label="Enable all notifications"
                      checked={form.notificationsEnabled}
                      onChange={(checked) => setForm((current) => current ? { ...current, notificationsEnabled: checked } : current)}
                    />
                    <PreferenceToggle
                      label="Email notifications"
                      checked={form.emailNotifications}
                      onChange={(checked) => setForm((current) => current ? { ...current, emailNotifications: checked } : current)}
                    />
                    <PreferenceToggle
                      label="SMS notifications"
                      checked={form.smsNotifications}
                      onChange={(checked) => setForm((current) => current ? { ...current, smsNotifications: checked } : current)}
                    />
                  </CardContent>
                </Card>
              </div>

              {updatePreferencesMutation.isError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {getDisplayErrorMessage(updatePreferencesMutation.error)}
                </div>
              ) : null}

              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={!hasChanges || updatePreferencesMutation.isPending}
                  onClick={async () => {
                    if (!form) return;
                    try {
                      await updatePreferencesMutation.mutateAsync(form);
                      toast.success("Settings saved.");
                    } catch (error) {
                      toast.error(getDisplayErrorMessage(error));
                    }
                  }}
                >
                  {updatePreferencesMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save settings
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PreferenceSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function PreferenceToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-teal-600"
      />
    </label>
  );
}

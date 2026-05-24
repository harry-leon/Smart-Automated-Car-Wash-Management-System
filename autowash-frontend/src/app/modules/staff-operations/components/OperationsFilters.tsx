import type { OperationFilters, OperationHourOption, StaffOption } from "../types/operations.types";
import { bookingStatusOptions } from "../mock/booking-status.mock";
import { useLanguage } from "@/app/modules/public-auth/components/LanguageSwitcher";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OperationsFiltersProps {
  filters: OperationFilters;
  hourOptions: OperationHourOption[];
  staffOptions: StaffOption[];
  onChange: (filters: OperationFilters) => void;
}

export function OperationsFilters({
  filters,
  hourOptions,
  staffOptions,
  onChange,
}: OperationsFiltersProps) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <FilterField label={t("Status", "Trạng thái")}>
        <Select
          value={filters.status}
          onValueChange={(status) =>
            onChange({ ...filters, status: status as OperationFilters["status"] })
          }
        >
          <SelectTrigger className="h-11 rounded-lg bg-background/70">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="ALL">{t("All statuses", "Tất cả trạng thái")}</SelectItem>
              {bookingStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.label, option.labelVi)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label={t("Time", "Buổi")}>
        <Select
          value={filters.time}
          onValueChange={(time) => onChange({ ...filters, time: time as OperationFilters["time"] })}
        >
          <SelectTrigger className="h-11 rounded-lg bg-background/70">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="ALL">{t("All day", "Cả ngày")}</SelectItem>
              <SelectItem value="MORNING">{t("Morning", "Buổi sáng")}</SelectItem>
              <SelectItem value="AFTERNOON">{t("Afternoon", "Buổi chiều")}</SelectItem>
              <SelectItem value="EVENING">{t("Evening", "Buổi tối")}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label={t("Hour", "Khung giờ")}>
        <Select value={filters.hour} onValueChange={(hour) => onChange({ ...filters, hour })}>
          <SelectTrigger className="h-11 rounded-lg bg-background/70">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="ALL">{t("All hours", "Tất cả giờ")}</SelectItem>
              {hourOptions.map((hour) => (
                <SelectItem key={hour.value} value={hour.value}>
                  {hour.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label={t("Staff", "Nhân viên")}>
        <Select
          value={filters.staffId}
          onValueChange={(staffId) => onChange({ ...filters, staffId })}
        >
          <SelectTrigger className="h-11 rounded-lg bg-background/70">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="ALL">{t("All staff", "Tất cả nhân viên")}</SelectItem>
              {staffOptions.map((staff) => (
                <SelectItem key={staff.id} value={staff.id}>
                  {staff.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FilterField>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

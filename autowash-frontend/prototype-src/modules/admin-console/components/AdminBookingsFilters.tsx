import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BookingStatus } from "../types/dashboard.types";
import styles from "../styles/admin-bookings.module.css";

export interface BookingsFilterState {
  status: "ALL" | BookingStatus;
  date: string;
  customerName: string;
}

interface Props {
  value: BookingsFilterState;
  onChange: (value: BookingsFilterState) => void;
}

export function AdminBookingsFilters({ value, onChange }: Props) {
  const reset = () => onChange({ status: "ALL", date: "", customerName: "" });

  return (
    <div className={styles.filtersWrap}>
      <div className="space-y-1.5">
        <Label
          htmlFor="filter-name"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Customer name
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="filter-name"
            value={value.customerName}
            onChange={(event) => onChange({ ...value, customerName: event.target.value })}
            placeholder="Search by customer name"
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="filter-status"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Status
        </Label>
        <Select
          value={value.status}
          onValueChange={(next) =>
            onChange({ ...value, status: next as BookingsFilterState["status"] })
          }
        >
          <SelectTrigger id="filter-status">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All status</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="CHECKED_IN">Checked-in</SelectItem>
            <SelectItem value="IN_PROGRESS">In progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="NO_SHOW">No-show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="filter-date"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Scheduled date
        </Label>
        <Input
          id="filter-date"
          type="date"
          value={value.date}
          onChange={(event) => onChange({ ...value, date: event.target.value })}
        />
      </div>

      <Button type="button" variant="outline" onClick={reset} className="gap-1.5">
        <X className="h-3.5 w-3.5" /> Reset
      </Button>
    </div>
  );
}

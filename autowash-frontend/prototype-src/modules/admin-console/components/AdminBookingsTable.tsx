import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminBookingRow, BookingStatus } from "../types/dashboard.types";

const STATUS_OPTIONS: BookingStatus[] = [
  "CONFIRMED",
  "CHECKED_IN",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

export const STATUS_TONE: Record<BookingStatus, string> = {
  CONFIRMED: "bg-sky-500/10 text-sky-600 border-sky-500/30",
  CHECKED_IN: "bg-violet-500/10 text-violet-600 border-violet-500/30",
  IN_PROGRESS: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  COMPLETED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  CANCELLED: "bg-zinc-500/10 text-zinc-600 border-zinc-500/30",
  NO_SHOW: "bg-rose-500/10 text-rose-600 border-rose-500/30",
};

interface Props {
  rows: AdminBookingRow[];
  onChangeStatus: (id: string, next: BookingStatus) => void;
  onRowClick?: (id: string) => void;
}

export function AdminBookingsTable({ rows, onChangeStatus, onRowClick }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking code</TableHead>
            <TableHead>Customer name</TableHead>
            <TableHead>Vehicle plate</TableHead>
            <TableHead>Service package</TableHead>
            <TableHead>Scheduled time</TableHead>
            <TableHead>Staff</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                No bookings match the current filters.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                className={onRowClick ? "cursor-pointer hover:bg-muted/10" : undefined}
                onClick={onRowClick ? () => onRowClick(row.id) : undefined}
              >
                <TableCell className="font-semibold">{row.code}</TableCell>
                <TableCell>{row.customerName}</TableCell>
                <TableCell className="font-mono text-xs">{row.vehiclePlate}</TableCell>
                <TableCell>{row.servicePackage}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.scheduledTime}</TableCell>
                <TableCell>{row.staffName}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`border font-semibold ${STATUS_TONE[row.status]}`}
                  >
                    {row.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Select
                    value={row.status}
                    onValueChange={(next) => onChangeStatus(row.id, next as BookingStatus)}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <SelectTrigger className="ml-auto h-8 w-[150px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status} className="text-xs">
                          {status.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

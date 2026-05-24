import { CalendarRange } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CustomerBookingItem } from "../types/customer.types";
import { STATUS_TONE } from "./AdminBookingsTable";

interface Props {
  bookings: CustomerBookingItem[];
}

export function CustomerBookingsTab({ bookings }: Props) {
  if (bookings.length === 0) {
    return (
      <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
        <CardContent className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <CalendarRange className="h-8 w-8" />
          <span className="text-sm">No bookings recorded for this customer yet.</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/50 bg-card/60 backdrop-blur-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-semibold">{booking.code}</TableCell>
              <TableCell>{booking.servicePackage}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {booking.scheduledTime}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`border font-semibold ${STATUS_TONE[booking.status]}`}
                >
                  {booking.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold">
                {booking.totalAmount.toLocaleString("vi-VN")} ₫
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

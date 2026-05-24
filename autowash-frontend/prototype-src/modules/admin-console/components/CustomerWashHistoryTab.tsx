import { Star, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WashHistoryItem } from "../types/customer.types";

interface Props {
  history: WashHistoryItem[];
}

export function CustomerWashHistoryTab({ history }: Props) {
  if (history.length === 0) {
    return (
      <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
        <CardContent className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <History className="h-8 w-8" />
          <span className="text-sm">No completed washes for this customer yet.</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/50 bg-card/60 backdrop-blur-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking code</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Completed at</TableHead>
            <TableHead>Staff</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-semibold">{item.bookingCode}</TableCell>
              <TableCell>{item.servicePackage}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{item.completedAt}</TableCell>
              <TableCell>{item.staffName}</TableCell>
              <TableCell>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-3.5 w-3.5 ${
                        index < item.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/40"
                      }`}
                    />
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold">
                {item.amount.toLocaleString("vi-VN")} ₫
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

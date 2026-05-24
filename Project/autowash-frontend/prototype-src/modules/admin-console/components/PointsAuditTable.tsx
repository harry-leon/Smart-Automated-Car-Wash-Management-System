import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PointTransaction, PointTransactionType } from "../types/customer.types";

const TYPE_TONE: Record<PointTransactionType, string> = {
  EARN: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  REDEEM: "bg-rose-500/10 text-rose-600 border-rose-500/30",
  ADJUST: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  EXPIRE: "bg-zinc-500/10 text-zinc-600 border-zinc-500/30",
  REFUND: "bg-sky-500/10 text-sky-600 border-sky-500/30",
};

interface Props {
  rows: PointTransaction[];
}

export function PointsAuditTable({ rows }: Props) {
  return (
    <Card className="overflow-hidden border-border/50 bg-card/60 shadow-lg backdrop-blur-xl">
      <CardHeader className="border-b border-border/50 bg-accent/20 py-4">
        <CardTitle className="text-base font-semibold">Points audit log</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Booking code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Available after</TableHead>
              <TableHead className="text-right">Lifetime after</TableHead>
              <TableHead>Created time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-semibold">{row.customerName}</TableCell>
                <TableCell>{row.bookingCode}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`border font-semibold ${TYPE_TONE[row.type]}`}
                  >
                    {row.type}
                  </Badge>
                </TableCell>
                <TableCell
                  className={`text-right font-semibold ${row.amount >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                >
                  {row.amount >= 0 ? "+" : ""}
                  {row.amount.toLocaleString("vi-VN")}
                </TableCell>
                <TableCell className="text-right">
                  {row.availableAfter.toLocaleString("vi-VN")}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {row.lifetimeAfter.toLocaleString("vi-VN")}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.createdAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

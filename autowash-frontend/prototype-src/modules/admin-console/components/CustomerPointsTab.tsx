import { Coins } from "lucide-react";
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
import type { PointTransaction, PointTransactionType } from "../types/customer.types";

const TYPE_TONE: Record<PointTransactionType, string> = {
  EARN: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  REDEEM: "bg-rose-500/10 text-rose-600 border-rose-500/30",
  ADJUST: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  EXPIRE: "bg-zinc-500/10 text-zinc-600 border-zinc-500/30",
  REFUND: "bg-sky-500/10 text-sky-600 border-sky-500/30",
};

interface Props {
  transactions: PointTransaction[];
}

export function CustomerPointsTab({ transactions }: Props) {
  if (transactions.length === 0) {
    return (
      <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
        <CardContent className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <Coins className="h-8 w-8" />
          <span className="text-sm">No point transactions yet.</span>
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
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Available after</TableHead>
            <TableHead className="text-right">Lifetime after</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="font-semibold">{tx.bookingCode}</TableCell>
              <TableCell>
                <Badge variant="outline" className={`border font-semibold ${TYPE_TONE[tx.type]}`}>
                  {tx.type}
                </Badge>
              </TableCell>
              <TableCell
                className={`text-right font-semibold ${tx.amount >= 0 ? "text-emerald-600" : "text-rose-600"}`}
              >
                {tx.amount >= 0 ? "+" : ""}
                {tx.amount.toLocaleString("vi-VN")}
              </TableCell>
              <TableCell className="text-right">
                {tx.availableAfter.toLocaleString("vi-VN")}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {tx.lifetimeAfter.toLocaleString("vi-VN")}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{tx.createdAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

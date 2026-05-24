import { ArrowRight, ShieldCheck } from "lucide-react";
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
import type { TierHistoryItem } from "../types/customer.types";
import { TIER_TONE } from "./CustomerTable";

interface Props {
  history: TierHistoryItem[];
}

export function CustomerTierHistoryTab({ history }: Props) {
  if (history.length === 0) {
    return (
      <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
        <CardContent className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <ShieldCheck className="h-8 w-8" />
          <span className="text-sm">No tier changes yet.</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/50 bg-card/60 backdrop-blur-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tier change</TableHead>
            <TableHead>Changed at</TableHead>
            <TableHead>Reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`border font-bold ${TIER_TONE[item.fromTier]}`}
                  >
                    {item.fromTier}
                  </Badge>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <Badge variant="outline" className={`border font-bold ${TIER_TONE[item.toTier]}`}>
                    {item.toTier}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{item.changedAt}</TableCell>
              <TableCell>{item.reason}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

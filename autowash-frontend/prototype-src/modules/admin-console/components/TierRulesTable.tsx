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
import type { TierRule } from "../mock/loyalty.mock";
import { TIER_TONE } from "./CustomerTable";

interface Props {
  rules: TierRule[];
}

export function TierRulesTable({ rules }: Props) {
  return (
    <Card className="overflow-hidden border-border/50 bg-card/60 shadow-lg backdrop-blur-xl">
      <CardHeader className="border-b border-border/50 bg-accent/20 py-4">
        <CardTitle className="text-base font-semibold">Tier rules</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tier</TableHead>
              <TableHead className="text-right">Min lifetime points</TableHead>
              <TableHead className="text-right">Point multiplier</TableHead>
              <TableHead className="text-right">Booking window (days)</TableHead>
              <TableHead>Perks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.tier}>
                <TableCell>
                  <Badge variant="outline" className={`border font-bold ${TIER_TONE[rule.tier]}`}>
                    {rule.tier}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {rule.minLifetimePoints.toLocaleString("vi-VN")}
                </TableCell>
                <TableCell className="text-right">x{rule.multiplier}</TableCell>
                <TableCell className="text-right">{rule.bookingWindowDays}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{rule.perks}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

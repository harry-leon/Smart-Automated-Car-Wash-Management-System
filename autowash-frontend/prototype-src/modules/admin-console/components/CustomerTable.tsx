import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  CustomerRole,
  CustomerRow,
  CustomerStatus,
  CustomerTier,
} from "../types/customer.types";

export const TIER_TONE: Record<CustomerTier, string> = {
  MEMBER: "bg-zinc-500/10 text-zinc-700 border-zinc-500/30 dark:text-zinc-300",
  SILVER: "bg-slate-400/10 text-slate-700 border-slate-400/30 dark:text-slate-300",
  GOLD: "bg-amber-400/10 text-amber-700 border-amber-400/30 dark:text-amber-300",
  DIAMOND: "bg-sky-400/10 text-sky-700 border-sky-400/30 dark:text-sky-300",
  "N/A": "bg-muted text-muted-foreground border-border",
};

export const ROLE_TONE: Record<CustomerRole, string> = {
  CUSTOMER: "bg-primary/10 text-primary border-primary/30",
  STAFF: "bg-violet-500/10 text-violet-600 border-violet-500/30",
  ADMIN: "bg-rose-500/10 text-rose-600 border-rose-500/30",
};

export const STATUS_TONE: Record<CustomerStatus, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  SUSPENDED: "bg-rose-500/10 text-rose-600 border-rose-500/30",
};

interface Props {
  rows: CustomerRow[];
  onOpenDetail: (id: string) => void;
}

export function CustomerTable({ rows, onOpenDetail }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Account name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead className="text-right">Available pts</TableHead>
            <TableHead className="text-right">Lifetime pts</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                No accounts match the current filters.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-semibold">{row.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.email}</TableCell>
                <TableCell className="font-mono text-xs">{row.phone}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`border font-bold ${TIER_TONE[row.tier]}`}>
                    {row.tier}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {row.availablePoints.toLocaleString("vi-VN")}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {row.lifetimePoints.toLocaleString("vi-VN")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`border font-semibold ${ROLE_TONE[row.role]}`}
                  >
                    {row.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`border font-semibold ${STATUS_TONE[row.status]}`}
                  >
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onOpenDetail(row.id)}
                    className="gap-1 text-xs"
                  >
                    Detail <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

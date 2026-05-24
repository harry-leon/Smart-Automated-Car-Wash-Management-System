import { Mail, Phone, CalendarDays, Coins } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { CustomerRole, CustomerRow, CustomerStatus } from "../types/customer.types";
import { ROLE_TONE, STATUS_TONE, TIER_TONE } from "./CustomerTable";

interface Props {
  customer: CustomerRow;
  draftRole: CustomerRole;
  draftStatus: CustomerStatus;
  onRoleChange: (role: CustomerRole) => void;
  onStatusChange: (status: CustomerStatus) => void;
}

export function CustomerProfilePanel({
  customer,
  draftRole,
  draftStatus,
  onRoleChange,
  onStatusChange,
}: Props) {
  const initials = customer.name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(-2)
    .join("")
    .toUpperCase();

  return (
    <Card className="border-border/50 bg-card/60 shadow-lg backdrop-blur-xl">
      <CardHeader className="border-b border-border/50 bg-accent/20 py-4">
        <CardTitle className="text-base font-semibold">Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border border-border/50">
            <AvatarFallback className="bg-primary/10 text-base font-bold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="text-lg font-bold text-foreground">{customer.name}</div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className={`border font-bold ${TIER_TONE[customer.tier]}`}>
                {customer.tier}
              </Badge>
              <Badge variant="outline" className={`border font-semibold ${ROLE_TONE[draftRole]}`}>
                {draftRole}
              </Badge>
              <Badge
                variant="outline"
                className={`border font-semibold ${STATUS_TONE[draftStatus]}`}
              >
                {draftStatus}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="text-foreground">{customer.email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span className="text-foreground font-mono">{customer.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span className="text-foreground">Joined {customer.joinedAt}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Coins className="h-4 w-4" />
            <span className="text-foreground">
              <strong>{customer.availablePoints.toLocaleString("vi-VN")}</strong> available /{" "}
              <span className="text-muted-foreground">
                {customer.lifetimePoints.toLocaleString("vi-VN")} lifetime
              </span>
            </span>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Admin overrides (mock)
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Role
            </Label>
            <Select value={draftRole} onValueChange={(next) => onRoleChange(next as CustomerRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CUSTOMER">CUSTOMER</SelectItem>
                <SelectItem value="STAFF">STAFF</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </Label>
            <Select
              value={draftStatus}
              onValueChange={(next) => onStatusChange(next as CustomerStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

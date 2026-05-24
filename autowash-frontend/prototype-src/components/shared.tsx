import { Badge } from "@/components/ui/badge";

export function TierBadge({ tier }: { tier: "Member" | "Silver" | "Gold" | "Platinum" | "Guest" }) {
  if (tier === "Platinum") {
    return (
      <Badge className="border-fuchsia-200 bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-100">
        Platinum
      </Badge>
    );
  }
  if (tier === "Gold") {
    return (
      <Badge className="border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100">
        Gold
      </Badge>
    );
  }
  if (tier === "Silver") {
    return (
      <Badge className="border-slate-300 bg-slate-200 text-slate-800 hover:bg-slate-200">
        Silver
      </Badge>
    );
  }
  if (tier === "Member") {
    return (
      <Badge className="border-orange-200 bg-orange-100 text-orange-800 hover:bg-orange-100">
        Member
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      Guest
    </Badge>
  );
}

export function PageHeader({
  step,
  title,
  subtitle,
}: {
  step?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      {step && (
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">{step}</div>
      )}
      <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

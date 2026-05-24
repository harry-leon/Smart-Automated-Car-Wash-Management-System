import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/staff/dashboard")({
  component: () => <StaffDashboardHome />,
});

function StaffDashboardHome() {
  return (
    <div className="p-4 md:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Staff Workspace
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl text-foreground">
            Operations dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Move synced bookings through check-in, wash progress, and completion.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <StaffCard
            to="/staff/operations"
            title="Operations"
            text="Track today's queue and move bookings through wash status."
            icon={ClipboardList}
          />
          <StaffCard
            to="/staff/check-in"
            title="Check-in Queue"
            text="Process booked arrivals with hourly filters."
            icon={ClipboardList}
          />
        </div>
      </div>
    </div>
  );
}

function StaffCard({
  to,
  title,
  text,
  icon: Icon,
}: {
  to: string;
  title: string;
  text: string;
  icon: typeof ClipboardList;
}) {
  return (
    <Link to={to} className="group block">
      <Card className="h-full rounded-[1.5rem] border-border/50 bg-card/60 backdrop-blur-xl p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-card/80 hover:border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 transition-all group-hover:bg-primary/10" />
        <div className="relative z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background shadow-inner text-primary transition-transform duration-300 group-hover:scale-110">
            <Icon className="h-6 w-6" />
          </div>
          <div className="mt-5 text-base font-bold text-foreground tracking-wide">{title}</div>
          <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</div>
        </div>
      </Card>
    </Link>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  ClipboardList,
  Gift,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Wrench,
  Activity,
} from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getHomePath } from "@/lib/auth";
import { useCarwashStore } from "@/lib/carwash-store";
import { cn } from "@/lib/utils";

function HomeRedirectPage() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useCarwashStore();

  useEffect(() => {
    navigate({ to: isAuthenticated ? getHomePath(role) : "/login", replace: true });
  }, [isAuthenticated, navigate, role]);

  return <div className="min-h-screen bg-background" />;
}

export function OverviewPage() {
  const { customers, bookings, transactions, notifications, role } = useCarwashStore();
  const activeCustomer = customers[0];

  return (
    <div className="relative z-10 p-4 md:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary shadow-sm backdrop-blur-md mb-4">
            <Sparkles className="h-3.5 w-3.5" /> Unified prototype ready for demo
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Carwash main flow hub
          </h1>
          <p className="mt-3 max-w-3xl text-sm md:text-base text-muted-foreground leading-relaxed">
            Registration, booking, staff check-in, operations, loyalty, notification and admin flows
            are now linked through one shared business state.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Customers" value={String(customers.length)} />
          <StatCard
            label="Active Bookings"
            value={String(
              bookings.filter((item) => item.status !== "Completed" && item.status !== "Cancelled")
                .length,
            )}
            highlight
          />
          <StatCard label="Transactions" value={String(transactions.length)} />
          <StatCard label="Notifications" value={String(notifications.length)} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="overflow-hidden border-border/50 bg-card/60 backdrop-blur-xl shadow-xl lg:col-span-2">
            <div className="border-b border-border/50 bg-accent/20 px-6 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Activity className="h-4 w-4 text-primary" />
                Main flow shortcuts
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <FlowLink
                  to="/register"
                  icon={UserPlus}
                  title="1. Register"
                  text="Create account, verify OTP and seed first vehicle."
                />
                <FlowLink
                  to="/customer/bookings"
                  icon={ClipboardList}
                  title="2. Book wash"
                  text="Create a booking using current customer vehicles."
                />
                <FlowLink
                  to="/staff/check-in"
                  icon={Wrench}
                  title="3. Staff check-in"
                  text="Check in booked customers from synced bookings."
                />
                <FlowLink
                  to="/staff/operations"
                  icon={ClipboardList}
                  title="4. Operations"
                  text="Track check-in, wash progress and completion."
                />
                <FlowLink
                  to="/customer/loyalty"
                  icon={Gift}
                  title="5. Loyalty"
                  text="View points, tier progress and reward redemption."
                />
                <FlowLink
                  to="/staff/notifications"
                  icon={Bell}
                  title="6. Notifications"
                  text="Review booking and loyalty notifications."
                />
                <FlowLink
                  to="/admin/tiers"
                  icon={ShieldCheck}
                  title="7. Admin rules"
                  text="Manage tier rules, promotions and governance screens."
                />
              </div>
            </div>
          </Card>

          <Card className="flex flex-col border-border/50 bg-card/60 backdrop-blur-xl shadow-xl">
            <div className="border-b border-border/50 bg-accent/20 px-6 py-4">
              <div className="text-sm font-semibold text-foreground">Current demo state</div>
            </div>
            <div className="flex-1 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="rounded-xl border border-border/50 bg-background/50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                    Active customer
                  </div>
                  <div className="text-base font-semibold text-foreground">
                    {activeCustomer?.name || "None"}
                  </div>
                </div>
                <div className="rounded-xl border border-border/50 bg-background/50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                    Tier / points
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-foreground">
                      {activeCustomer?.tier || "Standard"}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm font-medium text-primary">
                      {activeCustomer?.points || 0} pts
                    </span>
                  </div>
                </div>
                <div className="rounded-xl border border-border/50 bg-background/50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                    Workspace role
                  </div>
                  <div className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {role}
                  </div>
                </div>
              </div>
              <Button
                asChild
                size="lg"
                className="w-full shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
              >
                <Link to="/customer/bookings" className="font-semibold text-sm">
                  Continue Main Flow
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/50 bg-card/60 p-6 backdrop-blur-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-1",
        highlight && "border-primary/30 bg-primary/5",
      )}
    >
      {highlight && (
        <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-primary/10 blur-2xl" />
      )}
      <div className="relative z-10">
        <div
          className={cn(
            "text-[11px] font-bold uppercase tracking-wider",
            highlight ? "text-primary" : "text-muted-foreground",
          )}
        >
          {label}
        </div>
        <div className="mt-2 text-4xl font-bold tracking-tight text-foreground">{value}</div>
      </div>
    </Card>
  );
}

function FlowLink({
  to,
  icon: Icon,
  title,
  text,
}: {
  to: string;
  icon: typeof Sparkles;
  title: string;
  text: string;
}) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/50 bg-background/40 p-5 transition-all duration-300 hover:border-primary/40 hover:bg-background/80 hover:shadow-md hover:-translate-y-1"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative z-10">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-sm font-bold text-foreground transition-colors group-hover:text-primary">
          {title}
        </div>
        <div className="mt-1.5 text-xs font-medium leading-relaxed text-muted-foreground/80">
          {text}
        </div>
      </div>
    </Link>
  );
}

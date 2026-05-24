import { createFileRoute } from "@tanstack/react-router";
import { CarFront, CreditCard, Droplets, Lock, ShieldCheck, Timer } from "lucide-react";
import { AccessDenied } from "@/components/access-denied";
import { Card } from "@/components/ui/card";
import { canAccess } from "@/lib/access-control";
import { useAppStore } from "@/lib/app-store";

export const Route = createFileRoute("/admin/rbac")({
  component: () => <RbacPage />,
});

function RbacPage() {
  const { role } = useAppStore();

  if (!canAccess(role, ["Admin"])) {
    return (
      <div className="p-6 md:p-10">
        <AccessDenied
          title="RBAC configuration is restricted"
          description="Only Admin can inspect and manage the permission matrix."
          role={role}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
              Permission Matrix
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Role-based capability snapshot for the protected AURA CAR CARE workspace.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-xs font-bold text-primary shadow-sm border border-primary/20 backdrop-blur-md">
            <ShieldCheck className="h-4 w-4" />
            Demo Role Switch lives in the sidebar
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="p-6 sm:p-8 lg:col-span-2 rounded-[1.5rem] border border-border/50 bg-card/60 backdrop-blur-xl shadow-lg transition-all hover:shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background shadow-inner text-primary">
                    <CarFront className="h-5 w-5" />
                  </div>
                  Operations Capability Preview
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 shadow-sm border border-emerald-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                  Admin scope
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Metric icon={Timer} label="Wash floor" value="Full visibility" />
                <Metric icon={Droplets} label="Packages" value="Configurable" />
                <Metric icon={CarFront} label="Bays" value="Override rules" />
                <Metric icon={CreditCard} label="Checkout" value="Audit enabled" />
              </div>

              <div className="mt-6 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5 text-sm font-medium text-muted-foreground leading-relaxed">
                This page documents who can access each operational capability. To preview other
                workspaces, use the{" "}
                <span className="font-bold text-foreground">Demo Role Switch</span> in the sidebar
                instead of changing role inside the page.
              </div>
            </div>
          </Card>

          <Card className="p-6 sm:p-8 rounded-[1.5rem] border border-border/50 bg-card/60 backdrop-blur-xl shadow-lg transition-all hover:shadow-xl relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-foreground border-b border-border/50 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background shadow-inner text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                Admin Quick Config
              </div>
              <ul className="space-y-3 text-sm font-medium">
                {[
                  "Bay capacity rules",
                  "Package & add-on pricing",
                  "Loyalty multiplier config",
                  "Promotion eligibility matrix",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 backdrop-blur-md px-4 py-3 shadow-sm transition-all hover:bg-background hover:shadow-md"
                  >
                    <span>{item}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20">
                      Admin only
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        <Card className="p-6 sm:p-8 rounded-[1.5rem] border border-border/50 bg-card/60 backdrop-blur-xl shadow-xl">
          <div className="mb-6 border-b border-border/50 pb-4">
            <h2 className="text-lg font-bold uppercase tracking-wider text-foreground">
              Permission Matrix
            </h2>
            <p className="mt-1 text-sm text-muted-foreground font-medium">
              Production-style access rules for the current prototype roles.
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border border-border/50 bg-background/30 shadow-inner">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-bold border-b border-border/50">Capability</th>
                    <th className="px-6 py-4 font-bold border-b border-border/50">Admin</th>
                    <th className="px-6 py-4 font-bold border-b border-border/50">Staff</th>
                    <th className="px-6 py-4 font-bold border-b border-border/50">Current</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 bg-background/50">
                  {[
                    ["Process active wash & checkout", true, true],
                    ["Send manual notifications", true, true],
                    ["View analytics dashboard", true, false],
                    ["Manual points adjustments", true, false],
                    ["Edit pricing & packages", true, false],
                    ["Override system configurations", true, false],
                  ].map(([capability, adminAllowed, staffAllowed]) => (
                    <tr key={capability as string} className="hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4 font-bold">{capability}</td>
                      <td className="px-6 py-4">
                        <span className="text-emerald-600 font-bold bg-emerald-500/10 px-2 py-1 rounded-md">
                          Yes
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {staffAllowed ? (
                          <span className="text-emerald-600 font-bold bg-emerald-500/10 px-2 py-1 rounded-md">
                            Yes
                          </span>
                        ) : (
                          <span className="text-muted-foreground font-bold bg-muted/50 px-2 py-1 rounded-md">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {adminAllowed ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 shadow-sm border border-emerald-500/20">
                            Granted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/80 px-3 py-1 text-xs font-bold text-muted-foreground shadow-sm border border-border/50">
                            <Lock className="h-3.5 w-3.5" /> Locked
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CarFront;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/50 p-4 shadow-sm transition-all hover:bg-background hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <div className="mt-2 text-sm font-bold text-foreground leading-tight">{value}</div>
    </div>
  );
}

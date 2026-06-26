"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Droplets, Layers3, Package, Sparkles } from "lucide-react";
import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { AdminManagementTabs } from "@/features/admin/management/components/admin-management-tabs";
import { WorkspacePage } from "@/shared/components/workspace/workspace-page";

export function AdminServiceManagementPage() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const hasSelectedTab =
    currentTab === "packages" || currentTab === "add-ons" || currentTab === "combos";

  return (
    <WorkspacePage className="space-y-6">
      <Card className="border-border/70 bg-card/95 shadow-sm">
        <CardHeader className="gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
              <Layers3 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Service Management</CardTitle>
              <CardDescription>
                Group service-related admin tools in one place so packages, add-ons, and
                combos are easier to navigate and maintain.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hasSelectedTab ? (
            <AdminManagementTabs
              defaultTab="packages"
              tabs={[
                {
                  value: "packages",
                  label: "Packages",
                  content: (
                    <WorkspacePlaceholder
                      workspace="Admin"
                      badge="Service Management"
                      title="Packages"
                      description="Wash package management remains available here under the new grouped admin structure."
                      endpoints={["GET /admin/packages", "POST /admin/packages"]}
                    />
                  ),
                },
                {
                  value: "add-ons",
                  label: "Add-ons",
                  content: (
                    <WorkspacePlaceholder
                      workspace="Admin"
                      badge="Service Management"
                      title="Add-ons"
                      description="Add-on services stay separated by business purpose while living inside the same service management area."
                      endpoints={["GET /admin/add-ons", "POST /admin/add-ons"]}
                    />
                  ),
                },
                {
                  value: "combos",
                  label: "Combos",
                  content: (
                    <WorkspacePlaceholder
                      workspace="Admin"
                      badge="Service Management"
                      title="Combos"
                      description="Combo offerings remain accessible without scattering service configuration across separate menu entries."
                      endpoints={["GET /admin/combos", "POST /admin/combos"]}
                    />
                  ),
                },
              ]}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <ServiceEntryCard
                icon={Droplets}
                title="Packages"
                description="Open the package management section inside the grouped service shell."
                href="/admin/services?tab=packages"
                cta="Open packages"
              />
              <ServiceEntryCard
                icon={Package}
                title="Add-ons"
                description="Review add-on service options without scattering navigation across separate admin menus."
                href="/admin/services?tab=add-ons"
                cta="Open add-ons"
              />
              <ServiceEntryCard
                icon={Sparkles}
                title="Combos"
                description="Access combo offerings from the same service management group for easier admin navigation."
                href="/admin/services?tab=combos"
                cta="Open combos"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={Package}
          title="Packages"
          description="Core wash offerings and pricing building blocks."
        />
        <SummaryCard
          icon={Sparkles}
          title="Add-ons"
          description="Optional upsells that extend a package without changing the main flow."
        />
        <SummaryCard
          icon={Layers3}
          title="Combos"
          description="Bundled offers that simplify sales and improve perceived value."
        />
      </div>
    </WorkspacePage>
  );
}

function ServiceEntryCard({
  icon: Icon,
  title,
  description,
  href,
  cta,
}: {
  icon: typeof Layers3;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <Card className="border-border/70 bg-white shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-lg font-bold text-foreground">{title}</div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <Button asChild type="button">
          <Link href={href}>{cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function SummaryCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Layers3;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-border/70 bg-card/95 shadow-sm">
      <CardContent className="flex gap-3 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-bold text-foreground">{title}</div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

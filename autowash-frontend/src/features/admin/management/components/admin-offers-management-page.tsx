"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BadgePercent, Gift, Ticket } from "lucide-react";
import { AdminManagementTabs } from "@/features/admin/management/components/admin-management-tabs";
import { AdminVouchersManagementPanel } from "@/features/admin/management/components/admin-vouchers-management-panel";
import { AdminPromotionsPageContent } from "@/features/admin/promotions/components/admin-promotions-page";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { WorkspacePage } from "@/shared/components/workspace/workspace-page";
import { useLanguageStore, translate } from "@/shared/store/language.store";

export function AdminOffersManagementPage() {
  const { language } = useLanguageStore();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const hasSelectedTab = currentTab === "promotions" || currentTab === "vouchers";

  return (
    <WorkspacePage className="space-y-6">
      <Card className="border-border/70 bg-card/95 shadow-sm">
        <CardHeader className="gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>{translate(language, "Quản lý Ưu đãi", "Offers Management")}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hasSelectedTab ? (
            <AdminManagementTabs
              defaultTab="promotions"
              tabs={[
                {
                  value: "promotions",
                  label: translate(language, "Khuyến mãi", "Promotions"),
                  content: <AdminPromotionsPageContent />,
                },
                {
                  value: "vouchers",
                  label: "Vouchers",
                  content: <AdminVouchersManagementPanel />,
                },
              ]}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <OfferEntryCard
                icon={BadgePercent}
                title={translate(language, "Khuyến mãi", "Promotions")}
                description={translate(language, "Quản lý các chương trình khuyến mãi hiện hành.", "Open the existing promotion CRUD flow inside the new offers management shell.")}
                href="/admin/offers?tab=promotions"
                cta={translate(language, "Mở Khuyến mãi", "Open promotions")}
              />
              <OfferEntryCard
                icon={Ticket}
                title="Vouchers"
                description={translate(language, "Xem danh sách voucher và quản lý đổi điểm lấy voucher của khách hàng.", "Review voucher catalogue and inspect point-to-voucher redemption history for admin reconciliation.")}
                href="/admin/offers?tab=vouchers"
                cta={translate(language, "Mở Vouchers", "Open vouchers")}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </WorkspacePage>
  );
}

function OfferEntryCard({
  icon: Icon,
  title,
  description,
  href,
  cta,
}: {
  icon: typeof Gift;
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
          <p className="hidden mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
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
  icon: typeof Gift;
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
          <p className="hidden mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

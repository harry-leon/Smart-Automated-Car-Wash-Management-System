"use client";

import { RefreshCcw, Search, Ticket } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useAdminVoucherRedemptions, useAdminVouchers } from "@/features/admin/vouchers/hooks/use-admin-vouchers";
import { getDisplayErrorMessage } from "@/shared/lib/api-errors";
import { WorkspaceEmptyState, WorkspaceErrorState } from "@/shared/components/workspace/workspace-page";
import { useLanguageStore, translate } from "@/shared/store/language.store";

export function AdminVouchersManagementPanel() {
  const { language } = useLanguageStore();
  const [draftSearch, setDraftSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const vouchersQuery = useAdminVouchers();
  const redemptionsQuery = useAdminVoucherRedemptions(1, 20, searchQuery);

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/95 shadow-sm">
        <CardHeader className="gap-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>{translate("Danh mục voucher", "Voucher catalogue", language)}</CardTitle>
            </div>
            <Button type="button" variant="outline" onClick={() => vouchersQuery.refetch()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              {translate("Tải lại", "Refresh", language)}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {vouchersQuery.isPending ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-40 animate-pulse rounded-3xl bg-slate-100" />
              ))}
            </div>
          ) : vouchersQuery.isError ? (
            <WorkspaceErrorState
              title={translate("Không thể tải danh mục voucher", "Unable to load vouchers", language)}
              description={getDisplayErrorMessage(vouchersQuery.error)}
              onRetry={() => vouchersQuery.refetch()}
            />
          ) : !vouchersQuery.data || vouchersQuery.data.length === 0 ? (
            <WorkspaceEmptyState
              title={translate("Không có voucher nào", "No vouchers available", language)}
              description={translate("Danh mục voucher hiện tại đang trống.", "Voucher catalogue data is empty right now.", language)}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {vouchersQuery.data.map((voucher) => (
                <Card key={voucher.code} className="border-slate-200 bg-white">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-black text-slate-900">{voucher.code}</div>
                        <div className="mt-1 text-sm text-slate-500">
                          {translate("Đơn tối thiểu", "Min order", language)} {formatCurrency(voucher.minAmount, language)}
                        </div>
                      </div>
                      <Badge
                        className={
                          voucher.active
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                        }
                      >
                        {voucher.active 
                          ? translate("Hoạt động", "Active", language) 
                          : translate("Không hoạt động", "Inactive", language)}
                      </Badge>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                        {translate("Giảm giá", "Discount", language)}
                      </div>
                      <div className="mt-2 text-2xl font-black text-slate-900">
                        {voucher.discountType === "PERCENT"
                          ? `${voucher.discountValue}%`
                          : formatCurrency(voucher.discountValue, language)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {voucher.newCustomerOnly ? (
                        <Badge variant="outline">
                          {translate("Chỉ khách hàng mới", "New customers only", language)}
                        </Badge>
                      ) : null}
                      {voucher.targetTiers.length > 0
                        ? voucher.targetTiers.map((tier) => (
                            <Badge key={tier} variant="outline">
                              {tier}
                            </Badge>
                          ))
                        : <Badge variant="outline">{translate("Tất cả các hạng", "All tiers", language)}</Badge>}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Ticket className="h-4 w-4" />
                      {translate("Hết hạn", "Expires", language)} {formatDate(voucher.expiresAt, language)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/95 shadow-sm">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle>{translate("Lịch sử đổi điểm lấy voucher", "Point-to-voucher redemption history", language)}</CardTitle>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <div className="relative min-w-[240px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={draftSearch}
                  onChange={(event) => setDraftSearch(event.target.value)}
                  placeholder={translate("Tìm kiếm voucher, tên hoặc SĐT", "Search voucher, name, or phone", language)}
                  className="pl-9"
                />
              </div>
              <Button type="button" variant="outline" onClick={() => setSearchQuery(draftSearch.trim())}>
                {translate("Tìm kiếm", "Search", language)}
              </Button>
              <Button type="button" variant="outline" onClick={() => redemptionsQuery.refetch()}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                {translate("Tải lại", "Refresh", language)}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {redemptionsQuery.isPending ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-12 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : redemptionsQuery.isError ? (
            <WorkspaceErrorState
              title={translate("Không thể tải lịch sử đổi voucher", "Unable to load redemption history", language)}
              description={getDisplayErrorMessage(redemptionsQuery.error)}
              onRetry={() => redemptionsQuery.refetch()}
            />
          ) : !redemptionsQuery.data || redemptionsQuery.data.items.length === 0 ? (
            <WorkspaceEmptyState
              title={translate("Chưa có lịch sử đổi voucher", "No redemption history yet", language)}
              description={translate("Hoạt động đổi điểm lấy voucher sẽ xuất hiện ở đây sau khi khách hàng đổi điểm.", "Point-to-voucher activity will appear here after customers redeem loyalty points.", language)}
            />
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{translate("Khách hàng", "Customer", language)}</TableHead>
                      <TableHead>{translate("Voucher", "Voucher", language)}</TableHead>
                      <TableHead className="text-right">{translate("Điểm", "Points", language)}</TableHead>
                      <TableHead className="text-right">{translate("Số dư sau khi đổi", "Balance after", language)}</TableHead>
                      <TableHead>{translate("Đổi lúc", "Redeemed at", language)}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {redemptionsQuery.data.items.map((item) => (
                      <TableRow key={item.transactionId}>
                        <TableCell>
                          <div className="font-semibold text-foreground">{item.customerName}</div>
                          <div className="text-xs text-muted-foreground">{item.customerPhone}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.voucherCode}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {item.pointsRedeemed.toLocaleString(language === "vi" ? "vi-VN" : "en-US")}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {item.balanceAfter.toLocaleString(language === "vi" ? "vi-VN" : "en-US")}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateTime(item.redeemedAt, language)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatCurrency(value: number, language: "vi" | "en") {
  return `${value.toLocaleString(language === "vi" ? "vi-VN" : "en-US")} VND`;
}

function formatDate(value: string, language: "vi" | "en") {
  return new Date(value).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US");
}

function formatDateTime(value: string, language: "vi" | "en") {
  return new Date(value).toLocaleString(language === "vi" ? "vi-VN" : "en-US");
}

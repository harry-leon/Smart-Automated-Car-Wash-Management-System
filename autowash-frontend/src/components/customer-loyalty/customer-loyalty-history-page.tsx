"use client";

import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDisplayErrorMessage } from "@/lib/api-errors";
import { formatLoyaltyPoints, formatLoyaltyTransactionType } from "@/lib/customer-loyalty";
import { useCustomerLoyaltyTransactions } from "@/hooks/use-customer-loyalty";

export function CustomerLoyaltyHistoryPageContent() {
  const transactionsQuery = useCustomerLoyaltyTransactions(1, 50);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <Card className="border-slate-200 bg-white">
          <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>Point transaction history</CardTitle>
              <CardDescription>
                This list refreshes after wash completion and shows earned points from live data.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => transactionsQuery.refetch()}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button asChild>
                <Link href="/customer/loyalty/redeem">Redeem points</Link>
              </Button>
            </div>
          </CardHeader>
        </Card>

        {transactionsQuery.isPending ? (
          <div className="h-64 animate-pulse rounded-3xl bg-slate-100" />
        ) : transactionsQuery.isError ? (
          <Card className="border-rose-200 bg-white">
            <CardHeader>
              <CardTitle>Unable to load point history</CardTitle>
              <CardDescription>{getDisplayErrorMessage(transactionsQuery.error)}</CardDescription>
            </CardHeader>
          </Card>
        ) : !transactionsQuery.data || transactionsQuery.data.items.length === 0 ? (
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>No point activity yet</CardTitle>
              <CardDescription>
                Point entries appear here after a wash session is completed.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4">
            {transactionsQuery.data.items.map((item) => (
              <Card key={item.transactionId} className="border-slate-200 bg-white">
                <CardContent className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-base font-black text-slate-900">{formatLoyaltyTransactionType(item.type)}</div>
                    <div className="mt-1 text-sm text-slate-600">{item.description}</div>
                    <div className="mt-2 text-xs text-slate-500">
                      {item.bookingId} • {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </div>
                  <div className={item.points >= 0 ? "text-right text-lg font-black text-emerald-700" : "text-right text-lg font-black text-rose-700"}>
                    {formatLoyaltyPoints(item.points)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

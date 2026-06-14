"use client";

import { useMemo, useState } from "react";
import { BarChart3, CalendarDays, CircleDollarSign, ReceiptText, TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { getDisplayErrorMessage } from "@/shared/lib/api-errors";
import { useAdminBusinessHealthReport } from "@/features/admin/reports/hooks/use-admin-business-health-report";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  WorkspaceErrorState,
  WorkspaceLoadingState,
  WorkspacePage,
} from "@/shared/components/workspace/workspace-page";
import { cn } from "@/shared/lib/utils";
import type {
  AdminBusinessHealthReport,
  AdminReportBreakdownItem,
  ReportAnalysisGroup,
  ReportRangeKey,
} from "@/features/admin/reports/admin-reporting.types";
import {
  breakdownForGroup,
  formatCompactCurrency,
  formatCurrency,
  formatGrowth,
  formatPercent,
  growthTone,
  insightToneClasses,
  REPORT_GROUP_OPTIONS,
  REPORT_RANGE_OPTIONS,
} from "@/features/admin/reports/components/admin-business-health-helpers";

const CHART_CONFIG = {
  current: { label: "Current period", color: "#0f766e" },
  previous: { label: "Previous period", color: "#94a3b8" },
} as const;

export function AdminBusinessHealthPage() {
  const [range, setRange] = useState<ReportRangeKey>("LAST_30_DAYS");
  const [analysisGroup, setAnalysisGroup] = useState<ReportAnalysisGroup>("revenue");
  const reportQuery = useAdminBusinessHealthReport(range, analysisGroup);

  if (reportQuery.isPending) {
    return <WorkspaceLoadingState message="Loading business health report..." />;
  }

  if (reportQuery.isError || !reportQuery.data) {
    return (
      <WorkspaceErrorState
        title="Unable to load business health report"
        description={reportQuery.isError ? getDisplayErrorMessage(reportQuery.error) : "No report data available."}
        onRetry={() => reportQuery.refetch()}
      />
    );
  }

  return (
    <AdminBusinessHealthReportView
      report={reportQuery.data}
      range={range}
      analysisGroup={analysisGroup}
      onRangeChange={setRange}
      onAnalysisGroupChange={setAnalysisGroup}
    />
  );
}

function AdminBusinessHealthReportView({
  report,
  range,
  analysisGroup,
  onRangeChange,
  onAnalysisGroupChange,
}: {
  report: AdminBusinessHealthReport;
  range: ReportRangeKey;
  analysisGroup: ReportAnalysisGroup;
  onRangeChange: (value: ReportRangeKey) => void;
  onAnalysisGroupChange: (value: ReportAnalysisGroup) => void;
}) {
  const selectedBreakdown = breakdownForGroup(analysisGroup, report.breakdowns);
  const revenueTrendData = useMemo(
    () =>
      report.trends.revenue.points.map((point, index) => ({
        label: point.label,
        current: point.value,
        previous: report.trends.revenue.previousPoints[index]?.value ?? 0,
      })),
    [report.trends.revenue],
  );

  const completedTrendData = useMemo(
    () =>
      report.trends.completedBookings.points.map((point, index) => ({
        label: point.label,
        current: point.value,
        previous: report.trends.completedBookings.previousPoints[index]?.value ?? 0,
      })),
    [report.trends.completedBookings],
  );

  const kpiCards = [
    {
      title: "Revenue this period",
      value: formatCurrency(report.kpis.revenueThisPeriod),
      delta: formatGrowth(report.kpis.revenueGrowthRate),
      detail: `vs ${report.previousPeriod.label.toLowerCase()}`,
      icon: CircleDollarSign,
    },
    {
      title: "Completed bookings",
      value: report.kpis.completedBookings.toLocaleString("vi-VN"),
      delta: formatGrowth(report.kpis.completedBookingsGrowthRate),
      detail: `vs ${report.previousPeriod.label.toLowerCase()}`,
      icon: ReceiptText,
    },
    {
      title: "Average booking value",
      value: formatCurrency(report.kpis.averageBookingValue),
      delta: "Business mix quality",
      detail: "per booking",
      icon: TrendingUp,
    },
    {
      title: "Cancellation rate",
      value: formatPercent(report.kpis.cancellationRate),
      delta: report.kpis.cancellationRate > 10 ? "Watch closely" : "Healthy range",
      detail: "of total bookings",
      icon: TrendingDown,
    },
    {
      title: "Discount-assisted revenue",
      value: formatCurrency(report.kpis.discountAssistedRevenue),
      delta: report.capabilities.promotionAttributionExact ? "Campaign-attributed" : "Voucher/discount proxy",
      detail: "promotion visibility",
      icon: BarChart3,
    },
    {
      title: "Report window",
      value: report.period.label,
      delta: `${report.period.dateFrom} -> ${report.period.dateTo}`,
      detail: "selected range",
      icon: CalendarDays,
    },
  ];

  return (
    <WorkspacePage className="space-y-8">
      <section className="flex flex-col gap-5 rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-teal-50 p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100">Executive report</Badge>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Business health</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 md:text-base">
            Fast leadership view of revenue momentum, completed bookings, contribution mix, and the main business signals
            driving performance.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <FilterCard label="Time range">
            <Select value={range} onValueChange={(value) => onRangeChange(value as ReportRangeKey)}>
              <SelectTrigger className="min-w-[180px] bg-white">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterCard>

          <FilterCard label="Analysis group">
            <Tabs
              value={analysisGroup}
              onValueChange={(value) => onAnalysisGroupChange(value as ReportAnalysisGroup)}
              className="w-full"
            >
              <TabsList className="grid h-auto grid-cols-2 gap-1 bg-slate-100 p-1 sm:grid-cols-4">
                {REPORT_GROUP_OPTIONS.map((option) => (
                  <TabsTrigger
                    key={option.value}
                    value={option.value}
                    disabled={option.value === "channel" && !report.capabilities.channelAvailable}
                    className="px-2 py-2 text-xs"
                  >
                    {option.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </FilterCard>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading
          title="KPI summary"
          description="High-signal metrics for revenue health, booking completion, booking quality, and business drag."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {kpiCards.map((card) => (
            <KpiCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading
          title="Trend"
          description="Current-period performance compared with the previous equivalent period."
        />
        <div className="grid gap-4 xl:grid-cols-2">
          <TrendCard
            title="Revenue trend"
            description={`${report.period.label} vs ${report.previousPeriod.label}`}
            data={revenueTrendData}
            formatter={formatCompactCurrency}
          />
          <TrendCard
            title="Completed bookings trend"
            description={`${report.period.label} vs ${report.previousPeriod.label}`}
            data={completedTrendData}
            formatter={(value) => value.toLocaleString("vi-VN")}
          />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Breakdown</CardTitle>
            <CardDescription>
              Contribution mix for the selected analysis group, ordered by impact.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedBreakdown.available ? (
              selectedBreakdown.items.length > 0 ? (
                <div className="space-y-4">
                  {selectedBreakdown.message ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      {selectedBreakdown.message}
                    </div>
                  ) : null}
                  <div className="space-y-3">
                    {selectedBreakdown.items.slice(0, 6).map((item) => (
                      <BreakdownBar
                        key={item.key}
                        item={item}
                        valueLabel={formatCurrency(item.revenue)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyReportState message="No breakdown items are available for the selected range." />
              )
            ) : (
              <EmptyReportState message={selectedBreakdown.message ?? "This analysis group is not available."} />
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Business insights</CardTitle>
            <CardDescription>Short, decision-oriented summaries derived from current data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.insights.map((insight) => (
              <div
                key={`${insight.title}-${insight.summary}`}
                className={cn("rounded-2xl border px-4 py-4", insightToneClasses(insight.tone))}
              >
                <div className="text-sm font-bold">{insight.title}</div>
                <div className="mt-1 text-sm leading-6">{insight.summary}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <SectionHeading
          title="Top items"
          description="Most important revenue contributors in the selected period."
        />
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.topItems.services.length > 0 ? (
                  report.topItems.services.map((item) => (
                    <TableRow key={item.key}>
                      <TableCell className="font-semibold text-slate-900">{item.label}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                      <TableCell className="text-right">{item.bookings.toLocaleString("vi-VN")}</TableCell>
                      <TableCell className="text-right">{formatPercent(item.share)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-sm text-slate-500">
                      No top items are available for the selected range.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </WorkspacePage>
  );
}

function FilterCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</div>
      {children}
    </div>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
  );
}

function KpiCard({
  title,
  value,
  delta,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  delta: string;
  detail: string;
  icon: typeof CircleDollarSign;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="flex items-start justify-between gap-4 p-6">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{title}</div>
          <div className="mt-3 text-2xl font-black tracking-tight text-slate-950">{value}</div>
          <div className={cn("mt-2 text-sm font-semibold", growthTone(parseFloat(delta)))}>{delta}</div>
          <div className="mt-1 text-xs text-slate-500">{detail}</div>
        </div>
        <div className="rounded-2xl bg-teal-50 p-3 text-teal-700">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function TrendCard({
  title,
  description,
  data,
  formatter,
}: {
  title: string;
  description: string;
  data: Array<{ label: string; current: number; previous: number }>;
  formatter: (value: number) => string;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChartContainer
          config={CHART_CONFIG}
          className="h-[280px] w-full"
        >
          <AreaChart data={data} margin={{ left: 12, right: 12, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} width={64} tickFormatter={(value) => formatter(Number(value))} />
            <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatter(Number(value))} />} />
            <Area
              type="monotone"
              dataKey="previous"
              name="previous"
              stroke="var(--color-previous)"
              fill="var(--color-previous)"
              fillOpacity={0.08}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="current"
              name="current"
              stroke="var(--color-current)"
              fill="var(--color-current)"
              fillOpacity={0.24}
              strokeWidth={2.5}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function BreakdownBar({ item, valueLabel }: { item: AdminReportBreakdownItem; valueLabel: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-semibold text-slate-900">{item.label}</div>
          <div className="text-xs text-slate-500">{item.bookings.toLocaleString("vi-VN")} bookings</div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-slate-900">{valueLabel}</div>
          <div className="text-xs text-slate-500">{formatPercent(item.share)}</div>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-teal-600" style={{ width: `${Math.min(item.share, 100)}%` }} />
      </div>
    </div>
  );
}

function EmptyReportState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

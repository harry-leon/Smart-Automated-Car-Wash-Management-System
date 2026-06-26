"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { AlertTriangle, ArrowUpRight, Award, BarChart3, CalendarDays, CircleDollarSign, HelpCircle, ReceiptText, Sparkles, TrendingDown, TrendingUp, Send, Bot, User, Loader2, RefreshCw } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { getDisplayErrorMessage } from "@/shared/lib/api-errors";
import { useAdminBusinessHealthReport } from "@/features/admin/reports/hooks/use-admin-business-health-report";
import { useLanguageStore } from "@/shared/store/language.store";

const STATIC_TRANSLATIONS: Record<string, { vi: string; en: string }> = {
  "Loading business health report...": {
    vi: "Đang tải báo cáo tình hình kinh doanh...",
    en: "Loading business health report...",
  },
  "Unable to load business health report": {
    vi: "Không thể tải báo cáo tình hình kinh doanh",
    en: "Unable to load business health report",
  },
  "No report data available.": {
    vi: "Không có dữ liệu báo cáo.",
    en: "No report data available.",
  },
  "Executive report": {
    vi: "Báo cáo quản trị",
    en: "Executive report",
  },
  "Business health": {
    vi: "Tình hình kinh doanh",
    en: "Business health",
  },
  "Time range": {
    vi: "Khoảng thời gian",
    en: "Time range",
  },
  "Select range": {
    vi: "Chọn khoảng thời gian",
    en: "Select range",
  },
  "Analysis group": {
    vi: "Nhóm phân tích",
    en: "Analysis group",
  },
  "KPI summary": {
    vi: "Tóm tắt chỉ số KPI",
    en: "KPI summary",
  },
  "High-signal metrics for revenue health, booking completion, booking quality, and business drag.": {
    vi: "Các chỉ số quan trọng về doanh thu, tỷ lệ hoàn thành lịch đặt, chất lượng dịch vụ và rủi ro vận hành.",
    en: "High-signal metrics for revenue health, booking completion, booking quality, and business drag.",
  },
  "Trend": {
    vi: "Xu hướng",
    en: "Trend",
  },
  "Current-period performance compared with the previous equivalent period.": {
    vi: "Hiệu suất kỳ này so với kỳ trước tương đương.",
    en: "Current-period performance compared with the previous equivalent period.",
  },
  "Revenue trend": {
    vi: "Xu hướng doanh thu",
    en: "Revenue trend",
  },
  "Completed bookings trend": {
    vi: "Xu hướng lịch đặt hoàn thành",
    en: "Completed bookings trend",
  },
  "Breakdown": {
    vi: "Phân tích chi tiết",
    en: "Breakdown",
  },
  "Contribution mix for the selected analysis group, ordered by impact.": {
    vi: "Tỷ lệ đóng góp cho nhóm phân tích đã chọn, sắp xếp theo mức độ ảnh hưởng.",
    en: "Contribution mix for the selected analysis group, ordered by impact.",
  },
  "No breakdown items are available for the selected range.": {
    vi: "Không có dữ liệu phân tích chi tiết cho khoảng thời gian đã chọn.",
    en: "No breakdown items are available for the selected range.",
  },
  "This analysis group is not available.": {
    vi: "Nhóm phân tích này không khả dụng.",
    en: "This analysis group is not available.",
  },
  "Business insights": {
    vi: "Nhận định kinh doanh",
    en: "Business insights",
  },
  "Short, decision-oriented summaries derived from current data.": {
    vi: "Các tóm tắt ngắn gọn giúp đưa ra quyết định dựa trên dữ liệu hiện tại.",
    en: "Short, decision-oriented summaries derived from current data.",
  },
  "Top items": {
    vi: "Dịch vụ hàng đầu",
    en: "Top items",
  },
  "Most important revenue contributors in the selected period.": {
    vi: "Các dịch vụ đóng góp doanh thu lớn nhất trong khoảng thời gian đã chọn.",
    en: "Most important revenue contributors in the selected period.",
  },
  "Service": {
    vi: "Dịch vụ",
    en: "Service",
  },
  "Revenue": {
    vi: "Doanh thu",
    en: "Revenue",
  },
  "Bookings": {
    vi: "Lịch đặt",
    en: "Bookings",
  },
  "Share": {
    vi: "Tỷ trọng",
    en: "Share",
  },
  "No top items are available for the selected range.": {
    vi: "Không có dịch vụ hàng đầu nào trong khoảng thời gian đã chọn.",
    en: "No top items are available for the selected range.",
  },
  "Revenue this period": {
    vi: "Doanh thu kỳ này",
    en: "Revenue this period",
  },
  "Completed bookings": {
    vi: "Lịch đặt hoàn thành",
    en: "Completed bookings",
  },
  "Average booking value": {
    vi: "Giá trị trung bình lịch đặt",
    en: "Average booking value",
  },
  "Cancellation rate": {
    vi: "Tỷ lệ hủy lịch",
    en: "Cancellation rate",
  },
  "Discount-assisted revenue": {
    vi: "Doanh thu có khuyến mãi",
    en: "Discount-assisted revenue",
  },
  "Report window": {
    vi: "Khoảng thời gian báo cáo",
    en: "Report window",
  },
  "Business mix quality": {
    vi: "Chất lượng cơ cấu kinh doanh",
    en: "Business mix quality",
  },
  "per booking": {
    vi: "mỗi lịch đặt",
    en: "per booking",
  },
  "Watch closely": {
    vi: "Cần theo dõi sát sao",
    en: "Watch closely",
  },
  "Healthy range": {
    vi: "Mức an toàn",
    en: "Healthy range",
  },
  "of total bookings": {
    vi: "tổng số lịch đặt",
    en: "of total bookings",
  },
  "Campaign-attributed": {
    vi: "Ghi nhận theo chiến dịch",
    en: "Campaign-attributed",
  },
  "Voucher/discount proxy": {
    vi: "Ước tính theo voucher/khuyến mãi",
    en: "Voucher/discount proxy",
  },
  "promotion visibility": {
    vi: "hiệu quả khuyến mãi",
    en: "promotion visibility",
  },
  "selected range": {
    vi: "khoảng thời gian đã chọn",
    en: "selected range",
  },
  "Current period": {
    vi: "Kỳ hiện tại",
    en: "Current period",
  },
  "Previous period": {
    vi: "Kỳ trước",
    en: "Previous period",
  },
  "bookings": {
    vi: "lịch đặt",
    en: "bookings",
  },
  "Full price": {
    vi: "Giá gốc",
    en: "Full price",
  },
  "Discount-assisted": {
    vi: "Có khuyến mãi",
    en: "Discount-assisted",
  },
  "DISCOUNT_APPLIED": {
    vi: "Đã áp dụng giảm giá",
    en: "DISCOUNT_APPLIED",
  },
  "Promotion contribution is approximated from voucher and discount-assisted bookings.": {
    vi: "Đóng góp khuyến mãi được ước tính từ voucher và lịch đặt giảm giá.",
    en: "Promotion contribution is approximated from voucher and discount-assisted bookings.",
  },
  "vs": {
    vi: "so với",
    en: "vs",
  },
  "Premium Wash": {
    vi: "Rửa xe cao cấp",
    en: "Premium Wash",
  },
  "Basic Wash": {
    vi: "Rửa xe cơ bản",
    en: "Basic Wash",
  },
  "Standard Wash": {
    vi: "Rửa xe tiêu chuẩn",
    en: "Standard Wash",
  },
  "Wash Combo": {
    vi: "Combo rửa xe",
    en: "Wash Combo",
  },
  "Motorcycle Wash": {
    vi: "Rửa xe máy",
    en: "Motorcycle Wash",
  },
  "Interior Detailing": {
    vi: "Vệ sinh nội thất",
    en: "Interior Detailing",
  },
  "Exterior Polishing": {
    vi: "Đánh bóng ngoại thất",
    en: "Exterior Polishing",
  },
  "Car Wash": {
    vi: "Rửa ô tô",
    en: "Car Wash",
  },
  "Premium wash": {
    vi: "Rửa xe cao cấp",
    en: "Premium wash",
  },
  "Basic wash": {
    vi: "Rửa xe cơ bản",
    en: "Basic wash",
  },
  "Standard wash": {
    vi: "Rửa xe tiêu chuẩn",
    en: "Standard wash",
  },
  "Wash combo": {
    vi: "Combo rửa xe",
    en: "Wash combo",
  },
  "Motorcycle wash": {
    vi: "Rửa xe máy",
    en: "Motorcycle wash",
  },
  "Interior detailing": {
    vi: "Vệ sinh nội thất",
    en: "Interior detailing",
  },
  "Exterior polishing": {
    vi: "Đánh bóng ngoại thất",
    en: "Exterior polishing",
  },
  "Car wash": {
    vi: "Rửa ô tô",
    en: "Car wash",
  }
};

function translateText(text: string, lang: "vi" | "en"): string {
  if (lang === "en" || !text) return text;
  
  const staticMatch = STATIC_TRANSLATIONS[text];
  if (staticMatch) return staticMatch.vi;

  const lowerText = text.toLowerCase();

  if (lowerText === "last 30 days") return "30 ngày qua";
  if (lowerText === "last 7 days") return "7 ngày qua";
  if (lowerText === "this month") return "tháng này";
  if (lowerText === "this quarter") return "quý này";
  if (lowerText === "previous period") return "kỳ trước";
  if (lowerText === "previous 30 days") return "30 ngày trước đó";
  if (lowerText === "previous 7 days") return "7 ngày trước đó";
  if (lowerText === "previous month") return "tháng trước";
  if (lowerText === "previous quarter") return "quý trước";

  if (lowerText.startsWith("vs ")) {
    const rest = text.substring(3);
    return `so với ${translateText(rest, lang).toLowerCase()}`;
  }

  return text;
}

function translateInsight(title: string, summary: string, lang: "vi" | "en"): { title: string; summary: string } {
  if (lang === "en") return { title, summary };

  let translatedTitle = title;
  let translatedSummary = summary;

  if (title === "Revenue momentum") translatedTitle = "Đà tăng trưởng doanh thu";
  else if (title === "Top service contributor") translatedTitle = "Dịch vụ đóng góp hàng đầu";
  else if (title === "Cancellation pressure") translatedTitle = "Áp lực hủy lịch";
  else if (title === "Promotion visibility") translatedTitle = "Hiệu quả khuyến mãi";

  if (summary.startsWith("Revenue is up ") && summary.endsWith(" compared with the previous period.")) {
    const rate = summary.replace("Revenue is up ", "").replace("% compared with the previous period.", "");
    translatedSummary = `Doanh thu tăng ${rate}% so với kỳ trước.`;
  } else if (summary.startsWith("Revenue is down ") && summary.endsWith(" compared with the previous period.")) {
    const rate = summary.replace("Revenue is down ", "").replace("% compared with the previous period.", "");
    translatedSummary = `Doanh thu giảm ${rate}% so với kỳ trước.`;
  } else if (summary.includes(" is leading revenue contribution with ") && summary.includes(" bookings in the selected period.")) {
    const regex = /^(.*) is leading revenue contribution with (\d+) bookings in the selected period\.$/;
    const match = summary.match(regex);
    if (match) {
      const serviceName = translateText(match[1], lang);
      const bookings = match[2];
      translatedSummary = `Dịch vụ ${serviceName} đang dẫn đầu đóng góp doanh thu với ${bookings} lịch đặt trong kỳ báo cáo.`;
    }
  } else if (summary.startsWith("Cancellation rate increased by ") && summary.endsWith(" percentage points versus the previous period.")) {
    const pts = summary.replace("Cancellation rate increased by ", "").replace(" percentage points versus the previous period.", "");
    translatedSummary = `Tỷ lệ hủy lịch tăng ${pts} điểm phần trăm so với kỳ trước.`;
  } else if (summary.startsWith("Cancellation rate improved by ") && summary.endsWith(" percentage points versus the previous period.")) {
    const pts = summary.replace("Cancellation rate improved by ", "").replace(" percentage points versus the previous period.", "");
    translatedSummary = `Tỷ lệ hủy lịch cải thiện ${pts} điểm phần trăm so với kỳ trước.`;
  } else if (summary.startsWith("Discount-assisted bookings contributed ") && summary.endsWith(" of total revenue.")) {
    const rate = summary.replace("Discount-assisted bookings contributed ", "").replace(" of total revenue.", "");
    translatedSummary = `Các lịch đặt có giảm giá đóng góp ${rate} vào tổng doanh thu.`;
  } else if (summary.startsWith("Voucher-assisted bookings contributed ") && summary.endsWith(" of total revenue.")) {
    const rate = summary.replace("Voucher-assisted bookings contributed ", "").replace(" of total revenue.", "");
    translatedSummary = `Các lịch đặt sử dụng voucher đóng góp ${rate} vào tổng doanh thu.`;
  }

  return { title: translatedTitle, summary: translatedSummary };
}

function getInsightMeta(title: string, tone: string) {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes("revenue") || tone === "positive") {
    return {
      Icon: ArrowUpRight,
      iconBg: "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 shadow-inner",
      cardBg: "bg-gradient-to-br from-emerald-950/15 via-slate-900 to-slate-900/60 hover:shadow-md hover:shadow-emerald-500/2 hover:-translate-y-0.5 transition-all duration-300",
      borderColor: "border-emerald-900/45 hover:border-emerald-800/60",
      badgeText: "Tốt",
      badgeBg: "bg-emerald-950/30 text-emerald-400 border border-emerald-800/30",
    };
  }
  
  if (lowerTitle.includes("cancellation") || tone === "negative") {
    return {
      Icon: AlertTriangle,
      iconBg: "bg-rose-950/60 text-rose-400 border border-rose-800/40 shadow-inner",
      cardBg: "bg-gradient-to-br from-rose-950/15 via-slate-900 to-slate-900/60 hover:shadow-md hover:shadow-rose-500/2 hover:-translate-y-0.5 transition-all duration-300",
      borderColor: "border-rose-900/45 hover:border-rose-800/60",
      badgeText: "Chú ý",
      badgeBg: "bg-rose-950/30 text-rose-400 border border-rose-800/30",
    };
  }
  
  if (lowerTitle.includes("service") || lowerTitle.includes("contributor")) {
    return {
      Icon: Award,
      iconBg: "bg-amber-950/60 text-amber-400 border border-amber-800/40 shadow-inner",
      cardBg: "bg-gradient-to-br from-amber-950/15 via-slate-900 to-slate-900/60 hover:shadow-md hover:shadow-amber-500/2 hover:-translate-y-0.5 transition-all duration-300",
      borderColor: "border-amber-900/45 hover:border-amber-800/60",
      badgeText: "Nổi bật",
      badgeBg: "bg-amber-950/30 text-amber-400 border border-amber-800/30",
    };
  }
  
  if (lowerTitle.includes("promotion") || lowerTitle.includes("discount")) {
    return {
      Icon: Sparkles,
      iconBg: "bg-teal-950/60 text-teal-400 border border-teal-800/40 shadow-inner",
      cardBg: "bg-gradient-to-br from-teal-950/15 via-slate-900 to-slate-900/60 hover:shadow-md hover:shadow-teal-500/2 hover:-translate-y-0.5 transition-all duration-300",
      borderColor: "border-teal-900/45 hover:border-teal-800/60",
      badgeText: "Thông tin",
      badgeBg: "bg-teal-950/30 text-teal-400 border border-teal-800/30",
    };
  }

  return {
    Icon: HelpCircle,
    iconBg: "bg-slate-900 text-slate-400 border border-slate-800 shadow-inner",
    cardBg: "bg-slate-900 hover:bg-slate-900/90 hover:-translate-y-0.5 transition-all duration-300",
    borderColor: "border-slate-800 hover:border-slate-700",
    badgeText: "Thông tin",
    badgeBg: "bg-slate-900 text-slate-400 border border-slate-800",
  };
}

function highlightSummaryText(text: string) {
  return text;
}
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
  const { language } = useLanguageStore();
  const [range, setRange] = useState<ReportRangeKey>("LAST_30_DAYS");
  const [analysisGroup, setAnalysisGroup] = useState<ReportAnalysisGroup>("revenue");
  const reportQuery = useAdminBusinessHealthReport(range, analysisGroup);

  if (reportQuery.isPending) {
    return <WorkspaceLoadingState message={translateText("Loading business health report...", language)} />;
  }

  if (reportQuery.isError || !reportQuery.data) {
    return (
      <WorkspaceErrorState
        title={translateText("Unable to load business health report", language)}
        description={reportQuery.isError ? getDisplayErrorMessage(reportQuery.error) : translateText("No report data available.", language)}
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
  const { language } = useLanguageStore();
  
  // Chatbot State
  const [messages, setMessages] = useState<Array<{
    id: string;
    sender: "ai" | "user";
    text: React.ReactNode;
    timestamp: Date;
    title?: string;
    tone?: string;
  }>>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset messages with a greeting
    const greetingText = language === "vi" 
      ? "Xin chào! Mình là Trợ lý phân tích 🌸 Dưới đây là nhận định tổng quan về tình hình kinh doanh của bạn:" 
      : "Hello! I am the Analysis Assistant 🌸 Here is the overall performance assessment of your business:";
    
    const initialMsgs = [
      {
        id: "greeting",
        sender: "ai" as const,
        text: greetingText,
        timestamp: new Date(),
      }
    ];
    setMessages(initialMsgs);

    // Simulate AI typing and adding each insight one by one
    setIsTyping(true);
    let timeoutIds: NodeJS.Timeout[] = [];

    report.insights.forEach((insight, idx) => {
      const tId = setTimeout(() => {
        const translated = translateInsight(insight.title, insight.summary, language);
        setMessages(prev => [
          ...prev,
          {
            id: `insight-${idx}-${Date.now()}`,
            sender: "ai" as const,
            title: translated.title,
            text: highlightSummaryText(translated.summary),
            timestamp: new Date(),
            tone: insight.tone,
          }
        ]);
        
        // If it's the last insight, turn off typing and show concluding message
        if (idx === report.insights.length - 1) {
          const concludeTId = setTimeout(() => {
            const concludingText = language === "vi"
              ? "Hãy cho tôi biết nếu bạn cần phân tích sâu hơn về bất kỳ chỉ số nào ở trên!"
              : "Let me know if you need a deeper analysis of any metrics above!";
            setMessages(prev => [
              ...prev,
              {
                id: "conclusion",
                sender: "ai" as const,
                text: concludingText,
                timestamp: new Date(),
              }
            ]);
            setIsTyping(false);
          }, 1000);
          timeoutIds.push(concludeTId);
        }
      }, (idx + 1) * 1200); // 1.2s delay per message to feel like real typing
      timeoutIds.push(tId);
    });

    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, [report.insights, language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user" as const,
      text: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsTyping(true);

    // Simulate AI typing response
    setTimeout(() => {
      let responseText: React.ReactNode = "";
      const lower = text.toLowerCase();

      if (language === "vi") {
        if (lower.includes("doanh thu") || lower.includes("revenue")) {
          responseText = (
            <span>
              Dựa vào dữ liệu thực tế, doanh thu kỳ này là {formatCurrency(report.kpis.revenueThisPeriod)},{" "}
              {report.kpis.revenueGrowthRate >= 0 ? "tăng" : "giảm"} {formatGrowth(report.kpis.revenueGrowthRate)} so với kỳ trước. Sự tăng trưởng này chủ yếu nhờ vào dịch vụ {translateText(report.topItems.services[0]?.label ?? "", "vi")}.
            </span>
          );
        } else if (lower.includes("hủy") || lower.includes("cancel")) {
          const cancelRate = report.kpis.cancellationRate ?? 0;
          responseText = (
            <span>
              Tỷ lệ hủy lịch hiện tại là {formatPercent(cancelRate)}.{" "}
              {cancelRate > 0.1 
                ? "Mức độ hủy lịch đang ở mức cao. Bạn nên rà soát lại các khung giờ cao điểm và chính sách hoàn tiền để giảm thiểu tình trạng này."
                : "Mức độ hủy lịch đang được kiểm soát rất tốt so với mặt bằng chung."}
            </span>
          );
        } else if (lower.includes("dịch vụ") || lower.includes("service")) {
          const topService = report.topItems.services[0];
          responseText = (
            <span>
              Dịch vụ đắt khách nhất là {translateText(topService?.label ?? "", "vi")} đóng góp {formatCurrency(topService?.revenue ?? 0)} với {topService?.bookings ?? 0} lịch đặt (chiếm {formatPercent(topService?.share ?? 0)} tổng doanh thu).
            </span>
          );
        } else {
          responseText = (
            <span>
              Mình đã nhận được câu hỏi 💖 Hệ thống đang phân tích dữ liệu sâu hơn. Bạn có thể kiểm tra các biểu đồ ở dưới để có cái nhìn trực quan nhất nhé!
            </span>
          );
        }
      } else {
        if (lower.includes("revenue") || lower.includes("doanh thu")) {
          responseText = (
            <span>
              Based on real data, revenue this period is {formatCurrency(report.kpis.revenueThisPeriod)},{" "}
              {report.kpis.revenueGrowthRate >= 0 ? "up" : "down"} {formatGrowth(report.kpis.revenueGrowthRate)}. This is largely driven by {report.topItems.services[0]?.label ?? "top service"}.
            </span>
          );
        } else if (lower.includes("cancel") || lower.includes("hủy")) {
          const cancelRate = report.kpis.cancellationRate ?? 0;
          responseText = (
            <span>
              The current cancellation rate is {formatPercent(cancelRate)}.{" "}
              {cancelRate > 0.1 
                ? "This is relatively high. You should inspect peak wash hours and refund policies."
                : "Cancellation is currently well-controlled."}
            </span>
          );
        } else if (lower.includes("service") || lower.includes("dịch vụ")) {
          const topService = report.topItems.services[0];
          responseText = (
            <span>
              The top performing service is {topService?.label ?? ""} bringing in {formatCurrency(topService?.revenue ?? 0)} across {topService?.bookings ?? 0} bookings ({formatPercent(topService?.share ?? 0)} share).
            </span>
          );
        } else {
          responseText = (
            <span>
              Understood 💖 I am compiling deeper metrics for you. Please check the charts below for instant visual correlation.
            </span>
          );
        }
      }

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai" as const,
          text: responseText,
          timestamp: new Date(),
        }
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const selectedBreakdown = breakdownForGroup(analysisGroup, report.breakdowns);

  const chartConfig = useMemo(() => ({
    current: { label: translateText("Current period", language), color: "#0f766e" },
    previous: { label: translateText("Previous period", language), color: "#94a3b8" },
  }), [language]);

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
      title: translateText("Revenue this period", language),
      value: formatCurrency(report.kpis.revenueThisPeriod),
      delta: formatGrowth(report.kpis.revenueGrowthRate),
      detail: `${translateText("vs", language)} ${translateText(report.previousPeriod.label, language).toLowerCase()}`,
      icon: CircleDollarSign,
    },
    {
      title: translateText("Completed bookings", language),
      value: report.kpis.completedBookings.toLocaleString("vi-VN"),
      delta: formatGrowth(report.kpis.completedBookingsGrowthRate),
      detail: `${translateText("vs", language)} ${translateText(report.previousPeriod.label, language).toLowerCase()}`,
      icon: ReceiptText,
    },
    {
      title: translateText("Average booking value", language),
      value: formatCurrency(report.kpis.averageBookingValue),
      delta: translateText("Business mix quality", language),
      detail: translateText("per booking", language),
      icon: TrendingUp,
    },
    {
      title: translateText("Cancellation rate", language),
      value: formatPercent(report.kpis.cancellationRate),
      delta: translateText(report.kpis.cancellationRate > 10 ? "Watch closely" : "Healthy range", language),
      detail: translateText("of total bookings", language),
      icon: TrendingDown,
    },
    {
      title: translateText("Discount-assisted revenue", language),
      value: formatCurrency(report.kpis.discountAssistedRevenue),
      delta: translateText(report.capabilities.promotionAttributionExact ? "Campaign-attributed" : "Voucher/discount proxy", language),
      detail: translateText("promotion visibility", language),
      icon: BarChart3,
    },
    {
      title: translateText("Report window", language),
      value: translateText(report.period.label, language),
      delta: `${report.period.dateFrom} -> ${report.period.dateTo}`,
      detail: translateText("selected range", language),
      icon: CalendarDays,
    },
  ];

  return (
    <WorkspacePage className="space-y-8">
      <section className="flex flex-col gap-5 rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-teal-50 p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100">{translateText("Executive report", language)}</Badge>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">{translateText("Business health", language)}</h1>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <FilterCard label={translateText("Time range", language)}>
            <Select value={range} onValueChange={(value) => onRangeChange(value as ReportRangeKey)}>
              <SelectTrigger className="min-w-[180px] bg-white">
                <SelectValue placeholder={translateText("Select range", language)} />
              </SelectTrigger>
              <SelectContent>
                {REPORT_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {language === "vi" ? option.labelVi : option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterCard>

          <FilterCard label={translateText("Analysis group", language)}>
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
                    {language === "vi" ? option.labelVi : option.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </FilterCard>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading
          title={translateText("KPI summary", language)}
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {kpiCards.map((card) => (
            <KpiCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading
          title={translateText("Trend", language)}
        />
        <div className="grid gap-4 xl:grid-cols-2">
          <TrendCard
            title={translateText("Revenue trend", language)}
            description={`${translateText(report.period.label, language)} vs ${translateText(report.previousPeriod.label, language)}`}
            data={revenueTrendData}
            formatter={formatCompactCurrency}
            config={chartConfig}
          />
          <TrendCard
            title={translateText("Completed bookings trend", language)}
            description={`${translateText(report.period.label, language)} vs ${translateText(report.previousPeriod.label, language)}`}
            data={completedTrendData}
            formatter={(value) => value.toLocaleString("vi-VN")}
            config={chartConfig}
          />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>{translateText("Breakdown", language)}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedBreakdown.available ? (
              selectedBreakdown.items.length > 0 ? (
                <div className="space-y-4">
                  {selectedBreakdown.message ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      {translateText(selectedBreakdown.message, language)}
                    </div>
                  ) : null}
                  <div className="space-y-3">
                    {selectedBreakdown.items.slice(0, 6).map((item) => (
                      <BreakdownBar
                        key={item.key}
                        item={item}
                        valueLabel={formatCurrency(item.revenue)}
                        language={language}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyReportState message={translateText("No breakdown items are available for the selected range.", language)} />
              )
            ) : (
              <EmptyReportState message={translateText(selectedBreakdown.message ?? "This analysis group is not available.", language)} />
            )}
          </CardContent>
        </Card>

        <Card className="border-teal-100 bg-white text-slate-900 shadow-xl shadow-teal-100/50 overflow-hidden flex flex-col h-[520px] rounded-[24px]">
          {/* Header */}
          <div className="pb-3 pt-4 px-5 border-b border-teal-50 bg-gradient-to-r from-teal-50/80 to-emerald-50/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-400 text-white shadow-sm shadow-teal-200">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white animate-bounce" />
              </div>
              <div>
                <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 leading-none">
                  {language === "vi" ? "Trợ lý phân tích" : "Analysis Assistant"}
                </CardTitle>
                <div className="text-[10px] text-teal-600 mt-1 font-medium">Luôn sẵn sàng giúp đỡ bạn 🌸</div>
              </div>
            </div>
            <button 
              onClick={() => {
                const greetingText = language === "vi" 
                  ? "Xin chào! Mình là Trợ lý phân tích 🌸 Dưới đây là nhận định tổng quan về tình hình kinh doanh của bạn:" 
                  : "Hello! I am the Analysis Assistant 🌸 Here is the overall performance assessment of your business:";
                setMessages([{ id: "greeting", sender: "ai", text: greetingText, timestamp: new Date() }]);
              }}
              className="text-teal-400 hover:text-teal-600 transition-colors p-2 rounded-xl hover:bg-teal-100/50"
              title="Reset Chat"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-teal-200 scrollbar-track-transparent flex flex-col bg-slate-50/30">
            {messages.map((msg) => {
              const isAi = msg.sender === "ai";

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                    isAi ? "self-start" : "self-end flex-row-reverse ml-auto"
                  )}
                >
                  {isAi && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-300 to-emerald-300 text-white shadow-sm">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <div
                      className={cn(
                        "p-4 text-sm leading-relaxed shadow-sm",
                        isAi 
                          ? "bg-white border border-teal-100 text-slate-700 rounded-[24px] rounded-tl-none" 
                          : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-[24px] rounded-tr-none font-medium"
                      )}
                    >
                      <div>{msg.text}</div>
                    </div>
                    
                    <span className={cn("text-[10px] text-slate-400 block px-2", isAi ? "text-left" : "text-right")}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-300 to-emerald-300 text-white shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="bg-white border border-teal-100 text-teal-500 px-4 py-3 rounded-[24px] rounded-tl-none flex items-center gap-2 shadow-sm">
                  <span className="text-xs font-medium italic">{language === "vi" ? "Trợ lý đang suy nghĩ" : "Assistant is thinking"}</span>
                  <div className="flex space-x-1 items-center h-4 ml-1">
                    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions */}
          <div className="px-5 pb-3 pt-3 flex flex-wrap gap-2 bg-white border-t border-teal-50">
            {(language === "vi" 
              ? ["Phân tích doanh thu 💰", "Tỷ lệ hủy lịch ⚠️", "Dịch vụ bán chạy nhất 🏆"]
              : ["Analyze revenue 💰", "Cancellation status ⚠️", "Best selling services 🏆"]
            ).map((phrase) => (
              <button
                key={phrase}
                onClick={() => handleSendMessage(phrase)}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-600 border border-teal-100 hover:border-teal-200 transition-all duration-200"
              >
                {phrase}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white flex items-center gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={language === "vi" ? "Hỏi Trợ lý phân tích..." : "Ask Analysis Assistant..."}
              className="flex-1 bg-slate-50 border border-slate-100 rounded-full px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-100 transition-all"
            />
            <button
              onClick={() => handleSendMessage()}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white transition-all shadow-md shadow-teal-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </button>
          </div>
        </Card>
      </section>

      <section className="space-y-3">
        <SectionHeading
          title={translateText("Top items", language)}
        />
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{translateText("Service", language)}</TableHead>
                  <TableHead className="text-right">{translateText("Revenue", language)}</TableHead>
                  <TableHead className="text-right">{translateText("Bookings", language)}</TableHead>
                  <TableHead className="text-right">{translateText("Share", language)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.topItems.services.length > 0 ? (
                  report.topItems.services.map((item) => (
                    <TableRow key={item.key}>
                      <TableCell className="font-semibold text-slate-900">{translateText(item.label, language)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                      <TableCell className="text-right">{item.bookings.toLocaleString("vi-VN")}</TableCell>
                      <TableCell className="text-right">{formatPercent(item.share)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-sm text-slate-500">
                      {translateText("No top items are available for the selected range.", language)}
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

function SectionHeading({ title }: { title: string }) {
  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">{title}</h2>
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
  config,
}: {
  title: string;
  description: string;
  data: Array<{ label: string; current: number; previous: number }>;
  formatter: (value: number) => string;
  config: any;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChartContainer
          config={config}
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

function BreakdownBar({ item, valueLabel, language }: { item: AdminReportBreakdownItem; valueLabel: string; language: "vi" | "en" }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-semibold text-slate-900">{translateText(item.label, language)}</div>
          <div className="text-xs text-slate-500">{item.bookings.toLocaleString("vi-VN")} {translateText("bookings", language)}</div>
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

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Star,
  Flame,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  Loader2,
  Bookmark,
  Zap,
} from "lucide-react";
import { Card } from "@/shared/ui/ui/card";
import { Badge } from "@/shared/ui/ui/badge";
import { Button } from "@/shared/ui/ui/button";
import { useBookingPackages, useBookingCombos } from "@/features/bookings/hooks/use-bookings";
import { useLanguageStore, translate } from "@/shared/store/language.store";
import { formatBookingCurrency } from "@/features/bookings/lib/booking-format";
import { cn } from "@/shared/lib/utils";


export default function ServiceCatalogPage() {
  const { language } = useLanguageStore();
  const router = useRouter();
  const t = (vi: string, en: string) => translate(language, vi, en);

  const packagesQuery = useBookingPackages();
  const combosQuery = useBookingCombos();

  const [activeFilter, setActiveFilter] = useState<"all" | "daily" | "detailing" | "combos">("all");

  const filterTabs = [
    { id: "all", label: t("Tất cả", "All") },
    { id: "daily", label: t("Rửa Hàng Ngày", "Daily Wash") },
    { id: "detailing", label: t("Chăm Sóc Detailing", "Detailing") },
    { id: "combos", label: t("Gói Combos", "Combos") },
  ];

  const isLoading = packagesQuery.isLoading || combosQuery.isLoading;

  const catalogItems = useMemo(() => {
    if (isLoading) return [];
    
    const pkgs = (packagesQuery.data ?? []).map((pkg) => {
      // Classify as daily wash or detailing based on price/metadata
      const isDetailing = pkg.basePrice > 250000 || pkg.name.toLowerCase().includes("detailing") || pkg.name.toLowerCase().includes("phủ");
      return {
        id: pkg.packageId,
        type: "package" as const,
        category: isDetailing ? ("detailing" as const) : ("daily" as const),
        name: pkg.name,
        description: pkg.description || t("Quy trình rửa tiêu chuẩn chất lượng cao.", "High quality standard wash flow."),
        price: pkg.basePrice,
        originalPrice: pkg.basePrice,
        benefits: pkg.features || [t("Rửa bọt không chạm", "Touchless foam spray"), t("Lau khô sấy gương", "Hand dry & glass wipe")],
        duration: pkg.duration ? `${pkg.duration} mins` : "30 mins",
      };
    });

    const cmbs = (combosQuery.data ?? []).map((combo) => ({
      id: combo.comboId,
      type: "combo" as const,
      category: "combos" as const,
      name: combo.name,
      description: combo.description || t("Gói combo tiết kiệm cho nhiều lần sử dụng.", "Cost-saving combo for multiple usages."),
      price: combo.basePrice,
      originalPrice: combo.basePrice,
      benefits: combo.benefits || [t("Tiết kiệm lên tới 30%", "Save up to 30%"), t("Ưu tiên đặt chỗ trước", "Priority slot reservation")],
      duration: `${combo.maxServices} ${t("Lượt dùng", "Usages")}`,
    }));


    return [...pkgs, ...cmbs];
  }, [packagesQuery.data, combosQuery.data, isLoading, t]);

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return catalogItems;
    return catalogItems.filter((item) => item.category === activeFilter);
  }, [catalogItems, activeFilter]);

  // Find a showroom detailing package or a combo to feature as "Showroom Combo"
  const featuredItem = useMemo(() => {
    return catalogItems.find(
      (item) => item.name.toLowerCase().includes("showroom") || item.name.toLowerCase().includes("vip") || item.category === "combos"
    ) || catalogItems[0] || null;
  }, [catalogItems]);

  const handleQuickBook = (item: typeof catalogItems[number]) => {
    if (item.type === "combo") {
      router.push(`/customer/combos/${item.id}/checkout`);
    } else {
      router.push(`/customer/bookings/new?packageId=${item.id}`);
    }
  };

  return (
    <div className="relative min-h-screen px-4 py-8 sm:px-6 lg:px-8 bg-[#fdf7ff]">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -right-24 top-10 h-96 w-96 rounded-full bg-[#0566D9]/5 blur-[100px]" />
        <div className="absolute bottom-10 -left-10 h-[28rem] w-[28rem] rounded-full bg-[#6750A4]/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
        
        {/* Title Area */}
        <section className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0566D9]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.15em] text-[#0566D9]">
            <Sparkles className="h-3.5 w-3.5" />
            Aura Catalog
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            {t("Danh Mục Dịch Vụ Elite", "Elite Service Catalog")}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
            {t("Khám phá bảng giá niêm yết minh bạch các gói rửa xe cao cấp, chăm sóc bảo dưỡng sơn xe chuẩn showroom Aura.", "Explore transparent pricing for premium wash packages and showroom-grade paint detailing.")}
          </p>
        </section>

        {/* Highlighted Featured Combo Card */}
        {featuredItem && (
          <section className="overflow-hidden rounded-3xl border border-black/[0.04] bg-gradient-to-br from-white to-[#fdf7ff] shadow-[0_8px_30px_rgba(0,0,0,0.03)] group p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0566D9]/10 px-2.5 py-0.5 text-xs font-bold text-[#0566D9]">
                    <Flame className="h-3.5 w-3.5 animate-pulse" />
                    {t("Gói Nổi Bật Showroom Combo", "Showroom Featured Combo")}
                  </span>
                  <Badge variant="outline" className="border-[#6750A4]/30 bg-[#6750A4]/5 text-[#6750A4] rounded-full text-[10px] font-black">
                    Save up to 30%
                  </Badge>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-slate-950">
                  {featuredItem.name}
                </h2>
                <p className="text-sm leading-relaxed text-slate-650 max-w-xl">
                  {featuredItem.description}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {featuredItem.benefits.slice(0, 4).map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <CheckCircle className="h-4 w-4 text-[#0566D9] shrink-0" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-center items-stretch lg:items-end gap-4 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8">
                <div className="text-left lg:text-right space-y-1">
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                    {t("Giá đặc quyền", "Exclusive Price")}
                  </span>
                  <div className="flex items-baseline lg:justify-end gap-2">
                    <span className="text-3xl font-black text-[#0566D9]">
                      {formatBookingCurrency(featuredItem.price)}
                    </span>
                    {featuredItem.originalPrice > featuredItem.price && (
                      <span className="text-sm text-slate-450 line-through">
                        {formatBookingCurrency(featuredItem.originalPrice)}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 block">
                    Duration: {featuredItem.duration}
                  </span>
                </div>
                <Button 
                  onClick={() => handleQuickBook(featuredItem)}
                  className="rounded-xl bg-[#0566D9] text-white hover:bg-[#0455B6] w-full lg:w-auto px-8 py-3 font-bold shadow-md shadow-[#0566D9]/15"
                >
                  {t("Đặt Premium Slot", "Reserve Premium Slot")}
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Filter Navigation */}
        <section className="flex flex-wrap gap-2 items-center overflow-x-auto pb-1 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                activeFilter === tab.id
                  ? "bg-[#0566D9] text-white border-[#0566D9] shadow-sm shadow-[#0566D9]/10"
                  : "bg-white text-slate-600 border-black/[0.04] hover:bg-slate-50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </section>

        {/* Grid List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#0566D9]" />
            <p className="text-sm font-semibold text-slate-500">{t("Đang tải danh mục...", "Loading catalog...")}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-slate-500 font-semibold text-sm">
            {t("Không tìm thấy dịch vụ nào phù hợp.", "No matching services found.")}
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden rounded-3xl border border-black/[0.04] bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white",
                      item.type === "combo" ? "bg-[#6750A4]" : "bg-[#0566D9]"
                    )}>
                      {item.type === "combo" ? t("Gói Combo", "Combo Pack") : t("Dịch Vụ", "Single Wash")}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {item.duration}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-950 leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-600 line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {item.benefits.slice(0, 3).map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 text-[11px] font-semibold text-slate-650">
                        <CheckCircle className="h-3.5 w-3.5 text-[#0566D9] shrink-0" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      {t("Giá bán", "Price")}
                    </span>
                    <span className="text-xl font-black text-slate-950">
                      {formatBookingCurrency(item.price)}
                    </span>
                  </div>

                  <Button 
                    onClick={() => handleQuickBook(item)}
                    className="rounded-xl bg-[#0566D9]/10 text-[#0566D9] hover:bg-[#0566D9] hover:text-white px-5 py-2 text-xs font-black shadow-none transition-all duration-200"
                  >
                    {t("Quick Book", "Quick Book")}
                  </Button>
                </div>
              </Card>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Sparkles, Megaphone, Bell } from "lucide-react";
import { useLanguageStore, translate } from "@/shared/store/language.store";
import { apiClient } from "@/shared/lib/api";

interface TickerMessage {
  id: string;
  messageVi: string;
  messageEn: string;
  type?: "PROMO" | "RANK_UP" | "INFO";
}

const DEFAULT_MESSAGES: TickerMessage[] = [
  {
    id: "default-1",
    messageVi: "🔥 Khuyến mãi mùa mưa: Giảm ngay 20% cho gói Combo Phủ Ceramic & Rửa gầm xe chi tiết! Đặt lịch ngay!",
    messageEn: "🔥 Rainy season promotion: Get 20% off Ceramic Coating & Undercarriage Wash combo! Book now!",
    type: "PROMO",
  },
  {
    id: "default-2",
    messageVi: "✨ Chúc mừng khách hàng Nguyễn Văn A vừa thăng hạng Vàng và nhận Voucher trị giá 100,000 VND!",
    messageEn: "✨ Congratulations to customer Nguyen Van A for upgrading to Gold Tier and receiving a 100k voucher!",
    type: "RANK_UP",
  },
  {
    id: "default-3",
    messageVi: "📢 Hệ thống rửa xe tự động thông minh AutoWash mở cửa phục vụ từ 7:00 đến 21:00 hàng ngày.",
    messageEn: "📢 AutoWash smart car wash is open daily from 7:00 AM to 9:00 PM.",
    type: "INFO",
  },
];

export function MarqueeTicker() {
  const { language } = useLanguageStore();
  const [messages, setMessages] = useState<TickerMessage[]>(DEFAULT_MESSAGES);

  useEffect(() => {
    async function fetchTicker() {
      try {
        const response = await apiClient.get<{ data: TickerMessage[] }>("/notifications/ticker");
        if (response.data?.data && response.data.data.length > 0) {
          setMessages(response.data.data);
        }
      } catch (err) {
        // Fallback to default mock messages if endpoint is not created yet or fails
      }
    }
    fetchTicker();
  }, []);

  const textToDisplay = messages
    .map((m) => (language === "vi" ? m.messageVi : m.messageEn))
    .join("  |  ");

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 py-2 border-b border-sky-500/20 text-white select-none z-50">
      {/* Styles inject for CSS marquee */}
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .animate-marquee-custom {
          display: inline-block;
          white-space: nowrap;
          padding-left: 100%;
          animation: marquee 25s linear infinite;
        }
        .animate-marquee-custom:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="flex items-center gap-2 max-w-7xl mx-auto px-4 h-5">
        <div className="flex items-center gap-1.5 shrink-0 bg-primary/20 border border-primary/30 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-sky-400">
          <Megaphone className="h-3 w-3 animate-bounce" />
          <span>{translate(language, "Tin mới", "News")}</span>
        </div>
        <div className="w-full overflow-hidden relative">
          <div className="animate-marquee-custom text-xs font-medium tracking-wide text-slate-100 flex items-center gap-8">
            <span>{textToDisplay}</span>
            {/* Duplicate for seamless infinite loop */}
            <span>{textToDisplay}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

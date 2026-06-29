import os

content = """\"use client\";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Menu,
  Quote,
  Shield,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatBookingCurrency } from "@/features/customer/bookings/lib/booking-format";
import { cn } from "@/shared/lib/utils";
import {
  homeCombos,
  homeGallery,
  homeServices,
  homeTestimonials,
  type HomeCombo,
  type HomeService,
} from "./homepage-data";
import { ModernAuthPopupModal } from "./modern-auth-popup-modal";

const HOME_COPY = {
  vi: {
    navServices: "Dịch vụ",
    navCombos: "Gói Combo",
    navReviews: "Đánh giá",
    navContact: "Liên hệ",
    login: "Đăng nhập",
    register: "Đăng ký",
    footerQuickLinks: "Liên kết nhanh",
    footerContact: "Liên hệ",
    footerAddress: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
    footerPhone: "0901 234 567",
    footerEmail: "contact@auracarcare.vn",
    footerRights: "Bản quyền thuộc về Aura Car Care. Bảo lưu mọi quyền.",
    footerDesc: "Hệ thống rửa xe tự động không chạm theo tiêu chuẩn kiểm tra hiện đại.",
    footerHours: "T2 - CN: 7:00 AM - 8:00 PM",
  },
  en: {
    navServices: "Services",
    navCombos: "Combos",
    navReviews: "Reviews",
    navContact: "Contact",
    login: "Login",
    register: "Sign Up",
    footerQuickLinks: "Quick links",
    footerContact: "Contact",
    footerAddress: "123 Nguyen Van Linh, District 7, HCMC",
    footerPhone: "0901 234 567",
    footerEmail: "contact@auracarcare.vn",
    footerRights: "Aura Car Care. All rights reserved.",
    footerDesc: "Automated touchless car wash system adhering to modern quality standards.",
    footerHours: "Mon - Sun: 7:00 AM - 8:00 PM",
  }
};

const navigationItems = [
  { href: "#services", label: "Services" },
  { href: "#combos", label: "Packages" },
  { href: "#reviews", label: "Reviews" },
  { href: "#contact", label: "Contact" },
];

const CAR_WASH_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80",
    caption: { en: "Professional exterior wash", vi: "Rửa ngoài chuyên nghiệp" },
  },
  {
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    caption: { en: "Interior deep clean", vi: "Vệ sinh nội thất sâu" },
  },
  {
    url: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&q=80",
    caption: { en: "Premium foam wash", vi: "Rửa bọt cao cấp" },
  },
  {
    url: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&q=80",
    caption: { en: "Sparkling result", vi: "Kết quả bóng loáng" },
  },
];

function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

export function HomePageView() {
  const [authMode, setAuthMode] = useState<"login" | "register" | "otp" | null>(null);
  const [otpEmail, setOtpEmail] = useState("");
  const [language, setLanguage] = useState<"vi" | "en">("en");
  const copy = HOME_COPY[language];

  const handleOpenAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
  };

  const handleCloseAuth = () => {
    setAuthMode(null);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const auth = params.get("auth");
      if (auth === "login" || auth === "register") {
        setAuthMode(auth);
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, []);

  const translatedServices = useMemo(() => {
    return homeServices.map((s) => {
      if (language === "en") {
        if (s.id === "s1") return { ...s, name: "Quick Wash", description: "Quick exterior wash in 15 mins", duration: "15 mins" };
        if (s.id === "s2") return { ...s, name: "Premium Wash", description: "Exterior wash and interior vacuuming", duration: "30 mins" };
        if (s.id === "s3") return { ...s, name: "Deep Detailing", description: "Detailed cleaning inside and out", duration: "90 mins" };
        if (s.id === "s4") return { ...s, name: "Engine Cleaning", description: "Safe engine cleaning", duration: "45 mins" };
      }
      return s;
    });
  }, [language]);

  const translatedCombos = useMemo(() => {
    return homeCombos.map((c) => {
      if (language === "en") {
        if (c.id === "c1") return { ...c, name: "Monthly Silver", description: "8 quick washes per month", badge: "Most Popular", services: ["Quick Wash x8"] };
        if (c.id === "c2") return { ...c, name: "Monthly Gold", description: "4 premium washes & 2 deep detailings", badge: "Best Value", services: ["Premium Wash x4", "Deep Detail x2"] };
        if (c.id === "c3") return { ...c, name: "Corporate Fleet", description: "20 washes for company vehicles", badge: "For Business", services: ["Quick Wash x20"] };
      }
      return c;
    });
  }, [language]);

  const translatedTestimonials = useMemo(() => {
    return homeTestimonials.map((t) => {
      if (language === "en") {
        if (t.id === "t1") return { ...t, name: "Mr. Hung", content: "Very thorough washing, comfortable lounge, I will return." };
        if (t.id === "t2") return { ...t, name: "Mrs. Lan", content: "Booked in 30 seconds, no more waiting in line." };
        if (t.id === "t3") return { ...t, name: "Mr. Tuan", content: "Modern car wash technology, paint layer protected visibly." };
      }
      return t;
    });
  }, [language]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader onOpenAuth={handleOpenAuth} language={language} onChangeLanguage={setLanguage} copy={copy} />
      <HeroSection onOpenAuth={handleOpenAuth} language={language} />

      <PhotoGallery language={language} />

      <WaveDivider />

      <ServicesSection onOpenAuth={handleOpenAuth} language={language} services={translatedServices} />

      <WaveDivider flip />

      <BeforeAfterSection language={language} />

      <WaveDivider />

      <CombosSection onOpenAuth={handleOpenAuth} language={language} combos={translatedCombos} />

      <WaveDivider flip />

      <ReviewsSection language={language} testimonials={translatedTestimonials} />

      <CallToActionSection onOpenAuth={handleOpenAuth} language={language} />

      <PublicFooter copy={copy} />

      {authMode && (
        <ModernAuthPopupModal
          mode={authMode}
          otpEmail={otpEmail}
          setOtpEmail={setOtpEmail}
          setMode={setAuthMode}
          onClose={handleCloseAuth}
          language={language}
          setLanguage={setLanguage}
        />
      )}
    </div>
  );
}

function PublicHeader({
  onOpenAuth,
  language,
  onChangeLanguage,
  copy,
}: {
  onOpenAuth: (mode: "login" | "register") => void;
  language: "vi" | "en";
  onChangeLanguage: (lang: "vi" | "en") => void;
  copy: Record<string, string>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "#services", label: copy.navServices },
    { href: "#combos", label: copy.navCombos },
    { href: "#reviews", label: copy.navReviews },
    { href: "#contact", label: copy.navContact },
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
        isScrolled
          ? "border-teal-100/80 bg-white/92 shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl"
          : "border-transparent bg-white/70 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-[0_10px_30px_rgba(15,118,110,0.12)] ring-1 ring-teal-100 transition-transform duration-300 hover:scale-105">
            <img src="/logo.png" alt="AutoWash Pro" className="h-9 w-9 rounded-xl object-cover" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-teal-700 sm:text-[0.7rem] sm:tracking-[0.28em]">
              AutoWash Pro
            </p>
            <p className="truncate text-sm font-semibold text-slate-900">Aura Car Care</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition duration-300 hover:-translate-y-0.5 hover:text-slate-950"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="mr-2 flex rounded-full border border-teal-100/80 bg-teal-50/50 p-1 shadow-inner backdrop-blur-sm transition-all duration-300">
            {(["vi", "en"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onChangeLanguage(item)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[11px] font-black uppercase transition-all duration-300",
                  language === item
                    ? "scale-105 bg-teal-600 text-white shadow-md shadow-teal-600/20"
                    : "text-slate-500 hover:text-slate-950"
                )}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            className="rounded-full px-5 text-sm font-semibold transition-transform duration-300 hover:scale-[1.02]"
            onClick={() => onOpenAuth("login")}
          >
            {copy.login}
          </Button>
          <Button
            className="rounded-full px-5 text-sm font-semibold shadow-[0_12px_32px_rgba(15,118,110,0.22)] transition-transform duration-300 hover:scale-[1.02]"
            onClick={() => onOpenAuth("register")}
          >
            {copy.register}
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-teal-100 bg-white text-slate-900 shadow-sm transition-transform duration-300 hover:scale-105 lg:hidden"
          onClick={() => setIsOpen((value) => !value)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen ? (
        <div className="animate-in fade-in slide-in-from-top-2 border-t border-teal-100 bg-white px-4 py-4 shadow-[0_12px_24px_rgba(15,23,42,0.08)] duration-300 lg:hidden">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-teal-50 hover:text-slate-950"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          
          <div className="mt-4 flex justify-center">
            <div className="flex w-fit rounded-full border border-teal-100 bg-teal-50/50 p-1 shadow-sm">
              {(["vi", "en"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onChangeLanguage(item)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-black uppercase transition",
                    language === item ? "bg-teal-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900",
                  )}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button variant="outline" className="rounded-full" onClick={() => { setIsOpen(false); onOpenAuth("login"); }}>
              {copy.login}
            </Button>
            <Button className="rounded-full" onClick={() => { setIsOpen(false); onOpenAuth("register"); }}>
              {copy.register}
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function WaterWaves() {
  return (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none h-40">
      <svg
        viewBox="0 0 1440 120"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <path
          d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"
          fill="currentColor"
          className="text-primary/5 text-teal-600/5"
          style={{ animation: "waveMove 6s ease-in-out infinite" }}
        />
        <path
          d="M0,80 C200,20 400,100 720,80 C1040,60 1240,100 1440,70 L1440,120 L0,120 Z"
          fill="currentColor"
          className="text-primary/8 text-teal-600/8"
          style={{ animation: "waveMove 8s ease-in-out infinite reverse" }}
        />
      </svg>
      <style>{`
        @keyframes waveMove {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(-30px); }
        }
      `}</style>
    </div>
  );
}

function FloatingDrops() {
  const drops = [
    { size: 80, x: "10%", delay: "0s", dur: "7s", opacity: 0.06 },
    { size: 120, x: "85%", delay: "1s", dur: "9s", opacity: 0.04 },
    { size: 60, x: "60%", delay: "2s", dur: "6s", opacity: 0.07 },
    { size: 100, x: "35%", delay: "3s", dur: "8s", opacity: 0.05 },
    { size: 50, x: "75%", delay: "0.5s", dur: "10s", opacity: 0.06 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {drops.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-teal-600"
          style={{
            width: d.size,
            height: d.size,
            left: d.x,
            bottom: "-20%",
            opacity: d.opacity,
            animation: `floatUp ${d.dur} ${d.delay} ease-in-out infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-100vh) scale(0.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function AnimatedStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-extrabold text-teal-600">{value}</div>
      <div className="text-xs text-muted-foreground mt-1 font-medium">{label}</div>
    </div>
  );
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      {icon}
      {label}
    </div>
  );
}

function HeroSection({ onOpenAuth, language }: { onOpenAuth: (mode: "login" | "register") => void, language: "vi" | "en" }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-teal-600/5 pt-20">
      <FloatingDrops />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-1/3 right-0 h-[700px] w-[700px] rounded-full bg-teal-600/10 blur-[120px] opacity-60"
          style={{ animation: "pulse 8s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-1/4 -left-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[100px] opacity-50"
          style={{ animation: "pulse 10s ease-in-out infinite reverse" }}
        />
        <style>{`
          @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        `}</style>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 md:px-8 grid gap-12 lg:grid-cols-2 items-center">
        <div className="space-y-8">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-teal-600/30 bg-teal-600/10 px-4 py-2 text-sm font-semibold text-teal-600 transition-all duration-700"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
            }}
          >
            <Star className="h-4 w-4 fill-teal-600" />
            {language === "vi" ? "Nền Tảng Chăm Sóc Xe Thế Hệ Mới" : "Next-Gen Car Care Platform"}
          </div>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05] transition-all duration-700 delay-100"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
            }}
          >
            {language === "vi" ? (
              <>
                <span className="text-teal-600">Rửa Xe & Chăm Sóc</span>
                <br />
                Chuyên Nghiệp
                <br />
                Công Nghệ Đức tại TP.HCM.
              </>
            ) : (
              <>
                Professional Car Wash &<br />
                <span className="text-teal-600">German Technology</span>
                <br />
                in HCMC.
              </>
            )}
          </h1>

          <p
            className="text-lg text-muted-foreground max-w-lg leading-relaxed transition-all duration-700 delay-200"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
            }}
          >
            {language === "vi" 
              ? "Đặt lịch 30 giây. Không lo xếp hàng. Hoàn tiền 100% nếu bạn không hài lòng."
              : "Book in 30 seconds. No waiting in line. Premium finish guaranteed or 100% money back."}
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-300"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
            }}
          >
            <Button
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-8 py-6 text-base font-bold text-white shadow-lg shadow-teal-600/30 hover:bg-teal-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-600/40 transition-all"
              onClick={() => onOpenAuth("login")}
            >
              {language === "vi" ? "Đặt Lịch Ngay" : "Book Now"}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-background/60 px-8 py-4 text-base font-semibold hover:bg-accent hover:-translate-y-1 transition-all"
            >
              {language === "vi" ? "Xem Dịch Vụ" : "View Services"}
            </a>
          </div>

          <div
            className="flex flex-wrap gap-6 pt-2 transition-all duration-700 delay-[400ms]"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
            }}
          >
            <TrustBadge
              icon={<Clock className="h-4 w-4 text-teal-600" />}
              label={language === "vi" ? "Đặt lịch 30 giây" : "Book in 30s"}
            />
            <TrustBadge
              icon={<Shield className="h-4 w-4 text-teal-600" />}
              label={language === "vi" ? "Hoàn tiền 100%" : "100% Money Back"}
            />
            <TrustBadge
              icon={<Star className="h-4 w-4 fill-teal-600 text-teal-600" />}
              label={language === "vi" ? "Phòng chờ 5 sao" : "5-Star Lounge"}
            />
          </div>
        </div>

        <div
          className="hidden lg:flex flex-col gap-6 transition-all duration-700 delay-[500ms]"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(40px)",
          }}
        >
          <div className="rounded-3xl border border-border/50 bg-card/70 backdrop-blur-xl shadow-2xl p-8 space-y-5">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {language === "vi" ? "Tại Sao Chọn AURA CAR CARE?" : "Why AURA CAR CARE?"}
            </div>
            {[
              {
                emoji: "🚗",
                title: language === "vi" ? "Rửa Không Chạm" : "Touchless Wash",
                desc: language === "vi" ? "Bọt công nghệ Đức bảo vệ sơn xe" : "German-tech foam protects your paint",
              },
              {
                emoji: "🏆",
                title: language === "vi" ? "Phòng Chờ 5 Sao" : "5-Star Waiting Lounge",
                desc: language === "vi" ? "Máy lạnh, nước miễn phí & Wi-Fi tốc độ cao" : "AC, free drinks & high-speed Wi-Fi",
              },
              {
                emoji: "⚡",
                title: language === "vi" ? "Đặt Lịch Thời Gian Thực" : "Real-time Booking",
                desc: language === "vi" ? "Không xếp hàng, có chỗ được đảm bảo" : "Guaranteed slot, zero queue",
              },
              {
                emoji: "💎",
                title: language === "vi" ? "Tích Điểm Thưởng" : "Loyalty Rewards",
                desc: language === "vi" ? "Tích điểm mỗi lần rửa" : "Earn points every wash",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-default group"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">
                  {item.emoji}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{item.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/40">
              <AnimatedStat value="5000+" label={language === "vi" ? "Khách Hài Lòng" : "Happy Clients"} />
              <AnimatedStat value="98%" label={language === "vi" ? "Hài Lòng" : "Satisfaction"} />
              <AnimatedStat value="3 min" label={language === "vi" ? "Chờ TB" : "Avg. Wait"} />
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground transition-all duration-700 delay-[700ms]"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <span className="text-xs">{language === "vi" ? "Cuộn xuống" : "Scroll"}</span>
        <ChevronDown className="h-4 w-4" style={{ animation: "bounce 2s infinite" }} />
        <style>{`@keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(6px); } }`}</style>
      </div>

      <WaterWaves />
    </section>
  );
}

function PhotoGallery({ language }: { language: "vi" | "en" }) {
  const { ref, visible } = useScrollReveal();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setActive((a) => (a + 1) % CAR_WASH_IMAGES.length), 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={ref} className="py-20 px-4 md:px-8 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div
          className="text-center mb-12 transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-600/20 bg-teal-600/10 px-4 py-1.5 text-sm font-semibold text-teal-600 mb-4">
            📸 {language === "vi" ? "Cơ Sở Của Chúng Tôi" : "Our Facility"}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            {language === "vi" ? "Tận Mắt Chứng Kiến" : "See It For Yourself"}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {CAR_WASH_IMAGES.map((img, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer transition-all duration-700"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(40px)",
                transitionDelay: `${i * 100}ms`,
              }}
              onClick={() => setActive(i)}
            >
              <img
                src={img.url}
                alt={img.caption.en}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-xs font-semibold">
                  {img.caption[language]}
                </p>
              </div>
              {active === i && (
                <div className="absolute inset-0 ring-2 ring-teal-600 ring-offset-2 rounded-2xl pointer-events-none" />
              )}
            </div>
          ))}
        </div>

        <div
          className="mt-6 overflow-hidden rounded-3xl aspect-video relative transition-all duration-700"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <img
            src={CAR_WASH_IMAGES[active].url.replace("w=800", "w=1400")}
            alt={CAR_WASH_IMAGES[active].caption.en}
            className="h-full w-full object-cover transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <p className="text-lg font-bold">
              {CAR_WASH_IMAGES[active].caption[language]}
            </p>
            <p className="text-sm opacity-80">
              AURA CAR CARE — {language === "vi" ? "TP. Hồ Chí Minh" : "Ho Chi Minh City"}
            </p>
          </div>
          <div className="absolute bottom-6 right-6 flex gap-2">
            {CAR_WASH_IMAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={`h-2 rounded-full transition-all ${active === i ? "w-6 bg-white" : "w-2 bg-white/50"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WaveDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div className={`relative h-16 overflow-hidden ${flip ? "scale-y-[-1]" : ""}`}>
      <svg
        viewBox="0 0 1440 64"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute bottom-0 w-full"
        preserveAspectRatio="none"
      >
        <path
          d="M0,32 C360,64 720,0 1080,32 C1260,48 1380,24 1440,32 L1440,64 L0,64 Z"
          className="fill-teal-600/10"
          style={{ animation: "waveSlow 8s ease-in-out infinite" }}
        />
        <path
          d="M0,48 C180,16 540,56 900,40 C1080,32 1260,52 1440,44 L1440,64 L0,64 Z"
          className="fill-teal-600/5"
          style={{ animation: "waveSlow 10s ease-in-out infinite reverse" }}
        />
      </svg>
      <style>{`@keyframes waveSlow { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-20px)} }`}</style>
    </div>
  );
}

function RevealSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
      }}
    >
      {children}
    </div>
  );
}

function ServicesSection({ onOpenAuth, language, services }: { onOpenAuth: (mode: "login" | "register") => void, language: "vi" | "en", services: any[] }) {
  return (
    <section id="services" className="py-20 px-4 md:px-8 bg-teal-50/30">
      <div className="mx-auto max-w-7xl">
        <RevealSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-600/20 bg-teal-600/10 px-4 py-1.5 text-sm font-semibold text-teal-600 mb-4">
            ✨ {language === "vi" ? "Dịch Vụ Của Chúng Tôi" : "Our Services"}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            {language === "vi" ? "Chăm Sóc Xe Chuyên Nghiệp" : "Professional Car Care"}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            {language === "vi" 
              ? "Từ rửa nhanh đến chi tiết toàn diện — chúng tôi có tất cả những gì xe bạn cần."
              : "From quick express washes to full detailing — we cover everything your car needs."}
          </p>
        </RevealSection>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => (
            <div
              key={service.id}
              className="transition-all duration-700"
              style={{
                transitionDelay: `${i * 80}ms`,
              }}
            >
              <div className="group relative flex flex-col rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 transition-all hover:border-teal-600/40 hover:shadow-xl hover:-translate-y-1">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 space-y-3">
                  <div className="text-3xl">{service.icon}</div>
                  <div>
                    <h3 className="font-bold text-foreground">{service.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {service.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <div className="text-xl font-extrabold text-teal-600">{formatBookingCurrency(service.price)}</div>
                      <div className="text-xs text-muted-foreground">{service.duration}</div>
                    </div>
                    <Button
                      onClick={() => onOpenAuth("login")}
                      className="flex items-center gap-1 rounded-xl bg-teal-600/10 px-3 py-2 text-xs font-semibold text-teal-600 hover:bg-teal-600 hover:text-white transition-all h-8"
                    >
                      {language === "vi" ? "Đặt" : "Book"} <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BeforeAfterSection({ language }: { language: "vi" | "en" }) {
  return (
    <section className="py-20 px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <RevealSection className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            {language === "vi" ? "Thấy Sự Khác Biệt" : "See The Difference"}
          </h2>
          <p className="text-muted-foreground mt-2">
            {language === "vi" ? "Kết quả thực tế từ khách hàng thực tế" : "Real results from real customers"}
          </p>
        </RevealSection>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <RevealSection>
            <div className="relative overflow-hidden rounded-2xl aspect-video group">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
                alt="Before"
                className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                loading="lazy"
              />
              <div className="absolute top-3 left-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white">
                {language === "vi" ? "TRƯỚC" : "BEFORE"}
              </div>
            </div>
          </RevealSection>
          <RevealSection>
            <div className="relative overflow-hidden rounded-2xl aspect-video group">
              <img
                src="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80"
                alt="After"
                className="h-full w-full object-cover transition-all duration-700"
                loading="lazy"
              />
              <div className="absolute top-3 left-3 rounded-full bg-teal-600 px-3 py-1 text-xs font-bold text-white">
                {language === "vi" ? "SAU" : "AFTER"}
              </div>
              <div className="absolute inset-0 ring-2 ring-teal-600/40 rounded-2xl pointer-events-none" />
            </div>
          </RevealSection>
        </div>

        <RevealSection>
          <div className="rounded-2xl border border-teal-600/20 bg-teal-600/5 p-6 text-center">
            <div className="text-lg font-bold text-slate-900">
              🛡️ {language === "vi" ? "Cam Kết Hoàn Tiền 100%" : "100% Money Back Guarantee"}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {language === "vi" 
                ? "Không hài lòng với chất lượng? Chúng tôi hoàn lại toàn bộ tiền." 
                : "Not satisfied with the quality? We'll refund every penny."}
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}

function CombosSection({ onOpenAuth, language, combos }: { onOpenAuth: (mode: "login" | "register") => void, language: "vi" | "en", combos: any[] }) {
  return (
    <section id="combos" className="py-20 px-4 md:px-8 bg-teal-50/30">
      <div className="mx-auto max-w-7xl">
        <RevealSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-600/20 bg-teal-600/10 px-4 py-1.5 text-sm font-semibold text-teal-600 mb-4">
            💎 {language === "vi" ? "Gói Tháng" : "Monthly Packages"}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            {language === "vi" ? "Tiết Kiệm Hơn Với Gói Tháng" : "Save More With Combos"}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            {language === "vi"
              ? "Đăng ký theo tháng và tiết kiệm đến 35% so với đặt lịch từng lần."
              : "Subscribe monthly and save up to 35% compared to single bookings."}
          </p>
        </RevealSection>

        <div className="grid gap-8 md:grid-cols-3">
          {combos.map((combo) => {
            const savings = combo.originalPrice - combo.comboPrice;
            return (
              <RevealSection key={combo.id}>
                <div
                  className={cn(
                    "relative flex flex-col rounded-3xl border p-6 transition-all hover:-translate-y-1 hover:shadow-2xl",
                    combo.highlight
                      ? "border-teal-600 bg-teal-600/5 shadow-xl shadow-teal-600/20"
                      : "border-border/50 bg-card/60 backdrop-blur-sm hover:border-teal-600/40",
                  )}
                >
                  {combo.badge && (
                    <div
                      className={cn(
                        "absolute -top-3 left-6 rounded-full px-4 py-1 text-xs font-bold shadow-sm",
                        combo.highlight
                          ? "bg-teal-600 text-white"
                          : "bg-slate-900 text-white",
                      )}
                    >
                      {combo.badge}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-foreground">{combo.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {combo.description}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="text-3xl font-extrabold text-teal-600">
                        {formatBookingCurrency(combo.comboPrice)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground line-through">
                          {formatBookingCurrency(combo.originalPrice)}
                        </span>
                        <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-bold text-green-600">
                          -{language === "vi" ? "Tiết kiệm" : "Save"} {formatBookingCurrency(savings)}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {combo.services.map((s: string) => (
                        <li key={s} className="flex items-center gap-2 text-sm font-medium">
                          <Check className="h-4 w-4 text-teal-600 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => onOpenAuth("login")}
                      className={cn(
                        "flex w-full items-center justify-center gap-2 rounded-xl py-6 text-sm font-bold transition-all h-12",
                        combo.highlight
                          ? "bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-600/30"
                          : "border border-border/60 bg-background/60 hover:bg-accent text-slate-900",
                      )}
                    >
                      {language === "vi" ? "Mua Gói Này" : "Get This Pack"} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </RevealSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ReviewsSection({ language, testimonials }: { language: "vi" | "en", testimonials: any[] }) {
  return (
    <section id="reviews" className="py-20 px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <RevealSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-600/20 bg-teal-600/10 px-4 py-1.5 text-sm font-semibold text-teal-600 mb-4">
            ⭐ {language === "vi" ? "Đánh Giá Khách Hàng" : "Customer Reviews"}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            {language === "vi" ? "Khách Hàng Nói Gì Về Chúng Tôi" : "What Our Customers Say"}
          </h2>
        </RevealSection>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((review, i) => (
            <RevealSection key={review.id}>
              <div className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 space-y-4 hover:border-teal-600/30 hover:shadow-lg transition-all">
                <Quote className="h-6 w-6 text-teal-600/30 absolute top-4 right-4" />
                <div className="flex gap-1">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground italic">
                  "{review.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-teal-600/15 flex items-center justify-center text-sm font-bold text-teal-600">
                    {review.name.charAt(review.name.lastIndexOf(" ") + 1)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900">{review.name}</div>
                    <div className="text-xs text-muted-foreground">{review.vehicle || "Customer"}</div>
                  </div>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToActionSection({ onOpenAuth, language }: { onOpenAuth: (mode: "login" | "register") => void, language: "vi" | "en" }) {
  return (
    <section className="py-20 px-4 md:px-8 bg-teal-50/10">
      <RevealSection>
        <div className="mx-auto max-w-4xl text-center space-y-6 rounded-3xl border border-teal-600/20 bg-gradient-to-br from-teal-600/10 via-background to-blue-500/10 p-12 shadow-xl relative overflow-hidden">
          <div
            className="absolute top-4 right-8 text-4xl opacity-10 pointer-events-none"
            style={{ animation: "spin 20s linear infinite" }}
          >
            💧
          </div>
          <div
            className="absolute bottom-4 left-8 text-3xl opacity-10 pointer-events-none"
            style={{ animation: "spin 15s linear infinite reverse" }}
          >
            💧
          </div>
          <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>

          <h2 className="text-3xl md:text-4xl font-extrabold relative z-10 text-slate-900">
            {language === "vi" ? "Sẵn Sàng Đặt Lịch Rửa Xe?" : "Ready to Book Your First Wash?"}
          </h2>
          <p className="text-muted-foreground relative z-10">
            {language === "vi" 
              ? "Hàng nghìn chủ xe tại TP.HCM đã tin tưởng chúng tôi." 
              : "Join thousands of happy car owners in HCMC."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10 mt-8">
            <Button
              onClick={() => onOpenAuth("register")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-8 py-6 text-base font-bold text-white shadow-lg shadow-teal-600/30 hover:bg-teal-700 hover:-translate-y-1 transition-all"
            >
              {language === "vi" ? "Tạo Tài Khoản Miễn Phí" : "Create Free Account"}{" "}
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => onOpenAuth("login")}
              variant="outline"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-background/60 px-8 py-6 text-base font-semibold hover:bg-accent transition-all"
            >
              {language === "vi" ? "Đăng Nhập" : "Sign In"}
            </Button>
          </div>
        </div>
      </RevealSection>
    </section>
  );
}

function PublicFooter({ copy }: { copy: Record<string, string> }) {
  return (
    <footer className="relative overflow-hidden border-t border-teal-100/80 bg-[#f7fbfa]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_18%_0%,rgba(20,184,166,0.08),transparent_30%),radial-gradient(circle_at_84%_0%,rgba(20,184,166,0.06),transparent_28%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.7fr_1fr] lg:items-start">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-[0_10px_26px_rgba(15,118,110,0.08)] ring-1 ring-teal-100">
                <img src="/logo.png" alt="AutoWash Pro" className="h-8 w-8 rounded-lg object-cover" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal-700">AutoWash Pro</p>
                <h2 className="text-lg font-black tracking-tight text-slate-950">Aura Car Care</h2>
              </div>
            </div>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-600">
              {copy.footerDesc}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-700">{copy.footerQuickLinks}</p>
            <nav className="mt-5 grid gap-2.5 text-sm">
              {navigationItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="w-fit font-medium text-slate-600 transition hover:text-teal-800"
                >
                  {item.label === "Services" ? copy.navServices : item.label === "Packages" ? copy.navCombos : item.label === "Reviews" ? copy.navReviews : copy.navContact}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-700">{copy.footerContact}</p>
            <div className="mt-5 grid gap-2.5 text-sm leading-7 text-slate-600">
              <p className="font-medium text-slate-800">{copy.footerAddress}</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                <a className="font-medium text-slate-700 transition hover:text-teal-800" href={`tel:${copy.footerPhone.replace(/\s/g, "")}`}>
                  {copy.footerPhone}
                </a>
                <a className="break-all font-medium text-slate-700 transition hover:text-teal-800" href={`mailto:${copy.footerEmail}`}>
                  {copy.footerEmail}
                </a>
              </div>
              <p className="font-medium text-slate-500">{copy.footerHours}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-teal-100/80 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {copy.footerRights}</p>
          <div className="flex flex-wrap gap-3 text-slate-500">
            <span>Light theme</span>
            <span className="text-teal-600">/</span>
            <span>Touchless wash</span>
            <span className="text-teal-600">/</span>
            <span>Real-time booking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
"""

with open(r"e:\SU26\SWP391\autowash-frontend\src\features\public\components\home-page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("File updated successfully.")

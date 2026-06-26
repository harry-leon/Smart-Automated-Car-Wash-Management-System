"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, useCallback, useMemo, type FormEvent, type ChangeEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  type LucideIcon,
  Menu,
  Quote,
  Shield,
  Sparkles,
  Star,
  X,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Phone,
  UserRound,
  LockKeyhole,
  ShieldCheck,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatBookingCurrency } from "@/features/customer/bookings/lib/booking-format";
import { cn } from "@/shared/lib/utils";
import { useCustomerLogin, useCustomerRegister, useSendCustomerOtp, useVerifyCustomerOtp } from "@/features/auth/hooks/use-auth";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { emailPattern, otpPattern, passwordPattern, phonePattern } from "@/shared/lib/validators";
import { getDisplayErrorMessage, getFieldErrorMessage } from "@/shared/lib/api-errors";
import { getAuthRedirectPath } from "@/features/auth/lib/auth-session";
import { getPasswordVisibilityState } from "@/features/auth/lib/password-visibility";
import { getLoginIdentifierValidationMessage, normalizeLoginIdentifier } from "@/features/auth/lib/login-identifier";
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
    tagline: "Hệ thống chăm sóc xe thế hệ mới",
    heroTitle: "Rửa xe chuyên nghiệp với công nghệ hiện đại tại TP.HCM.",
    heroSubtitle: "Đặt lịch trong 30 giây. Không chờ xếp hàng. Hoàn thiện cao cấp, minh bạch từng bước.",
    bookNow: "Đặt lịch ngay",
    viewServices: "Xem dịch vụ",
    featureBookingTitle: "Đặt trong 30 giây",
    featureBookingDesc: "Chọn khung giờ và xác nhận tức thì.",
    featurePromiseTitle: "Hoàn tiền 100%",
    featurePromiseDesc: "Cam kết chất lượng dịch vụ hàng đầu.",
    featureLoungeTitle: "Phòng chờ 5 sao",
    featureLoungeDesc: "Wi-Fi, nước uống và không gian mát mẻ.",
    facilityTitle: "Trải nghiệm dịch vụ đẳng cấp.",
    facilityDesc: "Nghỉ tại khu chờ tiện nghi trong lúc đội ngũ kỹ thuật hoàn thiện quy trình rửa không chạm và chăm sóc bóng sơn.",
    beforeLabel: "Trước khi rửa",
    afterLabel: "Sau khi rửa",
    beforeDesc: "Lấm bẩn, bám bụi và xỉn màu.",
    afterDesc: "Hoàn thiện với độ bóng vượt trội và sạch sẽ từng chi tiết.",
    loungeDesc: "Thưởng thức cà phê đặc sản, Wi-Fi tốc độ cao và máy điều hòa mát mẻ trong phòng chờ hiện đại của chúng tôi.",
    loungeTag: "Áp dụng cho mọi lịch đặt",
    servicesTitle: "Giá cả rõ ràng. Chất lượng vượt trội.",
    servicesDesc: "Chọn gói dịch vụ phù hợp với nhu cầu chăm sóc xe của bạn. Tất cả các gói đều sử dụng bọt cao cấp và nước lọc tinh khiết RO.",
    promiseEyebrow: "Cam kết của chúng tôi",
    promiseTitle: "Quy trình kiểm chuẩn chất lượng Đức.",
    promiseDesc: "Mỗi xe được quét tự động trước khi rửa để đảm bảo an toàn. Hệ thống phun không chạm giúp hạn chế trầy xước tối đa.",
    promiseTouchless: "Không chạm",
    promiseScratches: "Hạn chế xước sơn",
    combosTitle: "Gói chăm sóc xe toàn diện.",
    combosDesc: "Tiết kiệm đến 30% khi chọn combo. Quy trình chăm sóc hoàn tất dưới 45 phút với dung dịch bảo vệ bóng sơn cao cấp.",
    reviewsTitle: "Hơn 10,000 khách hàng hài lòng.",
    reviewsDesc: "Đọc phản hồi từ những khách hàng thực tế đã tin tưởng giao xe cho Aura Car Care.",
    ctaEyebrow: "Đặt lịch chỉ trong vài giây",
    ctaTitle: "Trải nghiệm dịch vụ chăm sóc xe cao cấp ngay hôm nay.",
    ctaDesc: "Chọn khung giờ trực tuyến và bỏ qua hàng chờ. Quy trình rửa xe được theo dõi minh bạch.",
    ctaButton: "Đặt lịch rửa xe ngay",
    footerDesc: "Hệ thống rửa xe tự động không chạm theo tiêu chuẩn kiểm tra hiện đại.",
    footerHours: "T2 - CN: 7:00 AM - 8:00 PM",
    footerRights: "Bản quyền thuộc về Aura Car Care. Bảo lưu mọi quyền.",
    resultsEyebrow: "Cam kết của chúng tôi",
    resultsTitle: "Chẩn đoán chất lượng tiêu chuẩn Đức.",
    resultsDesc: "Mỗi xe được quét tự động trước khi rửa để đảm bảo an toàn. Hệ thống phun không chạm giúp hạn chế trầy xước tối đa.",
    resultsTouchless: "Không chạm",
    resultsScratches: "Trầy xước sơn",
    combosEyebrow: "Gói Combo AURA",
    reviewsEyebrow: "Đánh giá từ khách hàng",
    footerQuickLinks: "Liên kết nhanh",
    footerContact: "Liên hệ",
    footerAddress: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
    footerPhone: "0901 234 567",
    footerEmail: "contact@auracarcare.vn",
    getThisPack: "Nhận gói này",
    savingsLabel: "Tiết kiệm",
  },
  en: {
    navServices: "Services",
    navCombos: "Combos",
    navReviews: "Reviews",
    navContact: "Contact",
    login: "Login",
    register: "Sign Up",
    tagline: "",
    heroTitle: "Professional car wash with modern technology in HCMC.",
    heroSubtitle: "Book in 30 seconds. Skip the line. Premium finish, fully transparent.",
    bookNow: "Book Now",
    viewServices: "View Services",
    featureBookingTitle: "Book in 30s",
    featureBookingDesc: "Select your time slot and get instant confirmation.",
    featurePromiseTitle: "100% Satisfaction",
    featurePromiseDesc: "Satisfaction-first premium service promise.",
    featureLoungeTitle: "5-Star Lounge",
    featureLoungeDesc: "Wi-Fi, drinks, and a comfortable waiting space.",
    facilityTitle: "Unmatched service experience.",
    facilityDesc: "Relax in our comfortable waiting lounge while our technical team completes the touchless wash and paint gloss care.",
    beforeLabel: "Before",
    afterLabel: "After",
    beforeDesc: "Dirty, dusty, and lost gloss.",
    afterDesc: "Finished with premium gloss and clean details.",
    loungeDesc: "Enjoy specialty coffee, free high-speed Wi-Fi, and air conditioning inside our modern viewing lounge.",
    loungeTag: "Available for all bookings",
    servicesTitle: "Clear pricing. Premium results.",
    servicesDesc: "Choose a service package that fits your vehicle care needs. All washes utilize premium foam and RO purified water.",
    promiseEyebrow: "Our Promise",
    promiseTitle: "German standard diagnostics & safety.",
    promiseDesc: "Each vehicle is scanned automatically before washing to ensure safety. The touchless spray system minimizes paint scratches.",
    promiseTouchless: "Touchless Wash",
    promiseScratches: "Paint Protection",
    combosTitle: "Complete vehicle care packages.",
    combosDesc: "Save up to 30% with combo packages. Care completed in under 45 minutes with premium paint sealant protection.",
    reviewsTitle: "Over 10,000 satisfied reviews.",
    reviewsDesc: "Read verified feedback from our daily customers who trust Aura Car Care with their vehicles.",
    ctaEyebrow: "Book in seconds",
    ctaTitle: "Experience premium car care today.",
    ctaDesc: "Choose your time slot online and skip the line. The touchless wash process is transparently monitored.",
    ctaButton: "Book Your Wash Now",
    footerDesc: "Automated touchless car wash system adhering to modern quality standards.",
    footerHours: "Mon - Sun: 7:00 AM - 8:00 PM",
    footerRights: "Aura Car Care. All rights reserved.",
    resultsEyebrow: "Our Promise",
    resultsTitle: "German standard diagnostics & safety.",
    resultsDesc: "Each vehicle is scanned automatically before washing to ensure safety. The touchless spray system minimizes paint scratches.",
    resultsTouchless: "Touchless Wash",
    resultsScratches: "Paint Protection",
    combosEyebrow: "Aura Combos",
    reviewsEyebrow: "Aura Reviews",
    footerQuickLinks: "Quick links",
    footerContact: "Contact",
    footerAddress: "123 Nguyen Van Linh, District 7, HCMC",
    footerPhone: "0901 234 567",
    footerEmail: "contact@auracarcare.vn",
    getThisPack: "Get this pack",
    savingsLabel: "Save",
  }
};

const navigationItems = [
  { href: "#services", label: "Services" },
  { href: "#combos", label: "Packages" },
  { href: "#reviews", label: "Reviews" },
  { href: "#contact", label: "Contact" },
];

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
        // Clear query parameter from the URL bar without reloading
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_18%_8%,rgba(20,184,166,0.10),transparent_30%),radial-gradient(circle_at_82%_4%,rgba(45,212,191,0.08),transparent_28%),linear-gradient(180deg,#f8fbfb_0%,#ffffff_44%,#f6fbfa_72%,#f1faf7_100%)] text-slate-950">
      <MotionStyles />
      <PublicHeader onOpenAuth={handleOpenAuth} language={language} onChangeLanguage={setLanguage} copy={copy} />
      <HeroSection onOpenAuth={handleOpenAuth} copy={copy} />
      <FacilitySection copy={copy} />
      <ServicesSection onOpenAuth={handleOpenAuth} copy={copy} services={translatedServices} />
      <ResultsSection copy={copy} />
      <CombosSection onOpenAuth={handleOpenAuth} copy={copy} combos={translatedCombos} />
      <ReviewsSection copy={copy} testimonials={translatedTestimonials} />
      <CallToActionSection onOpenAuth={handleOpenAuth} copy={copy} />
      <PublicFooter copy={copy} />

      {/* Side-by-side Auth Modal Popup */}
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
    </main>
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
          {/* Aesthetic Language Switcher Capsule */}
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
                  onClick={() => {
                    onChangeLanguage(item);
                  }}
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

function HeroSection({ onOpenAuth, copy }: { onOpenAuth: (mode: "login" | "register") => void; copy: Record<string, string> }) {
  return (
    <section className="relative overflow-hidden pt-20">
      <div className="absolute inset-x-0 top-0 h-[44rem] animate-[heroGlow_14s_ease-in-out_infinite] bg-[radial-gradient(circle_at_14%_10%,rgba(153,246,228,0.42),transparent_34%),radial-gradient(circle_at_100%_0%,rgba(125,211,252,0.26),transparent_30%)]" />
      <div className="absolute left-1/2 top-20 h-px w-[min(72rem,80vw)] -translate-x-1/2 bg-gradient-to-r from-transparent via-teal-200/70 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-14 px-4 pb-24 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[0.96fr_1.04fr] lg:items-center lg:px-8 lg:pb-28">
        <div className="relative z-10">
          <FadeIn delay={100}>
            <h1 className="max-w-3xl break-words text-[clamp(2.35rem,8vw,5.65rem)] font-black leading-[0.95] tracking-[-0.045em] text-slate-950 sm:text-[clamp(3rem,6vw,5.65rem)]">
              {copy.heroTitle}
            </h1>
          </FadeIn>

          <FadeIn delay={180}>
            <p className="mt-7 max-w-xl break-words text-lg leading-8 text-slate-600 sm:text-xl">
              {copy.heroSubtitle}
            </p>
          </FadeIn>

          <FadeIn delay={260}>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="h-12 rounded-full bg-teal-600 px-7 text-sm font-semibold shadow-[0_18px_40px_rgba(15,118,110,0.28)] transition-transform duration-300 hover:scale-[1.02] hover:bg-teal-700"
                onClick={() => onOpenAuth("login")}
              >
                {copy.bookNow}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-full px-7 text-sm font-semibold transition-transform duration-300 hover:scale-[1.02]"
                asChild
              >
                <a href="#services">{copy.viewServices}</a>
              </Button>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            <FadeIn delay={340}>
              <TrustItem icon={Clock3} title={copy.featureBookingTitle} description={copy.featureBookingDesc} />
            </FadeIn>
            <FadeIn delay={420}>
              <TrustItem icon={Shield} title={copy.featurePromiseTitle} description={copy.featurePromiseDesc} />
            </FadeIn>
            <FadeIn delay={500}>
              <TrustItem icon={Star} title={copy.featureLoungeTitle} description={copy.featureLoungeDesc} />
            </FadeIn>
          </div>
        </div>

        <FadeIn delay={180} className="relative z-10" yClass="translate-y-10 md:translate-y-0 md:translate-x-4">
          <div className="absolute -inset-x-6 top-8 h-64 animate-[floatSoft_9s_ease-in-out_infinite] rounded-full bg-teal-200/32 blur-3xl" />
          <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
            <div className="relative min-h-[30rem] overflow-hidden rounded-[1.35rem] border border-white/80 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.16)] transition-transform duration-500 hover:-translate-y-1">
              <img
                src={homeGallery[0].src}
                alt={homeGallery[0].alt}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/62 via-slate-950/14 to-transparent p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-100">
                  {copy.navServices === "Dịch vụ" ? "Không gian AURA" : "AURA Facility"}
                </p>
                <h2 className="mt-2 max-w-sm text-2xl font-bold tracking-tight">
                  {copy.navServices === "Dịch vụ" ? "Rửa bọt không chạm với hoàn thiện cao cấp" : "Touchless foam wash with premium finish"}
                </h2>
              </div>
            </div>

            <div className="grid content-start gap-4">
              <div className="rounded-[1.15rem] border border-white/80 bg-white/[0.88] p-5 shadow-[0_24px_70px_rgba(15,118,110,0.14)] backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
                  {copy.navServices === "Dịch vụ" ? "Tại sao chọn chúng tôi" : "Why drivers choose us"}
                </p>
                <div className="mt-5 grid gap-3">
                  {(copy.navServices === "Dịch vụ"
                    ? [
                        "Rửa không chạm bảo vệ bề mặt sơn",
                        "Đặt lịch thời gian thực với khung giờ rõ ràng",
                        "Tích điểm thưởng sau mỗi lần rửa",
                      ]
                    : [
                        "Touchless wash protects paint surface",
                        "Real-time booking with clear time slots",
                        "Loyalty rewards every visit",
                      ]
                  ).map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-lg bg-teal-50/70 px-3 py-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-teal-700 shadow-sm">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.15rem] border border-white/80 bg-white shadow-[0_28px_70px_rgba(15,23,42,0.14)] transition-transform duration-500 hover:-translate-y-1">
                <img
                  src={homeGallery[2].src}
                  alt={homeGallery[2].alt}
                  className="h-40 w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                />
                <div className="space-y-2 p-5 text-slate-950">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
                    ECO-FRIENDLY
                  </p>
                  <h3 className="text-lg font-bold tracking-tight">
                    {copy.navServices === "Dịch vụ" ? "Hệ thống lọc nước tuần hoàn" : "Recycled water filtration system"}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function FacilitySection({ copy }: { copy: Record<string, string> }) {
  return (
    <SectionShell
      id="facility"
      eyebrow={copy.navServices === "Dịch vụ" ? "Không gian AURA" : "Aura facility"}
      title={copy.facilityTitle}
      description={copy.facilityDesc}
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <BeforeAfterCard image={homeGallery[1].src} title={copy.beforeLabel} tone="bg-rose-100 text-rose-800 border border-rose-200" copy={copy} />
        <BeforeAfterCard image={homeGallery[3].src} title={copy.afterLabel} tone="bg-emerald-100 text-emerald-800 border border-emerald-200" copy={copy} />
        <div className="flex min-h-[340px] flex-col justify-between rounded-[1.15rem] border border-teal-100 bg-[linear-gradient(180deg,#ffffff_0%,#f0fdfa_100%)] p-7 shadow-[0_22px_60px_rgba(15,118,110,0.10)] transition-transform duration-500 hover:-translate-y-1">
          <div>
            <span className="text-3xl">☕</span>
            <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-950">
              {copy.featureLoungeTitle}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {copy.loungeDesc}
            </p>
          </div>
          <div className="mt-5 border-t border-teal-100 pt-5">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-800">{copy.loungeTag}</p>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function ServicesSection({
  onOpenAuth,
  copy,
  services,
}: {
  onOpenAuth: (mode: "login" | "register") => void;
  copy: Record<string, string>;
  services: any[];
}) {
  return (
    <SectionShell
      id="services"
      eyebrow={copy.navServices === "Dịch vụ" ? "Dịch vụ AURA" : "AURA Services"}
      title={copy.servicesTitle}
      description={copy.servicesDesc}
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} onOpenAuth={onOpenAuth} copy={copy} />
        ))}
      </div>
    </SectionShell>
  );
}

function ResultsSection({ copy }: { copy: Record<string, string> }) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f7fbfb_100%)] py-24 text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(20,184,166,0.10),transparent_40%)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">{copy.resultsEyebrow}</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              {copy.resultsTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              {copy.resultsDesc}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="border-l-2 border-teal-400 pl-4">
                <p className="text-2xl font-black tracking-tight text-slate-950">100%</p>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mt-1">{copy.resultsTouchless}</p>
              </div>
              <div className="border-l-2 border-teal-400 pl-4">
                <p className="text-2xl font-black tracking-tight text-slate-950">0%</p>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mt-1">{copy.resultsScratches}</p>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-[1.15rem] border border-white bg-white shadow-[0_30px_80px_rgba(15,23,42,0.13),0_0_0_1px_rgba(20,184,166,0.08)]">
            <img
              src={homeGallery[3]?.src || homeGallery[0]?.src}
              alt="Diagnostics check"
              className="h-80 w-full object-cover transition-transform duration-700 hover:scale-[1.03] sm:h-96"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function CombosSection({
  onOpenAuth,
  copy,
  combos,
}: {
  onOpenAuth: (mode: "login" | "register") => void;
  copy: Record<string, string>;
  combos: any[];
}) {
  return (
    <SectionShell
      id="combos"
      eyebrow={copy.combosEyebrow}
      title={copy.combosTitle}
      description={copy.combosDesc}
      className="bg-[linear-gradient(180deg,#f0fdfa_0%,#ffffff_100%)] py-24"
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {combos.map((combo) => (
          <ComboCard key={combo.id} combo={combo} onOpenAuth={onOpenAuth} copy={copy} />
        ))}
      </div>
    </SectionShell>
  );
}

function ReviewsSection({
  copy,
  testimonials,
}: {
  copy: Record<string, string>;
  testimonials: any[];
}) {
  return (
    <SectionShell
      id="reviews"
      eyebrow={copy.reviewsEyebrow}
      title={copy.reviewsTitle}
      description={copy.reviewsDesc}
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="flex flex-col justify-between rounded-[1.15rem] border border-teal-100 bg-white p-7 shadow-[0_18px_50px_rgba(15,118,110,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(15,118,110,0.13)]">
            <div>
              <Quote className="h-6 w-6 text-teal-100" />
              <p className="mt-4 text-sm leading-7 text-slate-700 italic">
                &ldquo;{testimonial.content}&rdquo;
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
              <div className="h-10 w-10 overflow-hidden rounded-full border border-teal-100 bg-slate-100">
                <div className="flex h-full w-full items-center justify-center bg-teal-50 text-xs font-bold text-teal-700">
                  {testimonial.name[0]}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-950">{testimonial.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function CallToActionSection({
  onOpenAuth,
  copy,
}: {
  onOpenAuth: (mode: "login" | "register") => void;
  copy: Record<string, string>;
}) {
  return (
    <section className="relative overflow-hidden bg-white px-4 py-24 text-slate-950 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(20,184,166,0.12),transparent_42%)]" />
      <div className="relative z-10 mx-auto max-w-5xl rounded-[1.35rem] border border-teal-100 bg-[linear-gradient(135deg,#ffffff_0%,#f0fdfa_100%)] px-6 py-14 text-center shadow-[0_32px_90px_rgba(15,118,110,0.14)] sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-700">{copy.ctaEyebrow}</p>
        <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
          {copy.ctaTitle}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600">
          {copy.ctaDesc}
        </p>
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            className="h-12 rounded-full bg-teal-600 px-8 text-sm font-semibold shadow-[0_16px_40px_rgba(15,118,110,0.24)] transition-all hover:scale-[1.02] hover:bg-teal-700 active:scale-[0.98]"
            onClick={() => onOpenAuth("login")}
          >
            {copy.ctaButton}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
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

function MotionStyles() {
  return (
    <style jsx global>{`
      @keyframes heroGlow {
        0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
        50% { transform: translate3d(0, 10px, 0) scale(1.02); }
      }
      @keyframes floatSoft {
        0%, 100% { transform: translate3d(0, 0, 0); }
        50% { transform: translate3d(0, -10px, 0); }
      }
    `}</style>
  );
}

function FadeIn({
  children,
  delay = 0,
  className,
  yClass = "translate-y-6",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  yClass?: string;
}) {
  return (
    <div
      className={cn(
        "animate-in fade-in duration-700 ease-out fill-mode-both motion-reduce:animate-none",
        yClass,
        className,
      )}
      style={{ animationDelay: `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out motion-reduce:transform-none motion-reduce:transition-none",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function SectionShell({
  id,
  eyebrow,
  title,
  description,
  className,
  invert = false,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
  invert?: boolean;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("px-4 py-20 sm:px-6 lg:px-8", className)}>
      <div className="mx-auto max-w-7xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p
            className={cn(
              "text-sm font-semibold uppercase tracking-[0.24em]",
              invert ? "text-teal-300" : "text-teal-700",
            )}
          >
            {eyebrow}
          </p>
          <h2
            className={cn(
              "mt-4 text-3xl font-black tracking-tight sm:text-4xl",
              invert ? "text-white" : "text-slate-950",
            )}
          >
            {title}
          </h2>
          <p className={cn("mt-4 text-base leading-7", invert ? "text-slate-300" : "text-slate-600")}>
            {description}
          </p>
        </Reveal>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

function TrustItem({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1rem] border border-white/80 bg-white/85 p-4 shadow-[0_18px_46px_rgba(15,118,110,0.10)] backdrop-blur transition-transform duration-300 hover:-translate-y-1">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
    </div>
  );
}

function MiniFeatureCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[1.15rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_56px_rgba(15,118,110,0.12)] backdrop-blur transition-transform duration-500 hover:-translate-y-1">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">{title}</p>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3 rounded-lg bg-teal-50/70 px-4 py-3 transition duration-300 hover:bg-teal-100/70">
            <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Check className="h-3.5 w-3.5" />
            </div>
            <p className="text-sm font-medium leading-6 text-slate-700">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceCard({
  service,
  onOpenAuth,
  copy,
}: {
  service: HomeService;
  onOpenAuth: (mode: "login") => void;
  copy: Record<string, string>;
}) {
  return (
    <article className="group rounded-[1.15rem] border border-teal-100 bg-white p-6 shadow-[0_18px_50px_rgba(15,118,110,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_76px_rgba(15,118,110,0.14)]">
      <div className="flex items-center justify-between">
        <span className="text-3xl transition-transform duration-300 group-hover:scale-110">{service.icon}</span>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
          {service.duration}
        </span>
      </div>
      <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-950">{service.name}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{service.description}</p>
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
        <div>
          <p className="text-2xl font-black tracking-tight text-primary">
            {formatBookingCurrency(service.price)}
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-full px-4 text-sm font-semibold transition-transform duration-300 hover:scale-[1.02]"
          onClick={() => onOpenAuth("login")}
        >
          {copy.navServices === "Dịch vụ" ? "Đặt lịch" : "Book Now"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}

function BeforeAfterCard({
  title,
  image,
  tone,
  copy,
}: {
  title: string;
  image: string;
  tone: string;
  copy: Record<string, string>;
}) {
  const isVi = copy.navServices === "Dịch vụ";
  const isBefore = title === copy.beforeLabel;
  return (
    <div className="overflow-hidden rounded-[1.15rem] border border-teal-100 bg-white shadow-[0_22px_60px_rgba(15,118,110,0.10)] transition-transform duration-500 hover:-translate-y-1">
      <div className="relative">
        <img
          src={image}
          alt={title}
          className="h-[18rem] w-full object-cover transition-transform duration-700 hover:scale-[1.03] sm:h-[24rem]"
        />
        <div className={cn("absolute left-5 top-5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]", tone)}>
          {title}
        </div>
      </div>
      <div className="p-6">
        <p className="text-lg font-semibold text-slate-950">
          {isBefore ? copy.beforeDesc : copy.afterDesc}
        </p>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          {isVi
            ? "Quy trình vận hành luôn nhất quán. Chúng tôi liên tục cập nhật công nghệ để đem lại sự hài lòng cao nhất cho khách hàng."
            : "The business flow stays intact. We continually update our tech to deliver the highest satisfaction to our customers."}
        </p>
      </div>
    </div>
  );
}

function ComboCard({
  combo,
  onOpenAuth,
  copy,
}: {
  combo: HomeCombo;
  onOpenAuth: (mode: "login") => void;
  copy: Record<string, string>;
}) {
  const savings = combo.originalPrice - combo.comboPrice;

  return (
    <article
      className={cn(
        "relative rounded-lg border p-7 shadow-[0_18px_44px_rgba(15,118,110,0.10)] transition-transform duration-500 hover:-translate-y-1",
        combo.highlight
          ? "border-teal-300 bg-white"
          : "border-teal-100 bg-white backdrop-blur-sm",
      )}
    >
      {combo.badge ? (
        <span
          className={cn(
            "absolute left-7 top-0 -translate-y-1/2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em]",
            combo.highlight ? "bg-teal-600 text-white" : "bg-teal-100 text-teal-800",
          )}
        >
          {combo.badge}
        </span>
      ) : null}

      <div className="pt-2">
        <h3 className="text-2xl font-bold tracking-tight text-slate-950">{combo.name}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">{combo.description}</p>
      </div>

      <div className="mt-6 border-y border-teal-100 py-6">
        <p className="text-3xl font-black tracking-tight text-slate-950">
          {formatBookingCurrency(combo.comboPrice)}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-slate-400 line-through">
            {formatBookingCurrency(combo.originalPrice)}
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
            {copy.savingsLabel} {formatBookingCurrency(savings)}
          </span>
        </div>
      </div>

      <ul className="mt-6 grid gap-3">
        {combo.services.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <Check className="h-3.5 w-3.5" />
            </span>
            {item}
          </li>
        ))}
      </ul>

      <Button
        variant={combo.highlight ? "default" : "secondary"}
        size="lg"
        className={cn(
          "mt-8 h-12 w-full rounded-full text-sm font-semibold transition-transform duration-300 hover:scale-[1.02]",
          combo.highlight
            ? "bg-teal-600 text-white hover:bg-teal-700"
            : "bg-teal-50 text-teal-800 hover:bg-teal-100",
        )}
        onClick={() => onOpenAuth("login")}
      >
        {copy.getThisPack}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </article>
  );
}

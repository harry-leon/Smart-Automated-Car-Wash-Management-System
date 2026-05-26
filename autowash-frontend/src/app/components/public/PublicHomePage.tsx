"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { Star, ArrowRight, Quote } from "lucide-react";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";
import { HeroSection } from "./HeroSection";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Unsplash real car wash images (free to use)
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

// Mock service data
const SERVICES = [
  {
    id: "express",
    title: { en: "Express Wash", vi: "Rửa Nhanh" },
    desc: { en: "Quick exterior clean", vi: "Rửa ngoài nhanh" },
    price: 50000,
    duration: "15 min",
  },
  {
    id: "standard",
    title: { en: "Standard Wash", vi: "Rửa Chuẩn" },
    desc: { en: "Exterior + interior vacuum", vi: "Rửa ngoài + hút nội thất" },
    price: 120000,
    duration: "30 min",
  },
  {
    id: "deluxe",
    title: { en: "Deluxe Care", vi: "Chăm Sóc Cao Cấp" },
    desc: { en: "Full detail + wax", vi: "Chi tiết toàn diện + sáp bảo vệ" },
    price: 250000,
    duration: "45 min",
  },
  {
    id: "premium",
    title: { en: "Premium Detailing", vi: "Chi Tiết Đặc Biệt" },
    desc: { en: "Professional deep clean", vi: "Vệ sinh chuyên sâu" },
    price: 400000,
    duration: "60 min",
  },
];

// Mock combo data
const COMBOS = [
  {
    id: "basic",
    title: { en: "Basic Monthly", vi: "Gói Tháng Cơ Bản" },
    washes: 4,
    savings: "15%",
  },
  {
    id: "pro",
    title: { en: "Pro Monthly", vi: "Gói Tháng Pro" },
    washes: 8,
    savings: "25%",
  },
  {
    id: "elite",
    title: { en: "Elite Monthly", vi: "Gói Tháng Elite" },
    washes: 12,
    savings: "35%",
  },
];

// Mock testimonials
const TESTIMONIALS = [
  {
    id: 1,
    name: "Anh Minh Hoàng",
    vehicle: "BMW 3 Series",
    rating: 5,
    content: "Best car wash experience ever! Professional team, top-notch facility.",
    contentVi: "Dịch vụ rửa xe tốt nhất! Đội ngũ chuyên nghiệp, cơ sở hiện đại.",
  },
  {
    id: 2,
    name: "Chị Huỳnh Thuỷ",
    vehicle: "Toyota Camry",
    rating: 5,
    content: "Love the loyalty program! Save so much with the monthly package.",
    contentVi: "Yêu cái chương trình loyalty! Tiết kiệm rất nhiều với gói tháng.",
  },
  {
    id: 3,
    name: "Mr. David Lee",
    vehicle: "Honda CR-V",
    rating: 5,
    content: "Zero hassle booking. The 5-star lounge makes waiting enjoyable!",
    contentVi: "Đặt lịch dễ dàng. Phòng chờ 5 sao làm cho chờ đợi thành thú vui!",
  },
];

// Scroll-reveal hook
function useScrollReveal(threshold = 0.15) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
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

// Animated water wave divider
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
          className="fill-accent/30"
          style={{ animation: "waveSlow 8s ease-in-out infinite" }}
        />
        <path
          d="M0,48 C180,16 540,56 900,40 C1080,32 1260,52 1440,44 L1440,64 L0,64 Z"
          className="fill-accent/20"
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

// Photo gallery section
function PhotoGallery() {
  const { t } = useI18n();
  const { ref, visible } = useScrollReveal();
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
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
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
            📸 {t("ourFacility")}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold">
            {t("seeForYourself")}
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
                  {img.caption[Object.keys(img.caption).includes("en") ? "en" : "vi"] as string}
                </p>
              </div>
              {active === i && (
                <div className="absolute inset-0 ring-2 ring-primary ring-offset-2 rounded-2xl pointer-events-none" />
              )}
            </div>
          ))}
        </div>

        {/* Lightbox preview */}
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
              {CAR_WASH_IMAGES[active].caption.en}
            </p>
            <p className="text-sm opacity-80">
              AURA CAR CARE — TP. Hồ Chí Minh
            </p>
          </div>
          {/* Dot navigation */}
          <div className="absolute bottom-6 right-6 flex gap-2">
            {CAR_WASH_IMAGES.map((_, i) => (
              <button
                key={i}
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

// Services Section
function ServicesSection() {
  const { t } = useI18n();
  return (
    <section id="services" className="py-20 px-4 md:px-8 bg-accent/20">
      <div className="mx-auto max-w-7xl">
        <RevealSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
            ✨ {t("ourServices")}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {t("professionalCare")}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            {t("servicesDesc")}
          </p>
        </RevealSection>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, i) => (
            <RevealSection key={service.id}>
              <Card className="h-full p-6 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group">
                <div className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {service.title.en}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {service.desc.en}
                </p>
                <div className="mt-4 space-y-2">
                  <div className="text-2xl font-bold text-primary">
                    {(service.price / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {service.duration}
                  </div>
                </div>
              </Card>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// Before/After Section
function BeforeAfterSection() {
  const { t } = useI18n();
  return (
    <section className="py-20 px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <RevealSection className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold">
            {t("seeDifference")}
          </h2>
          <p className="text-muted-foreground mt-2">
            {t("realResults")}
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
                {t("before")}
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
              <div className="absolute top-3 left-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                {t("after")}
              </div>
              <div className="absolute inset-0 ring-2 ring-primary/40 rounded-2xl pointer-events-none" />
            </div>
          </RevealSection>
        </div>

        <RevealSection>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
            <div className="text-lg font-bold">
              🛡️ {t("moneyBackGuarantee")}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {t("guaranteeDesc")}
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}

// Combos Section
function CombosSection() {
  const { t } = useI18n();
  return (
    <section id="packages" className="py-20 px-4 md:px-8 bg-accent/20">
      <div className="mx-auto max-w-7xl">
        <RevealSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
            💎 {t("monthlyPackages")}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {t("saveMores")}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            {t("saveComboDesc")}
          </p>
        </RevealSection>

        <div className="grid gap-8 md:grid-cols-3">
          {COMBOS.map((combo) => (
            <RevealSection key={combo.id}>
              <Card className="h-full p-8 hover:shadow-lg hover:border-primary/30 hover:scale-105 transition-all cursor-pointer group relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                  Save {combo.savings}
                </div>
                <h3 className="text-xl font-bold">{combo.title.en}</h3>
                <div className="mt-4 space-y-3">
                  <div className="text-4xl font-bold text-primary">{combo.washes}</div>
                  <div className="text-sm text-muted-foreground">
                    washes per month
                  </div>
                </div>
                <Link href="/register" className="mt-6 block">
                  <Button className="w-full">Subscribe Now</Button>
                </Link>
              </Card>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection() {
  const { t } = useI18n();
  return (
    <section id="reviews" className="py-20 px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <RevealSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
            ⭐ {t("customerReviews")}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {t("whatCustomersSay")}
          </h2>
        </RevealSection>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((review) => (
            <RevealSection key={review.id}>
              <Card className="relative p-6 space-y-4 hover:border-primary/30 hover:shadow-lg transition-all">
                <Quote className="h-6 w-6 text-primary/30 absolute top-4 right-4" />
                <div className="flex gap-1">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  "{review.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{review.name}</div>
                    <div className="text-xs text-muted-foreground">{review.vehicle}</div>
                  </div>
                </div>
              </Card>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Banner Section
function CTABannerSection() {
  const { t } = useI18n();
  return (
    <section className="py-20 px-4 md:px-8 bg-accent/10">
      <RevealSection>
        <div className="mx-auto max-w-4xl text-center space-y-6 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-blue-500/10 p-12 shadow-xl relative overflow-hidden">
          {/* Decorative water drops */}
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

          <h2 className="text-3xl md:text-4xl font-extrabold relative z-10">
            {t("readyToBook")}
          </h2>
          <p className="text-muted-foreground relative z-10">
            {t("joinThousands")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                {t("createAccount")}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                {t("signIn")}
              </Button>
            </Link>
          </div>
        </div>
      </RevealSection>
    </section>
  );
}

export function PublicHomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <HeroSection />
      <PhotoGallery />
      <WaveDivider />
      <ServicesSection />
      <WaveDivider flip />
      <BeforeAfterSection />
      <WaveDivider />
      <CombosSection />
      <WaveDivider flip />
      <TestimonialsSection />
      <CTABannerSection />
      <PublicFooter />
    </div>
  );
}

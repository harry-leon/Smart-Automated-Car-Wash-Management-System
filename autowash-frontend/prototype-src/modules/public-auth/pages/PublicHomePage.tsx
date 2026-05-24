import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Star, ArrowRight, Quote } from "lucide-react";
import { PublicHeader } from "../components/PublicHeader";
import { PublicFooter } from "../components/PublicFooter";
import { HeroSection } from "../components/HeroSection";
import { PackagePreviewCard } from "../components/PackagePreviewCard";
import { ComboPreviewCard } from "../components/ComboPreviewCard";
import { useLanguage } from "../components/LanguageSwitcher";
import { HOMEPAGE_DATA } from "../mock/homepage.mock";

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

// Photo gallery section
function PhotoGallery() {
  const { t } = useLanguage();
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
            📸 {t("Our Facility", "Cơ Sở Của Chúng Tôi")}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold">
            {t("See It For Yourself", "Tận Mắt Chứng Kiến")}
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
                  {t(img.caption.en, img.caption.vi)}
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
              {t(CAR_WASH_IMAGES[active].caption.en, CAR_WASH_IMAGES[active].caption.vi)}
            </p>
            <p className="text-sm opacity-80">
              AURA CAR CARE — {t("Ho Chi Minh City", "TP. Hồ Chí Minh")}
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

function HomepageContent() {
  const { t } = useLanguage();
  const { services, combos, testimonials } = HOMEPAGE_DATA;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <HeroSection />

      {/* Real images gallery */}
      <PhotoGallery />

      <WaveDivider />

      {/* Services Section */}
      <section id="services" className="py-20 px-4 md:px-8 bg-accent/20">
        <div className="mx-auto max-w-7xl">
          <RevealSection className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
              ✨ {t("Our Services", "Dịch Vụ Của Chúng Tôi")}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {t("Professional Car Care", "Chăm Sóc Xe Chuyên Nghiệp")}
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              {t(
                "From quick express washes to full detailing — we cover everything your car needs.",
                "Từ rửa nhanh đến chi tiết toàn diện — chúng tôi có tất cả những gì xe bạn cần.",
              )}
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
                <PackagePreviewCard service={service} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider flip />

      {/* Before/After */}
      <section className="py-20 px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          <RevealSection className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold">
              {t("See The Difference", "Thấy Sự Khác Biệt")}
            </h2>
            <p className="text-muted-foreground mt-2">
              {t("Real results from real customers", "Kết quả thực tế từ khách hàng thực tế")}
            </p>
          </RevealSection>

          {/* Before/After image comparison */}
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
                  {t("BEFORE", "TRƯỚC")}
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
                  {t("AFTER", "SAU")}
                </div>
                <div className="absolute inset-0 ring-2 ring-primary/40 rounded-2xl pointer-events-none" />
              </div>
            </RevealSection>
          </div>

          <RevealSection>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
              <div className="text-lg font-bold">
                🛡️ {t("100% Money Back Guarantee", "Cam Kết Hoàn Tiền 100%")}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {t(
                  "Not satisfied with the quality? We'll refund every penny.",
                  "Không hài lòng với chất lượng? Chúng tôi hoàn lại toàn bộ tiền.",
                )}
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      <WaveDivider />

      {/* Monthly Combos */}
      <section id="combos" className="py-20 px-4 md:px-8 bg-accent/20">
        <div className="mx-auto max-w-7xl">
          <RevealSection className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
              💎 {t("Monthly Packages", "Gói Tháng")}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {t("Save More With Combos", "Tiết Kiệm Hơn Với Gói Tháng")}
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              {t(
                "Subscribe monthly and save up to 35% compared to single bookings.",
                "Đăng ký theo tháng và tiết kiệm đến 35% so với đặt lịch từng lần.",
              )}
            </p>
          </RevealSection>

          <div className="grid gap-8 md:grid-cols-3">
            {combos.map((combo) => (
              <RevealSection key={combo.id}>
                <ComboPreviewCard combo={combo} />
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider flip />

      {/* Testimonials */}
      <section id="reviews" className="py-20 px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          <RevealSection className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
              ⭐ {t("Customer Reviews", "Đánh Giá Khách Hàng")}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {t("What Our Customers Say", "Khách Hàng Nói Gì Về Chúng Tôi")}
            </h2>
          </RevealSection>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((review, i) => (
              <RevealSection key={review.id}>
                <div className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 space-y-4 hover:border-primary/30 hover:shadow-lg transition-all">
                  <Quote className="h-6 w-6 text-primary/30 absolute top-4 right-4" />
                  <div className="flex gap-1">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    "{t(review.content, review.contentVi)}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">
                      {review.name.charAt(review.name.lastIndexOf(" ") + 1)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{review.name}</div>
                      <div className="text-xs text-muted-foreground">{review.vehicle}</div>
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
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
              {t("Ready to Book Your First Wash?", "Sẵn Sàng Đặt Lịch Rửa Xe?")}
            </h2>
            <p className="text-muted-foreground relative z-10">
              {t(
                "Join thousands of happy car owners in HCMC.",
                "Hàng nghìn chủ xe tại TP.HCM đã tin tưởng chúng tôi.",
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 transition-all"
              >
                {t("Create Free Account", "Tạo Tài Khoản Miễn Phí")}{" "}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-background/60 px-8 py-4 text-base font-semibold hover:bg-accent transition-all"
              >
                {t("Sign In", "Đăng Nhập")}
              </Link>
            </div>
          </div>
        </RevealSection>
      </section>

      <PublicFooter />
    </div>
  );
}

export function PublicHomePage() {
  return <HomepageContent />;
}

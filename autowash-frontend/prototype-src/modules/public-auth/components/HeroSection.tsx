import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Star, Clock, Shield, ChevronDown } from "lucide-react";
import { useLanguage } from "./LanguageSwitcher";

// Animated water wave SVG background
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
          className="text-primary/5"
          style={{ animation: "waveMove 6s ease-in-out infinite" }}
        />
        <path
          d="M0,80 C200,20 400,100 720,80 C1040,60 1240,100 1440,70 L1440,120 L0,120 Z"
          fill="currentColor"
          className="text-primary/8"
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

// Floating water drops
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
          className="absolute rounded-full bg-primary"
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

// Animated stat counter
function AnimatedStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-extrabold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground mt-1 font-medium">{label}</div>
    </div>
  );
}

export function HeroSection() {
  const { t, lang } = useLanguage();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 pt-20">
      {/* Animated background */}
      <FloatingDrops />

      {/* Gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-1/3 right-0 h-[700px] w-[700px] rounded-full bg-primary/10 blur-[120px] opacity-60"
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
        {/* Left: Text with stagger animation */}
        <div className="space-y-8">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all duration-700"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
            }}
          >
            <Star className="h-4 w-4 fill-primary" />
            {t("Next-Gen Car Care Platform", "Nền Tảng Chăm Sóc Xe Thế Hệ Mới")}
          </div>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05] transition-all duration-700 delay-100"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
            }}
          >
            {lang === "vi" ? (
              <>
                <span className="text-primary">Rửa Xe & Chăm Sóc</span>
                <br />
                Chuyên Nghiệp
                <br />
                Công Nghệ Đức tại TP.HCM.
              </>
            ) : (
              <>
                Professional Car Wash &<br />
                <span className="text-primary">German Technology</span>
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
            {t(
              "Book in 30 seconds. No waiting in line. Premium finish guaranteed or 100% money back.",
              "Đặt lịch 30 giây. Không lo xếp hàng. Hoàn tiền 100% nếu bạn không hài lòng.",
            )}
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-300"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
            }}
          >
            <Link
              to="/login"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/40 transition-all"
            >
              {t("Book Now", "Đặt Lịch Ngay")}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-background/60 px-8 py-4 text-base font-semibold hover:bg-accent hover:-translate-y-1 transition-all"
            >
              {t("View Services", "Xem Dịch Vụ")}
            </a>
          </div>

          {/* Trust badges */}
          <div
            className="flex flex-wrap gap-6 pt-2 transition-all duration-700 delay-[400ms]"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
            }}
          >
            <TrustBadge
              icon={<Clock className="h-4 w-4 text-primary" />}
              label={t("Book in 30s", "Đặt lịch 30 giây")}
            />
            <TrustBadge
              icon={<Shield className="h-4 w-4 text-primary" />}
              label={t("100% Money Back", "Hoàn tiền 100%")}
            />
            <TrustBadge
              icon={<Star className="h-4 w-4 fill-primary text-primary" />}
              label={t("5-Star Lounge", "Phòng chờ 5 sao")}
            />
          </div>
        </div>

        {/* Right: Feature card with animation */}
        <div
          className="hidden lg:flex flex-col gap-6 transition-all duration-700 delay-[500ms]"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(40px)",
          }}
        >
          <div className="rounded-3xl border border-border/50 bg-card/70 backdrop-blur-xl shadow-2xl p-8 space-y-5">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {t("Why AURA CAR CARE?", "Tại Sao Chọn AURA CAR CARE?")}
            </div>
            {[
              {
                emoji: "🚗",
                title: t("Touchless Wash", "Rửa Không Chạm"),
                desc: t("German-tech foam protects your paint", "Bọt công nghệ Đức bảo vệ sơn xe"),
              },
              {
                emoji: "🏆",
                title: t("5-Star Waiting Lounge", "Phòng Chờ 5 Sao"),
                desc: t(
                  "AC, free drinks & high-speed Wi-Fi",
                  "Máy lạnh, nước miễn phí & Wi-Fi tốc độ cao",
                ),
              },
              {
                emoji: "⚡",
                title: t("Real-time Booking", "Đặt Lịch Thời Gian Thực"),
                desc: t("Guaranteed slot, zero queue", "Không xếp hàng, có chỗ được đảm bảo"),
              },
              {
                emoji: "💎",
                title: t("Loyalty Rewards", "Tích Điểm Thưởng"),
                desc: t("Earn points every wash", "Tích điểm mỗi lần rửa"),
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

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/40">
              <AnimatedStat value="5000+" label={t("Happy Clients", "Khách Hài Lòng")} />
              <AnimatedStat value="98%" label={t("Satisfaction", "Hài Lòng")} />
              <AnimatedStat value="3 min" label={t("Avg. Wait", "Chờ TB")} />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground transition-all duration-700 delay-[700ms]"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <span className="text-xs">{t("Scroll", "Cuộn xuống")}</span>
        <ChevronDown className="h-4 w-4" style={{ animation: "bounce 2s infinite" }} />
        <style>{`@keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(6px); } }`}</style>
      </div>

      <WaterWaves />
    </section>
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

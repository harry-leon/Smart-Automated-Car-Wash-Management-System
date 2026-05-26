"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { ArrowRight, Star, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

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

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        {icon}
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

export function HeroSection() {
  const { t, lang } = useI18n();
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
            {t("nextGenPlatform")}
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
            {t("bookInThirtySec")}
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-300"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
            }}
          >
            <Link href="/login">
              <Button size="lg" className="gap-2 group">
                {t("bookNow")}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#services">
              <Button size="lg" variant="outline">
                {t("viewServices")}
              </Button>
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
              label={t("bookIn30s")}
            />
            <TrustBadge
              icon={<Shield className="h-4 w-4 text-primary" />}
              label={t("moneyBack100")}
            />
            <TrustBadge
              icon={<Star className="h-4 w-4 fill-primary text-primary" />}
              label={t("fiveStarLounge")}
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
              {t("whyAura")}
            </div>
            {[
              {
                emoji: "🚗",
                title: t("touchlessWash"),
                desc: t("germanTech"),
              },
              {
                emoji: "🏆",
                title: t("waitingLounge"),
                desc: t("loungeDetails"),
              },
              {
                emoji: "⚡",
                title: t("realTimeBooking"),
                desc: t("noQueue"),
              },
              {
                emoji: "💎",
                title: t("loyaltyRewards"),
                desc: t("earnPoints"),
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
          </div>
        </div>
      </div>

      <WaterWaves />
    </section>
  );
}

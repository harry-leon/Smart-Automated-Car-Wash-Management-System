"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBookingCurrency } from "@/lib/booking-format";
import { cn } from "@/lib/utils";
import {
  homeCombos,
  homeGallery,
  homeServices,
  homeTestimonials,
  type HomeCombo,
  type HomeService,
} from "./homepage-data";

const navigationItems = [
  { href: "#services", label: "Services" },
  { href: "#combos", label: "Packages" },
  { href: "#reviews", label: "Reviews" },
  { href: "#contact", label: "Contact" },
];

export function HomePageView() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_32%),linear-gradient(180deg,#f8fbff_0%,#f5f9ff_30%,#ffffff_72%,#eff6ff_100%)] text-slate-950">
      <MotionStyles />
      <PublicHeader />
      <HeroSection />
      <FacilitySection />
      <ServicesSection />
      <ResultsSection />
      <CombosSection />
      <ReviewsSection />
      <CallToActionSection />
      <PublicFooter />
    </main>
  );
}

function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        isScrolled
          ? "border-sky-100/80 bg-white/92 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl"
          : "border-transparent bg-white/70 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-[0_10px_30px_rgba(59,130,246,0.18)] ring-1 ring-sky-100 transition-transform duration-300 hover:scale-105">
            <img src="/logo.png" alt="AutoWash Pro" className="h-9 w-9 rounded-xl object-cover" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-sky-700 sm:text-[0.7rem] sm:tracking-[0.28em]">
              AutoWash Pro
            </p>
            <p className="truncate text-sm font-semibold text-slate-900">Aura Car Care</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navigationItems.map((item) => (
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
          <Button
            variant="ghost"
            className="rounded-full px-5 text-sm font-semibold transition-transform duration-300 hover:scale-[1.02]"
            asChild
          >
            <Link href="/login">Sign in</Link>
          </Button>
          <Button
            className="rounded-full px-5 text-sm font-semibold shadow-[0_12px_32px_rgba(37,99,235,0.24)] transition-transform duration-300 hover:scale-[1.02]"
            asChild
          >
            <Link href="/register">Register</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-sky-100 bg-white text-slate-900 shadow-sm transition-transform duration-300 hover:scale-105 lg:hidden"
          onClick={() => setIsOpen((value) => !value)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen ? (
        <div className="animate-in fade-in slide-in-from-top-2 border-t border-sky-100 bg-white px-4 py-4 shadow-[0_12px_24px_rgba(15,23,42,0.08)] duration-300 lg:hidden">
          <nav className="flex flex-col gap-2">
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-sky-50 hover:text-slate-950"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button className="rounded-full" asChild>
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[36rem] animate-[heroGlow_14s_ease-in-out_infinite] bg-[radial-gradient(circle_at_10%_10%,rgba(191,219,254,0.7),transparent_32%),radial-gradient(circle_at_100%_0%,rgba(59,130,246,0.14),transparent_28%)]" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:pb-24">
        <div className="relative z-10">
          <FadeIn delay={0}>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-semibold text-sky-800 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Next-gen car care platform
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <h1 className="mt-6 max-w-3xl break-words text-[clamp(2rem,9vw,5.4rem)] font-black leading-[0.98] tracking-[-0.04em] text-slate-950 sm:text-[clamp(2.8rem,6vw,5.4rem)]">
              Professional car wash and German technology in HCMC.
            </h1>
          </FadeIn>

          <FadeIn delay={180}>
            <p className="mt-6 max-w-2xl break-words text-lg leading-8 text-slate-600 sm:text-xl">
              Book in 30 seconds. No waiting in line. Premium finish guaranteed or 100% money back.
            </p>
          </FadeIn>

          <FadeIn delay={260}>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="h-12 rounded-full px-7 text-sm font-semibold shadow-[0_14px_34px_rgba(37,99,235,0.28)] transition-transform duration-300 hover:scale-[1.02]"
                asChild
              >
                <Link href="/login">
                  Book now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-full px-7 text-sm font-semibold transition-transform duration-300 hover:scale-[1.02]"
                asChild
              >
                <a href="#services">View services</a>
              </Button>
            </div>
          </FadeIn>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <FadeIn delay={340}>
              <TrustItem icon={Clock3} title="Book in 30s" description="Pick a slot and confirm instantly." />
            </FadeIn>
            <FadeIn delay={420}>
              <TrustItem icon={Shield} title="100% money back" description="Satisfaction-first service promise." />
            </FadeIn>
            <FadeIn delay={500}>
              <TrustItem icon={Star} title="5-star lounge" description="Wi-Fi, drinks, and cool waiting space." />
            </FadeIn>
          </div>
        </div>

        <FadeIn delay={180} className="relative z-10" yClass="translate-y-10 md:translate-y-0 md:translate-x-8">
          <div className="absolute inset-x-10 top-0 h-32 animate-[floatSoft_9s_ease-in-out_infinite] rounded-full bg-sky-200/40 blur-3xl" />
          <div className="grid gap-4 sm:grid-cols-[1.15fr_0.85fr]">
            <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_24px_60px_rgba(15,23,42,0.14)] backdrop-blur transition-transform duration-500 hover:-translate-y-1">
              <img
                src={homeGallery[0].src}
                alt={homeGallery[0].alt}
                className="h-[21rem] w-full object-cover transition-transform duration-700 hover:scale-[1.03] sm:h-[26rem]"
              />
              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                      Aura facility
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                      Touchless foam wash with premium finish
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
                  <StatItem value="5000+" label="Happy clients" />
                  <StatItem value="98%" label="Satisfaction" />
                  <StatItem value="3 min" label="Avg. wait" />
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="animate-[floatSoft_10s_ease-in-out_infinite]">
                <MiniFeatureCard
                  title="Why drivers choose us"
                  items={[
                    "Touchless wash protects paintwork",
                    "Real-time booking with guaranteed slot",
                    "Loyalty rewards every visit",
                  ]}
                />
              </div>
              <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-slate-950 shadow-[0_22px_44px_rgba(15,23,42,0.18)] transition-transform duration-500 hover:-translate-y-1">
                <img
                  src={homeGallery[2].src}
                  alt={homeGallery[2].alt}
                  className="h-48 w-full object-cover opacity-85 transition-transform duration-700 hover:scale-[1.03]"
                />
                <div className="space-y-2 p-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">
                    Money back guarantee
                  </p>
                  <p className="text-lg font-semibold">
                    Not satisfied with the quality? We refund every penny.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      <div className="flex justify-center pb-10 text-slate-400">
        <a href="#services" className="inline-flex flex-col items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]">
          Scroll
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </a>
      </div>
    </section>
  );
}

function FacilitySection() {
  return (
    <SectionShell
      id="facility"
      eyebrow="Our facility"
      title="See it for yourself"
      description="A modern wash lane, a calm customer lounge, and premium detailing zones designed for repeat visits."
    >
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <Reveal>
          <div className="overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition-transform duration-500 hover:-translate-y-1">
            <img
              src={homeGallery[1].src}
              alt={homeGallery[1].alt}
              className="h-[18rem] w-full object-cover transition-transform duration-700 hover:scale-[1.02] sm:h-[26rem]"
            />
            <div className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="text-lg font-semibold text-slate-950">Interior deep clean</p>
                <p className="mt-1 text-sm text-slate-600">
                  Built for fast turnaround without sacrificing the premium finish.
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-full px-5 transition-transform duration-300 hover:scale-[1.02]"
                asChild
              >
                <Link href="/register">Create free account</Link>
              </Button>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {homeGallery.slice(2).map((item, index) => (
            <Reveal key={item.label} delay={index * 110}>
              <div className="overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.08)] transition-transform duration-500 hover:-translate-y-1">
                <img
                  src={item.src}
                  alt={item.alt}
                  className="h-48 w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                />
                <div className="p-5">
                  <p className="text-base font-semibold text-slate-950">{item.label}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function ServicesSection() {
  return (
    <SectionShell
      id="services"
      eyebrow="Our services"
      title="Professional car care"
      description="From quick express washes to full detailing, we cover the services customers already know from the original flow."
      className="bg-sky-50/70"
    >
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {homeServices.map((service, index) => (
          <Reveal key={service.id} delay={index * 90}>
            <ServiceCard service={service} />
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}

function ResultsSection() {
  return (
    <SectionShell
      eyebrow="Real results"
      title="See the difference"
      description="The same before-and-after story from the legacy prototype, rebuilt with a cleaner layout and more consistent responsive behavior."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <BeforeAfterCard
            title="Before"
            image={homeGallery[1].src}
            tone="bg-slate-950/75 text-white"
          />
        </Reveal>
        <Reveal delay={140}>
          <BeforeAfterCard
            title="After"
            image={homeGallery[0].src}
            tone="bg-primary text-primary-foreground"
          />
        </Reveal>
      </div>
    </SectionShell>
  );
}

function CombosSection() {
  return (
    <SectionShell
      id="combos"
      eyebrow="Monthly packages"
      title="Save more with combos"
      description="Subscribe monthly and save up to 35% compared to single bookings, without changing any of the existing public booking routes."
      className="bg-slate-950"
      invert
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {homeCombos.map((combo, index) => (
          <Reveal key={combo.id} delay={index * 110}>
            <ComboCard combo={combo} />
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}

function ReviewsSection() {
  return (
    <SectionShell
      id="reviews"
      eyebrow="Customer reviews"
      title="What our customers say"
      description="Social proof remains in the same place in the public journey, but with cards and spacing aligned to the current UI system."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {homeTestimonials.map((review, index) => (
          <Reveal key={review.id} delay={index * 90}>
            <article className="relative rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] transition-transform duration-500 hover:-translate-y-1">
              <Quote className="absolute right-6 top-6 h-6 w-6 text-sky-100" />
              <div className="flex gap-1 text-amber-400">
                {Array.from({ length: review.rating }).map((_, ratingIndex) => (
                  <Star key={ratingIndex} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-5 text-base leading-7 text-slate-600">"{review.content}"</p>
              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="font-semibold text-slate-950">{review.name}</p>
                <p className="text-sm text-slate-500">{review.vehicle}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}

function CallToActionSection() {
  return (
    <Reveal>
      <section className="px-4 pb-20 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-sky-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_45%,#dbeafe_100%)] p-8 shadow-[0_26px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
                Ready to book your first wash?
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Join thousands of happy car owners in Ho Chi Minh City.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Keep the same public flow, just with a sharper first impression and clearer CTA hierarchy.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button
                size="lg"
                className="h-12 rounded-full px-6 text-sm font-semibold transition-transform duration-300 hover:scale-[1.02]"
                asChild
              >
                <Link href="/register">
                  Create free account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-full px-6 text-sm font-semibold transition-transform duration-300 hover:scale-[1.02]"
                asChild
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function PublicFooter() {
  return (
    <Reveal>
      <footer id="contact" className="border-t border-slate-200 bg-slate-950 text-slate-200">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.9fr] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white">
                <img src="/logo.png" alt="AutoWash Pro" className="h-9 w-9 rounded-xl object-cover" />
              </div>
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-sky-300">
                  AutoWash Pro
                </p>
                <p className="text-base font-semibold text-white">Aura Car Care</p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              Professional car wash with German technology in Ho Chi Minh City. Built to make public discovery, booking, and onboarding feel like one coherent system.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Quick links</p>
            <div className="mt-5 grid gap-3 text-sm text-slate-400">
              {navigationItems.map((item) => (
                <a key={item.href} href={item.href} className="transition hover:text-white">
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Contact</p>
            <div className="mt-5 grid gap-3 text-sm leading-7 text-slate-400">
              <p>123 Nguyen Van Linh, District 7, HCMC</p>
              <p>0901 234 567</p>
              <p>contact@auracarcare.vn</p>
              <p>Mon-Sun: 7:00 AM - 8:00 PM</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Aura Car Care. All rights reserved.
        </div>
      </footer>
    </Reveal>
  );
}

function MotionStyles() {
  return (
    <style jsx global>{`
      @keyframes heroGlow {
        0%,
        100% {
          transform: translate3d(0, 0, 0) scale(1);
        }
        50% {
          transform: translate3d(0, 10px, 0) scale(1.02);
        }
      }

      @keyframes floatSoft {
        0%,
        100% {
          transform: translate3d(0, 0, 0);
        }
        50% {
          transform: translate3d(0, -10px, 0);
        }
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
              invert ? "text-sky-300" : "text-sky-700",
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
    <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur transition-transform duration-300 hover:-translate-y-1">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
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
    <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur transition-transform duration-500 hover:-translate-y-1">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">{title}</p>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3 rounded-2xl bg-sky-50/70 px-4 py-3 transition duration-300 hover:bg-sky-100/70">
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

function ServiceCard({ service }: { service: HomeService }) {
  return (
    <article className="group rounded-[2rem] border border-sky-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(15,23,42,0.12)]">
      <div className="flex items-center justify-between">
        <span className="text-3xl transition-transform duration-300 group-hover:scale-110">{service.icon}</span>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
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
          asChild
        >
          <Link href="/login">
            Book
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

function BeforeAfterCard({
  title,
  image,
  tone,
}: {
  title: string;
  image: string;
  tone: string;
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition-transform duration-500 hover:-translate-y-1">
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
          {title === "Before" ? "Queued, rushed, and inconsistent." : "Finished with premium gloss and cleaner detail."}
        </p>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          The business flow stays intact. We only modernize the way each outcome is presented to first-time visitors.
        </p>
      </div>
    </div>
  );
}

function ComboCard({ combo }: { combo: HomeCombo }) {
  const savings = combo.originalPrice - combo.comboPrice;

  return (
    <article
      className={cn(
        "relative rounded-[2rem] border p-7 shadow-[0_24px_60px_rgba(2,6,23,0.28)] transition-transform duration-500 hover:-translate-y-1",
        combo.highlight
          ? "border-sky-300 bg-[linear-gradient(180deg,rgba(37,99,235,0.22)_0%,rgba(15,23,42,0.95)_100%)]"
          : "border-white/10 bg-white/5 backdrop-blur-sm",
      )}
    >
      {combo.badge ? (
        <span
          className={cn(
            "absolute left-7 top-0 -translate-y-1/2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em]",
            combo.highlight ? "bg-white text-slate-950" : "bg-sky-400 text-slate-950",
          )}
        >
          {combo.badge}
        </span>
      ) : null}

      <div className="pt-2">
        <h3 className="text-2xl font-bold tracking-tight text-white">{combo.name}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-300">{combo.description}</p>
      </div>

      <div className="mt-6 border-y border-white/10 py-6">
        <p className="text-3xl font-black tracking-tight text-white">
          {formatBookingCurrency(combo.comboPrice)}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-slate-400 line-through">
            {formatBookingCurrency(combo.originalPrice)}
          </span>
          <span className="rounded-full bg-emerald-400/20 px-3 py-1 font-semibold text-emerald-300">
            Save {formatBookingCurrency(savings)}
          </span>
        </div>
      </div>

      <ul className="mt-6 grid gap-3">
        {combo.services.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-200">
            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-400/20 text-sky-200">
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
            ? "bg-white text-slate-950 hover:bg-slate-100"
            : "bg-white/10 text-white hover:bg-white/15",
        )}
        asChild
      >
        <Link href="/login">
          Get this pack
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </article>
  );
}

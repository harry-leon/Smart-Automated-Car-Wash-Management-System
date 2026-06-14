import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function GuestLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground relative flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-primary/20 blur-[120px] opacity-50 mix-blend-screen animate-in fade-in duration-1000" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-indigo-500/20 blur-[100px] opacity-50 mix-blend-screen animate-in fade-in duration-1000 delay-300" />
      </div>

      <div className="w-full max-w-6xl z-10 grid gap-0 lg:grid-cols-[1fr_480px] overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl transition-all duration-500">
        {/* Left Side: Information / Branding */}
        <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary/10 via-transparent to-indigo-500/10">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom_right,white,transparent)]" />

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-lg transition-transform group-hover:scale-105 overflow-hidden p-0.5">
                <img
                  src="/logo.png"
                  alt="AURA CAR CARE logo"
                  className="h-full w-full rounded-[14px] object-cover"
                />
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  AURA CAR CARE
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Smart Car Wash System
                </div>
              </div>
            </Link>
          </div>

          <div className="relative z-10 mt-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              Next-Gen Management Platform
            </div>
            <h2 className="mt-6 text-4xl font-bold tracking-tight text-foreground leading-[1.1]">
              Elevate your car wash operations.
            </h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">
              Experience a unified ecosystem for customers, staff, and administrators. Secure, fast,
              and remarkably intuitive.
            </p>

            <div className="mt-10 grid gap-4 grid-cols-2">
              <FeatureCard
                title="Customer Portal"
                text="Bookings, loyalty points & history"
                delay="delay-100"
              />
              <FeatureCard
                title="Staff Console"
                text="Live queue & checkout operations"
                delay="delay-200"
              />
              <FeatureCard
                title="Admin Dashboard"
                text="Analytics, tier rules & RBAC"
                delay="delay-300"
              />
              <FeatureCard
                title="Real-time Sync"
                text="Instant updates across all devices"
                delay="delay-400"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex flex-col p-6 md:p-10 lg:p-12 bg-card/80 backdrop-blur-md relative border-l border-border/50">
          {/* Mobile Header */}
          <div className="mb-8 flex lg:hidden items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-md overflow-hidden p-0.5">
                <img
                  src="/logo.png"
                  alt="AURA CAR CARE logo"
                  className="h-full w-full rounded-[10px] object-cover"
                />
              </div>
              <div>
                <div className="font-bold tracking-tight">AURA CAR CARE</div>
              </div>
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>

            <div className="animate-in slide-in-from-bottom-4 duration-500 fade-in">{children}</div>
          </div>

          {footer ? (
            <div className="mt-8 pt-6 border-t border-border/50 text-center animate-in fade-in duration-700 delay-300">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, text, delay }: { title: string; text: string; delay?: string }) {
  return (
    <div
      className={cn(
        "group rounded-2xl border border-border/50 bg-background/40 p-5 backdrop-blur-md transition-all hover:bg-background/60 hover:shadow-md hover:border-primary/30 hover:-translate-y-1",
        delay,
      )}
    >
      <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
        {title}
      </div>
      <div className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{text}</div>
    </div>
  );
}

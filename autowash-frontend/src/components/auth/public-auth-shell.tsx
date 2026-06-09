"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function PublicAuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_38%),linear-gradient(180deg,#f8fbff_0%,#f5f9ff_30%,#ffffff_72%,#eff6ff_100%)] text-slate-950">
      <MotionStyles />
      <AuthLandscape />

      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          {/* Logo Brand matching the Landing Page */}
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-[0_10px_30px_rgba(59,130,246,0.18)] ring-1 ring-sky-100 transition-transform duration-300 hover:scale-105">
              <img src="/logo.png" alt="AutoWash Pro" className="h-9 w-9 rounded-xl object-cover" />
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className="truncate text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-sky-700 sm:text-[0.7rem] sm:tracking-[0.28em]">
                AutoWash Pro
              </p>
              <p className="truncate text-sm font-semibold text-slate-900">Aura Car Care</p>
            </div>
          </Link>

          <div className="flex items-center gap-5 sm:gap-8">
            <nav className="hidden items-center gap-8 text-[14px] font-bold uppercase tracking-[0.06em] text-slate-600 md:flex lg:gap-10">
              <Link href="/" className="transition duration-300 hover:-translate-y-0.5 hover:text-sky-700">
                Home
              </Link>
              <a href="/#services" className="transition duration-300 hover:-translate-y-0.5 hover:text-sky-700">
                Services
              </a>
              <a href="/#combos" className="transition duration-300 hover:-translate-y-0.5 hover:text-sky-700">
                Packages
              </a>
              <a href="/#contact" className="transition duration-300 hover:-translate-y-0.5 hover:text-sky-700">
                Contact
              </a>
            </nav>

            <Link
              href="/login"
              className="rounded-full border border-sky-100 bg-white/80 px-6 py-2 text-sm font-semibold text-sky-800 shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-sky-50"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <div className="relative mx-auto flex min-h-screen max-w-[1400px] items-center justify-center px-4 py-24 sm:px-6 lg:px-10">
        {/* Animated Entrance for the Card Container */}
        <section className="relative w-full max-w-[840px] overflow-hidden rounded-[2.5rem] border border-sky-100/80 bg-white/80 px-6 py-8 shadow-[0_32px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-10 sm:py-10 lg:px-12 lg:py-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out fill-mode-both">
          
          {/* Subtle top decoration beam */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-sky-300 to-transparent opacity-60" />
          
          <div className="mx-auto flex w-full max-w-[590px] flex-col items-center">
            <h1 className="text-center text-[clamp(2.2rem,4vw,3.45rem)] font-black uppercase tracking-tight text-slate-950">
              {title}
            </h1>

            {description ? (
              <p className="mt-3 max-w-[520px] text-center text-[14px] leading-6 text-slate-600">
                {description}
              </p>
            ) : null}

            <div className="mt-8 w-full">{children}</div>

            {footer ? (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-[14px] text-slate-600/90 border-t border-slate-100 w-full pt-6">
                {footer}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function AuthLandscape() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base premium glowing backgrounds */}
      <div className="absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_10%_10%,rgba(191,219,254,0.45),transparent_32%),radial-gradient(circle_at_100%_0%,rgba(59,130,246,0.12),transparent_28%)]" />
      
      {/* Floating Blobs matching the Landing Page design concept */}
      <div 
        className="absolute left-[-10rem] top-[20%] h-[30rem] w-[30rem] rounded-full bg-sky-200/30 blur-3xl"
        style={{ animation: "floatSoft 12s ease-in-out infinite" }}
      />
      <div 
        className="absolute right-[-12rem] bottom-[15%] h-[35rem] w-[35rem] rounded-full bg-blue-200/20 blur-3xl"
        style={{ animation: "floatSoft 14s ease-in-out infinite alternate" }}
      />
      <div 
        className="absolute left-[30%] bottom-[-5rem] h-[20rem] w-[20rem] rounded-full bg-indigo-100/20 blur-3xl"
        style={{ animation: "floatSoft 10s ease-in-out infinite" }}
      />
    </div>
  );
}

function MotionStyles() {
  return (
    <style jsx global>{`
      @keyframes floatSoft {
        0%,
        100% {
          transform: translate3d(0, 0, 0);
        }
        50% {
          transform: translate3d(0, -15px, 0);
        }
      }
    `}</style>
  );
}

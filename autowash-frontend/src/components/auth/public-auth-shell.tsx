import type { ReactNode } from "react";
import Link from "next/link";

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
    <main className="relative min-h-screen overflow-hidden bg-[#cfe0ff] text-slate-950">
      <AuthLandscape />

      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-[1400px] items-center justify-end gap-5 px-5 py-5 sm:gap-8 sm:px-8 lg:px-12">
          <nav className="hidden items-center gap-8 text-[15px] font-bold uppercase tracking-[0.06em] text-slate-950 md:flex lg:gap-12">
            <Link href="/" className="transition hover:opacity-70">
              Home
            </Link>
            <Link href="/" className="transition hover:opacity-70">
              About
            </Link>
            <Link href="/" className="transition hover:opacity-70">
              Service
            </Link>
            <Link href="/" className="transition hover:opacity-70">
              Contact
            </Link>
          </nav>

          <Link
            href="/login"
            className="rounded-xl border border-white/70 bg-white/15 px-5 py-2 text-[15px] font-bold uppercase tracking-[0.08em] text-white shadow-sm backdrop-blur-md transition hover:bg-white/25"
          >
            Login
          </Link>
        </div>
      </header>

      <div className="relative mx-auto flex min-h-screen max-w-[1400px] items-center justify-center px-4 py-24 sm:px-6 lg:px-10">
        <section className="relative w-full max-w-[840px] overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.76)_0%,rgba(233,240,255,0.64)_28%,rgba(74,139,189,0.64)_100%)] px-6 py-7 shadow-[0_28px_90px_rgba(15,23,42,0.22)] backdrop-blur-xl sm:px-10 sm:py-9 lg:px-12 lg:py-10">
          <div className="mx-auto flex w-full max-w-[590px] flex-col items-center">
            <h1 className="text-center text-[clamp(2.2rem,4vw,3.45rem)] font-black uppercase tracking-tight text-slate-950">
              {title}
            </h1>

            {description ? (
              <p className="mt-3 max-w-[520px] text-center text-[14px] leading-6 text-slate-700">
                {description}
              </p>
            ) : null}

            <div className="mt-8 w-full">{children}</div>

            {footer ? (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-[14px] text-slate-100/95">
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
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#d9e5ff_0%,#d0e0ff_24%,#bdd3ff_52%,#aec6f5_100%)]" />

      <div className="absolute left-1/2 top-8 h-[17rem] w-[17rem] -translate-x-1/2 rounded-full bg-white/70 blur-[1px]" />

      <Cloud className="left-[-2rem] top-[7rem] w-[540px]" />
      <Cloud className="right-[-2rem] top-[7.5rem] w-[620px] scale-x-[-1]" />
      <Cloud className="left-[23%] top-[11rem] w-[420px]" soft />
      <Cloud className="right-[15%] top-[13rem] w-[340px]" soft />

      <Mountain
        className="bottom-[21%] left-[-2%] h-[23rem] w-[32rem]"
        fill="rgba(180, 198, 255, 0.95)"
      />
      <Mountain
        className="bottom-[14%] left-[12%] h-[15rem] w-[42rem]"
        fill="rgba(112, 166, 236, 0.95)"
      />
      <Mountain
        className="bottom-[10%] right-[5%] h-[17rem] w-[40rem]"
        fill="rgba(29, 119, 160, 0.96)"
      />
      <Mountain
        className="bottom-[0%] left-[38%] h-[12rem] w-[28rem]"
        fill="rgba(6, 31, 50, 0.98)"
      />

      <div className="absolute bottom-0 left-0 right-0 h-[22%] bg-[linear-gradient(180deg,rgba(12,46,80,0.08)_0%,rgba(4,11,28,0.92)_100%)]" />

      <BushCluster className="bottom-[-0.6rem] left-[-0.7rem] h-[22rem] w-[15rem] origin-bottom-left -rotate-1 scale-95" />
      <BushCluster className="bottom-[-0.4rem] right-[-0.3rem] h-[23rem] w-[16rem] origin-bottom-right rotate-1 scale-95" mirror />

      <Bird className="left-[12%] top-[32%] scale-125" />
      <Bird className="left-[82%] top-[30%] scale-100" />
      <Bird className="left-[79%] top-[36%] scale-90" />
    </div>
  );
}

function Cloud({ className, soft = false }: { className: string; soft?: boolean }) {
  return (
    <div className={`absolute ${className}`}>
      <div
        className={`absolute left-0 top-8 h-24 w-24 rounded-full ${soft ? "bg-white/50" : "bg-white/58"} blur-[0.2px]`}
      />
      <div className={`absolute left-10 top-0 h-32 w-32 rounded-full ${soft ? "bg-white/55" : "bg-white/64"}`} />
      <div className={`absolute left-24 top-8 h-28 w-28 rounded-full ${soft ? "bg-white/46" : "bg-white/58"}`} />
      <div className={`absolute left-40 top-2 h-28 w-28 rounded-full ${soft ? "bg-white/50" : "bg-white/62"}`} />
      <div className={`absolute left-56 top-10 h-22 w-22 rounded-full ${soft ? "bg-white/44" : "bg-white/52"}`} />
    </div>
  );
}

function Mountain({
  className,
  fill,
}: {
  className: string;
  fill: string;
}) {
  return (
    <div
      className={`absolute ${className}`}
      style={{
        clipPath:
          "polygon(0 72%, 10% 58%, 22% 66%, 33% 46%, 48% 58%, 60% 30%, 73% 50%, 84% 38%, 100% 56%, 100% 100%, 0 100%)",
        background: fill,
      }}
    />
  );
}

function BushCluster({
  className,
  mirror = false,
}: {
  className: string;
  mirror?: boolean;
}) {
  const stems = [
    { left: "4%", height: "76%", rotate: "-8deg", width: "14px" },
    { left: "12%", height: "92%", rotate: "3deg", width: "18px" },
    { left: "22%", height: "68%", rotate: "-5deg", width: "12px" },
    { left: "31%", height: "84%", rotate: "7deg", width: "16px" },
    { left: "43%", height: "58%", rotate: "-10deg", width: "13px" },
    { left: "54%", height: "88%", rotate: "2deg", width: "18px" },
    { left: "67%", height: "64%", rotate: "8deg", width: "12px" },
    { left: "77%", height: "92%", rotate: "-3deg", width: "17px" },
    { left: "88%", height: "71%", rotate: "5deg", width: "13px" },
  ] as const;

  return (
    <div className={`absolute ${className}`}>
      {stems.map((stem, index) => (
        <span
          key={index}
          className="absolute bottom-0 rounded-full bg-[#050816]"
          style={{
            left: mirror ? `calc(100% - ${stem.left})` : stem.left,
            width: stem.width,
            height: stem.height,
            transform: `${mirror ? "scaleX(-1)" : ""} rotate(${stem.rotate})`,
            transformOrigin: "bottom center",
          }}
        />
      ))}
      <span className="absolute bottom-[8%] left-[6%] h-[18%] w-[50%] rounded-full bg-[#050816]" />
      <span className="absolute bottom-[10%] left-[28%] h-[20%] w-[44%] rounded-full bg-[#050816]" />
      <span className="absolute bottom-[12%] left-[48%] h-[15%] w-[34%] rounded-full bg-[#050816]" />
    </div>
  );
}

function Bird({ className }: { className: string }) {
  return (
    <div className={`absolute ${className}`}>
      <span className="absolute left-0 top-0 h-5 w-7 rounded-t-full border-t-[6px] border-l-[6px] border-r-[6px] border-transparent border-t-[#050816] border-l-[#050816] border-r-[#050816] rotate-[-8deg]" />
      <span className="absolute left-8 top-0 h-5 w-7 rounded-t-full border-t-[6px] border-l-[6px] border-r-[6px] border-transparent border-t-[#050816] border-l-[#050816] border-r-[#050816] rotate-[8deg]" />
    </div>
  );
}

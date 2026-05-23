import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(360px,440px)] lg:items-center">
          <section className="hidden lg:block">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
              AutoWash Pro
            </p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight text-slate-950">
              One account for customers, staff operations, and admin oversight.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
              The auth layer is prepared for role-based routing, token refresh, and profile loading.
            </p>
          </section>
          <section className="mx-auto w-full max-w-md">{children}</section>
        </div>
      </div>
    </main>
  );
}

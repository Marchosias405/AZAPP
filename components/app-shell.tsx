import type { ReactNode } from "react";
import { APP_NAME } from "@/lib/constants/app";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-5 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-md flex-col">
        <header className="mb-5 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            AZ-900 Study App
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">{APP_NAME}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Built for quick phone-friendly study sessions while commuting.
          </p>
        </header>

        <section className="flex-1">{children}</section>

        <footer className="mt-6 pb-2 text-center text-xs text-slate-500">
          No database, AI generation, or real exam logic is connected yet.
        </footer>
      </div>
    </main>
  );
}
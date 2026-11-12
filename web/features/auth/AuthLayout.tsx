import type { ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";

export function AuthLayout({ titulo, descripcion, children }: { titulo: string; descripcion: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-900">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <Logo claro />
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{titulo}</h1>
          <p className="mt-1 text-sm text-slate-500">{descripcion}</p>
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}

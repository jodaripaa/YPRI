import type { ReactNode } from "react";
import { BadgeCheck, KeyRound, Receipt, Snowflake, Sparkles, Star, Wrench, Zap } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { escalonado } from "@/components/ui";

const CATEGORIAS = [Zap, Wrench, Sparkles, Snowflake, KeyRound];

const VENTAJAS = [
  { icono: BadgeCheck, titulo: "Profesionales verificados", texto: "Perfiles revisados por YPRI antes de recibir solicitudes." },
  { icono: Receipt, titulo: "Precios claros", texto: "Tarifa por hora con IVA calculado desde el primer momento." },
  { icono: Star, titulo: "Calificaciones reales", texto: "Cada reseña viene de un servicio completado en la plataforma." },
];

/** Marco de las pantallas de acceso: encabezado azul en móvil y pantalla dividida en escritorio. */
export function AuthLayout({ titulo, descripcion, children }: { titulo: string; descripcion: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Panel de marca (solo escritorio) */}
      <aside className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col">
        <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div aria-hidden className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/5 blur-2xl" />
        <Logo claro prioridad />
        <div className="relative my-auto max-w-md py-12">
          <h2 className="animate-fade-up text-4xl font-bold leading-tight tracking-tight">
            Profesionales de confianza, <span className="text-accent">a domicilio</span>.
          </h2>
          <p className="mt-4 animate-fade-up text-primary-foreground/75" style={escalonado(1, 80)}>
            Electricidad, plomería, limpieza, climatización y cerrajería en las principales ciudades de Colombia.
          </p>
          <div className="mt-8 flex gap-3">
            {CATEGORIAS.map((Icono, i) => (
              <span key={i} className="flex h-12 w-12 animate-pop items-center justify-center rounded-2xl bg-white/10" style={escalonado(i + 2, 70)}>
                <Icono className="h-5 w-5 text-accent" aria-hidden />
              </span>
            ))}
          </div>
          <ul className="mt-10 space-y-5">
            {VENTAJAS.map(({ icono: Icono, titulo: t, texto }, i) => (
              <li key={t} className="flex animate-fade-up gap-4" style={escalonado(i + 6, 80)}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Icono className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold">{t}</span>
                  <span className="block text-sm text-primary-foreground/70">{texto}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-primary-foreground/50">YPRI · Plataforma de servicios a domicilio</p>
      </aside>

      {/* Formulario */}
      <div className="flex min-h-screen flex-col">
        <header className="relative overflow-hidden rounded-b-[2rem] bg-primary px-6 pb-16 pt-8 text-primary-foreground lg:hidden">
          <div aria-hidden className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/20 blur-2xl" />
          <Logo claro prioridad />
          <h1 className="relative mt-8 animate-fade-up text-2xl font-bold tracking-tight">{titulo}</h1>
          <p className="relative mt-1 animate-fade-up text-sm text-primary-foreground/75" style={escalonado(1, 80)}>
            {descripcion}
          </p>
        </header>
        <main className="flex flex-1 items-start justify-center px-4 pb-10 lg:items-center lg:px-12 lg:py-12">
          <div className="-mt-10 w-full max-w-md animate-fade-up lg:mt-0" style={escalonado(2, 80)}>
            <div className="mb-8 hidden lg:block">
              <h1 className="text-3xl font-bold tracking-tight">{titulo}</h1>
              <p className="mt-2 text-muted-foreground">{descripcion}</p>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

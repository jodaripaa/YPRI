"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  BarChart3,
  Briefcase,
  ClipboardList,
  Code2,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  MapPin,
  Search,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Avatar, cx } from "@/components/ui";
import { CIUDAD_LABEL, ROL_LABEL } from "@/lib/constants";
import { contratosVisiblesPara } from "@/lib/domain/contracts";
import type { DefinicionVista, VistaId } from "@/lib/domain/navigation";
import { iniciales } from "@/lib/format";
import type { Usuario } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";
import { BottomNav } from "./BottomNav";
import { Logo } from "./Logo";
import { SelectorTema } from "./Tema";

const ICONOS: Record<VistaId, LucideIcon> = {
  explorar: Search,
  "mis-solicitudes": ClipboardList,
  solicitudes: Inbox,
  "mis-servicios": Briefcase,
  ganancias: Wallet,
  resumen: LayoutDashboard,
  facturacion: BarChart3,
  contratos: FileText,
  usuarios: Users,
  subalgoritmos: Code2,
};

/** Etiquetas cortas para que quepan cinco pestañas en la barra inferior del móvil. */
const ETIQUETA_CORTA: Partial<Record<VistaId, string>> = {
  "mis-servicios": "Servicios",
  "mis-solicitudes": "Solicitudes",
  subalgoritmos: "Algoritmos",
};

interface AppShellProps {
  usuario: Usuario;
  vistas: readonly DefinicionVista[];
  vistaActiva: VistaId;
  onNavegar: (vista: VistaId) => void;
  onCerrarSesion: () => void;
  children: ReactNode;
}

/**
 * Marco del panel de profesionales y administradores: barra lateral azul
 * marino en escritorio y barra inferior en móvil, como la app del cliente.
 */
export function AppShell({ usuario, vistas, vistaActiva, onNavegar, onCerrarSesion, children }: AppShellProps) {
  const { data } = useAppStore();
  // Solicitudes nuevas que esperan respuesta del profesional.
  const nuevas = contratosVisiblesPara(data.contratos, usuario).filter((c) => c.prestador_id === usuario.id && c.estado === "Pendiente").length;
  const insignia = (id: VistaId) => (id === "solicitudes" ? nuevas : undefined);

  return (
    <div className="min-h-screen bg-background lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-primary text-primary-foreground lg:flex">
        <div className="px-6 pb-6 pt-7">
          <Logo claro prioridad />
        </div>
        <p className="px-6 pb-2 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground/50">{ROL_LABEL[usuario.rol]}</p>
        <nav aria-label="Principal" className="flex-1 space-y-1 px-3">
          {vistas.map((vista) => {
            const Icono = ICONOS[vista.id];
            const activa = vista.id === vistaActiva;
            const cantidad = insignia(vista.id);
            return (
              <button
                key={vista.id}
                type="button"
                onClick={() => onNavegar(vista.id)}
                aria-current={activa ? "page" : undefined}
                className={cx(
                  "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                  activa ? "bg-white/10 text-white" : "text-primary-foreground/70 hover:bg-white/5 hover:text-white",
                )}
              >
                <span
                  aria-hidden
                  className={cx(
                    "absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-accent transition-all duration-300",
                    activa ? "opacity-100" : "scale-y-0 opacity-0",
                  )}
                />
                <Icono className={cx("h-[18px] w-[18px] transition-colors", activa ? "text-accent" : "text-primary-foreground/60 group-hover:text-white")} aria-hidden />
                <span className="flex-1 text-left">{vista.etiqueta}</span>
                {cantidad !== undefined && cantidad > 0 && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground">
                    {cantidad}
                    <span className="sr-only"> nuevas</span>
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="px-3 pb-1">
          <SelectorTema sobreOscuro className="w-full" />
        </div>
        <div className="m-3 rounded-2xl bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <Avatar texto={iniciales(usuario.nombre)} className="bg-accent text-accent-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{usuario.nombre}</p>
              <p className="truncate text-xs text-primary-foreground/60">{usuario.correo}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCerrarSesion}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2 text-sm text-primary-foreground/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md lg:hidden">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <Logo prioridad />
          <MenuUsuario usuario={usuario} onCerrarSesion={onCerrarSesion} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-10">
        <div key={vistaActiva} className="animate-fade-up">
          {children}
        </div>
      </main>

      <BottomNav
        className="lg:hidden"
        activa={vistaActiva}
        onCambiar={onNavegar}
        items={vistas.map((vista) => ({
          id: vista.id,
          etiqueta: ETIQUETA_CORTA[vista.id] ?? vista.etiqueta,
          icono: ICONOS[vista.id],
          insignia: insignia(vista.id),
          descripcionInsignia: "solicitudes nuevas",
        }))}
      />
    </div>
  );
}

function MenuUsuario({ usuario, onCerrarSesion }: { usuario: Usuario; onCerrarSesion: () => void }) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const alHacerClic = (evento: MouseEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    };
    const alPresionar = (evento: KeyboardEvent) => evento.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", alHacerClic);
    document.addEventListener("keydown", alPresionar);
    return () => {
      document.removeEventListener("mousedown", alHacerClic);
      document.removeEventListener("keydown", alPresionar);
    };
  }, [abierto]);

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        aria-expanded={abierto}
        aria-haspopup="menu"
        aria-label="Menú de la cuenta"
        className="touch-feedback flex items-center gap-2 rounded-full py-1 pl-3 pr-1 hover:bg-muted"
      >
        <span className="hidden text-right sm:block">
          <span className="block text-sm font-medium leading-tight">{usuario.nombre}</span>
          <span className="block text-xs text-muted-foreground">{ROL_LABEL[usuario.rol]}</span>
        </span>
        <Avatar texto={iniciales(usuario.nombre)} className="bg-primary text-primary-foreground" />
      </button>

      {abierto && (
        <div role="menu" className="absolute right-0 mt-2 w-64 origin-top-right animate-scale-in rounded-2xl border border-border bg-card p-1.5 shadow-elevada">
          <div className="px-3 py-2.5">
            <p className="text-sm font-semibold">{usuario.nombre}</p>
            <p className="truncate text-xs text-muted-foreground">{usuario.correo}</p>
            <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" aria-hidden />
              {ROL_LABEL[usuario.rol]} · {CIUDAD_LABEL[usuario.ciudad]}
            </p>
          </div>
          <div className="px-3 pb-2">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Tema</p>
            <SelectorTema className="w-full" />
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={onCerrarSesion}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

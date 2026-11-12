"use client";

// Piezas visuales de la app móvil del cliente, adaptadas del prototipo de v0
// a Tailwind 3 y a los datos reales del dominio (sin fotos ni cifras inventadas).

import type { ButtonHTMLAttributes, FormEvent, ReactNode } from "react";
import Image from "next/image";
import { ArrowLeft, BadgeCheck, CalendarDays, Clock, Home, MapPin, Search, Star, User, type LucideIcon } from "lucide-react";
import { cx } from "@/components/ui";
import { CATEGORIA_LABEL, CATEGORIAS_SERVICIO, CIUDAD_LABEL, type CategoriaServicio, type EstadoContrato } from "@/lib/constants";
import { formatearCalificacion, formatearMoneda, iniciales, pluralizar } from "@/lib/format";
import type { Servicio, Usuario } from "@/lib/types";
import { ICONO_CATEGORIA, PROFESION_CATEGORIA } from "./categorias";

/* ------------------------------------------------------------------ Marco */

export function MarcoMovil({ children, conNavegacion = true }: { children: ReactNode; conNavegacion?: boolean }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className={cx("relative mx-auto w-full max-w-[1180px] sm:px-6 lg:px-8", conNavegacion ? "pb-24" : "pb-28")}>{children}</div>
    </div>
  );
}

export function EncabezadoInicio({ usuario, onPerfil }: { usuario: Usuario; onPerfil: () => void }) {
  return (
    <header className="flex items-center justify-between gap-3 bg-card px-4 py-3 sm:rounded-b-2xl">
      <Image src="/images/ypri-logo.png" alt="YPRI" width={94} height={32} priority className="h-8 w-auto" />
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15">
          <MapPin className="h-4 w-4 text-accent-strong" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block text-[10px] text-muted-foreground">Tu ciudad</span>
          <span className="block truncate text-xs font-semibold">{CIUDAD_LABEL[usuario.ciudad]}</span>
        </span>
      </div>
      <button
        type="button"
        onClick={onPerfil}
        aria-label="Ver mi perfil"
        className="touch-feedback flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
      >
        {iniciales(usuario.nombre)}
      </button>
    </header>
  );
}

export function BarraSuperior({ titulo, subtitulo, onVolver, accion }: { titulo: string; subtitulo?: string; onVolver?: () => void; accion?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-md">
      {onVolver && (
        <button
          type="button"
          onClick={onVolver}
          aria-label="Volver"
          className="touch-feedback -ml-1 flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold">{titulo}</h1>
        {subtitulo && <p className="truncate text-xs text-muted-foreground">{subtitulo}</p>}
      </div>
      {accion}
    </header>
  );
}

/* ------------------------------------------------------- Navegación inferior */

export type PestanaCliente = "inicio" | "buscar" | "reservas" | "perfil";

const PESTANAS: { id: PestanaCliente; etiqueta: string; icono: LucideIcon }[] = [
  { id: "inicio", etiqueta: "Inicio", icono: Home },
  { id: "buscar", etiqueta: "Buscar", icono: Search },
  { id: "reservas", etiqueta: "Reservas", icono: CalendarDays },
  { id: "perfil", etiqueta: "Perfil", icono: User },
];

export function NavegacionInferior({
  activa,
  onCambiar,
  reservasActivas,
}: {
  activa: PestanaCliente;
  onCambiar: (pestana: PestanaCliente) => void;
  reservasActivas: number;
}) {
  return (
    <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="pb-safe mx-auto flex max-w-[1180px] items-center justify-around px-2 pt-2 sm:px-6">
        {PESTANAS.map(({ id, etiqueta, icono: Icono }) => {
          const seleccionada = id === activa;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onCambiar(id)}
              aria-current={seleccionada ? "page" : undefined}
              className="touch-feedback relative flex min-w-[64px] flex-col items-center gap-0.5 px-3 py-1.5"
            >
              <span className="relative">
                <Icono className={cx("h-6 w-6 transition-colors", seleccionada ? "text-primary" : "text-muted-foreground")} aria-hidden />
                {id === "reservas" && reservasActivas > 0 && (
                  <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-foreground">
                    {reservasActivas > 9 ? "9+" : reservasActivas}
                    <span className="sr-only"> reservas activas</span>
                  </span>
                )}
              </span>
              <span className={cx("text-[11px] font-medium", seleccionada ? "text-primary" : "text-muted-foreground")}>{etiqueta}</span>
              {seleccionada && <span aria-hidden className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-accent" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* --------------------------------------------------------------- Búsqueda */

export function BarraBusqueda({
  valor,
  onCambiar,
  onEnviar,
  placeholder = "Buscar electricistas, plomeros...",
  autoFocus,
}: {
  valor: string;
  onCambiar: (valor: string) => void;
  onEnviar?: (valor: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    onEnviar?.(valor);
  };
  return (
    <form role="search" onSubmit={enviar} className="px-4 py-2">
      <label className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3 transition-shadow focus-within:ring-2 focus-within:ring-accent">
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="sr-only">Buscar servicios</span>
        <input
          type="search"
          value={valor}
          autoFocus={autoFocus}
          onChange={(e) => onCambiar(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </label>
    </form>
  );
}

/* ------------------------------------------------------------- Categorías */

export function CarruselCategorias({
  seleccionada,
  onSeleccionar,
}: {
  seleccionada?: CategoriaServicio | "todas";
  onSeleccionar: (categoria: CategoriaServicio) => void;
}) {
  return (
    <div className="hide-scrollbar flex gap-3 overflow-x-auto px-4 pb-2 sm:grid sm:grid-cols-5 sm:overflow-visible" role="group" aria-label="Categorías">
      {CATEGORIAS_SERVICIO.map((categoria) => {
        const Icono = ICONO_CATEGORIA[categoria];
        const activa = seleccionada === categoria;
        return (
          <button
            key={categoria}
            type="button"
            aria-pressed={activa}
            onClick={() => onSeleccionar(categoria)}
            className="touch-feedback flex min-w-[76px] flex-col items-center gap-2"
          >
            <span
              className={cx(
                "flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
                activa ? "bg-primary shadow-lg" : "bg-muted hover:bg-border/70",
              )}
            >
              <Icono className={cx("h-6 w-6", activa ? "text-primary-foreground" : "text-foreground")} aria-hidden />
            </span>
            <span className={cx("text-center text-xs font-medium", activa ? "text-primary" : "text-muted-foreground")}>
              {CATEGORIA_LABEL[categoria]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function ChipFiltro({ activa, onClick, children }: { activa: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={activa}
      onClick={onClick}
      className={cx(
        "touch-feedback shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        activa ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-muted-foreground/40",
      )}
    >
      {children}
    </button>
  );
}

export function EncabezadoSeccion({ titulo, accion, onAccion }: { titulo: string; accion?: string; onAccion?: () => void }) {
  return (
    <div className="mb-3 flex items-center justify-between px-4">
      <h2 className="text-base font-semibold">{titulo}</h2>
      {accion && onAccion && (
        <button type="button" onClick={onAccion} className="touch-feedback text-sm font-medium text-accent-strong hover:underline">
          {accion}
        </button>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- Profesionales */

export function AvatarProfesional({ servicio, tamano = "md" }: { servicio: Servicio; tamano?: "md" | "lg" | "xl" }) {
  const clases = { md: "h-16 w-16 rounded-xl text-lg", lg: "h-20 w-20 rounded-2xl text-xl", xl: "h-28 w-28 rounded-full text-3xl" }[tamano];
  return (
    <span aria-hidden className={cx("relative flex shrink-0 items-center justify-center bg-primary/10 font-semibold text-primary", clases)}>
      {iniciales(servicio.prestador_nombre)}
      {servicio.disponible && (
        <span className={cx("absolute rounded-full border-2 border-card bg-accent", tamano === "xl" ? "bottom-2 right-2 h-5 w-5" : "bottom-1 right-1 h-3 w-3")} />
      )}
    </span>
  );
}

export function Estrellas({ valor, resenas, compacto }: { valor: number; resenas: number; compacto?: boolean }) {
  if (resenas === 0) return <span className="text-xs font-medium text-muted-foreground">Nuevo</span>;
  return (
    <span className={cx("relative inline-flex items-center gap-1", compacto ? "text-xs" : "text-sm")}>
      <Star className={cx("fill-amber-400 text-amber-400", compacto ? "h-3.5 w-3.5" : "h-4 w-4")} aria-hidden />
      <span className="font-medium text-foreground">{formatearCalificacion(valor)}</span>
      <span className="text-muted-foreground">({resenas})</span>
      <span className="sr-only">de 5 estrellas</span>
    </span>
  );
}

/** Tarjeta grande para el carrusel de destacados. */
export function TarjetaDestacada({ servicio, onAbrir }: { servicio: Servicio; onAbrir: (servicio: Servicio) => void }) {
  const Icono = ICONO_CATEGORIA[servicio.categoria];
  return (
    <button
      type="button"
      onClick={() => onAbrir(servicio)}
      className="touch-feedback relative flex w-[min(78vw,280px)] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card text-left md:w-full"
    >
      <span className="relative flex h-28 w-full items-center justify-center bg-gradient-to-br from-primary to-primary/80">
        <Icono className="h-12 w-12 text-accent" aria-hidden />
        <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-semibold text-primary">
          {CATEGORIA_LABEL[servicio.categoria]}
        </span>
        {servicio.disponible && (
          <span className="absolute right-3 top-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">Disponible</span>
        )}
      </span>
      <span className="flex flex-1 flex-col p-3">
        <span className="flex items-center gap-1">
          <span className="truncate text-sm font-semibold">{servicio.prestador_nombre}</span>
          <BadgeCheck className="h-4 w-4 shrink-0 text-accent-strong" aria-label="Verificado" />
        </span>
        <span className="mb-2 text-xs text-muted-foreground">
          {PROFESION_CATEGORIA[servicio.categoria]} · {CIUDAD_LABEL[servicio.ciudad]}
        </span>
        <span className="mt-auto flex items-center justify-between gap-2">
          <Estrellas valor={servicio.calificacion} resenas={servicio.num_resenas} compacto />
          <span className="text-xs font-semibold text-primary">{formatearMoneda(servicio.tarifa_hora)}/h</span>
        </span>
      </span>
    </button>
  );
}

/** Fila de lista para resultados de búsqueda y "En tu ciudad". */
export function TarjetaServicio({ servicio, onAbrir }: { servicio: Servicio; onAbrir: (servicio: Servicio) => void }) {
  return (
    <button
      type="button"
      onClick={() => onAbrir(servicio)}
      className="touch-feedback relative flex w-full gap-3 rounded-2xl border border-border bg-card p-3 text-left sm:gap-4 sm:p-4"
    >
      <AvatarProfesional servicio={servicio} />
      <span className="min-w-0 flex-1">
        <span className="mb-0.5 flex items-center gap-1.5">
          <span className="truncate text-base font-semibold">{servicio.prestador_nombre}</span>
          <BadgeCheck className="h-4 w-4 shrink-0 text-accent-strong" aria-label="Verificado" />
        </span>
        <span className="mb-2 block text-sm text-muted-foreground">{PROFESION_CATEGORIA[servicio.categoria]}</span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <Estrellas valor={servicio.calificacion} resenas={servicio.num_resenas} compacto />
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {CIUDAD_LABEL[servicio.ciudad]}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {pluralizar(servicio.anios_experiencia, "año", "años")}
          </span>
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end justify-between">
        <span className="text-base font-bold text-primary">{formatearMoneda(servicio.tarifa_hora)}</span>
        <span className="text-[10px] text-muted-foreground">por hora</span>
        {!servicio.disponible && <span className="mt-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">No disponible</span>}
      </span>
    </button>
  );
}

/* ---------------------------------------------------------------- Estados */

const ESTILO_ESTADO: Record<EstadoContrato, string> = {
  Pendiente: "bg-amber-100 text-amber-800",
  "En proceso": "bg-sky-100 text-sky-800",
  Completado: "bg-emerald-100 text-emerald-800",
  Cancelado: "bg-muted text-muted-foreground",
};

export function PildoraEstado({ estado }: { estado: EstadoContrato }) {
  return <span className={cx("shrink-0 rounded-full px-2.5 py-1 text-xs font-medium", ESTILO_ESTADO[estado])}>{estado}</span>;
}

export function Vacio({ icono: Icono, titulo, descripcion, accion }: { icono: LucideIcon; titulo: string; descripcion?: string; accion?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icono className="h-7 w-7 text-muted-foreground" aria-hidden />
      </span>
      <p className="mt-4 text-base font-semibold">{titulo}</p>
      {descripcion && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{descripcion}</p>}
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------- Botones */

type VarianteBoton = "primario" | "acento" | "contorno" | "peligro";

const VARIANTES_BOTON: Record<VarianteBoton, string> = {
  primario: "bg-primary text-primary-foreground hover:bg-primary/90",
  acento: "bg-accent text-accent-foreground hover:bg-accent/90",
  contorno: "border border-border bg-card text-foreground hover:bg-muted",
  peligro: "border border-red-200 bg-card text-red-600 hover:bg-red-50",
};

export function BotonMovil({
  variante = "primario",
  icono: Icono,
  bloque,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: VarianteBoton; icono?: LucideIcon; bloque?: boolean }) {
  return (
    <button
      type="button"
      className={cx(
        "touch-feedback inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTES_BOTON[variante],
        bloque && "w-full",
        className,
      )}
      {...props}
    >
      {Icono && <Icono className="h-4 w-4" aria-hidden />}
      {children}
    </button>
  );
}

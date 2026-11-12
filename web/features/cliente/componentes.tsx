"use client";

// Piezas visuales propias de la app móvil del cliente (adaptadas del prototipo
// de v0). Los botones, estados y mensajes vacíos vienen del kit común en
// components/ui para que toda YPRI se vea igual.

import type { CSSProperties, FormEvent, ReactNode } from "react";
import { ArrowLeft, BadgeCheck, Clock, MapPin, Search, Star } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { cx } from "@/components/ui";
import { CATEGORIA_LABEL, CATEGORIAS_SERVICIO, CIUDAD_LABEL, type CategoriaServicio } from "@/lib/constants";
import { formatearCalificacion, formatearMoneda, iniciales, pluralizar } from "@/lib/format";
import type { Servicio, Usuario } from "@/lib/types";
import { formatearDistancia, formatearTiempo } from "@/lib/geo";
import { ICONO_CATEGORIA, PROFESION_CATEGORIA } from "./categorias";
import { BotonUbicacion } from "./SelectorUbicacion";

/** Distancia y tiempo de llegada respecto al cliente (si se conoce su ubicación). */
export interface Cercania {
  distanciaKm: number;
  minutos: number;
  enCobertura?: boolean;
}

/* ------------------------------------------------------------------ Marco */

export function MarcoMovil({ children, conNavegacion = true }: { children: ReactNode; conNavegacion?: boolean }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className={cx("relative mx-auto w-full max-w-[1180px] animate-fade-in sm:px-6 lg:px-8", conNavegacion ? "pb-24 lg:pb-16" : "pb-28 lg:pb-16")}>{children}</div>
    </div>
  );
}

export function EncabezadoInicio({ usuario, onPerfil }: { usuario: Usuario; onPerfil: () => void }) {
  return (
    <header className="flex items-center justify-between gap-3 bg-card px-4 py-3 sm:rounded-b-2xl lg:hidden">
      <Logo prioridad />
      <BotonUbicacion className="py-1 pl-1 pr-2" />
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
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-md lg:static lg:border-0 lg:bg-transparent lg:pb-2 lg:pt-8 lg:backdrop-blur-none">
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
        <h1 className="truncate text-lg font-semibold lg:text-3xl lg:font-bold lg:tracking-tight">{titulo}</h1>
        {subtitulo && <p className="truncate text-xs text-muted-foreground lg:mt-1 lg:text-sm">{subtitulo}</p>}
      </div>
      {accion}
    </header>
  );
}

/* --------------------------------------------------------------- Búsqueda */

export function BarraBusqueda({
  valor,
  onCambiar,
  onEnviar,
  placeholder = "Buscar electricistas, plomeros...",
  autoFocus,
  className,
  claseCampo,
}: {
  valor: string;
  onCambiar: (valor: string) => void;
  onEnviar?: (valor: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  claseCampo?: string;
}) {
  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    onEnviar?.(valor);
  };
  return (
    <form role="search" onSubmit={enviar} className={cx("px-4 py-2", className)}>
      <label className={cx("flex items-center gap-3 rounded-2xl bg-muted px-4 py-3 transition-all duration-200 focus-within:bg-card focus-within:shadow-suave focus-within:ring-2 focus-within:ring-accent", claseCampo)}>
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
      {CATEGORIAS_SERVICIO.map((categoria, i) => {
        const Icono = ICONO_CATEGORIA[categoria];
        const activa = seleccionada === categoria;
        return (
          <button
            key={categoria}
            type="button"
            aria-pressed={activa}
            onClick={() => onSeleccionar(categoria)}
            style={{ animationDelay: `${i * 50}ms` }}
            className="group touch-feedback flex min-w-[76px] animate-fade-up flex-col items-center gap-2"
          >
            <span
              className={cx(
                "flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200 group-hover:-translate-y-0.5",
                activa ? "bg-primary shadow-lg" : "bg-muted group-hover:bg-primary-soft",
              )}
            >
              <Icono className={cx("h-6 w-6 transition-colors", activa ? "text-primary-foreground" : "text-foreground group-hover:text-enfasis")} aria-hidden />
            </span>
            <span className={cx("text-center text-xs font-medium", activa ? "text-enfasis" : "text-muted-foreground")}>{CATEGORIA_LABEL[categoria]}</span>
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
        "touch-feedback shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-200",
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
    <span aria-hidden className={cx("relative flex shrink-0 items-center justify-center bg-primary-soft font-semibold text-enfasis", clases)}>
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
export function TarjetaDestacada({
  servicio,
  onAbrir,
  style,
  cercania,
}: {
  servicio: Servicio;
  onAbrir: (servicio: Servicio) => void;
  style?: CSSProperties;
  cercania?: Cercania;
}) {
  const Icono = ICONO_CATEGORIA[servicio.categoria];
  return (
    <button
      type="button"
      onClick={() => onAbrir(servicio)}
      style={style}
      className="group touch-feedback hover-elevar relative flex w-[min(78vw,280px)] shrink-0 animate-fade-up flex-col overflow-hidden rounded-2xl border border-border bg-card text-left md:w-full"
    >
      <span className="relative flex h-28 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-primary to-primary/80">
        <span aria-hidden className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/20 blur-xl" />
        <Icono className="h-12 w-12 text-accent transition-transform duration-300 group-hover:scale-110" aria-hidden />
        <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-semibold text-enfasis">
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
          {PROFESION_CATEGORIA[servicio.categoria]} · {cercania ? `a ${formatearDistancia(cercania.distanciaKm)}` : CIUDAD_LABEL[servicio.ciudad]}
        </span>
        <span className="mt-auto flex items-center justify-between gap-2">
          <Estrellas valor={servicio.calificacion} resenas={servicio.num_resenas} compacto />
          <span className="text-xs font-semibold text-enfasis">{formatearMoneda(servicio.tarifa_hora)}/h</span>
        </span>
      </span>
    </button>
  );
}

/** Fila de lista para resultados de búsqueda y "En tu ciudad". */
export function TarjetaServicio({
  servicio,
  onAbrir,
  style,
  cercania,
}: {
  servicio: Servicio;
  onAbrir: (servicio: Servicio) => void;
  style?: CSSProperties;
  cercania?: Cercania;
}) {
  return (
    <button
      type="button"
      onClick={() => onAbrir(servicio)}
      style={style}
      className="touch-feedback hover-elevar relative flex w-full animate-fade-up gap-3 rounded-2xl border border-border bg-card p-3 text-left sm:gap-4 sm:p-4"
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
            {cercania ? formatearDistancia(cercania.distanciaKm) : CIUDAD_LABEL[servicio.ciudad]}
          </span>
          {cercania ? (
            <span className="flex items-center gap-1 font-medium text-accent-strong">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              llega en {formatearTiempo(cercania.minutos)}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {pluralizar(servicio.anios_experiencia, "año", "años")}
            </span>
          )}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end justify-between">
        <span className="text-base font-bold text-enfasis">{formatearMoneda(servicio.tarifa_hora)}</span>
        <span className="text-[10px] text-muted-foreground">por hora</span>
        {!servicio.disponible && <span className="mt-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">No disponible</span>}
        {servicio.disponible && cercania?.enCobertura === false && (
          <span className="mt-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">Fuera de su zona</span>
        )}
      </span>
    </button>
  );
}

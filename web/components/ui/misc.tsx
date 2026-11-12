import type { CSSProperties, ReactNode } from "react";
import { Star, type LucideIcon } from "lucide-react";
import { formatearCalificacion } from "@/lib/format";
import { cx } from "./cx";

/** Retraso escalonado para que los elementos de una lista aparezcan uno tras otro. */
export function escalonado(indice: number, pasoMs = 50, maximoMs = 400): CSSProperties {
  return { animationDelay: `${Math.min(indice * pasoMs, maximoMs)}ms` };
}

export function PageHeader({ titulo, descripcion, acciones }: { titulo: string; descripcion?: string; acciones?: ReactNode }) {
  return (
    <div className="mb-6 flex animate-fade-up flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
        {descripcion && <p className="mt-1 text-sm text-muted-foreground">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
    </div>
  );
}

type TonoStat = "primary" | "accent" | "neutral";

const TONO_STAT: Record<TonoStat, { caja: string; icono: string }> = {
  primary: { caja: "bg-primary-soft", icono: "text-enfasis" },
  accent: { caja: "bg-accent/15", icono: "text-accent-strong" },
  neutral: { caja: "bg-muted", icono: "text-muted-foreground" },
};

export function StatCard({
  etiqueta,
  valor,
  detalle,
  icono: Icono,
  tono = "primary",
  destacado,
  style,
}: {
  etiqueta: string;
  valor: ReactNode;
  detalle?: ReactNode;
  icono?: LucideIcon;
  tono?: TonoStat;
  /** Tarjeta con fondo azul marino para la cifra principal. */
  destacado?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      style={style}
      className={cx(
        "hover-elevar animate-fade-up rounded-2xl border p-4 sm:p-5",
        destacado ? "border-transparent bg-primary text-primary-foreground shadow-elevada" : "border-border bg-card shadow-suave",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={cx("text-sm", destacado ? "text-primary-foreground/75" : "text-muted-foreground")}>{etiqueta}</p>
        {Icono && (
          <span className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", destacado ? "bg-accent" : TONO_STAT[tono].caja)}>
            <Icono className={cx("h-[18px] w-[18px]", destacado ? "text-accent-foreground" : TONO_STAT[tono].icono)} aria-hidden />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{valor}</p>
      {detalle && <p className={cx("mt-1 text-xs", destacado ? "text-primary-foreground/70" : "text-muted-foreground")}>{detalle}</p>}
    </div>
  );
}

export function EmptyState({
  icono: Icono,
  titulo,
  descripcion,
  accion,
  sinMarco,
}: {
  icono: LucideIcon;
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
  /** Sin borde: para usar dentro de otra tarjeta o pantalla. */
  sinMarco?: boolean;
}) {
  return (
    <div
      className={cx(
        "flex animate-fade-in flex-col items-center px-6 py-12 text-center",
        !sinMarco && "rounded-2xl border border-dashed border-border bg-card/60",
      )}
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icono className="h-7 w-7 text-muted-foreground" aria-hidden />
      </span>
      <p className="mt-4 text-base font-semibold">{titulo}</p>
      {descripcion && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{descripcion}</p>}
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  );
}

export interface OpcionTab<T extends string> {
  id: T;
  etiqueta: string;
  conteo?: number;
}

/** Pestañas segmentadas con desplazamiento horizontal en pantallas angostas. */
export function Tabs<T extends string>({
  opciones,
  activa,
  onCambiar,
  etiqueta,
  className,
}: {
  opciones: readonly OpcionTab<T>[];
  activa: T;
  onCambiar: (id: T) => void;
  etiqueta: string;
  className?: string;
}) {
  return (
    <div className={cx("hide-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0", className)}>
      <div role="tablist" aria-label={etiqueta} className="inline-flex min-w-full gap-1 rounded-xl bg-muted p-1 sm:min-w-0">
        {opciones.map((opcion) => {
          const seleccionada = opcion.id === activa;
          return (
            <button
              key={opcion.id}
              type="button"
              role="tab"
              aria-selected={seleccionada}
              onClick={() => onCambiar(opcion.id)}
              className={cx(
                "flex flex-1 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                seleccionada ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opcion.etiqueta}
              {opcion.conteo !== undefined && (
                <span
                  className={cx(
                    "min-w-5 rounded-full px-1.5 text-xs tabular-nums transition-colors",
                    seleccionada ? "bg-accent text-accent-foreground" : "bg-border/70 text-muted-foreground",
                  )}
                >
                  {opcion.conteo}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Calificacion({ valor, resenas }: { valor: number; resenas: number }) {
  if (resenas === 0) return <span className="text-sm text-muted-foreground">Nuevo</span>;
  return (
    <span className="relative inline-flex items-center gap-1 text-sm">
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
      <span className="font-medium text-foreground">{formatearCalificacion(valor)}</span>
      <span className="text-muted-foreground">({resenas})</span>
    </span>
  );
}

export function SelectorEstrellas({ valor, onCambiar }: { valor: number; onCambiar: (valor: number) => void }) {
  return (
    <div role="radiogroup" aria-label="Calificación" className="flex gap-1">
      {[1, 2, 3, 4, 5].map((numero) => {
        const activa = numero <= valor;
        return (
          <button
            key={numero}
            type="button"
            role="radio"
            aria-checked={numero === valor}
            aria-label={`${numero} de 5`}
            onClick={() => onCambiar(numero)}
            className="touch-feedback rounded-lg p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Star
              key={activa ? `on-${valor}` : "off"}
              className={cx("h-8 w-8 transition-colors", activa ? "animate-pop fill-amber-400 text-amber-400" : "text-border")}
              style={activa ? { animationDelay: `${(numero - 1) * 40}ms` } : undefined}
            />
          </button>
        );
      })}
    </div>
  );
}

export function Avatar({ texto, className }: { texto: string; className?: string }) {
  // Si quien lo usa define su propio fondo, no se aplica el color por defecto
  // (en Tailwind ganaría la clase que aparece después en la hoja de estilos).
  const colorPropio = /(^|\s)bg-/.test(className ?? "");
  return (
    <span
      aria-hidden
      className={cx(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
        !colorPropio && "bg-primary-soft text-enfasis",
        className,
      )}
    >
      {texto}
    </span>
  );
}

export function DatoFila({ etiqueta, valor, destacado }: { etiqueta: string; valor: ReactNode; destacado?: boolean }) {
  return (
    <div className={cx("flex items-center justify-between gap-4 py-1.5 text-sm", destacado && "text-base font-bold")}>
      <span className={destacado ? "" : "text-muted-foreground"}>{etiqueta}</span>
      <span className={destacado ? "text-enfasis" : "text-foreground"}>{valor}</span>
    </div>
  );
}

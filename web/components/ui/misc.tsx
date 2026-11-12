import type { ReactNode } from "react";
import { Star, type LucideIcon } from "lucide-react";
import { formatearCalificacion } from "@/lib/format";
import { cx } from "./cx";

export function PageHeader({ titulo, descripcion, acciones }: { titulo: string; descripcion?: string; acciones?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">{titulo}</h1>
        {descripcion && <p className="mt-1 text-sm text-slate-500">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
    </div>
  );
}

export function StatCard({ etiqueta, valor, detalle }: { etiqueta: string; valor: ReactNode; detalle?: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{etiqueta}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{valor}</p>
      {detalle && <p className="mt-1 text-xs text-slate-500">{detalle}</p>}
    </div>
  );
}

export function EmptyState({
  icono: Icono,
  titulo,
  descripcion,
  accion,
}: {
  icono: LucideIcon;
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <Icono className="h-8 w-8 text-slate-400" aria-hidden />
      <p className="mt-3 text-sm font-medium text-slate-900">{titulo}</p>
      {descripcion && <p className="mt-1 max-w-sm text-sm text-slate-500">{descripcion}</p>}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  );
}

export interface OpcionTab<T extends string> {
  id: T;
  etiqueta: string;
  conteo?: number;
}

export function Tabs<T extends string>({
  opciones,
  activa,
  onCambiar,
  etiqueta,
}: {
  opciones: readonly OpcionTab<T>[];
  activa: T;
  onCambiar: (id: T) => void;
  etiqueta: string;
}) {
  return (
    <div role="tablist" aria-label={etiqueta} className="-mb-px flex gap-6 overflow-x-auto border-b border-slate-200">
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
              "flex shrink-0 items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors",
              seleccionada ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800",
            )}
          >
            {opcion.etiqueta}
            {opcion.conteo !== undefined && (
              <span className={cx("rounded px-1.5 text-xs", seleccionada ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600")}>
                {opcion.conteo}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Calificacion({ valor, resenas }: { valor: number; resenas: number }) {
  if (resenas === 0) return <span className="text-sm text-slate-500">Nuevo</span>;
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
      <span className="font-medium text-slate-900">{formatearCalificacion(valor)}</span>
      <span className="text-slate-500">({resenas})</span>
    </span>
  );
}

export function SelectorEstrellas({ valor, onCambiar }: { valor: number; onCambiar: (valor: number) => void }) {
  return (
    <div role="radiogroup" aria-label="Calificación" className="flex gap-1">
      {[1, 2, 3, 4, 5].map((numero) => (
        <button
          key={numero}
          type="button"
          role="radio"
          aria-checked={numero === valor}
          aria-label={`${numero} de 5`}
          onClick={() => onCambiar(numero)}
          className="rounded p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          <Star className={cx("h-7 w-7", numero <= valor ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
        </button>
      ))}
    </div>
  );
}

export function Avatar({ texto, className }: { texto: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cx("inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700", className)}
    >
      {texto}
    </span>
  );
}

export function DatoFila({ etiqueta, valor, destacado }: { etiqueta: string; valor: ReactNode; destacado?: boolean }) {
  return (
    <div className={cx("flex items-center justify-between gap-4 py-1.5 text-sm", destacado && "font-semibold text-slate-900")}>
      <span className={destacado ? "" : "text-slate-500"}>{etiqueta}</span>
      <span className={destacado ? "" : "text-slate-900"}>{valor}</span>
    </div>
  );
}

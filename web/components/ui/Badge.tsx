import type { ReactNode } from "react";
import type { EstadoContrato } from "@/lib/constants";
import { cx } from "./cx";

export type Tono = "neutral" | "blue" | "green" | "amber" | "red";

const TONOS: Record<Tono, string> = {
  neutral: "bg-slate-100 text-slate-700",
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
};

const PUNTOS: Record<Tono, string> = {
  neutral: "bg-slate-400",
  blue: "bg-blue-600",
  green: "bg-emerald-600",
  amber: "bg-amber-500",
  red: "bg-red-600",
};

export function Badge({ tono = "neutral", conPunto, children }: { tono?: Tono; conPunto?: boolean; children: ReactNode }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium", TONOS[tono])}>
      {conPunto && <span className={cx("h-1.5 w-1.5 rounded-full", PUNTOS[tono])} aria-hidden />}
      {children}
    </span>
  );
}

const TONO_ESTADO: Record<EstadoContrato, Tono> = {
  Pendiente: "amber",
  "En proceso": "blue",
  Completado: "green",
  Cancelado: "red",
};

export function EstadoContratoBadge({ estado }: { estado: EstadoContrato }) {
  return (
    <Badge tono={TONO_ESTADO[estado]} conPunto>
      {estado}
    </Badge>
  );
}

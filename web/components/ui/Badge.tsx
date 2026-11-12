import type { ReactNode } from "react";
import type { EstadoContrato } from "@/lib/constants";
import { cx } from "./cx";

export type Tono = "neutral" | "blue" | "green" | "amber" | "red";

const TONOS: Record<Tono, string> = {
  neutral: "bg-muted text-muted-foreground",
  blue: "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300",
  green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300",
  red: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300",
};

const PUNTOS: Record<Tono, string> = {
  neutral: "bg-muted-foreground",
  blue: "bg-sky-600",
  green: "bg-emerald-600",
  amber: "bg-amber-500",
  red: "bg-red-600",
};

export function Badge({ tono = "neutral", conPunto, children }: { tono?: Tono; conPunto?: boolean; children: ReactNode }) {
  return (
    <span className={cx("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", TONOS[tono])}>
      {conPunto && <span className={cx("h-1.5 w-1.5 rounded-full", PUNTOS[tono])} aria-hidden />}
      {children}
    </span>
  );
}

const TONO_ESTADO: Record<EstadoContrato, Tono> = {
  Pendiente: "amber",
  "En proceso": "blue",
  Completado: "green",
  Cancelado: "neutral",
};

export function EstadoContratoBadge({ estado }: { estado: EstadoContrato }) {
  return (
    <Badge tono={TONO_ESTADO[estado]} conPunto>
      {estado}
    </Badge>
  );
}

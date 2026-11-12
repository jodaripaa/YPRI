import { KeyRound, Scissors, Snowflake, Sparkles, Wrench, Zap, type LucideIcon } from "lucide-react";
import type { CategoriaServicio } from "@/lib/constants";

/** Icono de cada categoría del dominio (reemplaza las categorías inventadas del prototipo). */
export const ICONO_CATEGORIA: Record<CategoriaServicio, LucideIcon> = {
  Electricidad: Zap,
  Plomeria: Wrench,
  Limpieza: Sparkles,
  Climatizacion: Snowflake,
  Cerrajeria: KeyRound,
  Belleza: Scissors,
};

/** Profesión que se muestra bajo el nombre del profesional. */
export const PROFESION_CATEGORIA: Record<CategoriaServicio, string> = {
  Electricidad: "Electricista",
  Plomeria: "Plomería",
  Limpieza: "Limpieza a domicilio",
  Climatizacion: "Técnico en climatización",
  Cerrajeria: "Cerrajero",
  Belleza: "Barbería y peluquería",
};

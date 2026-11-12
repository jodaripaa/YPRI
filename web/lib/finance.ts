// Subalgoritmos financieros (Guía 10): funciones puras con parámetros y retorno.

import { COMISION_PLATAFORMA, IVA_PORCENTAJE, RETENCION_FUENTE } from "./constants";
import type { ProductoInventario } from "./types";

export interface LiquidacionFinanciera {
  tarifaHora: number;
  horas: number;
  subtotalBruto: number;
  descuentoPct: number;
  montoDescuento: number;
  subtotalNeto: number;
  tasaIva: number;
  montoIva: number;
  totalPagar: number;
}

export function calcularLiquidacionContrato(
  tarifaHora: number,
  horas: number,
  descuentoPct = 0,
  tasaIva: number = IVA_PORCENTAJE,
): LiquidacionFinanciera {
  const subtotalBruto = tarifaHora * horas;
  const montoDescuento = Math.round(subtotalBruto * (descuentoPct / 100));
  const subtotalNeto = subtotalBruto - montoDescuento;
  const montoIva = Math.round(subtotalNeto * tasaIva);
  const totalPagar = subtotalNeto + montoIva;

  return {
    tarifaHora,
    horas,
    subtotalBruto,
    descuentoPct,
    montoDescuento,
    subtotalNeto,
    tasaIva,
    montoIva,
    totalPagar,
  };
}

export interface DistribucionPago {
  comisionYpri: number;
  retencionFuente: number;
  pagoNetoPrestador: number;
}

export function calcularComisionPlataforma(
  totalPagar: number,
  comisionPct: number = COMISION_PLATAFORMA,
  retencionPct: number = RETENCION_FUENTE,
): DistribucionPago {
  const comisionYpri = Math.round(totalPagar * comisionPct);
  const retencionFuente = Math.round(totalPagar * retencionPct);
  return {
    comisionYpri,
    retencionFuente,
    pagoNetoPrestador: totalPagar - comisionYpri - retencionFuente,
  };
}

/**
 * Recalcula el promedio incremental de calificaciones.
 * @param numEvaluaciones total de evaluaciones incluyendo la nueva nota.
 */
export function calcularPromedioRating(ratingPrevio: number, numEvaluaciones: number, nuevaNota: number): number {
  if (numEvaluaciones <= 1) return Number(nuevaNota.toFixed(1));
  const totalPrevio = ratingPrevio * (numEvaluaciones - 1);
  return Number(((totalPrevio + nuevaNota) / numEvaluaciones).toFixed(1));
}

export const calcularSubtotalInventario = (precio: number, cantidad: number): number => precio * cantidad;

export function calcularTotalInventario(productos: readonly ProductoInventario[]): number {
  return productos.reduce((acumulado, p) => acumulado + calcularSubtotalInventario(p.precio, p.cantidad), 0);
}

export function sumarTotales<T>(elementos: readonly T[], obtenerValor: (elemento: T) => number): number {
  return elementos.reduce((acumulado, elemento) => acumulado + obtenerValor(elemento), 0);
}

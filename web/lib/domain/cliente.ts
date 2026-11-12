// Consultas de solo lectura para la app móvil del cliente. Son funciones puras:
// reciben los datos y devuelven lo que cada pantalla muestra, sin modificar
// el estado, así la interfaz no repite cálculos ni inventa cifras.

import type { CiudadCobertura } from "../constants";
import type { AppData, Contrato, Servicio, Usuario } from "../types";
import { ESTADOS_ACTIVOS, contratosVisiblesPara } from "./contracts";

/** Reseñas de un servicio: contratos calificados, de la más reciente a la más antigua. */
export function resenasDeServicio(contratos: readonly Contrato[], servicioCodigo: string): Contrato[] {
  return contratos
    .filter((c) => c.servicio_codigo === servicioCodigo && c.calificacion !== undefined)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export interface FilaDistribucion {
  estrellas: 1 | 2 | 3 | 4 | 5;
  cantidad: number;
  porcentaje: number;
}

/** Cuántas reseñas hay de cada número de estrellas (de 5 a 1) y qué porcentaje representan. */
export function distribucionCalificaciones(resenas: readonly Contrato[]): FilaDistribucion[] {
  const total = resenas.length;
  return ([5, 4, 3, 2, 1] as const).map((estrellas) => {
    const cantidad = resenas.filter((r) => r.calificacion === estrellas).length;
    return { estrellas, cantidad, porcentaje: total ? Math.round((cantidad / total) * 100) : 0 };
  });
}

/**
 * Servicios destacados: disponibles, con reseñas y mejor calificados. Prioriza la
 * ciudad del cliente y completa con otras ciudades si no alcanza el límite.
 */
export function serviciosDestacados(servicios: readonly Servicio[], ciudad: CiudadCobertura, limite = 4): Servicio[] {
  const ordenados = servicios
    .filter((s) => s.disponible && s.num_resenas > 0)
    .sort((a, b) => b.calificacion - a.calificacion || b.num_resenas - a.num_resenas);
  const locales = ordenados.filter((s) => s.ciudad === ciudad);
  const otros = ordenados.filter((s) => s.ciudad !== ciudad);
  return [...locales, ...otros].slice(0, limite);
}

/** Otros servicios publicados por el mismo profesional. */
export function otrosServiciosDelProfesional(servicios: readonly Servicio[], servicio: Servicio): Servicio[] {
  return servicios.filter((s) => s.prestador_id === servicio.prestador_id && s.codigo !== servicio.codigo);
}

export interface ResumenCliente {
  solicitudes: number;
  enCurso: number;
  completados: number;
  totalInvertido: number;
}

/** Cifras del perfil del cliente calculadas a partir de sus propios contratos. */
export function resumenCliente(contratos: readonly Contrato[], usuario: Usuario): ResumenCliente {
  const propios = contratosVisiblesPara(contratos, usuario).filter((c) => c.cliente_id === usuario.id);
  const completados = propios.filter((c) => c.estado === "Completado");
  return {
    solicitudes: propios.length,
    enCurso: propios.filter((c) => ESTADOS_ACTIVOS.includes(c.estado)).length,
    completados: completados.length,
    totalInvertido: completados.reduce((suma, c) => suma + c.total, 0),
  };
}

/** Próxima reserva activa del cliente (la de fecha más cercana), si existe. */
export function proximaReserva(contratos: readonly Contrato[], usuario: Usuario): Contrato | null {
  const activas = contratosVisiblesPara(contratos, usuario)
    .filter((c) => c.cliente_id === usuario.id && ESTADOS_ACTIVOS.includes(c.estado))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  return activas[0] ?? null;
}

export interface EstadisticasPlataforma {
  profesionales: number;
  serviciosCompletados: number;
  /** Promedio ponderado por número de reseñas; null si aún no hay reseñas. */
  calificacionPromedio: number | null;
}

/** Cifras reales de la plataforma para la sección de confianza del inicio. */
export function estadisticasPlataforma(data: Pick<AppData, "usuarios" | "servicios" | "contratos">): EstadisticasPlataforma {
  const resenas = data.servicios.reduce((suma, s) => suma + s.num_resenas, 0);
  const puntos = data.servicios.reduce((suma, s) => suma + s.calificacion * s.num_resenas, 0);
  return {
    profesionales: data.usuarios.filter((u) => u.rol === "prestador" && u.activo).length,
    serviciosCompletados: data.servicios.reduce((suma, s) => suma + s.num_contratos, 0),
    calificacionPromedio: resenas ? Number((puntos / resenas).toFixed(1)) : null,
  };
}

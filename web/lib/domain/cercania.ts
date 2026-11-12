// Búsqueda de profesionales cercanos y simulación del seguimiento "en camino",
// al estilo de las apps de domicilios. Funciones puras: reciben los datos y
// la ubicación del cliente y no modifican nada.

import type { CategoriaServicio } from "../constants";
import { distanciaKm, interpolar, tiempoLlegadaMin, type Coordenadas } from "../geo";
import type { Servicio } from "../types";

export interface ServicioCercano {
  servicio: Servicio;
  /** Distancia en línea recta entre el profesional y el cliente. */
  distanciaKm: number;
  /** Minutos estimados para que el profesional llegue. */
  minutos: number;
  /** El cliente está dentro del radio de atención del profesional. */
  enCobertura: boolean;
}

export function calcularCercania(servicio: Servicio, origen: Coordenadas): ServicioCercano {
  const distancia = distanciaKm(servicio.ubicacion, origen);
  return {
    servicio,
    distanciaKm: distancia,
    minutos: tiempoLlegadaMin(servicio.ubicacion, origen),
    enCobertura: distancia <= servicio.radio_km,
  };
}

export interface OpcionesCercania {
  /** Distancia máxima que acepta el cliente (además del radio del profesional). */
  radioMaxKm?: number;
  /** Por defecto solo muestra profesionales que atienden en la ubicación del cliente. */
  soloEnCobertura?: boolean;
  soloDisponibles?: boolean;
  categoria?: CategoriaServicio | "todas";
}

/** Profesionales ordenados del más cercano al más lejano (a igual distancia, mejor calificado primero). */
export function serviciosCercanos(servicios: readonly Servicio[], origen: Coordenadas, opciones: OpcionesCercania = {}): ServicioCercano[] {
  const { radioMaxKm, soloEnCobertura = true, soloDisponibles = false, categoria = "todas" } = opciones;
  return servicios
    .filter((s) => categoria === "todas" || s.categoria === categoria)
    .filter((s) => !soloDisponibles || s.disponible)
    .map((s) => calcularCercania(s, origen))
    .filter((c) => !soloEnCobertura || c.enCobertura)
    .filter((c) => radioMaxKm === undefined || c.distanciaKm <= radioMaxKm)
    .sort((a, b) => a.distanciaKm - b.distanciaKm || b.servicio.calificacion - a.servicio.calificacion);
}

/** El profesional disponible más cercano que atiende en la ubicación del cliente. */
export function profesionalMasCercano(servicios: readonly Servicio[], origen: Coordenadas, categoria?: CategoriaServicio): ServicioCercano | null {
  return serviciosCercanos(servicios, origen, { soloDisponibles: true, categoria: categoria ?? "todas" })[0] ?? null;
}

export interface EstadoSeguimiento {
  posicion: Coordenadas;
  /** De 0 (saliendo) a 1 (llegó). */
  progreso: number;
  minutosRestantes: number;
  distanciaRestanteKm: number;
  llego: boolean;
}

/**
 * Simula el recorrido del profesional hacia el cliente. La demostración dura
 * `duracionSimulacionSeg` segundos reales aunque el viaje estimado sea más largo;
 * los minutos restantes se calculan sobre el tiempo estimado real.
 */
export function simularSeguimiento(
  origen: Coordenadas,
  destino: Coordenadas,
  transcurridoSeg: number,
  duracionSimulacionSeg: number,
): EstadoSeguimiento {
  const progreso = duracionSimulacionSeg > 0 ? Math.min(1, Math.max(0, transcurridoSeg / duracionSimulacionSeg)) : 1;
  const posicion = interpolar(origen, destino, progreso);
  const llego = progreso >= 1;
  return {
    posicion,
    progreso,
    llego,
    distanciaRestanteKm: distanciaKm(posicion, destino),
    minutosRestantes: llego ? 0 : Math.max(1, Math.ceil(tiempoLlegadaMin(origen, destino) * (1 - progreso))),
  };
}

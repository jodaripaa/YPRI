// Búsqueda de profesionales cercanos y simulación del seguimiento "en camino",
// al estilo de las apps de domicilios. Funciones puras: reciben los datos y
// la ubicación del cliente y no modifican nada.

import type { CategoriaServicio } from "../constants";
import { distanciaKm, interpolar, tiempoLlegadaMin, type Coordenadas } from "../geo";
import type { Contrato, Servicio } from "../types";
import { barrioMasCercano } from "../zonas";

export interface PosicionOperario {
  /** Dónde está ahora: el lugar del servicio que atiende o su barrio base. */
  coordenadas: Coordenadas;
  /** Está atendiendo un servicio en este momento (contrato "En proceso"). */
  enServicio: boolean;
  contratoId?: string;
  /** Barrio de referencia de su posición actual ("más o menos" dónde está). */
  zonaReferencia: string;
}

/**
 * Posición de referencia del operario: si está atendiendo un servicio con
 * ubicación conocida, es ese lugar; si no, su barrio base.
 */
export function posicionActual(servicio: Servicio, contratos: readonly Contrato[] = []): PosicionOperario {
  const enCurso = contratos.find((c) => c.prestador_id === servicio.prestador_id && c.estado === "En proceso" && c.ubicacion);
  if (enCurso?.ubicacion) {
    return {
      coordenadas: enCurso.ubicacion,
      enServicio: true,
      contratoId: enCurso.id,
      zonaReferencia: barrioMasCercano(servicio.ciudad, enCurso.ubicacion).nombre,
    };
  }
  return { coordenadas: servicio.ubicacion, enServicio: false, zonaReferencia: servicio.zona };
}

export interface ServicioCercano {
  servicio: Servicio;
  /** Posición desde la que se miden distancia y tiempo de llegada. */
  posicion: PosicionOperario;
  /** Distancia en línea recta entre el profesional y el cliente. */
  distanciaKm: number;
  /** Minutos estimados para que el profesional llegue. */
  minutos: number;
  /** El cliente está dentro del radio de atención del profesional. */
  enCobertura: boolean;
}

export function calcularCercania(servicio: Servicio, origen: Coordenadas, contratos: readonly Contrato[] = []): ServicioCercano {
  const posicion = posicionActual(servicio, contratos);
  return {
    servicio,
    posicion,
    distanciaKm: distanciaKm(posicion.coordenadas, origen),
    minutos: tiempoLlegadaMin(posicion.coordenadas, origen),
    // La cobertura se mide siempre desde su barrio base (es su zona de trabajo).
    enCobertura: distanciaKm(servicio.ubicacion, origen) <= servicio.radio_km,
  };
}

export interface OpcionesCercania {
  /** Distancia máxima que acepta el cliente (además del radio del profesional). */
  radioMaxKm?: number;
  /** Por defecto solo muestra profesionales que atienden en la ubicación del cliente. */
  soloEnCobertura?: boolean;
  soloDisponibles?: boolean;
  categoria?: CategoriaServicio | "todas";
  /** Contratos para conocer dónde está cada operario ahora mismo. */
  contratos?: readonly Contrato[];
}

/** Profesionales ordenados del más cercano al más lejano (a igual distancia, mejor calificado primero). */
export function serviciosCercanos(servicios: readonly Servicio[], origen: Coordenadas, opciones: OpcionesCercania = {}): ServicioCercano[] {
  const { radioMaxKm, soloEnCobertura = true, soloDisponibles = false, categoria = "todas", contratos = [] } = opciones;
  return servicios
    .filter((s) => categoria === "todas" || s.categoria === categoria)
    .filter((s) => !soloDisponibles || s.disponible)
    .map((s) => calcularCercania(s, origen, contratos))
    .filter((c) => !soloEnCobertura || c.enCobertura)
    .filter((c) => radioMaxKm === undefined || c.distanciaKm <= radioMaxKm)
    .sort((a, b) => a.distanciaKm - b.distanciaKm || b.servicio.calificacion - a.servicio.calificacion);
}

/** El profesional disponible más cercano que atiende en la ubicación del cliente. */
export function profesionalMasCercano(
  servicios: readonly Servicio[],
  origen: Coordenadas,
  categoria?: CategoriaServicio,
  contratos: readonly Contrato[] = [],
): ServicioCercano | null {
  return serviciosCercanos(servicios, origen, { soloDisponibles: true, categoria: categoria ?? "todas", contratos })[0] ?? null;
}

export interface CandidatosPedidoInmediato {
  /** Operarios libres ahora, del que llega antes al que llega después. */
  libres: ServicioCercano[];
  /** Operarios disponibles que están atendiendo otro servicio. */
  ocupados: ServicioCercano[];
  /** El elegido para el pedido inmediato: el libre que llega antes. */
  asignado: ServicioCercano | null;
}

/**
 * Pedido inmediato (estilo Uber): entre los operarios del oficio que atienden en
 * la ubicación del cliente, asigna al libre que llega antes. Los ocupados quedan
 * como alternativa porque primero deben terminar su servicio actual.
 */
export function candidatosPedidoInmediato(
  servicios: readonly Servicio[],
  contratos: readonly Contrato[],
  origen: Coordenadas,
  categoria: CategoriaServicio,
): CandidatosPedidoInmediato {
  const cercanos = serviciosCercanos(servicios, origen, { soloDisponibles: true, categoria, contratos }).sort(
    (a, b) => a.minutos - b.minutos || b.servicio.calificacion - a.servicio.calificacion,
  );
  const libres = cercanos.filter((c) => !c.posicion.enServicio);
  const ocupados = cercanos.filter((c) => c.posicion.enServicio);
  return { libres, ocupados, asignado: libres[0] ?? null };
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

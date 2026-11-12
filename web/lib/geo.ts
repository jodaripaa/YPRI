// Georreferenciación de YPRI: funciones puras para medir distancias entre
// coordenadas, estimar tiempos de llegada y simular el recorrido de un
// profesional. Las mismas fórmulas existen en backend/modules/geolocalizacion.py.

export interface Coordenadas {
  /** Latitud en grados decimales (positivo al norte). */
  lat: number;
  /** Longitud en grados decimales (negativo al oeste). */
  lng: number;
}

/** Radio medio de la Tierra en kilómetros (valor usado por la fórmula de Haversine). */
export const RADIO_TIERRA_KM = 6371;

/** Velocidad promedio de un desplazamiento urbano en moto o carro, en km/h. */
export const VELOCIDAD_URBANA_KMH = 24;

/** Minutos que tarda un profesional en alistarse antes de salir. */
export const MINUTOS_ALISTAMIENTO = 5;

/** Factor que convierte la línea recta en una ruta por calles (las vías no son rectas). */
export const FACTOR_RUTA = 1.3;

const aRadianes = (grados: number) => (grados * Math.PI) / 180;

export function sonCoordenadasValidas(c: Partial<Coordenadas> | null | undefined): c is Coordenadas {
  return (
    !!c &&
    typeof c.lat === "number" &&
    typeof c.lng === "number" &&
    Number.isFinite(c.lat) &&
    Number.isFinite(c.lng) &&
    Math.abs(c.lat) <= 90 &&
    Math.abs(c.lng) <= 180
  );
}

/**
 * Distancia en línea recta sobre la superficie terrestre (fórmula de Haversine).
 * Devuelve kilómetros.
 */
export function distanciaKm(a: Coordenadas, b: Coordenadas): number {
  const dLat = aRadianes(b.lat - a.lat);
  const dLng = aRadianes(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aRadianes(a.lat)) * Math.cos(aRadianes(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_TIERRA_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Distancia estimada por calles a partir de la línea recta. */
export function distanciaRutaKm(a: Coordenadas, b: Coordenadas): number {
  return distanciaKm(a, b) * FACTOR_RUTA;
}

/**
 * Minutos estimados de llegada: alistamiento más el recorrido por calles a
 * velocidad urbana. Se redondea hacia arriba y nunca es menor que el alistamiento.
 */
export function tiempoLlegadaMin(
  a: Coordenadas,
  b: Coordenadas,
  velocidadKmH: number = VELOCIDAD_URBANA_KMH,
  alistamientoMin: number = MINUTOS_ALISTAMIENTO,
): number {
  const recorrido = (distanciaRutaKm(a, b) / velocidadKmH) * 60;
  return Math.ceil(alistamientoMin + recorrido);
}

/** Texto corto para la distancia: metros por debajo de 1 km, kilómetros con un decimal arriba. */
export function formatearDistancia(km: number): string {
  if (km < 1) return `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m`;
  return `${km.toLocaleString("es-CO", { maximumFractionDigits: 1, minimumFractionDigits: km < 10 ? 1 : 0 })} km`;
}

export function formatearTiempo(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto ? `${horas} h ${resto} min` : `${horas} h`;
}

/** Punto intermedio de un trayecto recto: progreso 0 es el origen y 1 el destino. */
export function interpolar(origen: Coordenadas, destino: Coordenadas, progreso: number): Coordenadas {
  const t = Math.min(1, Math.max(0, progreso));
  return { lat: origen.lat + (destino.lat - origen.lat) * t, lng: origen.lng + (destino.lng - origen.lng) * t };
}

/**
 * Desplaza un punto una distancia y dirección dadas (para generar ubicaciones
 * de prueba alrededor de un centro). `rumboGrados`: 0 = norte, 90 = este.
 */
export function desplazar(origen: Coordenadas, km: number, rumboGrados: number): Coordenadas {
  const d = km / RADIO_TIERRA_KM;
  const rumbo = aRadianes(rumboGrados);
  const lat1 = aRadianes(origen.lat);
  const lng1 = aRadianes(origen.lng);
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(rumbo));
  const lng2 = lng1 + Math.atan2(Math.sin(rumbo) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));
  return { lat: (lat2 * 180) / Math.PI, lng: (lng2 * 180) / Math.PI };
}

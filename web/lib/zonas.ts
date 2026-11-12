// Zonas de cobertura de YPRI con coordenadas aproximadas (grados decimales).
// Se usan para ubicar a los profesionales de prueba y para simular la
// ubicación del cliente sin GPS. Coinciden con backend/modules/geolocalizacion.py.

import type { CiudadCobertura } from "./constants";
import type { Coordenadas } from "./geo";

export interface Zona {
  nombre: string;
  coordenadas: Coordenadas;
}

/** Centro de referencia de cada ciudad con cobertura. */
export const CENTRO_CIUDAD: Record<CiudadCobertura, Coordenadas> = {
  Cucuta: { lat: 7.8891, lng: -72.505 },
  Cali: { lat: 3.4516, lng: -76.532 },
  Bogota: { lat: 4.5981, lng: -74.0758 },
  Medellin: { lat: 6.2518, lng: -75.5636 },
  Bucaramanga: { lat: 7.1193, lng: -73.1227 },
};

/** Barrios de prueba por ciudad (para simular dónde está el cliente o el profesional). */
export const BARRIOS: Record<CiudadCobertura, readonly Zona[]> = {
  Cucuta: [
    { nombre: "Centro", coordenadas: { lat: 7.8891, lng: -72.505 } },
    { nombre: "La Playa", coordenadas: { lat: 7.8935, lng: -72.4995 } },
    { nombre: "Caobos", coordenadas: { lat: 7.9035, lng: -72.494 } },
    { nombre: "Quinta Oriental", coordenadas: { lat: 7.8858, lng: -72.4925 } },
    { nombre: "Prados del Este", coordenadas: { lat: 7.9085, lng: -72.482 } },
    { nombre: "San Luis", coordenadas: { lat: 7.8705, lng: -72.487 } },
    { nombre: "El Contento", coordenadas: { lat: 7.892, lng: -72.514 } },
    { nombre: "La Libertad", coordenadas: { lat: 7.882, lng: -72.5225 } },
    { nombre: "Atalaya", coordenadas: { lat: 7.8775, lng: -72.5395 } },
  ],
  Bogota: [
    { nombre: "Centro", coordenadas: { lat: 4.5981, lng: -74.0758 } },
    { nombre: "Teusaquillo", coordenadas: { lat: 4.6373, lng: -74.0791 } },
    { nombre: "Chapinero", coordenadas: { lat: 4.6486, lng: -74.0628 } },
    { nombre: "Usaquén", coordenadas: { lat: 4.6946, lng: -74.0308 } },
    { nombre: "Suba", coordenadas: { lat: 4.7412, lng: -74.0838 } },
    { nombre: "Kennedy", coordenadas: { lat: 4.6268, lng: -74.1517 } },
  ],
  Cali: [
    { nombre: "Centro", coordenadas: { lat: 3.4516, lng: -76.532 } },
    { nombre: "Granada", coordenadas: { lat: 3.4612, lng: -76.5354 } },
    { nombre: "San Fernando", coordenadas: { lat: 3.4361, lng: -76.5419 } },
    { nombre: "Ciudad Jardín", coordenadas: { lat: 3.3653, lng: -76.5318 } },
  ],
  Medellin: [
    { nombre: "Centro", coordenadas: { lat: 6.2518, lng: -75.5636 } },
    { nombre: "Laureles", coordenadas: { lat: 6.2447, lng: -75.5946 } },
    { nombre: "El Poblado", coordenadas: { lat: 6.2088, lng: -75.5671 } },
    { nombre: "Belén", coordenadas: { lat: 6.2304, lng: -75.6047 } },
  ],
  Bucaramanga: [
    { nombre: "Centro", coordenadas: { lat: 7.1193, lng: -73.1227 } },
    { nombre: "Cabecera", coordenadas: { lat: 7.1189, lng: -73.1088 } },
    { nombre: "Sotomayor", coordenadas: { lat: 7.1229, lng: -73.1142 } },
    { nombre: "Provenza", coordenadas: { lat: 7.0928, lng: -73.1102 } },
  ],
};

/** Radio de atención por defecto de un profesional, en kilómetros. */
export const RADIO_COBERTURA_KM = 10;
export const RADIOS_COBERTURA_KM = [3, 5, 8, 10, 15, 20] as const;

export function barrioPorNombre(ciudad: CiudadCobertura, nombre: string): Zona | undefined {
  return BARRIOS[ciudad].find((b) => b.nombre === nombre);
}

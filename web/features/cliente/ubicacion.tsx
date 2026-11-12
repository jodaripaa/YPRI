"use client";

// Ubicación del cliente: GPS real del navegador o simulada (barrio o punto en el
// mapa) para hacer pruebas sin moverse. Se guarda por usuario en este navegador.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CiudadCobertura } from "@/lib/constants";
import { distanciaKm, sonCoordenadasValidas, type Coordenadas } from "@/lib/geo";
import type { Usuario } from "@/lib/types";
import { BARRIOS, CENTRO_CIUDAD, type Zona } from "@/lib/zonas";

export type FuenteUbicacion = "gps" | "barrio" | "mapa" | "predeterminada";

export interface UbicacionCliente {
  coordenadas: Coordenadas;
  /** Texto corto para mostrar: barrio, "Mi ubicación" o "Punto en el mapa". */
  etiqueta: string;
  fuente: FuenteUbicacion;
  /** Ciudad con cobertura más cercana al punto. */
  ciudad: CiudadCobertura;
}

type EstadoGps = { estado: "inactivo" } | { estado: "buscando" } | { estado: "error"; mensaje: string };

interface ContextoUbicacion {
  ubicacion: UbicacionCliente;
  gps: EstadoGps;
  usarGps: () => void;
  elegirBarrio: (ciudad: CiudadCobertura, zona: Zona) => void;
  elegirPunto: (coordenadas: Coordenadas) => void;
}

const Contexto = createContext<ContextoUbicacion | null>(null);
const clave = (usuarioId: string) => `ypri:ubicacion:${usuarioId}`;

/** Ciudad con cobertura cuyo centro está más cerca del punto. */
export function ciudadMasCercana(punto: Coordenadas): CiudadCobertura {
  const ciudades = Object.keys(CENTRO_CIUDAD) as CiudadCobertura[];
  return ciudades.reduce((mejor, c) => (distanciaKm(punto, CENTRO_CIUDAD[c]) < distanciaKm(punto, CENTRO_CIUDAD[mejor]) ? c : mejor), ciudades[0]);
}

function predeterminada(usuario: Usuario): UbicacionCliente {
  const zona = BARRIOS[usuario.ciudad][0];
  return { coordenadas: zona.coordenadas, etiqueta: zona.nombre, fuente: "predeterminada", ciudad: usuario.ciudad };
}

function leer(usuario: Usuario): UbicacionCliente | null {
  try {
    const crudo = localStorage.getItem(clave(usuario.id));
    if (!crudo) return null;
    const valor = JSON.parse(crudo) as UbicacionCliente;
    return sonCoordenadasValidas(valor?.coordenadas) && typeof valor.etiqueta === "string" ? valor : null;
  } catch {
    return null;
  }
}

const MENSAJES_GPS: Record<number, string> = {
  1: "No diste permiso para usar tu ubicación. Puedes elegir tu barrio para simularla.",
  2: "No pudimos obtener tu ubicación. Revisa el GPS o elige tu barrio.",
  3: "La ubicación tardó demasiado. Inténtalo de nuevo o elige tu barrio.",
};

export function UbicacionProvider({ usuario, children }: { usuario: Usuario; children: ReactNode }) {
  const [ubicacion, setUbicacion] = useState<UbicacionCliente>(() => predeterminada(usuario));
  const [gps, setGps] = useState<EstadoGps>({ estado: "inactivo" });

  useEffect(() => {
    const guardada = leer(usuario);
    if (guardada) setUbicacion(guardada);
  }, [usuario]);

  const guardar = useCallback(
    (nueva: UbicacionCliente) => {
      setUbicacion(nueva);
      try {
        localStorage.setItem(clave(usuario.id), JSON.stringify(nueva));
      } catch {
        // Sin almacenamiento: la ubicación vale solo para esta visita.
      }
    },
    [usuario.id],
  );

  const usarGps = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGps({ estado: "error", mensaje: "Este navegador no permite obtener la ubicación. Elige tu barrio para simularla." });
      return;
    }
    setGps({ estado: "buscando" });
    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        const coordenadas = { lat: posicion.coords.latitude, lng: posicion.coords.longitude };
        guardar({ coordenadas, etiqueta: "Mi ubicación", fuente: "gps", ciudad: ciudadMasCercana(coordenadas) });
        setGps({ estado: "inactivo" });
      },
      (error) => setGps({ estado: "error", mensaje: MENSAJES_GPS[error.code] ?? MENSAJES_GPS[2] }),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  }, [guardar]);

  const elegirBarrio = useCallback(
    (ciudad: CiudadCobertura, zona: Zona) => {
      setGps({ estado: "inactivo" });
      guardar({ coordenadas: zona.coordenadas, etiqueta: zona.nombre, fuente: "barrio", ciudad });
    },
    [guardar],
  );

  const elegirPunto = useCallback(
    (coordenadas: Coordenadas) => {
      setGps({ estado: "inactivo" });
      guardar({ coordenadas, etiqueta: "Punto en el mapa", fuente: "mapa", ciudad: ciudadMasCercana(coordenadas) });
    },
    [guardar],
  );

  const valor = useMemo(() => ({ ubicacion, gps, usarGps, elegirBarrio, elegirPunto }), [ubicacion, gps, usarGps, elegirBarrio, elegirPunto]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useUbicacion(): ContextoUbicacion {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useUbicacion debe usarse dentro de UbicacionProvider");
  return contexto;
}

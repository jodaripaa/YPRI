"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import type { PropsMapa } from "./tipos";

export type { CirculoMapa, MarcadorMapa, PropsMapa, TipoMarcador } from "./tipos";

/**
 * Mapa de YPRI. Leaflet usa `window`, así que se carga solo en el navegador;
 * mientras tanto se muestra un marcador de posición del mismo tamaño.
 */
export const Mapa = dynamic<PropsMapa>(() => import("./MapaLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[260px] animate-pulso-suave items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground">
      <MapPin className="h-6 w-6" aria-hidden />
      <span className="sr-only">Cargando mapa</span>
    </div>
  ),
});

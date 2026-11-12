"use client";

// Mapa de OpenStreetMap con Leaflet. Solo se carga en el navegador (ver Mapa.tsx).

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import { Circle, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import type { Coordenadas } from "@/lib/geo";
import type { PropsMapa, TipoMarcador } from "./tipos";

const ESTILO_MARCADOR: Record<TipoMarcador, string> = {
  cliente: "ypri-pin ypri-pin--cliente",
  profesional: "ypri-pin ypri-pin--profesional",
  ocupado: "ypri-pin ypri-pin--ocupado",
  inactivo: "ypri-pin ypri-pin--inactivo",
  movil: "ypri-pin ypri-pin--movil",
};

/** Escapa texto antes de ponerlo en el HTML del marcador (los nombres vienen de los datos). */
function escapar(texto: string): string {
  return texto.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

function icono(tipo: TipoMarcador, texto: string | undefined, seleccionado: boolean): L.DivIcon {
  const contenido = tipo === "cliente" ? '<span class="ypri-pin__pulso"></span>' : escapar(texto ?? "");
  return L.divIcon({
    className: "ypri-pin-caja",
    html: `<span class="${ESTILO_MARCADOR[tipo]}${seleccionado ? " ypri-pin--seleccionado" : ""}">${contenido}</span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    tooltipAnchor: [0, -20],
  });
}

const aLatLng = (c: Coordenadas): L.LatLngTuple => [c.lat, c.lng];

/** Ajusta la vista para que se vean todos los puntos (cuando cambian). */
function AjustarVista({ puntos, zoomMaximo }: { puntos: Coordenadas[]; zoomMaximo: number }) {
  const mapa = useMap();
  const clave = puntos.map((p) => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`).join("|");
  useEffect(() => {
    if (puntos.length === 0) return;
    if (puntos.length === 1) mapa.setView(aLatLng(puntos[0]), zoomMaximo);
    else mapa.fitBounds(L.latLngBounds(puntos.map(aLatLng)), { padding: [36, 36], maxZoom: zoomMaximo });
    // Solo se reajusta cuando cambia el conjunto de puntos, no en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, mapa]);
  return null;
}

/** Sigue un punto en movimiento sin cambiar el zoom (seguimiento en vivo). */
function Seguir({ punto }: { punto?: Coordenadas }) {
  const mapa = useMap();
  useEffect(() => {
    if (punto) mapa.panTo(aLatLng(punto), { animate: true, duration: 0.8 });
  }, [punto, mapa]);
  return null;
}

function ClicEnMapa({ onClic }: { onClic?: (c: Coordenadas) => void }) {
  useMapEvents({ click: (e) => onClic?.({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

export default function MapaLeaflet({ centro, zoom = 13, marcadores, circulos = [], ruta, ajustar = true, seguir, onClicMapa, etiqueta, alto = 260 }: PropsMapa) {
  const puntos = useMemo(() => marcadores.map((m) => m.coordenadas), [marcadores]);
  const color = { profesional: "#003151", movil: "#3dca8d" };

  return (
    <div role="region" aria-label={etiqueta} className="ypri-mapa relative isolate overflow-hidden rounded-2xl border border-border" style={{ height: alto }}>
      <MapContainer center={aLatLng(centro)} zoom={zoom} scrollWheelZoom={false} className="h-full w-full" attributionControl>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        {circulos.map((c) => (
          <Circle
            key={c.id}
            center={aLatLng(c.centro)}
            radius={c.radioKm * 1000}
            pathOptions={{ color: color.profesional, weight: 1, opacity: 0.4, fillColor: "#3dca8d", fillOpacity: 0.08 }}
          />
        ))}
        {ruta && <Polyline positions={ruta.map(aLatLng)} pathOptions={{ color: color.movil, weight: 4, opacity: 0.9, dashArray: "8 8" }} />}
        {marcadores.map((m) => (
          <Marker
            key={m.id}
            position={aLatLng(m.coordenadas)}
            icon={icono(m.tipo, m.texto, Boolean(m.seleccionado))}
            title={m.etiqueta}
            alt={m.etiqueta}
            keyboard={Boolean(m.onClic)}
            eventHandlers={m.onClic ? { click: m.onClic } : undefined}
            zIndexOffset={m.tipo === "cliente" ? 1000 : m.tipo === "movil" ? 2000 : 0}
          >
            <Tooltip direction="top" offset={[0, -4]}>
              {m.etiqueta}
            </Tooltip>
          </Marker>
        ))}
        {ajustar && <AjustarVista puntos={puntos} zoomMaximo={zoom} />}
        <Seguir punto={seguir} />
        <ClicEnMapa onClic={onClicMapa} />
      </MapContainer>
    </div>
  );
}

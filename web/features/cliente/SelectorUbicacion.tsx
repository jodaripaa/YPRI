"use client";

import { useState } from "react";
import { ChevronDown, Crosshair, Loader2, MapPin, Navigation } from "lucide-react";
import { Mapa, type MarcadorMapa } from "@/components/mapa/Mapa";
import { Button, cx, Modal, Select } from "@/components/ui";
import { CIUDAD_LABEL, CIUDADES_COBERTURA, type CiudadCobertura } from "@/lib/constants";
import { iniciales } from "@/lib/format";
import { useAppStore } from "@/store/AppStore";
import { BARRIOS, CENTRO_CIUDAD } from "@/lib/zonas";
import { useUbicacion, type FuenteUbicacion } from "./ubicacion";

const DESCRIPCION_FUENTE: Record<FuenteUbicacion, string> = {
  gps: "Ubicación real (GPS)",
  barrio: "Ubicación simulada",
  mapa: "Ubicación simulada",
  predeterminada: "Ubicación aproximada",
};

/** Botón con la ubicación actual del cliente; abre el selector. */
export function BotonUbicacion({ compacto, className }: { compacto?: boolean; className?: string }) {
  const { ubicacion } = useUbicacion();
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label={`Ubicación: ${ubicacion.etiqueta}, ${CIUDAD_LABEL[ubicacion.ciudad]}. Cambiar ubicación`}
        className={cx("touch-feedback flex min-w-0 items-center gap-2 rounded-full text-left transition-colors hover:bg-muted", className)}
      >
        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15">
          <MapPin className="h-4 w-4 text-accent-strong" aria-hidden />
          {ubicacion.fuente === "gps" && <span aria-hidden className="absolute right-0 top-0 h-2 w-2 rounded-full bg-accent ring-2 ring-card" />}
        </span>
        <span className="min-w-0">
          {!compacto && <span className="block text-[10px] text-muted-foreground">{DESCRIPCION_FUENTE[ubicacion.fuente]}</span>}
          <span className="flex items-center gap-1">
            <span className="truncate text-xs font-semibold">
              {ubicacion.etiqueta}
              {!compacto && `, ${CIUDAD_LABEL[ubicacion.ciudad]}`}
            </span>
            <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
          </span>
        </span>
      </button>
      {abierto && <SelectorUbicacion onCerrar={() => setAbierto(false)} />}
    </>
  );
}

export function SelectorUbicacion({ onCerrar }: { onCerrar: () => void }) {
  const { data } = useAppStore();
  const { ubicacion, gps, usarGps, elegirBarrio, elegirPunto } = useUbicacion();
  const [ciudad, setCiudad] = useState<CiudadCobertura>(ubicacion.ciudad);

  // Profesionales de la ciudad elegida, como referencia en el mapa.
  const marcadores: MarcadorMapa[] = [
    ...data.servicios
      .filter((s) => s.ciudad === ciudad)
      .map((s) => ({
        id: s.codigo,
        coordenadas: s.ubicacion,
        tipo: s.disponible ? ("profesional" as const) : ("inactivo" as const),
        etiqueta: `${s.prestador_nombre} · ${s.zona}`,
        texto: iniciales(s.prestador_nombre),
      })),
    ...(ubicacion.ciudad === ciudad ? [{ id: "yo", coordenadas: ubicacion.coordenadas, tipo: "cliente" as const, etiqueta: `Tú: ${ubicacion.etiqueta}` }] : []),
  ];

  return (
    <Modal abierto titulo="¿Dónde necesitas el servicio?" descripcion="Así te mostramos a los profesionales más cercanos." onCerrar={onCerrar} ancho="lg"
      pie={<Button onClick={onCerrar}>Listo</Button>}
    >
      <div className="space-y-5">
        <div>
          <Button variante="secondary" bloque icono={gps.estado === "buscando" ? Loader2 : Crosshair} onClick={usarGps} disabled={gps.estado === "buscando"}
            className={gps.estado === "buscando" ? "[&_svg]:animate-spin" : undefined}
          >
            {gps.estado === "buscando" ? "Buscando tu ubicación…" : "Usar mi ubicación actual"}
          </Button>
          {gps.estado === "error" && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{gps.mensaje}</p>}
          {ubicacion.fuente === "gps" && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Navigation className="h-3.5 w-3.5 text-accent-strong" aria-hidden />
              Usando tu GPS. Si estás fuera de las ciudades con cobertura no verás profesionales cerca; simula un barrio para probar.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="h-px flex-1 bg-border" />O simula tu ubicación<span className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-3">
          <Select aria-label="Ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value as CiudadCobertura)}>
            {CIUDADES_COBERTURA.map((c) => (
              <option key={c} value={c}>
                {CIUDAD_LABEL[c]}
              </option>
            ))}
          </Select>
          <div className="flex flex-wrap gap-2" role="group" aria-label={`Barrios de ${CIUDAD_LABEL[ciudad]}`}>
            {BARRIOS[ciudad].map((zona) => {
              const activo = ubicacion.fuente === "barrio" && ubicacion.ciudad === ciudad && ubicacion.etiqueta === zona.nombre;
              return (
                <button
                  key={zona.nombre}
                  type="button"
                  aria-pressed={activo}
                  onClick={() => elegirBarrio(ciudad, zona)}
                  className={cx(
                    "touch-feedback rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    activo ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-muted-foreground/40",
                  )}
                >
                  {zona.nombre}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Mapa
            etiqueta={`Mapa de ${CIUDAD_LABEL[ciudad]}. Toca un punto para elegir tu ubicación.`}
            centro={CENTRO_CIUDAD[ciudad]}
            zoom={13}
            marcadores={marcadores}
            onClicMapa={elegirPunto}
            alto={240}
          />
          <p className="mt-2 text-xs text-muted-foreground">Toca el mapa para elegir un punto exacto. Los círculos azul marino son profesionales.</p>
        </div>
      </div>
    </Modal>
  );
}

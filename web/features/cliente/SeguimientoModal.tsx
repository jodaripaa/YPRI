"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Navigation, Phone, RotateCcw } from "lucide-react";
import { Mapa } from "@/components/mapa/Mapa";
import { Button, cx, Modal } from "@/components/ui";
import { simularSeguimiento } from "@/lib/domain/cercania";
import { distanciaKm, formatearDistancia, formatearTiempo, interpolar } from "@/lib/geo";
import { iniciales } from "@/lib/format";
import type { Contrato, Servicio } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";
import { useUbicacion } from "./ubicacion";

/** Segundos reales que dura la demostración del recorrido. */
const DURACION_SIMULACION_SEG = 40;

/** Zoom que deja ver origen y destino a la vez. */
function zoomPara(km: number): number {
  if (km < 1.5) return 15;
  if (km < 3.5) return 14;
  if (km < 8) return 13;
  return 12;
}

/**
 * Seguimiento del profesional en camino, al estilo de las apps de domicilios.
 * Es una simulación: el profesional avanza en línea recta desde su zona hasta
 * el lugar del servicio y el tiempo restante se recalcula en cada paso.
 */
export function SeguimientoModal({ contrato, servicio, onCerrar }: { contrato: Contrato; servicio: Servicio; onCerrar: () => void }) {
  const { data } = useAppStore();
  const { ubicacion } = useUbicacion();
  const destino = contrato.ubicacion ?? ubicacion.coordenadas;
  const origen = servicio.ubicacion;
  const [inicio, setInicio] = useState(() => Date.now());
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 500);
    return () => clearInterval(id);
  }, [inicio]);

  const estado = simularSeguimiento(origen, destino, (ahora - inicio) / 1000, DURACION_SIMULACION_SEG);
  const telefono = data.usuarios.find((u) => u.id === servicio.prestador_id)?.telefono;
  const nombre = contrato.prestador_nombre.split(" ")[0];
  const vista = useMemo(() => ({ centro: interpolar(origen, destino, 0.5), zoom: zoomPara(distanciaKm(origen, destino)) }), [origen, destino]);

  return (
    <Modal
      abierto
      ancho="lg"
      titulo={estado.llego ? `${nombre} llegó` : `${nombre} va en camino`}
      descripcion={`${contrato.servicio_nombre} · ${contrato.id}`}
      onCerrar={onCerrar}
      pie={
        <>
          <Button variante="secondary" icono={RotateCcw} onClick={() => setInicio(Date.now())}>
            Repetir
          </Button>
          <Button onClick={onCerrar}>Cerrar</Button>
        </>
      }
    >
      <div className="space-y-4">
        {contrato.estado === "Pendiente" && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-400/10 dark:text-amber-200">
            Simulación: así verás a tu profesional cuando acepte la solicitud.
          </p>
        )}

        <div className="flex items-center gap-4">
          <span
            className={cx(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
              estado.llego ? "animate-pop bg-accent text-accent-foreground" : "bg-primary text-primary-foreground",
            )}
          >
            {estado.llego ? <CheckCircle2 className="h-7 w-7" aria-hidden /> : <Navigation className="h-6 w-6" aria-hidden />}
          </span>
          <div className="min-w-0 flex-1" aria-live="polite">
            <p className="text-2xl font-bold tracking-tight">{estado.llego ? "¡Ya está aquí!" : `Llega en ${formatearTiempo(estado.minutosRestantes)}`}</p>
            <p className="text-sm text-muted-foreground">
              {estado.llego ? `${contrato.prestador_nombre} está en ${contrato.direccion}.` : `A ${formatearDistancia(estado.distanciaRestanteKm)} de ti`}
            </p>
          </div>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Avance del recorrido" aria-valuenow={Math.round(estado.progreso * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-accent transition-[width] duration-500 ease-linear" style={{ width: `${estado.progreso * 100}%` }} />
        </div>

        <Mapa
          etiqueta={`Recorrido de ${contrato.prestador_nombre} hasta el lugar del servicio`}
          centro={vista.centro}
          zoom={vista.zoom}
          ajustar={false}
          alto={280}
          ruta={[estado.posicion, destino]}
          marcadores={[
            { id: "destino", coordenadas: destino, tipo: "cliente", etiqueta: `Lugar del servicio: ${contrato.direccion}` },
            { id: "movil", coordenadas: estado.posicion, tipo: "movil", etiqueta: `${contrato.prestador_nombre} en camino`, texto: iniciales(contrato.prestador_nombre) },
          ]}
        />

        <div className="flex items-center gap-3 rounded-2xl border border-border p-3">
          <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-sm font-semibold text-enfasis">
            {iniciales(contrato.prestador_nombre)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{contrato.prestador_nombre}</p>
            <p className="text-xs text-muted-foreground">Sale desde {servicio.zona}</p>
          </div>
          {telefono && (
            <a href={`tel:${telefono}`} aria-label={`Llamar a ${contrato.prestador_nombre}`} className="touch-feedback flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Phone className="h-4 w-4" aria-hidden />
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
}

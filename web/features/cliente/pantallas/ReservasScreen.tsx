"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { CalendarDays, CalendarX, Clock, MapPin, Navigation, Star } from "lucide-react";
import { Button, cx, EmptyState, escalonado, EstadoContratoBadge, useToast } from "@/components/ui";
import type { EstadoContrato } from "@/lib/constants";
import { accionesDisponibles, contratosVisiblesPara, ESTADOS_ACTIVOS, type AccionContrato } from "@/lib/domain/contracts";
import { formatearFecha, formatearMoneda, iniciales, pluralizar } from "@/lib/format";
import type { Contrato, Usuario } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";
import { useContratos } from "@/store/hooks";
import { ConfirmDialog, RateDialog } from "../../contracts/ContractDialogs";
import { CONFIGURACION_ACCIONES } from "../../contracts/contractActions";
import { BarraSuperior, MarcoMovil } from "../componentes";
import { SeguimientoModal } from "../SeguimientoModal";

type Pestana = "proximas" | "historial";

const ESTADOS_PESTANA: Record<Pestana, readonly EstadoContrato[]> = {
  proximas: ESTADOS_ACTIVOS,
  historial: ["Completado", "Cancelado"],
};

type Dialogo = { tipo: "calificar" | "cancelar" | "seguir"; contrato: Contrato } | null;

interface Props {
  usuario: Usuario;
  onExplorar: () => void;
  onAbrirServicio: (codigo: string) => void;
}

export function ReservasScreen({ usuario, onExplorar, onAbrirServicio }: Props) {
  const { data } = useAppStore();
  const { transicionar, calificar } = useContratos();
  const toast = useToast();
  const [pestana, setPestana] = useState<Pestana>("proximas");
  const [dialogo, setDialogo] = useState<Dialogo>(null);

  const propias = useMemo(() => contratosVisiblesPara(data.contratos, usuario), [data.contratos, usuario]);
  const porPestana = (p: Pestana) => propias.filter((c) => ESTADOS_PESTANA[p].includes(c.estado));
  const visibles = porPestana(pestana).sort((a, b) => (pestana === "proximas" ? a.fecha.localeCompare(b.fecha) : b.fecha.localeCompare(a.fecha)));

  const servicioDe = (contrato: Contrato) => data.servicios.find((s) => s.codigo === contrato.servicio_codigo);

  const alAccionar = (contrato: Contrato, accion: AccionContrato) => {
    if (accion === "calificar") return setDialogo({ tipo: "calificar", contrato });
    if (accion === "cancelar") return setDialogo({ tipo: "cancelar", contrato });
  };

  const cancelar = (contrato: Contrato) => {
    const resultado = transicionar(contrato.id, "cancelar");
    if (resultado.ok) toast.exito(CONFIGURACION_ACCIONES.cancelar.exito);
    else toast.error(resultado.error);
    setDialogo(null);
  };

  return (
    <MarcoMovil>
      <BarraSuperior titulo="Mis reservas" subtitulo="Sigue tus servicios y califica a los profesionales" />

      <div role="tablist" aria-label="Filtrar reservas" className="mx-4 mt-4 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
        {(["proximas", "historial"] as const).map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={pestana === p}
            onClick={() => setPestana(p)}
            className={cx(
              "rounded-lg py-2 text-sm font-medium transition-colors",
              pestana === p ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {p === "proximas" ? "Próximas" : "Historial"} ({porPestana(p).length})
          </button>
        ))}
      </div>

      {visibles.length ? (
        <div key={pestana} className="flex flex-col gap-3 px-4 py-4 md:grid md:grid-cols-2 xl:grid-cols-3">
          {visibles.map((contrato, i) => (
            <TarjetaReserva
              key={contrato.id}
              style={escalonado(i)}
              contrato={contrato}
              acciones={accionesDisponibles(contrato, usuario)}
              onAccion={alAccionar}
              onVerProfesional={() => onAbrirServicio(contrato.servicio_codigo)}
              onSeguir={ESTADOS_ACTIVOS.includes(contrato.estado) ? () => setDialogo({ tipo: "seguir", contrato }) : undefined}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          sinMarco
          icono={CalendarX}
          titulo={pestana === "proximas" ? "No tienes reservas próximas" : "Aún no tienes servicios finalizados"}
          descripcion={pestana === "proximas" ? "Encuentra un profesional y agenda tu servicio en minutos." : undefined}
          accion={pestana === "proximas" && <Button onClick={onExplorar}>Buscar un servicio</Button>}
        />
      )}

      {dialogo?.tipo === "calificar" && (
        <RateDialog
          contrato={dialogo.contrato}
          onCerrar={() => setDialogo(null)}
          onEnviar={(puntuacion, comentario) => {
            const resultado = calificar(dialogo.contrato.id, puntuacion, comentario);
            if (!resultado.ok) return resultado.error;
            toast.exito(CONFIGURACION_ACCIONES.calificar.exito);
            setDialogo(null);
            return null;
          }}
        />
      )}

      {dialogo?.tipo === "seguir" && servicioDe(dialogo.contrato) && (
        <SeguimientoModal contrato={dialogo.contrato} servicio={servicioDe(dialogo.contrato)!} onCerrar={() => setDialogo(null)} />
      )}

      {dialogo?.tipo === "cancelar" && (
        <ConfirmDialog
          titulo={`Cancelar reserva ${dialogo.contrato.id}`}
          mensaje={CONFIGURACION_ACCIONES.cancelar.confirmacion ?? ""}
          etiquetaConfirmar="Cancelar reserva"
          onCerrar={() => setDialogo(null)}
          onConfirmar={() => cancelar(dialogo.contrato)}
        />
      )}
    </MarcoMovil>
  );
}

function TarjetaReserva({
  contrato,
  acciones,
  onAccion,
  onVerProfesional,
  onSeguir,
  style,
}: {
  style?: CSSProperties;
  contrato: Contrato;
  acciones: AccionContrato[];
  onAccion: (contrato: Contrato, accion: AccionContrato) => void;
  onVerProfesional: () => void;
  /** Abre el seguimiento en el mapa (solo reservas activas). */
  onSeguir?: () => void;
}) {
  return (
    <article style={style} className="hover-elevar flex animate-fade-up flex-col rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-muted-foreground">{contrato.id}</span>
        <EstadoContratoBadge estado={contrato.estado} />
      </div>

      <button type="button" onClick={onVerProfesional} className="touch-feedback mb-3 flex items-center gap-3 text-left">
        <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-semibold text-enfasis">
          {iniciales(contrato.prestador_nombre)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{contrato.prestador_nombre}</span>
          <span className="block text-xs text-muted-foreground">{contrato.servicio_nombre}</span>
        </span>
      </button>

      <dl className="space-y-1.5 text-sm text-muted-foreground">
        <Dato icono={CalendarDays} etiqueta="Fecha" valor={formatearFecha(contrato.fecha)} />
        <Dato icono={Clock} etiqueta="Duración" valor={pluralizar(contrato.horas, "hora", "horas")} />
        <Dato icono={MapPin} etiqueta="Dirección" valor={contrato.direccion} />
      </dl>

      {contrato.calificacion !== undefined && (
        <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-muted px-3 py-2 text-sm">
          <Star className="mt-0.5 h-4 w-4 shrink-0 fill-amber-400 text-amber-400" aria-hidden />
          <span>
            <span className="font-medium">Calificaste {contrato.calificacion} de 5</span>
            {contrato.comentario && <span className="text-muted-foreground"> · {contrato.comentario}</span>}
          </span>
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
        <p className="text-sm">
          <span className="text-base font-bold text-enfasis">{formatearMoneda(contrato.total)}</span>
          <span className="text-xs text-muted-foreground"> IVA incl.</span>
        </p>
        <div className="flex gap-2">
          {onSeguir && (
            <Button variante="primary" icono={Navigation} className="h-9 px-3 text-xs" onClick={onSeguir}>
              Seguir
            </Button>
          )}
          {acciones.includes("cancelar") && (
            <Button variante="danger" className="h-9 px-3 text-xs" onClick={() => onAccion(contrato, "cancelar")}>
              Cancelar
            </Button>
          )}
          {acciones.includes("calificar") && (
            <Button variante="accent" icono={Star} className="h-9 px-3 text-xs" onClick={() => onAccion(contrato, "calificar")}>
              Calificar
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

function Dato({ icono: Icono, etiqueta, valor }: { icono: typeof Clock; etiqueta: string; valor: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icono className="h-4 w-4 shrink-0" aria-hidden />
      <dt className="sr-only">{etiqueta}</dt>
      <dd className="truncate">{valor}</dd>
    </div>
  );
}

import { CalendarDays, Clock, MapPin, Star } from "lucide-react";
import { Button, Card, EstadoContratoBadge } from "@/components/ui";
import type { AccionContrato } from "@/lib/domain/contracts";
import { formatearFecha, formatearMoneda, pluralizar } from "@/lib/format";
import type { Contrato, Usuario } from "@/lib/types";
import { CONFIGURACION_ACCIONES } from "./contractActions";

interface Props {
  contrato: Contrato;
  usuario: Usuario;
  acciones: AccionContrato[];
  onAccion: (contrato: Contrato, accion: AccionContrato) => void;
}

/** Describe la contraparte según quién mira el contrato. */
function contraparte(contrato: Contrato, usuario: Usuario): string {
  if (usuario.rol === "cliente") return `Con ${contrato.prestador_nombre}`;
  if (usuario.rol === "prestador") return `Para ${contrato.cliente_nombre}`;
  return `${contrato.cliente_nombre} con ${contrato.prestador_nombre}`;
}

export function ContractCard({ contrato, usuario, acciones, onAccion }: Props) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">{contrato.servicio_nombre}</h3>
            <span className="font-mono text-xs text-slate-400">{contrato.id}</span>
          </div>
          <p className="text-sm text-slate-600">{contraparte(contrato, usuario)}</p>
        </div>
        <EstadoContratoBadge estado={contrato.estado} />
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-3">
        <Dato icono={CalendarDays} etiqueta="Fecha" valor={formatearFecha(contrato.fecha)} />
        <Dato icono={Clock} etiqueta="Duración" valor={pluralizar(contrato.horas, "hora", "horas")} />
        <Dato icono={MapPin} etiqueta="Dirección" valor={contrato.direccion} />
      </dl>

      {contrato.nota && <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{contrato.nota}</p>}

      {contrato.calificacion !== undefined && (
        <div className="mt-3 flex items-start gap-2 text-sm">
          <span className="inline-flex items-center gap-1 font-medium text-slate-900">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
            {contrato.calificacion} de 5
          </span>
          {contrato.comentario && <span className="text-slate-600">· {contrato.comentario}</span>}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Total <span className="text-base font-semibold text-slate-900">{formatearMoneda(contrato.total)}</span>
          <span className="text-xs"> IVA incluido</span>
        </p>
        {acciones.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {acciones.map((accion) => {
              const configuracion = CONFIGURACION_ACCIONES[accion];
              return (
                <Button key={accion} tamano="sm" variante={configuracion.variante} onClick={() => onAccion(contrato, accion)}>
                  {configuracion.etiqueta}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

function Dato({ icono: Icono, etiqueta, valor }: { icono: typeof Clock; etiqueta: string; valor: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icono className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      <dt className="sr-only">{etiqueta}</dt>
      <dd className="truncate">{valor}</dd>
    </div>
  );
}

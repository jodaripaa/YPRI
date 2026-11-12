import type { CSSProperties } from "react";
import { CalendarDays, Clock, MapPin, MessageSquareText, Star } from "lucide-react";
import { Avatar, Button, EstadoContratoBadge } from "@/components/ui";
import type { AccionContrato } from "@/lib/domain/contracts";
import { formatearFecha, formatearMoneda, iniciales, pluralizar } from "@/lib/format";
import type { Contrato, Usuario } from "@/lib/types";
import { CONFIGURACION_ACCIONES } from "./contractActions";

interface Props {
  contrato: Contrato;
  usuario: Usuario;
  acciones: AccionContrato[];
  onAccion: (contrato: Contrato, accion: AccionContrato) => void;
  style?: CSSProperties;
}

/** Persona que se muestra en la tarjeta según quién la mira. */
function contraparte(contrato: Contrato, usuario: Usuario): { nombre: string; detalle: string } {
  if (usuario.rol === "cliente") return { nombre: contrato.prestador_nombre, detalle: "Profesional" };
  if (usuario.rol === "prestador") return { nombre: contrato.cliente_nombre, detalle: "Cliente" };
  return { nombre: contrato.cliente_nombre, detalle: `con ${contrato.prestador_nombre}` };
}

export function ContractCard({ contrato, usuario, acciones, onAccion, style }: Props) {
  const persona = contraparte(contrato, usuario);
  return (
    <article style={style} className="hover-elevar flex animate-fade-up flex-col rounded-2xl border border-border bg-card p-4 shadow-suave sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-muted-foreground">{contrato.id}</span>
        <EstadoContratoBadge estado={contrato.estado} />
      </div>

      <div className="mb-4 flex items-center gap-3">
        <Avatar texto={iniciales(persona.nombre)} className="h-12 w-12 rounded-xl text-base" />
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{contrato.servicio_nombre}</h3>
          <p className="truncate text-sm text-muted-foreground">
            {persona.nombre} · {persona.detalle}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-3">
        <Dato icono={CalendarDays} etiqueta="Fecha" valor={formatearFecha(contrato.fecha)} />
        <Dato icono={Clock} etiqueta="Duración" valor={pluralizar(contrato.horas, "hora", "horas")} />
        <Dato icono={MapPin} etiqueta="Dirección" valor={contrato.direccion} />
      </dl>

      {contrato.nota && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-muted px-3 py-2 text-sm text-foreground/80">
          <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          {contrato.nota}
        </p>
      )}

      {contrato.calificacion !== undefined && (
        <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-sm">
          <Star className="mt-0.5 h-4 w-4 shrink-0 fill-amber-400 text-amber-400" aria-hidden />
          <span>
            <span className="font-medium">{contrato.calificacion} de 5</span>
            {contrato.comentario && <span className="text-foreground/70"> · {contrato.comentario}</span>}
          </span>
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">
          <span className="text-lg font-bold text-primary">{formatearMoneda(contrato.total)}</span>
          <span className="text-xs text-muted-foreground"> IVA incluido</span>
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
    </article>
  );
}

function Dato({ icono: Icono, etiqueta, valor }: { icono: typeof Clock; etiqueta: string; valor: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icono className="h-3.5 w-3.5" aria-hidden />
      </span>
      <dt className="sr-only">{etiqueta}</dt>
      <dd className="truncate">{valor}</dd>
    </div>
  );
}

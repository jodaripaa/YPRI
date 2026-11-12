import { Clock, MapPin } from "lucide-react";
import { Avatar, Button, Calificacion, Card } from "@/components/ui";
import { CATEGORIA_LABEL, CIUDAD_LABEL } from "@/lib/constants";
import { formatearMoneda, iniciales, pluralizar } from "@/lib/format";
import type { Servicio } from "@/lib/types";

export function ServiceCard({ servicio, onSolicitar }: { servicio: Servicio; onSolicitar: (servicio: Servicio) => void }) {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start gap-3">
        <Avatar texto={iniciales(servicio.prestador_nombre)} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">{CATEGORIA_LABEL[servicio.categoria]}</p>
          <h3 className="truncate text-base font-semibold text-foreground">{servicio.prestador_nombre}</h3>
          <Calificacion valor={servicio.calificacion} resenas={servicio.num_resenas} />
        </div>
      </div>

      <p className="mt-4 line-clamp-2 flex-1 text-sm text-foreground/70">{servicio.descripcion}</p>

      <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          <dt className="sr-only">Ciudad</dt>
          <dd>{CIUDAD_LABEL[servicio.ciudad]}</dd>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          <dt className="sr-only">Experiencia</dt>
          <dd>{pluralizar(servicio.anios_experiencia, "año", "años")} de experiencia</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-4">
        <p>
          <span className="text-lg font-semibold text-foreground">{formatearMoneda(servicio.tarifa_hora)}</span>
          <span className="text-sm text-muted-foreground"> / hora</span>
        </p>
        {servicio.disponible ? (
          <Button tamano="sm" onClick={() => onSolicitar(servicio)}>
            Solicitar
          </Button>
        ) : (
          <span className="text-sm font-medium text-muted-foreground/70">No disponible</span>
        )}
      </div>
    </Card>
  );
}

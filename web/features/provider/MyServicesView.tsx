"use client";

import { useState, type CSSProperties } from "react";
import { Briefcase, MapPin, Plus } from "lucide-react";
import { Button, Card, cx, EmptyState, escalonado, PageHeader, useToast } from "@/components/ui";
import { CATEGORIA_LABEL, CIUDAD_LABEL } from "@/lib/constants";
import { serviciosDe } from "@/lib/domain/services";
import { formatearCalificacion, formatearMoneda, pluralizar } from "@/lib/format";
import type { Servicio, Usuario } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";
import { useServicios } from "@/store/hooks";
import { ICONO_CATEGORIA } from "../cliente/categorias";
import { PublishServiceModal } from "./PublishServiceModal";

export function MyServicesView({ usuario }: { usuario: Usuario }) {
  const { data } = useAppStore();
  const [publicando, setPublicando] = useState(false);
  const servicios = serviciosDe(data.servicios, usuario.id);

  const botonPublicar = (
    <Button variante="accent" icono={Plus} onClick={() => setPublicando(true)}>
      Publicar servicio
    </Button>
  );

  return (
    <>
      <PageHeader
        titulo="Mis servicios"
        descripcion="Controla qué servicios ven los clientes y cuándo estás disponible."
        acciones={servicios.length > 0 && botonPublicar}
      />

      {servicios.length ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {servicios.map((servicio, i) => (
            <ServicioPropio key={servicio.codigo} servicio={servicio} style={escalonado(i, 70)} />
          ))}
        </div>
      ) : (
        <EmptyState
          icono={Briefcase}
          titulo="Aún no has publicado servicios"
          descripcion="Publica tu primer servicio para empezar a recibir solicitudes de clientes."
          accion={botonPublicar}
        />
      )}

      {publicando && <PublishServiceModal usuario={usuario} onCerrar={() => setPublicando(false)} />}
    </>
  );
}

function ServicioPropio({ servicio, style }: { servicio: Servicio; style?: CSSProperties }) {
  const { alternarDisponibilidad } = useServicios();
  const toast = useToast();
  const Icono = ICONO_CATEGORIA[servicio.categoria];

  const alternar = () => {
    const resultado = alternarDisponibilidad(servicio.codigo);
    if (!resultado.ok) return toast.error(resultado.error);
    toast.exito(servicio.disponible ? "Servicio pausado: no recibirás nuevas solicitudes." : "Servicio activo de nuevo.");
  };

  return (
    <Card style={style} className="hover-elevar animate-fade-up overflow-hidden">
      <div className="relative flex items-center gap-4 bg-gradient-to-br from-primary to-primary/85 p-5 text-primary-foreground">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
          <Icono className="h-6 w-6 text-accent" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold">{CATEGORIA_LABEL[servicio.categoria]}</h3>
          <p className="flex items-center gap-1 text-sm text-primary-foreground/75">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {CIUDAD_LABEL[servicio.ciudad]} · <span className="font-mono text-xs">{servicio.codigo}</span>
          </p>
        </div>
        <Interruptor activo={servicio.disponible} onCambiar={alternar} />
      </div>
      <div className="p-5">
        <p className="text-sm text-foreground/80">{servicio.descripcion}</p>
        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Cifra etiqueta="Tarifa por hora" valor={formatearMoneda(servicio.tarifa_hora)} />
          <Cifra etiqueta="Calificación" valor={servicio.num_resenas ? formatearCalificacion(servicio.calificacion) : "Nuevo"} />
          <Cifra etiqueta="Trabajos" valor={String(servicio.num_contratos)} />
        </dl>
        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span className={servicio.disponible ? "h-2 w-2 animate-pulso-suave rounded-full bg-accent" : "h-2 w-2 rounded-full bg-muted-foreground/50"} aria-hidden />
          {servicio.disponible ? "Visible para los clientes" : "Pausado: no recibe solicitudes nuevas"}
          {servicio.num_resenas > 0 && <span className="ml-auto">{pluralizar(servicio.num_resenas, "reseña", "reseñas")}</span>}
        </p>
      </div>
    </Card>
  );
}

function Cifra({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-xl bg-muted px-2 py-2.5">
      <dd className="truncate text-sm font-bold text-primary">{valor}</dd>
      <dt className="text-[11px] text-muted-foreground">{etiqueta}</dt>
    </div>
  );
}

/** Interruptor accesible para pausar o reactivar un servicio. */
function Interruptor({ activo, onCambiar }: { activo: boolean; onCambiar: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={activo ? "Pausar servicio" : "Reactivar servicio"}
      onClick={onCambiar}
      className={cx(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        activo ? "bg-accent" : "bg-white/25",
      )}
    >
      <span
        aria-hidden
        className={cx("absolute left-0 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300", activo ? "translate-x-6" : "translate-x-1")}
      />
    </button>
  );
}

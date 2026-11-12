"use client";

import { useState } from "react";
import { Briefcase, Plus } from "lucide-react";
import { Badge, Button, Calificacion, Card, EmptyState, PageHeader, useToast } from "@/components/ui";
import { CATEGORIA_LABEL, CIUDAD_LABEL } from "@/lib/constants";
import { serviciosDe } from "@/lib/domain/services";
import { formatearMoneda, pluralizar } from "@/lib/format";
import type { Servicio, Usuario } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";
import { useServicios } from "@/store/hooks";
import { PublishServiceModal } from "./PublishServiceModal";

export function MyServicesView({ usuario }: { usuario: Usuario }) {
  const { data } = useAppStore();
  const [publicando, setPublicando] = useState(false);
  const servicios = serviciosDe(data.servicios, usuario.id);

  const botonPublicar = (
    <Button icono={Plus} onClick={() => setPublicando(true)}>
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
          {servicios.map((servicio) => (
            <ServicioPropio key={servicio.codigo} servicio={servicio} />
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

function ServicioPropio({ servicio }: { servicio: Servicio }) {
  const { alternarDisponibilidad } = useServicios();
  const toast = useToast();

  const alternar = () => {
    const resultado = alternarDisponibilidad(servicio.codigo);
    if (!resultado.ok) return toast.error(resultado.error);
    toast.exito(servicio.disponible ? "Servicio pausado: no recibirás nuevas solicitudes." : "Servicio activo de nuevo.");
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">{CATEGORIA_LABEL[servicio.categoria]}</h3>
            <span className="font-mono text-xs text-slate-400">{servicio.codigo}</span>
          </div>
          <p className="text-sm text-slate-500">{CIUDAD_LABEL[servicio.ciudad]}</p>
        </div>
        <Badge tono={servicio.disponible ? "green" : "neutral"} conPunto>
          {servicio.disponible ? "Disponible" : "Pausado"}
        </Badge>
      </div>
      <p className="mt-3 text-sm text-slate-600">{servicio.descripcion}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span className="font-semibold text-slate-900">{formatearMoneda(servicio.tarifa_hora)} / hora</span>
        <Calificacion valor={servicio.calificacion} resenas={servicio.num_resenas} />
        <span className="text-slate-500">{pluralizar(servicio.num_contratos, "trabajo", "trabajos")}</span>
      </div>
      <div className="mt-4 border-t border-slate-100 pt-4">
        <Button variante="secondary" tamano="sm" onClick={alternar}>
          {servicio.disponible ? "Pausar servicio" : "Reactivar servicio"}
        </Button>
      </div>
    </Card>
  );
}

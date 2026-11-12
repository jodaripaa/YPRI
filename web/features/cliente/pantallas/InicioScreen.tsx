"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays } from "lucide-react";
import { CIUDAD_LABEL, type CategoriaServicio } from "@/lib/constants";
import { estadisticasPlataforma, proximaReserva, serviciosDestacados } from "@/lib/domain/cliente";
import { filtrarCatalogo } from "@/lib/domain/services";
import { formatearCalificacion, formatearFecha } from "@/lib/format";
import type { Usuario } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";
import {
  BarraBusqueda,
  CarruselCategorias,
  EncabezadoInicio,
  EncabezadoSeccion,
  MarcoMovil,
  TarjetaDestacada,
  TarjetaServicio,
} from "../componentes";

interface Props {
  usuario: Usuario;
  onBuscar: (texto: string, categoria?: CategoriaServicio) => void;
  onAbrirServicio: (codigo: string) => void;
  onVerReservas: () => void;
  onPerfil: () => void;
}

export function InicioScreen({ usuario, onBuscar, onAbrirServicio, onVerReservas, onPerfil }: Props) {
  const { data } = useAppStore();
  const [texto, setTexto] = useState("");

  const destacados = useMemo(() => serviciosDestacados(data.servicios, usuario.ciudad), [data.servicios, usuario.ciudad]);
  const enTuCiudad = useMemo(
    () => filtrarCatalogo(data.servicios, { texto: "", categoria: "todas", ciudad: usuario.ciudad, soloDisponibles: false, orden: "relevancia" }),
    [data.servicios, usuario.ciudad],
  );
  const proxima = proximaReserva(data.contratos, usuario);
  const stats = estadisticasPlataforma(data);
  const nombre = usuario.nombre.split(" ")[0];

  return (
    <MarcoMovil>
      <EncabezadoInicio usuario={usuario} onPerfil={onPerfil} />

      <div className="px-4 pb-1 pt-4">
        <p className="text-sm text-muted-foreground">Hola, {nombre}</p>
        <h1 className="text-2xl font-bold tracking-tight">¿Qué necesitas hoy?</h1>
      </div>

      <BarraBusqueda valor={texto} onCambiar={setTexto} onEnviar={(valor) => onBuscar(valor.trim())} />

      <div className="px-4 py-2">
        {proxima ? (
          <button
            type="button"
            onClick={onVerReservas}
            className="touch-feedback flex w-full items-center gap-4 rounded-2xl bg-primary p-4 text-left"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent">
              <CalendarDays className="h-5 w-5 text-accent-foreground" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="mb-1 inline-block rounded-full bg-primary-foreground/15 px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                {proxima.estado === "Pendiente" ? "Esperando confirmación" : "Confirmada"}
              </span>
              <span className="block truncate text-base font-bold text-primary-foreground">
                {proxima.servicio_nombre} con {proxima.prestador_nombre}
              </span>
              <span className="block text-sm text-primary-foreground/80">{formatearFecha(proxima.fecha)}</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-primary-foreground" aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onBuscar("")}
            className="touch-feedback flex w-full items-center justify-between gap-4 rounded-2xl bg-primary p-4 text-left"
          >
            <span>
              <span className="mb-1 block text-lg font-bold text-primary-foreground">Agenda tu próximo servicio</span>
              <span className="block text-sm text-primary-foreground/80">Profesionales verificados en {CIUDAD_LABEL[usuario.ciudad]}</span>
            </span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20">
              <ArrowRight className="h-5 w-5 text-primary-foreground" aria-hidden />
            </span>
          </button>
        )}
      </div>

      <section className="py-4">
        <EncabezadoSeccion titulo="Categorías" accion="Ver todas" onAccion={() => onBuscar("")} />
        <CarruselCategorias onSeleccionar={(categoria) => onBuscar("", categoria)} />
      </section>

      {destacados.length > 0 && (
        <section className="py-2">
          <EncabezadoSeccion titulo="Mejor calificados" accion="Ver todo" onAccion={() => onBuscar("")} />
          <div className="hide-scrollbar flex gap-3 overflow-x-auto px-4 pb-2 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4">
            {destacados.map((servicio) => (
              <TarjetaDestacada key={servicio.codigo} servicio={servicio} onAbrir={(s) => onAbrirServicio(s.codigo)} />
            ))}
          </div>
        </section>
      )}

      <section className="py-4">
        <EncabezadoSeccion titulo={`En ${CIUDAD_LABEL[usuario.ciudad]}`} accion="Ver todo" onAccion={() => onBuscar("")} />
        <div className="flex flex-col gap-3 px-4 md:grid md:grid-cols-2 xl:grid-cols-3">
          {enTuCiudad.map((servicio) => (
            <TarjetaServicio key={servicio.codigo} servicio={servicio} onAbrir={(s) => onAbrirServicio(s.codigo)} />
          ))}
        </div>
      </section>

      <section className="px-4 py-4">
        <div className="rounded-2xl bg-muted p-4">
          <h2 className="mb-3 text-center text-sm font-semibold">YPRI en cifras</h2>
          <dl className="grid grid-cols-3 gap-4 text-center">
            <Cifra valor={String(stats.profesionales)} etiqueta="Profesionales" />
            <Cifra valor={String(stats.serviciosCompletados)} etiqueta="Servicios realizados" acento />
            <Cifra valor={stats.calificacionPromedio === null ? "—" : formatearCalificacion(stats.calificacionPromedio)} etiqueta="Calificación" />
          </dl>
        </div>
      </section>
    </MarcoMovil>
  );
}

function Cifra({ valor, etiqueta, acento }: { valor: string; etiqueta: string; acento?: boolean }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
      <dd className={acento ? "text-2xl font-bold text-accent-strong" : "text-2xl font-bold text-primary"}>{valor}</dd>
    </div>
  );
}

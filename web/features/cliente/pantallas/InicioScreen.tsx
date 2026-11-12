"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays, MapPinOff } from "lucide-react";
import { Mapa, type MarcadorMapa } from "@/components/mapa/Mapa";
import { CATEGORIA_LABEL, CIUDAD_LABEL, type CategoriaServicio } from "@/lib/constants";
import { calcularCercania, serviciosCercanos } from "@/lib/domain/cercania";
import { estadisticasPlataforma, proximaReserva, serviciosDestacados } from "@/lib/domain/cliente";
import { formatearCalificacion, formatearFecha, iniciales, pluralizar } from "@/lib/format";
import { formatearDistancia, formatearTiempo } from "@/lib/geo";
import type { Usuario } from "@/lib/types";
import { EmptyState, escalonado } from "@/components/ui";
import { useAppStore } from "@/store/AppStore";
import { BarraBusqueda, CarruselCategorias, EncabezadoInicio, EncabezadoSeccion, MarcoMovil, TarjetaDestacada, TarjetaServicio } from "../componentes";
import { BotonUbicacion } from "../SelectorUbicacion";
import { useUbicacion } from "../ubicacion";

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

  const { ubicacion } = useUbicacion();
  const ciudad = ubicacion.ciudad;
  const destacados = useMemo(() => serviciosDestacados(data.servicios, ciudad), [data.servicios, ciudad]);
  // Profesionales que atienden en la ubicación del cliente, del más cercano al más lejano.
  const cercanos = useMemo(() => serviciosCercanos(data.servicios, ubicacion.coordenadas), [data.servicios, ubicacion.coordenadas]);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);

  const marcadores: MarcadorMapa[] = [
    { id: "yo", coordenadas: ubicacion.coordenadas, tipo: "cliente", etiqueta: `Tú: ${ubicacion.etiqueta}` },
    ...cercanos.map(({ servicio, distanciaKm }) => ({
      id: servicio.codigo,
      coordenadas: servicio.ubicacion,
      tipo: servicio.disponible ? ("profesional" as const) : ("inactivo" as const),
      etiqueta: `${servicio.prestador_nombre} · ${CATEGORIA_LABEL[servicio.categoria]} · a ${formatearDistancia(distanciaKm)}`,
      texto: iniciales(servicio.prestador_nombre),
      seleccionado: seleccionado === servicio.codigo,
      onClic: () => setSeleccionado(servicio.codigo),
    })),
  ];
  const proxima = proximaReserva(data.contratos, usuario);
  const stats = estadisticasPlataforma(data);
  const nombre = usuario.nombre.split(" ")[0];

  return (
    <MarcoMovil>
      <EncabezadoInicio usuario={usuario} onPerfil={onPerfil} />

      {/* En escritorio, saludo, búsqueda y próxima reserva forman un encabezado azul. */}
      <div className="relative lg:mx-4 lg:mt-8 lg:grid lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-10 lg:overflow-hidden lg:rounded-3xl lg:bg-primary lg:p-10 lg:shadow-elevada">
        <div aria-hidden className="absolute -right-24 -top-24 hidden h-80 w-80 rounded-full bg-accent/20 blur-3xl lg:block" />
        <div aria-hidden className="absolute -bottom-32 left-1/3 hidden h-72 w-72 rounded-full bg-white/5 blur-2xl lg:block" />
        <div className="relative">
          <div className="px-4 pb-1 pt-4 lg:p-0">
            <p className="text-sm text-muted-foreground lg:text-primary-foreground/70">Hola, {nombre}</p>
            <h1 className="text-2xl font-bold tracking-tight lg:mt-1 lg:text-4xl lg:text-primary-foreground">¿Qué necesitas hoy?</h1>
            <p className="mt-2 hidden max-w-md text-primary-foreground/75 lg:block">
              Profesionales verificados en {CIUDAD_LABEL[ciudad]}, con precios claros y calificaciones reales.
            </p>
          </div>
          <BarraBusqueda
            valor={texto}
            onCambiar={setTexto}
            onEnviar={(valor) => onBuscar(valor.trim())}
            className="lg:px-0 lg:pb-0 lg:pt-6"
            claseCampo="lg:bg-card lg:py-4 lg:shadow-elevada"
          />
        </div>

      <div className="relative px-4 py-2 lg:p-0">
        {proxima ? (
          <button
            type="button"
            onClick={onVerReservas}
            className="touch-feedback hover-elevar flex w-full animate-fade-up items-center gap-4 rounded-2xl bg-primary p-4 text-left shadow-elevada lg:bg-white/10 lg:p-5 lg:shadow-none lg:ring-1 lg:ring-white/15 lg:backdrop-blur-sm"
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
            className="touch-feedback hover-elevar flex w-full animate-fade-up items-center justify-between gap-4 rounded-2xl bg-primary p-4 text-left shadow-elevada lg:bg-white/10 lg:p-5 lg:shadow-none lg:ring-1 lg:ring-white/15 lg:backdrop-blur-sm"
          >
            <span>
              <span className="mb-1 block text-lg font-bold text-primary-foreground">Agenda tu próximo servicio</span>
              <span className="block text-sm text-primary-foreground/80">Profesionales verificados en {CIUDAD_LABEL[ciudad]}</span>
            </span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20">
              <ArrowRight className="h-5 w-5 text-primary-foreground" aria-hidden />
            </span>
          </button>
        )}
      </div>
      </div>

      <section className="py-4 lg:pt-10">
        <EncabezadoSeccion titulo="Categorías" accion="Ver todas" onAccion={() => onBuscar("")} />
        <CarruselCategorias onSeleccionar={(categoria) => onBuscar("", categoria)} />
      </section>

      <section className="py-4">
        <EncabezadoSeccion titulo="Cerca de ti" accion="Ver todo" onAccion={() => onBuscar("")} />
        <p className="-mt-2 mb-3 px-4 text-sm text-muted-foreground" aria-live="polite">
          {cercanos.length
            ? `${pluralizar(cercanos.length, "profesional atiende", "profesionales atienden")} en ${ubicacion.etiqueta}. El más cercano llega en unos ${formatearTiempo(cercanos[0].minutos)}.`
            : `Ningún profesional atiende todavía en ${ubicacion.etiqueta}.`}
        </p>
        <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Mapa
              etiqueta={`Mapa de profesionales cerca de ${ubicacion.etiqueta}`}
              centro={ubicacion.coordenadas}
              zoom={14}
              marcadores={marcadores}
              alto={300}
            />
          </div>
          {cercanos.length ? (
            <div className="flex flex-col gap-3">
              {cercanos.map(({ servicio, distanciaKm, minutos }, i) => (
                <div key={servicio.codigo} onMouseEnter={() => setSeleccionado(servicio.codigo)} onFocus={() => setSeleccionado(servicio.codigo)}>
                  <TarjetaServicio
                    style={escalonado(i + 1, 60)}
                    servicio={servicio}
                    cercania={{ distanciaKm, minutos }}
                    onAbrir={(s) => onAbrirServicio(s.codigo)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icono={MapPinOff}
              titulo="No hay profesionales en tu zona"
              descripcion="Prueba con otro barrio o activa tu GPS si estás en una ciudad con cobertura."
              accion={<BotonUbicacion className="border border-border bg-card py-1 pl-1 pr-3" />}
            />
          )}
        </div>
      </section>

      {destacados.length > 0 && (
        <section className="py-2">
          <EncabezadoSeccion titulo="Mejor calificados" accion="Ver todo" onAccion={() => onBuscar("")} />
          <div className="hide-scrollbar flex gap-3 overflow-x-auto px-4 pb-2 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4">
            {destacados.map((servicio, i) => (
              <TarjetaDestacada
                key={servicio.codigo}
                style={escalonado(i, 70)}
                servicio={servicio}
                cercania={calcularCercania(servicio, ubicacion.coordenadas)}
                onAbrir={(s) => onAbrirServicio(s.codigo)}
              />
            ))}
          </div>
        </section>
      )}


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
      <dd className={acento ? "text-2xl font-bold text-accent-strong" : "text-2xl font-bold text-enfasis"}>{valor}</dd>
    </div>
  );
}

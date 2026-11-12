"use client";

import { useState } from "react";
import { ArrowLeft, BadgeCheck, Briefcase, Clock, MapPin, MessageSquareText, Phone, SearchX, ShieldCheck, Star } from "lucide-react";
import { Button, cx, EmptyState } from "@/components/ui";
import { CATEGORIA_LABEL, CIUDAD_LABEL, IVA_PORCENTAJE } from "@/lib/constants";
import { distribucionCalificaciones, otrosServiciosDelProfesional, resenasDeServicio } from "@/lib/domain/cliente";
import { formatearCalificacion, formatearFecha, formatearMoneda, iniciales, pluralizar } from "@/lib/format";
import { useAppStore } from "@/store/AppStore";
import { PROFESION_CATEGORIA } from "../categorias";
import { AvatarProfesional, MarcoMovil, TarjetaServicio } from "../componentes";

type Pestana = "servicio" | "resenas" | "acerca";

const PESTANAS: { id: Pestana; etiqueta: string }[] = [
  { id: "servicio", etiqueta: "Servicio" },
  { id: "resenas", etiqueta: "Reseñas" },
  { id: "acerca", etiqueta: "Acerca de" },
];

interface Props {
  codigo: string;
  onVolver: () => void;
  onReservar: (codigo: string) => void;
  onAbrirServicio: (codigo: string) => void;
}

export function ProfesionalScreen({ codigo, onVolver, onReservar, onAbrirServicio }: Props) {
  const { data } = useAppStore();
  const [pestana, setPestana] = useState<Pestana>("servicio");
  const servicio = data.servicios.find((s) => s.codigo === codigo);

  if (!servicio) {
    return (
      <MarcoMovil conNavegacion={false}>
        <EmptyState sinMarco icono={SearchX} titulo="Este servicio ya no existe" accion={<Button onClick={onVolver}>Volver</Button>} />
      </MarcoMovil>
    );
  }

  const prestador = data.usuarios.find((u) => u.id === servicio.prestador_id);
  const resenas = resenasDeServicio(data.contratos, servicio.codigo);
  const otros = otrosServiciosDelProfesional(data.servicios, servicio);

  return (
    <MarcoMovil conNavegacion={false}>
      {/* En escritorio: ficha del profesional fija a la izquierda y pestañas a la derecha. */}
      <div className="lg:flex lg:items-start lg:gap-8 lg:px-4 lg:pt-8">
      <aside className="lg:sticky lg:top-24 lg:w-[380px] lg:shrink-0 lg:animate-fade-up lg:overflow-hidden lg:rounded-3xl lg:border lg:border-border lg:bg-card lg:pb-6 lg:shadow-suave">
      <div className="relative h-44 bg-gradient-to-br from-primary to-primary/80 sm:rounded-b-3xl lg:h-36 lg:rounded-none">
        <button
          type="button"
          onClick={onVolver}
          aria-label="Volver"
          className="touch-feedback absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-card/90 backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="absolute right-4 top-4 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-enfasis">{CATEGORIA_LABEL[servicio.categoria]}</span>
        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 rounded-full border-4 border-background bg-card">
          <AvatarProfesional servicio={servicio} tamano="xl" />
        </div>
      </div>

      <div className="px-4 pb-4 pt-16 text-center">
        <div className="mb-1 flex items-center justify-center gap-1.5">
          <h1 className="text-xl font-bold">{servicio.prestador_nombre}</h1>
          <BadgeCheck className="h-5 w-5 text-accent-strong" aria-label="Verificado" />
        </div>
        <p className="mb-3 text-sm text-muted-foreground">{PROFESION_CATEGORIA[servicio.categoria]}</p>

        <div className="mb-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
          {servicio.num_resenas > 0 ? (
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
              <span className="font-semibold text-foreground">{formatearCalificacion(servicio.calificacion)}</span>({servicio.num_resenas})
            </span>
          ) : (
            <span>Sin reseñas aún</span>
          )}
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" aria-hidden />
            {CIUDAD_LABEL[servicio.ciudad]}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" aria-hidden />
            {pluralizar(servicio.anios_experiencia, "año", "años")}
          </span>
        </div>

        {servicio.disponible ? (
          prestador?.telefono && (
            <a
              href={`tel:${prestador.telefono}`}
              className="touch-feedback mx-auto inline-flex h-11 w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-semibold hover:bg-muted"
            >
              <Phone className="h-4 w-4" aria-hidden />
              Llamar a {servicio.prestador_nombre.split(" ")[0]}
            </a>
          )
        ) : (
          <p className="mx-auto max-w-sm rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
            Este profesional no está recibiendo reservas por ahora.
          </p>
        )}
        {servicio.disponible && (
          <div className="mt-5 hidden border-t border-border pt-5 text-left lg:block">
            <p className="text-xs text-muted-foreground">Tarifa por hora</p>
            <p className="mb-4 text-2xl font-bold text-enfasis">
              {formatearMoneda(servicio.tarifa_hora)}
              <span className="text-sm font-normal text-muted-foreground"> + IVA</span>
            </p>
            <Button bloque tamano="lg" onClick={() => onReservar(servicio.codigo)}>
              Reservar ahora
            </Button>
          </div>
        )}
      </div>
      </aside>

      <div className="lg:min-w-0 lg:flex-1 lg:animate-fade-up">

      <div role="tablist" aria-label="Información del profesional" className="flex border-b border-border lg:rounded-2xl lg:border lg:bg-card lg:p-1 lg:shadow-suave">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={pestana === p.id}
            onClick={() => setPestana(p.id)}
            className={cx(
              "flex-1 border-b-2 py-3 text-sm font-medium transition-colors lg:rounded-xl lg:border-b-0 lg:py-2.5",
              pestana === p.id ? "border-accent text-enfasis lg:bg-primary-soft" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {p.etiqueta}
            {p.id === "resenas" && resenas.length > 0 && ` (${resenas.length})`}
          </button>
        ))}
      </div>

      <div key={pestana} className="animate-fade-in px-4 py-4 lg:px-0 lg:py-6">
        {pestana === "servicio" && (
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-border bg-card p-4">
              <h2 className="mb-1 text-sm font-semibold">{CATEGORIA_LABEL[servicio.categoria]}</h2>
              <p className="text-sm text-muted-foreground">{servicio.descripcion}</p>
              <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Tarifa por hora</p>
                  <p className="text-xl font-bold text-enfasis">{formatearMoneda(servicio.tarifa_hora)}</p>
                </div>
                <p className="text-xs text-muted-foreground">+ IVA {Math.round(IVA_PORCENTAJE * 100)} %</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Dato icono={Briefcase} valor={String(servicio.num_contratos)} etiqueta="Trabajos completados" />
              <Dato icono={ShieldCheck} valor="Verificado" etiqueta="Perfil revisado por YPRI" />
            </div>
          </div>
        )}

        {pestana === "resenas" &&
          (resenas.length ? (
            <div className="flex flex-col gap-4">
              <ResumenResenas valor={servicio.calificacion} total={servicio.num_resenas} resenas={resenas} />
              {resenas.map((r) => (
                <article key={r.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {iniciales(r.cliente_nombre)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{r.cliente_nombre}</p>
                        <p className="text-xs text-muted-foreground">{formatearFecha(r.fecha)}</p>
                      </div>
                    </div>
                    <EstrellasFijas valor={r.calificacion ?? 0} />
                  </div>
                  {r.comentario ? <p className="text-sm text-muted-foreground">{r.comentario}</p> : <p className="text-sm italic text-muted-foreground">Sin comentario</p>}
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              sinMarco
              icono={MessageSquareText}
              titulo="Aún no hay reseñas escritas"
              descripcion={
                servicio.num_resenas > 0
                  ? `Tiene ${pluralizar(servicio.num_resenas, "calificación", "calificaciones")} de clientes anteriores a la app.`
                  : "Sé el primero en calificar a este profesional."
              }
            />
          ))}

        {pestana === "acerca" && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-card p-4 text-sm">
              <p className="text-muted-foreground">
                {servicio.prestador_nombre} ofrece servicios de {CATEGORIA_LABEL[servicio.categoria].toLowerCase()} en {CIUDAD_LABEL[servicio.ciudad]} con{" "}
                {pluralizar(servicio.anios_experiencia, "año", "años")} de experiencia.
              </p>
            </div>
            {otros.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold">Otros servicios de {servicio.prestador_nombre.split(" ")[0]}</h2>
                <div className="flex flex-col gap-3">
                  {otros.map((s) => (
                    <TarjetaServicio key={s.codigo} servicio={s} onAbrir={(x) => onAbrirServicio(x.codigo)} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      </div>
      </div>

      {servicio.disponible && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md lg:hidden">
          <div className="pb-safe mx-auto flex max-w-[1180px] items-center gap-4 px-4 pt-3 sm:px-8">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Desde</p>
              <p className="text-lg font-bold text-enfasis">
                {formatearMoneda(servicio.tarifa_hora)}
                <span className="text-xs font-normal text-muted-foreground"> /hora</span>
              </p>
            </div>
            <Button variante="primary" className="px-8" onClick={() => onReservar(servicio.codigo)}>
              Reservar ahora
            </Button>
          </div>
        </div>
      )}
    </MarcoMovil>
  );
}

function Dato({ icono: Icono, valor, etiqueta }: { icono: typeof Star; valor: string; etiqueta: string }) {
  return (
    <div className="rounded-2xl bg-muted p-4">
      <Icono className="mb-2 h-5 w-5 text-accent-strong" aria-hidden />
      <p className="text-base font-bold">{valor}</p>
      <p className="text-xs text-muted-foreground">{etiqueta}</p>
    </div>
  );
}

function EstrellasFijas({ valor }: { valor: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${valor} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cx("h-3.5 w-3.5", n <= valor ? "fill-amber-400 text-amber-400" : "text-border")} aria-hidden />
      ))}
    </span>
  );
}

function ResumenResenas({ valor, total, resenas }: { valor: number; total: number; resenas: Parameters<typeof distribucionCalificaciones>[0] }) {
  const distribucion = distribucionCalificaciones(resenas);
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-muted p-4">
      <div className="text-center">
        <p className="text-3xl font-bold">{formatearCalificacion(valor)}</p>
        <EstrellasFijas valor={Math.round(valor)} />
        <p className="mt-1 text-xs text-muted-foreground">{pluralizar(total, "calificación", "calificaciones")}</p>
      </div>
      <div className="flex flex-1 flex-col gap-1" aria-label="Distribución de las reseñas escritas">
        {distribucion.map((fila) => (
          <div key={fila.estrellas} className="flex items-center gap-2">
            <span className="w-3 text-xs text-muted-foreground">{fila.estrellas}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-border">
              <span className="block h-full rounded-full bg-amber-400" style={{ width: `${fila.porcentaje}%` }} />
            </span>
            <span className="w-5 text-right text-xs text-muted-foreground">{fila.cantidad}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

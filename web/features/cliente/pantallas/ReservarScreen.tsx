"use client";

import { useState } from "react";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock, MapPin, Minus, Navigation, Plus, SearchX } from "lucide-react";
import { Button, cx, EmptyState, Field, FormError, Input, Textarea, useToast } from "@/components/ui";
import { CATEGORIA_LABEL, CIUDAD_LABEL, HORAS_MAXIMAS, HORAS_MINIMAS, IVA_PORCENTAJE } from "@/lib/constants";
import { calcularCercania } from "@/lib/domain/cercania";
import { calcularLiquidacionContrato } from "@/lib/finance";
import { formatearDistancia, formatearTiempo } from "@/lib/geo";
import { fechaIsoHoy, formatearFecha, formatearMoneda, pluralizar } from "@/lib/format";
import type { Contrato } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";
import { useContratos } from "@/store/hooks";
import { AvatarProfesional, BarraSuperior, MarcoMovil } from "../componentes";
import { BotonUbicacion } from "../SelectorUbicacion";
import { useUbicacion } from "../ubicacion";

type Paso = "fecha" | "direccion" | "confirmar";

const PASOS: { id: Paso; titulo: string }[] = [
  { id: "fecha", titulo: "Fecha y duración" },
  { id: "direccion", titulo: "Dirección" },
  { id: "confirmar", titulo: "Confirmar reserva" },
];

interface Props {
  codigo: string;
  onVolver: () => void;
  onConfirmada: (contrato: Contrato) => void;
}

export function ReservarScreen({ codigo, onVolver, onConfirmada }: Props) {
  const { data } = useAppStore();
  const { solicitar } = useContratos();
  const toast = useToast();
  const hoy = fechaIsoHoy();
  const { ubicacion } = useUbicacion();
  const servicio = data.servicios.find((s) => s.codigo === codigo);

  const [paso, setPaso] = useState<Paso>("fecha");
  const [fecha, setFecha] = useState(hoy);
  const [horas, setHoras] = useState(2);
  const [direccion, setDireccion] = useState("");
  const [nota, setNota] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!servicio || !servicio.disponible) {
    return (
      <MarcoMovil conNavegacion={false}>
        <BarraSuperior titulo="Reservar" onVolver={onVolver} />
        <EmptyState sinMarco icono={SearchX} titulo="Este servicio no está disponible" descripcion="Elige otro profesional o inténtalo más tarde." />
      </MarcoMovil>
    );
  }

  const indice = PASOS.findIndex((p) => p.id === paso);
  const cercania = calcularCercania(servicio, ubicacion.coordenadas, data.contratos);
  const liquidacion = calcularLiquidacionContrato(servicio.tarifa_hora, horas);
  const ajustarHoras = (delta: number) => setHoras((h) => Math.min(HORAS_MAXIMAS, Math.max(HORAS_MINIMAS, h + delta)));

  // Validación por paso con los mismos criterios que aplica el dominio al crear el contrato.
  const errorDelPaso = (): string | null => {
    if (paso === "fecha" && (!fecha || fecha < hoy)) return "Selecciona una fecha a partir de hoy.";
    if (paso === "direccion" && direccion.trim().length < 5) return "Escribe la dirección donde se prestará el servicio.";
    return null;
  };

  const siguiente = () => {
    const mensaje = errorDelPaso();
    setError(mensaje);
    if (!mensaje) {
      setPaso(PASOS[indice + 1].id);
      window.scrollTo({ top: 0 });
    }
  };

  const anterior = () => {
    setError(null);
    if (indice === 0) onVolver();
    else setPaso(PASOS[indice - 1].id);
  };

  const confirmar = () => {
    const resultado = solicitar({ servicioCodigo: servicio.codigo, horas, fecha, direccion, nota, ubicacion: ubicacion.coordenadas });
    if (!resultado.ok) return setError(resultado.error);
    toast.exito(`Reserva ${resultado.value.contrato.id} enviada a ${servicio.prestador_nombre}.`);
    onConfirmada(resultado.value.contrato);
  };

  return (
    <MarcoMovil conNavegacion={false}>
      <BarraSuperior titulo={PASOS[indice].titulo} subtitulo={`Paso ${indice + 1} de ${PASOS.length}`} onVolver={anterior} />

      {/* En escritorio: formulario a la izquierda y resumen fijo a la derecha. */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8 lg:px-4 lg:pt-4">
      <div>
      <div className="flex gap-2 px-4 pt-3 lg:px-0" aria-hidden>
        {PASOS.map((p, i) => (
          <span key={p.id} className={cx("h-1 flex-1 rounded-full transition-colors duration-500", i <= indice ? "bg-accent" : "bg-border")} />
        ))}
      </div>

      <div className="mx-4 mt-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-3 lg:hidden">
        <AvatarProfesional servicio={servicio} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{servicio.prestador_nombre}</p>
          <p className="text-xs text-muted-foreground">{CATEGORIA_LABEL[servicio.categoria]}</p>
          <p className="text-sm font-semibold text-enfasis">{formatearMoneda(servicio.tarifa_hora)}/hora</p>
        </div>
      </div>

      <div key={paso} className="mx-auto max-w-xl animate-fade-up space-y-5 px-4 py-5 lg:mx-0 lg:max-w-none lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:p-6 lg:shadow-suave lg:mt-5">
        {paso === "fecha" && (
          <>
            <Field etiqueta="¿Qué día lo necesitas?">
              {(props) => <Input {...props} type="date" min={hoy} value={fecha} onChange={(e) => setFecha(e.target.value)} className="h-12 rounded-xl" />}
            </Field>
            <div>
              <p className="mb-1.5 text-sm font-medium text-foreground">Horas estimadas</p>
              <div className="flex h-14 items-center rounded-xl border border-border bg-card">
                <button
                  type="button"
                  onClick={() => ajustarHoras(-1)}
                  disabled={horas <= HORAS_MINIMAS}
                  aria-label="Restar una hora"
                  className="flex h-full w-14 items-center justify-center rounded-l-xl hover:bg-muted disabled:text-border"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="flex-1 text-center text-base font-semibold" aria-live="polite">
                  {pluralizar(horas, "hora", "horas")}
                </span>
                <button
                  type="button"
                  onClick={() => ajustarHoras(1)}
                  disabled={horas >= HORAS_MAXIMAS}
                  aria-label="Sumar una hora"
                  className="flex h-full w-14 items-center justify-center rounded-r-xl hover:bg-muted disabled:text-border"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">El profesional confirma la duración final en el lugar.</p>
            </div>
          </>
        )}

        {paso === "direccion" && (
          <>
            <div>
              <p className="mb-1.5 text-sm font-medium">Ubicación en el mapa</p>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-2 pr-3">
                <BotonUbicacion className="py-1 pl-1 pr-2" />
                <span className="shrink-0 text-right text-xs text-muted-foreground">
                  a {formatearDistancia(cercania.distanciaKm)}
                  <span className="block font-medium text-accent-strong">llega en {formatearTiempo(cercania.minutos)}</span>
                </span>
              </div>
              {!cercania.enCobertura && (
                <p className="mt-2 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-400/10 dark:text-amber-200">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  Estás fuera de su radio de {servicio.radio_km} km. Puedes enviar la solicitud, pero el profesional podría rechazarla.
                </p>
              )}
            </div>
            <Field etiqueta="Dirección del servicio" ayuda={`Atiende desde ${servicio.zona} (${CIUDAD_LABEL[servicio.ciudad]}). Indica calle, número y apartamento.`}>
              {(props) => (
                <Input
                  {...props}
                  autoComplete="street-address"
                  placeholder="Calle, número, barrio y apartamento"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="h-12 rounded-xl"
                />
              )}
            </Field>
            <Field etiqueta="Detalles para el profesional" ayuda="Opcional">
              {(props) => (
                <Textarea {...props} rows={3} placeholder="Describe brevemente lo que necesitas" value={nota} onChange={(e) => setNota(e.target.value)} className="rounded-xl" />
              )}
            </Field>
          </>
        )}

        {paso === "confirmar" && (
          <>
            <div className="space-y-3 rounded-2xl border border-border bg-card p-4 text-sm">
              <Resumen icono={CalendarDays} etiqueta="Fecha" valor={formatearFecha(fecha)} />
              <Resumen icono={Clock} etiqueta="Duración" valor={pluralizar(horas, "hora", "horas")} />
              <Resumen icono={MapPin} etiqueta="Dirección" valor={`${direccion.trim()} · ${ubicacion.etiqueta}`} />
              <Resumen icono={Navigation} etiqueta="Llegada estimada" valor={`${formatearTiempo(cercania.minutos)} (a ${formatearDistancia(cercania.distanciaKm)})`} />
              {nota.trim() && <p className="rounded-xl bg-muted px-3 py-2 text-muted-foreground">{nota.trim()}</p>}
            </div>
            <div className="rounded-2xl bg-muted p-4 text-sm">
              <Fila etiqueta={`Servicio (${pluralizar(horas, "hora", "horas")})`} valor={formatearMoneda(liquidacion.subtotalNeto)} />
              <Fila etiqueta={`IVA (${Math.round(IVA_PORCENTAJE * 100)} %)`} valor={formatearMoneda(liquidacion.montoIva)} />
              <div className="mt-2 border-t border-border pt-2">
                <Fila etiqueta="Total estimado" valor={formatearMoneda(liquidacion.totalPagar)} destacado />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">El pago se realiza al profesional cuando el servicio queda completado.</p>
          </>
        )}

        <FormError mensaje={error} />
      </div>
      </div>

      <aside className="hidden animate-fade-up lg:sticky lg:top-24 lg:block lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:p-5 lg:shadow-suave">
        <div className="flex items-center gap-3">
          <AvatarProfesional servicio={servicio} />
          <div className="min-w-0">
            <p className="truncate font-semibold">{servicio.prestador_nombre}</p>
            <p className="text-sm text-muted-foreground">{CATEGORIA_LABEL[servicio.categoria]}</p>
          </div>
        </div>
        <div className="mt-5 border-t border-border pt-4 text-sm">
          <Fila etiqueta={`Servicio (${pluralizar(horas, "hora", "horas")})`} valor={formatearMoneda(liquidacion.subtotalNeto)} />
          <Fila etiqueta={`IVA (${Math.round(IVA_PORCENTAJE * 100)} %)`} valor={formatearMoneda(liquidacion.montoIva)} />
          <div className="mt-2 border-t border-border pt-2">
            <Fila etiqueta="Total estimado" valor={formatearMoneda(liquidacion.totalPagar)} destacado />
          </div>
        </div>
        {paso === "confirmar" ? (
          <Button variante="accent" bloque tamano="lg" className="mt-5" onClick={confirmar}>
            Confirmar reserva
          </Button>
        ) : (
          <Button bloque tamano="lg" className="mt-5" onClick={siguiente}>
            Continuar
          </Button>
        )}
        <p className="mt-3 text-center text-xs text-muted-foreground">Pagas al profesional cuando el servicio quede completado.</p>
      </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md lg:hidden">
        <div className="pb-safe mx-auto flex max-w-xl items-center gap-4 px-4 pt-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Total estimado</p>
            <p className="text-lg font-bold text-enfasis">{formatearMoneda(liquidacion.totalPagar)}</p>
          </div>
          {paso === "confirmar" ? (
            <Button variante="accent" className="px-6" onClick={confirmar}>
              Confirmar reserva
            </Button>
          ) : (
            <Button className="px-8" onClick={siguiente}>
              Continuar
            </Button>
          )}
        </div>
      </div>
    </MarcoMovil>
  );
}

function Resumen({ icono: Icono, etiqueta, valor }: { icono: typeof Clock; etiqueta: string; valor: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/15">
        <Icono className="h-4 w-4 text-accent-strong" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{etiqueta}</p>
        <p className="break-words font-medium">{valor}</p>
      </div>
    </div>
  );
}

function Fila({ etiqueta, valor, destacado }: { etiqueta: string; valor: string; destacado?: boolean }) {
  return (
    <div className={cx("flex items-center justify-between gap-4 py-1", destacado && "text-base font-bold")}>
      <span className={destacado ? "" : "text-muted-foreground"}>{etiqueta}</span>
      <span className={destacado ? "text-enfasis" : ""}>{valor}</span>
    </div>
  );
}

export function ReservaConfirmadaScreen({ contrato, onVerReservas, onInicio }: { contrato: Contrato; onVerReservas: () => void; onInicio: () => void }) {
  return (
    <MarcoMovil conNavegacion={false}>
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <span className="flex h-20 w-20 animate-pop items-center justify-center rounded-full bg-accent/20">
          <CheckCircle2 className="h-10 w-10 text-accent-strong" aria-hidden />
        </span>
        <h1 className="mt-6 text-2xl font-bold">¡Reserva enviada!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {contrato.prestador_nombre} recibió tu solicitud de {contrato.servicio_nombre.toLowerCase()} para el {formatearFecha(contrato.fecha)}. Te avisaremos cuando la
          acepte.
        </p>
        <div className="mt-6 w-full rounded-2xl border border-border bg-card p-4 text-left text-sm">
          <Fila etiqueta="Número de reserva" valor={contrato.id} />
          <Fila etiqueta="Total estimado" valor={formatearMoneda(contrato.total)} />
        </div>
        <div className="mt-8 flex w-full flex-col gap-3">
          <Button bloque onClick={onVerReservas}>
            Ver mis reservas
          </Button>
          <Button bloque variante="secondary" onClick={onInicio}>
            Volver al inicio
          </Button>
        </div>
      </div>
    </MarcoMovil>
  );
}

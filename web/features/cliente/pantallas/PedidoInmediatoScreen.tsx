"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, CalendarClock, Clock, MapPinOff, Radar, Star, Zap } from "lucide-react";
import { Mapa, type MarcadorMapa } from "@/components/mapa/Mapa";
import { Button, cx, EmptyState, Field, FormError, Input, useToast } from "@/components/ui";
import { CATEGORIA_LABEL, CATEGORIAS_SERVICIO, CIUDAD_LABEL, IVA_PORCENTAJE, type CategoriaServicio } from "@/lib/constants";
import { candidatosPedidoInmediato, type ServicioCercano } from "@/lib/domain/cercania";
import { calcularLiquidacionContrato } from "@/lib/finance";
import { fechaIsoHoy, formatearCalificacion, formatearMoneda, iniciales } from "@/lib/format";
import { formatearDistancia, formatearTiempo } from "@/lib/geo";
import { NECESIDADES_FRECUENTES } from "@/lib/palabrasClave";
import type { Contrato } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";
import { useContratos } from "@/store/hooks";
import { ICONO_CATEGORIA, PROFESION_CATEGORIA } from "../categorias";
import { BarraSuperior, MarcoMovil } from "../componentes";
import { dondeEsta, marcadorOperario } from "../marcadores";
import { BotonUbicacion } from "../SelectorUbicacion";
import { useUbicacion } from "../ubicacion";

/** Tiempo de la animación "buscando operario" (le da al cliente la sensación de búsqueda en vivo). */
const MS_BUSQUEDA = 1600;

interface Props {
  categoriaInicial?: CategoriaServicio;
  texto: string;
  onVolver: () => void;
  onConfirmado: (contrato: Contrato) => void;
  onProgramar: (texto: string, categoria?: CategoriaServicio) => void;
}

export function PedidoInmediatoScreen({ categoriaInicial, texto, onVolver, onConfirmado, onProgramar }: Props) {
  const { data } = useAppStore();
  const { ubicacion } = useUbicacion();
  const { solicitar } = useContratos();
  const toast = useToast();
  const [categoria, setCategoria] = useState<CategoriaServicio | undefined>(categoriaInicial);
  const [nota, setNota] = useState(texto);
  const [buscando, setBuscando] = useState(true);
  const [elegidoCodigo, setElegidoCodigo] = useState<string | null>(null);
  const [direccion, setDireccion] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Cada vez que cambia el oficio o la ubicación se vuelve a "buscar".
  useEffect(() => {
    if (!categoria) return;
    setBuscando(true);
    setElegidoCodigo(null);
    const id = setTimeout(() => setBuscando(false), MS_BUSQUEDA);
    return () => clearTimeout(id);
  }, [categoria, ubicacion.coordenadas]);

  useEffect(() => setDireccion(`Barrio ${ubicacion.etiqueta}, ${CIUDAD_LABEL[ubicacion.ciudad]}`), [ubicacion.etiqueta, ubicacion.ciudad]);

  const candidatos = useMemo(
    () => (categoria ? candidatosPedidoInmediato(data.servicios, data.contratos, ubicacion.coordenadas, categoria) : null),
    [categoria, data.servicios, data.contratos, ubicacion.coordenadas],
  );
  const opciones: ServicioCercano[] = candidatos ? [...candidatos.libres, ...candidatos.ocupados] : [];
  const elegido = opciones.find((o) => o.servicio.codigo === elegidoCodigo) ?? candidatos?.asignado ?? candidatos?.ocupados[0] ?? null;

  const marcadores: MarcadorMapa[] = [
    { id: "yo", coordenadas: ubicacion.coordenadas, tipo: "cliente", etiqueta: `Tú: ${ubicacion.etiqueta}` },
    ...(buscando ? [] : opciones.map((o) => marcadorOperario(o, { seleccionado: o === elegido, onClic: () => setElegidoCodigo(o.servicio.codigo) }))),
  ];

  const confirmar = () => {
    if (!elegido) return;
    const resultado = solicitar({
      servicioCodigo: elegido.servicio.codigo,
      horas: 1,
      fecha: fechaIsoHoy(),
      direccion,
      nota: nota.trim() || undefined,
      ubicacion: ubicacion.coordenadas,
      urgente: true,
    });
    if (!resultado.ok) return setError(resultado.error);
    toast.exito(`Pedido inmediato enviado a ${elegido.servicio.prestador_nombre}.`);
    onConfirmado(resultado.value.contrato);
  };

  return (
    <MarcoMovil conNavegacion={false}>
      <BarraSuperior titulo="Pedido inmediato" subtitulo="Te conectamos con el operario libre más cercano" onVolver={onVolver} />

      <div className="flex items-center justify-between gap-3 px-4 pt-3 lg:px-4">
        <BotonUbicacion className="border border-border bg-card py-1 pl-1 pr-3" />
        {categoria && (
          <button type="button" onClick={() => setCategoria(undefined)} className="text-xs font-medium text-accent-strong hover:underline">
            Cambiar oficio
          </button>
        )}
      </div>

      {!categoria ? (
        <div className="mx-auto max-w-2xl animate-fade-up px-4 py-5">
          <h2 className="text-lg font-semibold">¿Qué necesitas ya?</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CATEGORIAS_SERVICIO.map((c) => {
              const Icono = ICONO_CATEGORIA[c];
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategoria(c)}
                  className="touch-feedback hover-elevar flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft">
                    <Icono className="h-5 w-5 text-enfasis" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{CATEGORIA_LABEL[c]}</span>
                    <span className="block text-xs text-muted-foreground">{PROFESION_CATEGORIA[c]}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">O elige una situación</p>
          <div className="flex flex-wrap gap-2">
            {NECESIDADES_FRECUENTES.map((n) => (
              <button
                key={n.texto}
                type="button"
                onClick={() => {
                  setNota(n.texto);
                  setCategoria(n.categoria);
                }}
                className="touch-feedback rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted"
              >
                {n.texto}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:gap-8">
          <div className="relative isolate lg:sticky lg:top-24">
            <Mapa
              etiqueta={`Operarios de ${CATEGORIA_LABEL[categoria]} cerca de ${ubicacion.etiqueta}`}
              centro={ubicacion.coordenadas}
              zoom={14}
              marcadores={marcadores}
              ruta={!buscando && elegido ? [elegido.posicion.coordenadas, ubicacion.coordenadas] : undefined}
              alto={320}
            />
            {buscando && (
              <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center" aria-live="polite">
                <div className="flex items-center gap-3 rounded-2xl bg-card/95 px-4 py-3 shadow-elevada">
                  <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                    <span className="absolute inset-0 animate-ping rounded-full bg-accent/30" aria-hidden />
                    <Radar className="h-5 w-5 text-accent-strong" aria-hidden />
                  </span>
                  <span className="text-sm font-medium">Buscando {PROFESION_CATEGORIA[categoria].toLowerCase()} cerca de ti…</span>
                </div>
              </div>
            )}
          </div>

          {buscando ? (
            <div className="space-y-3" aria-hidden>
              {[0, 1].map((i) => (
                <div key={i} className="h-24 animate-pulso-suave rounded-2xl bg-muted" />
              ))}
            </div>
          ) : !elegido ? (
            <EmptyState
              icono={MapPinOff}
              titulo={`No hay ${PROFESION_CATEGORIA[categoria].toLowerCase()} disponible cerca`}
              descripcion={`Nadie de ${CATEGORIA_LABEL[categoria].toLowerCase()} atiende ahora en ${ubicacion.etiqueta}. Prueba otra ubicación o prográmalo para otro día.`}
              accion={
                <Button variante="secondary" icono={CalendarClock} onClick={() => onProgramar(nota, categoria)}>
                  Programar para después
                </Button>
              }
            />
          ) : (
            <div className="animate-fade-up space-y-4">
              {!candidatos?.asignado && (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-400/10 dark:text-amber-200">
                  Todos los operarios de {CATEGORIA_LABEL[categoria].toLowerCase()} cercanos están atendiendo otro servicio. Puedes pedir igual (llegará al
                  terminar) o programarlo.
                </p>
              )}
              <TarjetaAsignado opcion={elegido} />

              <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
                <Field etiqueta="Dirección exacta" ayuda="Calle, número y apartamento, para que te encuentre rápido.">
                  {(props) => <Input {...props} value={direccion} onChange={(e) => setDireccion(e.target.value)} />}
                </Field>
                <Field etiqueta="¿Qué pasó?" ayuda="Opcional">
                  {(props) => <Input {...props} value={nota} placeholder="Ej: dejé las llaves adentro" onChange={(e) => setNota(e.target.value)} />}
                </Field>
                <FormError mensaje={error} />
                <Button variante="accent" bloque tamano="lg" icono={Zap} onClick={confirmar}>
                  Pedir a {elegido.servicio.prestador_nombre.split(" ")[0]} ahora
                </Button>
                <button
                  type="button"
                  onClick={() => onProgramar(nota, categoria)}
                  className="mx-auto flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <CalendarClock className="h-4 w-4" aria-hidden />
                  Prefiero programarlo para otro día
                </button>
              </div>

              {opciones.length > 1 && (
                <section>
                  <h3 className="mb-2 text-sm font-semibold">Otros operarios cerca</h3>
                  <div role="radiogroup" aria-label="Elegir operario" className="space-y-2">
                    {opciones
                      .filter((o) => o !== elegido)
                      .map((o) => (
                        <button
                          key={o.servicio.codigo}
                          type="button"
                          role="radio"
                          aria-checked={false}
                          onClick={() => setElegidoCodigo(o.servicio.codigo)}
                          className="touch-feedback flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left hover:bg-muted/50"
                        >
                          <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-sm font-semibold text-enfasis">
                            {iniciales(o.servicio.prestador_nombre)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">{o.servicio.prestador_nombre}</span>
                            <span className="block truncate text-xs text-muted-foreground">{dondeEsta(o)}</span>
                          </span>
                          <span className="text-right text-xs">
                            <span className="block font-semibold text-accent-strong">{formatearTiempo(o.minutos)}</span>
                            {o.posicion.enServicio && <span className="text-amber-700 dark:text-amber-300">ocupado</span>}
                          </span>
                        </button>
                      ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      )}
    </MarcoMovil>
  );
}

function TarjetaAsignado({ opcion }: { opcion: ServicioCercano }) {
  const { servicio, posicion, minutos, distanciaKm } = opcion;
  const estimado = calcularLiquidacionContrato(servicio.tarifa_hora, 1);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-suave">
      <div className="flex items-center gap-4 bg-primary p-4 text-primary-foreground">
        <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <span className="text-lg font-bold leading-none">{minutos}</span>
          <span className="text-[10px] font-semibold">min</span>
        </span>
        <div className="min-w-0">
          <p className="text-sm text-primary-foreground/75">{posicion.enServicio ? "Llegaría al terminar su servicio actual" : "Llega en aproximadamente"}</p>
          <p className="text-xl font-bold">{formatearTiempo(minutos)}</p>
          <p className="text-xs text-primary-foreground/75">a {formatearDistancia(distanciaKm)} de ti</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-4">
        <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft font-semibold text-enfasis">
          {iniciales(servicio.prestador_nombre)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 font-semibold">
            <span className="truncate">{servicio.prestador_nombre}</span>
            <BadgeCheck className="h-4 w-4 shrink-0 text-accent-strong" aria-label="Verificado" />
          </p>
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            {servicio.num_resenas > 0 && (
              <span className="flex items-center gap-0.5">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                {formatearCalificacion(servicio.calificacion)}
              </span>
            )}
            <span className={cx(posicion.enServicio && "text-amber-700 dark:text-amber-300")}>{dondeEsta(opcion)}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-4 w-4" aria-hidden />
          Estimado 1 hora (con IVA {Math.round(IVA_PORCENTAJE * 100)} %)
        </span>
        <span className="font-bold text-enfasis">{formatearMoneda(estimado.totalPagar)}</span>
      </div>
    </div>
  );
}

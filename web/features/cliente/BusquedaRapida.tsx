"use client";

import { useId, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Search, Sparkles, Zap } from "lucide-react";
import { cx } from "@/components/ui";
import { CATEGORIA_LABEL, type CategoriaServicio } from "@/lib/constants";
import { candidatosPedidoInmediato } from "@/lib/domain/cercania";
import { formatearTiempo } from "@/lib/geo";
import { detectarCategorias, NECESIDADES_FRECUENTES, pareceUrgente } from "@/lib/palabrasClave";
import { useAppStore } from "@/store/AppStore";
import { ICONO_CATEGORIA } from "./categorias";
import { dondeEsta } from "./marcadores";
import { useUbicacion } from "./ubicacion";

interface Props {
  /** Pedido inmediato: buscar al operario libre más cercano ya. */
  onPedirAhora: (categoria: CategoriaServicio | undefined, texto: string) => void;
  /** Ver todos los operarios de esa necesidad (búsqueda normal). */
  onVerOpciones: (texto: string, categoria?: CategoriaServicio) => void;
  className?: string;
  claseCampo?: string;
}

/**
 * Búsqueda rápida: el cliente escribe lo que le pasa con sus palabras y YPRI
 * sugiere el oficio, el operario más cercano y la opción de pedirlo ya.
 */
export function BusquedaRapida({ onPedirAhora, onVerOpciones, className, claseCampo }: Props) {
  const { data } = useAppStore();
  const { ubicacion } = useUbicacion();
  const [texto, setTexto] = useState("");
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const idPanel = useId();

  const detectadas = useMemo(() => detectarCategorias(texto).slice(0, 2), [texto]);
  const urgente = pareceUrgente(texto);

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    const principal = detectadas[0]?.categoria;
    if (urgente && principal) onPedirAhora(principal, texto.trim());
    else onVerOpciones(texto.trim(), principal);
  };

  return (
    <div
      ref={contenedor}
      className={cx("relative px-4 py-2", className)}
      onBlur={(e) => {
        if (!contenedor.current?.contains(e.relatedTarget as Node)) setAbierto(false);
      }}
      onKeyDown={(e) => e.key === "Escape" && setAbierto(false)}
    >
      <form role="search" onSubmit={enviar}>
        <label
          className={cx(
            "flex items-center gap-3 rounded-2xl bg-muted px-4 py-3 transition-all duration-200 focus-within:bg-card focus-within:shadow-suave focus-within:ring-2 focus-within:ring-accent",
            claseCampo,
          )}
        >
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="sr-only">¿Qué necesitas?</span>
          <input
            type="search"
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setAbierto(true);
            }}
            onFocus={() => setAbierto(true)}
            placeholder="¿Qué necesitas? Ej: se me quedaron las llaves adentro"
            aria-expanded={abierto}
            aria-controls={idPanel}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
      </form>

      {abierto && (
        <div
          id={idPanel}
          className="absolute inset-x-4 top-full z-30 mt-1 animate-scale-in overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-elevada"
        >
          {texto.trim() === "" ? (
            <div className="p-3">
              <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Necesidades frecuentes</p>
              <div className="flex flex-wrap gap-2">
                {NECESIDADES_FRECUENTES.map((n) => {
                  const Icono = ICONO_CATEGORIA[n.categoria];
                  return (
                    <button
                      key={n.texto}
                      type="button"
                      onClick={() => (n.urgente ? onPedirAhora(n.categoria, n.texto) : onVerOpciones(n.texto, n.categoria))}
                      className="touch-feedback flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm hover:bg-muted"
                    >
                      <Icono className="h-3.5 w-3.5 text-accent-strong" aria-hidden />
                      {n.texto}
                      {n.urgente && <Zap className="h-3 w-3 text-amber-500" aria-label="Urgente" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : detectadas.length ? (
            <ul className="divide-y divide-border">
              {detectadas.map((d, i) => {
                const Icono = ICONO_CATEGORIA[d.categoria];
                const { asignado, ocupados } = candidatosPedidoInmediato(data.servicios, data.contratos, ubicacion.coordenadas, d.categoria);
                const referencia = asignado ?? ocupados[0];
                return (
                  <li key={d.categoria} className="p-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
                        <Icono className="h-5 w-5 text-enfasis" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-x-2 text-sm font-semibold">
                          {CATEGORIA_LABEL[d.categoria]}
                          <span className="text-xs font-normal text-muted-foreground">por «{d.coincidencia}»</span>
                          {i === 0 && urgente && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
                              Parece urgente
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {referencia
                            ? `${referencia.servicio.prestador_nombre}, ${dondeEsta(referencia)} · llega en ${formatearTiempo(referencia.minutos)}${asignado ? "" : " (ocupado)"}`
                            : `Nadie de este oficio atiende hoy en ${ubicacion.etiqueta}.`}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2.5 flex gap-2 pl-[3.25rem]">
                      <button
                        type="button"
                        onClick={() => onPedirAhora(d.categoria, texto.trim())}
                        className={cx(
                          "touch-feedback inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold",
                          i === 0 && urgente ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground",
                        )}
                      >
                        <Zap className="h-3.5 w-3.5" aria-hidden />
                        Pedir ahora
                      </button>
                      <button
                        type="button"
                        onClick={() => onVerOpciones(texto.trim(), d.categoria)}
                        className="touch-feedback inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                      >
                        Ver opciones
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <button
              type="button"
              onClick={() => onVerOpciones(texto.trim())}
              className="flex w-full items-center gap-3 p-3 text-left text-sm hover:bg-muted"
            >
              <Sparkles className="h-4 w-4 text-muted-foreground" aria-hidden />
              <span className="flex-1">
                Buscar «{texto.trim()}» en todos los profesionales
                <span className="block text-xs text-muted-foreground">Prueba con el oficio o el problema: «plomero», «fuga», «sin luz».</span>
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

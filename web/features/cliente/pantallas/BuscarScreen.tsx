"use client";

import { useMemo, useState } from "react";
import { List, Map as MapIcon, SearchX, Sparkles, Zap } from "lucide-react";
import { Mapa, type MarcadorMapa } from "@/components/mapa/Mapa";
import { Button, cx, EmptyState, escalonado, Select } from "@/components/ui";
import { CATEGORIA_LABEL, CATEGORIAS_SERVICIO, CIUDAD_LABEL, CIUDADES_COBERTURA, type CategoriaServicio, type CiudadCobertura } from "@/lib/constants";
import { calcularCercania } from "@/lib/domain/cercania";
import { filtrarCatalogo, type FiltrosCatalogo, type OrdenCatalogo } from "@/lib/domain/services";
import { pluralizar } from "@/lib/format";
import { interpretarNecesidad, pareceUrgente } from "@/lib/palabrasClave";
import type { Usuario } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";
import { BarraBusqueda, BarraSuperior, ChipFiltro, MarcoMovil, TarjetaServicio } from "../componentes";
import { cercaniaTarjeta, marcadorOperario } from "../marcadores";
import { useUbicacion } from "../ubicacion";

const DISTANCIAS_KM = [1, 2, 5, 10] as const;

export interface BusquedaInicial {
  /** Cambia en cada búsqueda nueva para reiniciar los filtros. */
  id: number;
  texto: string;
  categoria: CategoriaServicio | "todas";
}

type OrdenBusqueda = OrdenCatalogo | "cercania";

const ORDENES: { id: OrdenBusqueda; etiqueta: string }[] = [
  { id: "cercania", etiqueta: "Más cercanos" },
  { id: "relevancia", etiqueta: "Recomendados" },
  { id: "calificacion", etiqueta: "Mejor calificados" },
  { id: "precio_asc", etiqueta: "Menor precio" },
  { id: "precio_desc", etiqueta: "Mayor precio" },
];

export function BuscarScreen({
  usuario,
  inicial,
  onAbrirServicio,
  onPedirAhora,
}: {
  usuario: Usuario;
  inicial: BusquedaInicial;
  onAbrirServicio: (codigo: string) => void;
  onPedirAhora: (categoria: CategoriaServicio | undefined, texto: string) => void;
}) {
  const { data } = useAppStore();
  const { ubicacion } = useUbicacion();
  const [filtros, setFiltros] = useState<FiltrosCatalogo>({
    texto: inicial.texto,
    categoria: inicial.categoria,
    ciudad: ubicacion.ciudad ?? usuario.ciudad,
    soloDisponibles: false,
    orden: "relevancia",
  });
  const [orden, setOrden] = useState<OrdenBusqueda>("cercania");
  const [distanciaMax, setDistanciaMax] = useState<number | null>(null);
  const [vista, setVista] = useState<"lista" | "mapa">("lista");
  const [seleccionado, setSeleccionado] = useState<string | null>(null);

  // Filtra con las reglas del catálogo y añade a cada resultado su distancia al cliente.
  const resultados = useMemo(() => {
    const base = filtrarCatalogo(data.servicios, { ...filtros, orden: orden === "cercania" ? "relevancia" : orden });
    const conDistancia = base
      .map((servicio) => calcularCercania(servicio, ubicacion.coordenadas, data.contratos))
      .filter((c) => distanciaMax === null || c.distanciaKm <= distanciaMax);
    return orden === "cercania" ? conDistancia.sort((a, b) => a.distanciaKm - b.distanciaKm) : conDistancia;
  }, [data.servicios, data.contratos, filtros, orden, distanciaMax, ubicacion.coordenadas]);
  const actualizar = <K extends keyof FiltrosCatalogo>(campo: K, valor: FiltrosCatalogo[K]) => setFiltros((f) => ({ ...f, [campo]: valor }));

  const marcadores: MarcadorMapa[] = [
    { id: "yo", coordenadas: ubicacion.coordenadas, tipo: "cliente", etiqueta: `Tú: ${ubicacion.etiqueta}` },
    ...resultados.map((c) =>
      marcadorOperario(c, { seleccionado: seleccionado === c.servicio.codigo, onClic: () => setSeleccionado(c.servicio.codigo) }),
    ),
  ];
  const elegido = resultados.find((r) => r.servicio.codigo === seleccionado);
  const detectada = interpretarNecesidad(filtros.texto);
  const urgente = pareceUrgente(filtros.texto);

  return (
    <MarcoMovil>
      <BarraSuperior titulo="Buscar" subtitulo="Encuentra al profesional que necesitas" />
      <div className="lg:flex lg:items-start lg:gap-8 lg:px-4 lg:pt-4">
      {/* En escritorio los filtros forman una columna fija a la izquierda. */}
      <aside className="lg:sticky lg:top-24 lg:w-80 lg:shrink-0 lg:animate-fade-up lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:p-4 lg:shadow-suave">
      <p className="hidden px-1 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:block">Filtros</p>
      <div className="pt-2 lg:pt-0">
        <BarraBusqueda className="lg:px-0" valor={filtros.texto} onCambiar={(texto) => actualizar("texto", texto)} autoFocus={!inicial.texto && inicial.categoria === "todas"} />
      </div>

      <div className="hide-scrollbar flex gap-2 overflow-x-auto px-4 py-2 lg:flex-wrap lg:overflow-visible lg:px-0" role="group" aria-label="Categorías">
        {(["todas", ...CATEGORIAS_SERVICIO] as const).map((categoria) => (
          <ChipFiltro key={categoria} activa={filtros.categoria === categoria} onClick={() => actualizar("categoria", categoria)}>
            {categoria === "todas" ? "Todas" : CATEGORIA_LABEL[categoria]}
          </ChipFiltro>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 px-4 py-2 sm:flex sm:items-center lg:flex-col lg:items-stretch lg:px-0">
        <Select
          aria-label="Ciudad"
          className="rounded-xl border-border sm:w-48 lg:w-full"
          value={filtros.ciudad}
          onChange={(e) => actualizar("ciudad", e.target.value as CiudadCobertura | "todas")}
        >
          <option value="todas">Todas las ciudades</option>
          {CIUDADES_COBERTURA.map((ciudad) => (
            <option key={ciudad} value={ciudad}>
              {CIUDAD_LABEL[ciudad]}
            </option>
          ))}
        </Select>
        <Select aria-label="Ordenar por" className="rounded-xl border-border sm:w-48 lg:w-full" value={orden} onChange={(e) => setOrden(e.target.value as OrdenBusqueda)}>
          {ORDENES.map((orden) => (
            <option key={orden.id} value={orden.id}>
              {orden.etiqueta}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Distancia máxima"
          className="col-span-2 rounded-xl border-border sm:w-48 lg:w-full"
          value={distanciaMax ?? ""}
          onChange={(e) => setDistanciaMax(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Cualquier distancia</option>
          {DISTANCIAS_KM.map((km) => (
            <option key={km} value={km}>
              Hasta {km} km
            </option>
          ))}
        </Select>
        <label className="col-span-2 flex items-center gap-2 text-sm text-muted-foreground sm:ml-auto lg:ml-0 lg:pt-1">
          <input
            type="checkbox"
            checked={filtros.soloDisponibles}
            onChange={(e) => actualizar("soloDisponibles", e.target.checked)}
            className="h-4 w-4 rounded border-border accent-[rgb(var(--primary))]"
          />
          Solo disponibles
        </label>
      </div>

      </aside>

      <div className="min-w-0 flex-1">
      {detectada && (
        <div className="mx-4 mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-primary-soft px-4 py-3 text-sm lg:mx-0">
          <Sparkles className="h-4 w-4 shrink-0 text-enfasis" aria-hidden />
          <span className="min-w-0 flex-1">
            Entendimos que necesitas <strong>{CATEGORIA_LABEL[detectada.categoria].toLowerCase()}</strong>
            <span className="text-muted-foreground"> (por «{detectada.coincidencia}»)</span>
          </span>
          <Button variante={urgente ? "accent" : "primary"} tamano="sm" icono={Zap} onClick={() => onPedirAhora(detectada.categoria, filtros.texto)}>
            Pedir ahora
          </Button>
        </div>
      )}
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-1 lg:px-0 lg:pt-0">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {pluralizar(resultados.length, "profesional", "profesionales")} · desde {ubicacion.etiqueta}
        </p>
        <div role="tablist" aria-label="Ver resultados como" className="flex shrink-0 gap-1 rounded-xl bg-muted p-1">
          {(["lista", "mapa"] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={vista === v}
              onClick={() => setVista(v)}
              className={cx(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                vista === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v === "lista" ? <List className="h-3.5 w-3.5" aria-hidden /> : <MapIcon className="h-3.5 w-3.5" aria-hidden />}
              {v === "lista" ? "Lista" : "Mapa"}
            </button>
          ))}
        </div>
      </div>

      {resultados.length && vista === "mapa" ? (
        <div className="space-y-3 px-4 lg:px-0">
          <Mapa etiqueta="Mapa de resultados de búsqueda" centro={ubicacion.coordenadas} zoom={14} marcadores={marcadores} alto={420} />
          {elegido ? (
            <TarjetaServicio
              servicio={elegido.servicio}
              cercania={cercaniaTarjeta(elegido)}
              onAbrir={(s) => onAbrirServicio(s.codigo)}
            />
          ) : (
            <p className="text-center text-sm text-muted-foreground">Toca un profesional en el mapa para ver su ficha.</p>
          )}
        </div>
      ) : resultados.length ? (
        <div className="flex flex-col gap-3 px-4 md:grid md:grid-cols-2 lg:px-0">
          {resultados.map((c, i) => (
            <TarjetaServicio
              key={c.servicio.codigo}
              style={escalonado(i)}
              servicio={c.servicio}
              cercania={cercaniaTarjeta(c)}
              onAbrir={(s) => onAbrirServicio(s.codigo)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          sinMarco
          icono={SearchX}
          titulo="No encontramos profesionales"
          descripcion="Prueba con otra categoría o busca en todas las ciudades."
          accion={
            <Button
              variante="secondary"
              onClick={() => {
                setDistanciaMax(null);
                setFiltros((f) => ({ ...f, texto: "", categoria: "todas", ciudad: "todas", soloDisponibles: false }));
              }}
            >
              Limpiar filtros
            </Button>
          }
        />
      )}
      </div>
      </div>
    </MarcoMovil>
  );
}

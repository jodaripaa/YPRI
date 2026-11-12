"use client";

import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import { Button, EmptyState, escalonado, Select } from "@/components/ui";
import { CATEGORIA_LABEL, CATEGORIAS_SERVICIO, CIUDAD_LABEL, CIUDADES_COBERTURA, type CategoriaServicio, type CiudadCobertura } from "@/lib/constants";
import { filtrarCatalogo, type FiltrosCatalogo, type OrdenCatalogo } from "@/lib/domain/services";
import { pluralizar } from "@/lib/format";
import type { Usuario } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";
import { BarraBusqueda, BarraSuperior, ChipFiltro, MarcoMovil, TarjetaServicio } from "../componentes";

export interface BusquedaInicial {
  /** Cambia en cada búsqueda nueva para reiniciar los filtros. */
  id: number;
  texto: string;
  categoria: CategoriaServicio | "todas";
}

const ORDENES: { id: OrdenCatalogo; etiqueta: string }[] = [
  { id: "relevancia", etiqueta: "Recomendados" },
  { id: "calificacion", etiqueta: "Mejor calificados" },
  { id: "precio_asc", etiqueta: "Menor precio" },
  { id: "precio_desc", etiqueta: "Mayor precio" },
];

export function BuscarScreen({ usuario, inicial, onAbrirServicio }: { usuario: Usuario; inicial: BusquedaInicial; onAbrirServicio: (codigo: string) => void }) {
  const { data } = useAppStore();
  const [filtros, setFiltros] = useState<FiltrosCatalogo>({
    texto: inicial.texto,
    categoria: inicial.categoria,
    ciudad: usuario.ciudad,
    soloDisponibles: false,
    orden: "relevancia",
  });

  const resultados = useMemo(() => filtrarCatalogo(data.servicios, filtros), [data.servicios, filtros]);
  const actualizar = <K extends keyof FiltrosCatalogo>(campo: K, valor: FiltrosCatalogo[K]) => setFiltros((f) => ({ ...f, [campo]: valor }));

  return (
    <MarcoMovil>
      <BarraSuperior titulo="Buscar" subtitulo="Encuentra al profesional que necesitas" />
      <div className="pt-2">
        <BarraBusqueda valor={filtros.texto} onCambiar={(texto) => actualizar("texto", texto)} autoFocus={!inicial.texto && inicial.categoria === "todas"} />
      </div>

      <div className="hide-scrollbar flex gap-2 overflow-x-auto px-4 py-2" role="group" aria-label="Categorías">
        {(["todas", ...CATEGORIAS_SERVICIO] as const).map((categoria) => (
          <ChipFiltro key={categoria} activa={filtros.categoria === categoria} onClick={() => actualizar("categoria", categoria)}>
            {categoria === "todas" ? "Todas" : CATEGORIA_LABEL[categoria]}
          </ChipFiltro>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 px-4 py-2 sm:flex sm:items-center">
        <Select
          aria-label="Ciudad"
          className="rounded-xl border-border sm:w-48"
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
        <Select aria-label="Ordenar por" className="rounded-xl border-border sm:w-48" value={filtros.orden} onChange={(e) => actualizar("orden", e.target.value as OrdenCatalogo)}>
          {ORDENES.map((orden) => (
            <option key={orden.id} value={orden.id}>
              {orden.etiqueta}
            </option>
          ))}
        </Select>
        <label className="col-span-2 flex items-center gap-2 text-sm text-muted-foreground sm:ml-auto">
          <input
            type="checkbox"
            checked={filtros.soloDisponibles}
            onChange={(e) => actualizar("soloDisponibles", e.target.checked)}
            className="h-4 w-4 rounded border-border accent-[rgb(var(--primary))]"
          />
          Solo disponibles
        </label>
      </div>

      <p className="px-4 pb-2 pt-1 text-sm text-muted-foreground" aria-live="polite">
        {pluralizar(resultados.length, "profesional", "profesionales")}
      </p>

      {resultados.length ? (
        <div className="flex flex-col gap-3 px-4 md:grid md:grid-cols-2 xl:grid-cols-3">
          {resultados.map((servicio, i) => (
            <TarjetaServicio key={servicio.codigo} style={escalonado(i)} servicio={servicio} onAbrir={(s) => onAbrirServicio(s.codigo)} />
          ))}
        </div>
      ) : (
        <EmptyState
          sinMarco
          icono={SearchX}
          titulo="No encontramos profesionales"
          descripcion="Prueba con otra categoría o busca en todas las ciudades."
          accion={
            <Button variante="secondary" onClick={() => setFiltros((f) => ({ ...f, texto: "", categoria: "todas", ciudad: "todas", soloDisponibles: false }))}>
              Limpiar filtros
            </Button>
          }
        />
      )}
    </MarcoMovil>
  );
}

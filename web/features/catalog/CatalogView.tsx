"use client";

import { useMemo, useState } from "react";
import { SearchX, Search } from "lucide-react";
import { Button, cx, EmptyState, Input, PageHeader, Select } from "@/components/ui";
import {
  CATEGORIA_LABEL,
  CATEGORIAS_SERVICIO,
  CIUDAD_LABEL,
  CIUDADES_COBERTURA,
  type CategoriaServicio,
  type CiudadCobertura,
} from "@/lib/constants";
import { filtrarCatalogo, type FiltrosCatalogo, type OrdenCatalogo } from "@/lib/domain/services";
import { pluralizar } from "@/lib/format";
import type { Servicio, Usuario } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";
import { RequestServiceModal } from "./RequestServiceModal";
import { ServiceCard } from "./ServiceCard";

const ORDENES: { id: OrdenCatalogo; etiqueta: string }[] = [
  { id: "relevancia", etiqueta: "Recomendados" },
  { id: "calificacion", etiqueta: "Mejor calificados" },
  { id: "precio_asc", etiqueta: "Menor precio" },
  { id: "precio_desc", etiqueta: "Mayor precio" },
];

export function CatalogView({ usuario, onSolicitudCreada }: { usuario: Usuario; onSolicitudCreada: () => void }) {
  const { data } = useAppStore();
  const [filtros, setFiltros] = useState<FiltrosCatalogo>({
    texto: "",
    categoria: "todas",
    ciudad: usuario.ciudad,
    soloDisponibles: false,
    orden: "relevancia",
  });
  const [seleccionado, setSeleccionado] = useState<Servicio | null>(null);

  const servicios = useMemo(() => filtrarCatalogo(data.servicios, filtros), [data.servicios, filtros]);
  const actualizar = <K extends keyof FiltrosCatalogo>(campo: K, valor: FiltrosCatalogo[K]) =>
    setFiltros((actual) => ({ ...actual, [campo]: valor }));

  const ciudadTexto = filtros.ciudad === "todas" ? "todas las ciudades" : CIUDAD_LABEL[filtros.ciudad];

  return (
    <>
      <PageHeader titulo="¿Qué necesitas hoy?" descripcion={`Profesionales verificados en ${ciudadTexto}.`} />

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input
              aria-label="Buscar servicios"
              placeholder="Buscar por servicio o profesional"
              className="pl-9"
              value={filtros.texto}
              onChange={(e) => actualizar("texto", e.target.value)}
            />
          </div>
          <Select
            aria-label="Ciudad"
            className="sm:w-48"
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
          <Select
            aria-label="Ordenar por"
            className="sm:w-48"
            value={filtros.orden}
            onChange={(e) => actualizar("orden", e.target.value as OrdenCatalogo)}
          >
            {ORDENES.map((orden) => (
              <option key={orden.id} value={orden.id}>
                {orden.etiqueta}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Categorías">
          {(["todas", ...CATEGORIAS_SERVICIO] as const).map((categoria) => (
            <FiltroCategoria
              key={categoria}
              activa={filtros.categoria === categoria}
              onClick={() => actualizar("categoria", categoria as CategoriaServicio | "todas")}
            >
              {categoria === "todas" ? "Todas" : CATEGORIA_LABEL[categoria]}
            </FiltroCategoria>
          ))}
          <label className="ml-auto flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={filtros.soloDisponibles}
              onChange={(e) => actualizar("soloDisponibles", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            />
            Solo disponibles
          </label>
        </div>

        <p className="text-sm text-slate-500">{pluralizar(servicios.length, "resultado", "resultados")}</p>

        {servicios.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {servicios.map((servicio) => (
              <ServiceCard key={servicio.codigo} servicio={servicio} onSolicitar={setSeleccionado} />
            ))}
          </div>
        ) : (
          <EmptyState
            icono={SearchX}
            titulo="No encontramos profesionales con esos filtros"
            descripcion="Prueba con otra categoría o amplía la búsqueda a todas las ciudades."
            accion={
              <Button variante="secondary" onClick={() => setFiltros((f) => ({ ...f, texto: "", categoria: "todas", ciudad: "todas" }))}>
                Limpiar filtros
              </Button>
            }
          />
        )}
      </div>

      {seleccionado && (
        <RequestServiceModal
          servicio={seleccionado}
          onCerrar={() => setSeleccionado(null)}
          onSolicitado={() => {
            setSeleccionado(null);
            onSolicitudCreada();
          }}
        />
      )}
    </>
  );
}

function FiltroCategoria({ activa, onClick, children }: { activa: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={activa}
      onClick={onClick}
      className={cx(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        activa ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400",
      )}
    >
      {children}
    </button>
  );
}

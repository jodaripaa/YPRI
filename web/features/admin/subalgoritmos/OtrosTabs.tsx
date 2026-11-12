"use client";

import { useState } from "react";
import { Button, Card, Select, Table, Td, Th } from "@/components/ui";
import { CATEGORIA_LABEL, CIUDAD_LABEL } from "@/lib/constants";
import { calcularLiquidacionContrato } from "@/lib/finance";
import { formatearCalificacion, formatearMoneda, pluralizar } from "@/lib/format";
import type { Servicio } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";
import { BloqueCodigo, TarjetaSubalgoritmo } from "./shared";

const HORAS_RECIBO = 4;
const DESCUENTO_RECIBO = 10;

/** Procedimientos: funciones sin retorno que solo presentan información. */
export function ProcedimientosTab() {
  const { data } = useAppStore();
  const [codigo, setCodigo] = useState(data.servicios[0]?.codigo ?? "");
  const servicio = data.servicios.find((s) => s.codigo === codigo) ?? data.servicios[0];
  if (!servicio) return null;

  const l = calcularLiquidacionContrato(servicio.tarifa_hora, HORAS_RECIBO, DESCUENTO_RECIBO);

  return (
    <div className="space-y-4">
      <Select aria-label="Servicio" className="sm:w-96" value={servicio.codigo} onChange={(e) => setCodigo(e.target.value)}>
        {data.servicios.map((s) => (
          <option key={s.codigo} value={s.codigo}>
            {s.codigo} · {CATEGORIA_LABEL[s.categoria]} · {s.prestador_nombre}
          </option>
        ))}
      </Select>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TarjetaSubalgoritmo firma="mostrar_ficha_tecnica_servicio()" tipo="sin return" descripcion="Imprime la ficha técnica del servicio.">
          <BloqueCodigo lineas={fichaTecnica(servicio)} />
        </TarjetaSubalgoritmo>
        <TarjetaSubalgoritmo firma="mostrar_recibo_liquidacion()" tipo="sin return" descripcion={`Recibo para ${HORAS_RECIBO} horas con ${DESCUENTO_RECIBO} % de descuento.`}>
          <BloqueCodigo
            lineas={[
              `Servicio:        ${servicio.codigo} - ${CATEGORIA_LABEL[servicio.categoria]}`,
              `Horas:           ${HORAS_RECIBO} x ${formatearMoneda(l.tarifaHora)}`,
              `Subtotal bruto:  ${formatearMoneda(l.subtotalBruto)}`,
              `Descuento:      -${formatearMoneda(l.montoDescuento)}`,
              `Subtotal neto:   ${formatearMoneda(l.subtotalNeto)}`,
              `IVA (19 %):      ${formatearMoneda(l.montoIva)}`,
              `TOTAL A PAGAR:   ${formatearMoneda(l.totalPagar)}`,
            ]}
          />
        </TarjetaSubalgoritmo>
      </div>
    </div>
  );
}

function fichaTecnica(s: Servicio): string[] {
  return [
    `Código:          ${s.codigo}`,
    `Categoría:       ${CATEGORIA_LABEL[s.categoria]}`,
    `Profesional:     ${s.prestador_nombre}`,
    `Ciudad:          ${CIUDAD_LABEL[s.ciudad]}`,
    `Tarifa:          ${formatearMoneda(s.tarifa_hora)} / hora`,
    `Calificación:    ${formatearCalificacion(s.calificacion)} de 5 (${pluralizar(s.num_resenas, "reseña", "reseñas")})`,
    `Experiencia:     ${pluralizar(s.anios_experiencia, "año", "años")}`,
    `Disponibilidad:  ${s.disponible ? "Disponible" : "Pausado"}`,
  ];
}

const CRITERIOS_LAMBDA = {
  tarifa_desc: { etiqueta: "Tarifa (mayor a menor)", codigo: "sorted(servicios, key=lambda s: s['tarifa_hora'], reverse=True)", comparar: (a: Servicio, b: Servicio) => b.tarifa_hora - a.tarifa_hora },
  tarifa_asc: { etiqueta: "Tarifa (menor a mayor)", codigo: "sorted(servicios, key=lambda s: s['tarifa_hora'])", comparar: (a: Servicio, b: Servicio) => a.tarifa_hora - b.tarifa_hora },
  calificacion: { etiqueta: "Calificación", codigo: "sorted(servicios, key=lambda s: s['calificacion'], reverse=True)", comparar: (a: Servicio, b: Servicio) => b.calificacion - a.calificacion },
} as const;

type CriterioLambda = keyof typeof CRITERIOS_LAMBDA;

export function LambdasTab() {
  const { data } = useAppStore();
  const [criterio, setCriterio] = useState<CriterioLambda>("tarifa_desc");
  const ordenados = [...data.servicios].sort(CRITERIOS_LAMBDA[criterio].comparar);

  return (
    <TarjetaSubalgoritmo firma="lambda argumentos: expresión" tipo="lambda" descripcion="Funciones anónimas usadas como criterio de ordenamiento.">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select aria-label="Criterio" className="sm:w-64" value={criterio} onChange={(e) => setCriterio(e.target.value as CriterioLambda)}>
          {Object.entries(CRITERIOS_LAMBDA).map(([id, c]) => (
            <option key={id} value={id}>
              {c.etiqueta}
            </option>
          ))}
        </Select>
        <code className="overflow-x-auto rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">{CRITERIOS_LAMBDA[criterio].codigo}</code>
      </div>
      <Table>
        <thead>
          <tr>
            <Th>Código</Th>
            <Th>Profesional</Th>
            <Th>Categoría</Th>
            <Th numerico>Tarifa</Th>
            <Th numerico>Calificación</Th>
          </tr>
        </thead>
        <tbody>
          {ordenados.map((s) => (
            <tr key={s.codigo}>
              <Td className="font-mono text-xs">{s.codigo}</Td>
              <Td>{s.prestador_nombre}</Td>
              <Td>{CATEGORIA_LABEL[s.categoria]}</Td>
              <Td numerico>{formatearMoneda(s.tarifa_hora)}</Td>
              <Td numerico>{formatearCalificacion(s.calificacion)}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TarjetaSubalgoritmo>
  );
}

export function ArgumentosTab() {
  const [lista, setLista] = useState(["Electricidad", "Plomería"]);
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <TarjetaSubalgoritmo firma="Objetos inmutables" tipo="int, float, str, tuple" descripcion="Reasignar el parámetro no modifica la variable original.">
        <BloqueCodigo
          lineas={[
            "def modificar_numero(numero):",
            "    numero = numero + 10000",
            "    return numero",
            "",
            "tarifa = 50000",
            "modificar_numero(tarifa)  # retorna 60000",
            "print(tarifa)             # 50000, sin cambios",
          ]}
        />
      </TarjetaSubalgoritmo>
      <TarjetaSubalgoritmo firma="Objetos mutables" tipo="list, dict, set" descripcion="Los métodos como append() modifican el objeto original.">
        <BloqueCodigo
          lineas={["def agregar_servicio(servicios):", '    servicios.append("Climatización")', "", `inventario = [${lista.map((x) => `"${x}"`).join(", ")}]`]}
        />
        <Card className="mt-4 flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">{pluralizar(lista.length, "elemento", "elementos")} en la lista</p>
          <div className="flex gap-2">
            <Button tamano="sm" variante="secondary" onClick={() => setLista((l) => [...l, `Servicio ${l.length + 1}`])}>
              Ejecutar append()
            </Button>
            <Button tamano="sm" variante="ghost" onClick={() => setLista(["Electricidad", "Plomería"])}>
              Reiniciar
            </Button>
          </div>
        </Card>
      </TarjetaSubalgoritmo>
    </div>
  );
}

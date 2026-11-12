"use client";

import { useState } from "react";
import { DatoFila, Field, Input } from "@/components/ui";
import { calcularComisionPlataforma, calcularLiquidacionContrato, calcularPromedioRating } from "@/lib/finance";
import { formatearMoneda } from "@/lib/format";
import { numeroEnRango, TarjetaSubalgoritmo } from "./shared";

export function FuncionesTab() {
  // Los campos guardan el texto escrito; el valor se acota solo al calcular,
  // así el usuario puede borrar y reescribir sin que el número salte.
  const [campos, setCampos] = useState({ tarifa: "45000", horas: "4", descuento: "10", ratingPrevio: "4.2", evaluaciones: "5", nuevaNota: "5" });
  const actualizar = (campo: keyof typeof campos) => (e: { target: { value: string } }) =>
    setCampos((actual) => ({ ...actual, [campo]: e.target.value }));

  const tarifa = numeroEnRango(campos.tarifa, 0, 10_000_000);
  const horas = numeroEnRango(campos.horas, 1, 100);
  const descuento = numeroEnRango(campos.descuento, 0, 100);
  const ratingPrevio = numeroEnRango(campos.ratingPrevio, 1, 5);
  const evaluaciones = Math.round(numeroEnRango(campos.evaluaciones, 1, 10_000));
  const nuevaNota = numeroEnRango(campos.nuevaNota, 1, 5);

  const liquidacion = calcularLiquidacionContrato(tarifa, horas, descuento);
  const distribucion = calcularComisionPlataforma(liquidacion.totalPagar);
  const nuevoRating = calcularPromedioRating(ratingPrevio, evaluaciones, nuevaNota);

  return (
    <div className="space-y-4">
      <TarjetaSubalgoritmo
        firma="calcular_liquidacion_contrato(tarifa, horas, descuento)"
        tipo="return dict"
        descripcion="Recibe parámetros numéricos y retorna el desglose de la liquidación."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field etiqueta="Tarifa por hora">
            {(p) => <Input {...p} type="number" min={0} step={5000} value={campos.tarifa} onChange={actualizar("tarifa")} />}
          </Field>
          <Field etiqueta="Horas">
            {(p) => <Input {...p} type="number" min={1} max={100} value={campos.horas} onChange={actualizar("horas")} />}
          </Field>
          <Field etiqueta="Descuento (%)">
            {(p) => <Input {...p} type="number" min={0} max={100} value={campos.descuento} onChange={actualizar("descuento")} />}
          </Field>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <DatoFila etiqueta="Subtotal bruto" valor={formatearMoneda(liquidacion.subtotalBruto)} />
            <DatoFila etiqueta={`Descuento (${descuento} %)`} valor={`- ${formatearMoneda(liquidacion.montoDescuento)}`} />
            <DatoFila etiqueta="IVA (19 %)" valor={formatearMoneda(liquidacion.montoIva)} />
            <DatoFila etiqueta="Total a pagar" valor={formatearMoneda(liquidacion.totalPagar)} destacado />
          </div>
          <div>
            <p className="mb-1 font-mono text-xs text-slate-500">calcular_comision_plataforma(total)</p>
            <DatoFila etiqueta="Comisión plataforma (10 %)" valor={formatearMoneda(distribucion.comisionYpri)} />
            <DatoFila etiqueta="Retención en la fuente (4 %)" valor={formatearMoneda(distribucion.retencionFuente)} />
            <DatoFila etiqueta="Pago neto al profesional" valor={formatearMoneda(distribucion.pagoNetoPrestador)} destacado />
          </div>
        </div>
      </TarjetaSubalgoritmo>

      <TarjetaSubalgoritmo
        firma="calcular_promedio_calificacion(previo, n, nueva)"
        tipo="return float"
        descripcion="Actualiza la media aritmética de forma incremental."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:items-end">
          <Field etiqueta="Promedio actual">
            {(p) => <Input {...p} type="number" step={0.1} min={1} max={5} value={campos.ratingPrevio} onChange={actualizar("ratingPrevio")} />}
          </Field>
          <Field etiqueta="Total de reseñas (n)">
            {(p) => <Input {...p} type="number" min={1} value={campos.evaluaciones} onChange={actualizar("evaluaciones")} />}
          </Field>
          <Field etiqueta="Nueva nota">
            {(p) => <Input {...p} type="number" step={0.1} min={1} max={5} value={campos.nuevaNota} onChange={actualizar("nuevaNota")} />}
          </Field>
          <div className="rounded-lg bg-slate-50 px-4 py-2">
            <p className="text-xs text-slate-500">Nuevo promedio</p>
            <p className="text-lg font-semibold text-slate-900">{nuevoRating.toFixed(1)} / 5</p>
          </div>
        </div>
      </TarjetaSubalgoritmo>
    </div>
  );
}

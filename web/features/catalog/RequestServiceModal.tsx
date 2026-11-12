"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button, DatoFila, Field, FormError, Input, Modal, Textarea, useToast } from "@/components/ui";
import { CATEGORIA_LABEL, HORAS_MAXIMAS, HORAS_MINIMAS, IVA_PORCENTAJE } from "@/lib/constants";
import { calcularLiquidacionContrato } from "@/lib/finance";
import { fechaIsoHoy, formatearMoneda, pluralizar } from "@/lib/format";
import type { Servicio } from "@/lib/types";
import { useContratos } from "@/store/hooks";

interface Props {
  servicio: Servicio;
  onCerrar: () => void;
  onSolicitado: () => void;
}

export function RequestServiceModal({ servicio, onCerrar, onSolicitado }: Props) {
  const { solicitar } = useContratos();
  const toast = useToast();
  const hoy = fechaIsoHoy();
  const [horas, setHoras] = useState(2);
  const [fecha, setFecha] = useState(hoy);
  const [direccion, setDireccion] = useState("");
  const [nota, setNota] = useState("");
  const [error, setError] = useState<string | null>(null);

  const liquidacion = calcularLiquidacionContrato(servicio.tarifa_hora, horas);
  const ajustarHoras = (delta: number) => setHoras((h) => Math.min(HORAS_MAXIMAS, Math.max(HORAS_MINIMAS, h + delta)));

  const confirmar = () => {
    const resultado = solicitar({ servicioCodigo: servicio.codigo, horas, fecha, direccion, nota });
    if (!resultado.ok) return setError(resultado.error);
    toast.exito(`Solicitud ${resultado.value.contrato.id} enviada a ${servicio.prestador_nombre}.`);
    onSolicitado();
  };

  return (
    <Modal
      abierto
      titulo={`Solicitar ${CATEGORIA_LABEL[servicio.categoria].toLowerCase()}`}
      descripcion={`Con ${servicio.prestador_nombre} · ${formatearMoneda(servicio.tarifa_hora)} por hora`}
      onCerrar={onCerrar}
      pie={
        <>
          <Button variante="secondary" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button onClick={confirmar}>Confirmar solicitud</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field etiqueta="Fecha del servicio">
            {(props) => <Input {...props} type="date" min={hoy} value={fecha} onChange={(e) => setFecha(e.target.value)} />}
          </Field>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Horas estimadas</span>
            <div className="flex h-10 items-center rounded-lg border border-slate-300">
              <button
                type="button"
                onClick={() => ajustarHoras(-1)}
                disabled={horas <= HORAS_MINIMAS}
                className="flex h-full w-10 items-center justify-center text-slate-600 hover:bg-slate-50 disabled:text-slate-300"
                aria-label="Restar una hora"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex-1 text-center text-sm font-medium text-slate-900" aria-live="polite">
                {pluralizar(horas, "hora", "horas")}
              </span>
              <button
                type="button"
                onClick={() => ajustarHoras(1)}
                disabled={horas >= HORAS_MAXIMAS}
                className="flex h-full w-10 items-center justify-center text-slate-600 hover:bg-slate-50 disabled:text-slate-300"
                aria-label="Sumar una hora"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <Field etiqueta="Dirección">
          {(props) => (
            <Input
              {...props}
              autoComplete="street-address"
              placeholder="Calle, número, barrio y apartamento"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          )}
        </Field>
        <Field etiqueta="Detalles para el profesional" ayuda="Opcional">
          {(props) => (
            <Textarea
              {...props}
              rows={2}
              placeholder="Describe brevemente lo que necesitas"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
            />
          )}
        </Field>

        <div className="rounded-lg bg-slate-50 px-4 py-2">
          <DatoFila etiqueta={`Servicio (${pluralizar(horas, "hora", "horas")})`} valor={formatearMoneda(liquidacion.subtotalNeto)} />
          <DatoFila etiqueta={`IVA (${Math.round(IVA_PORCENTAJE * 100)} %)`} valor={formatearMoneda(liquidacion.montoIva)} />
          <div className="mt-1 border-t border-slate-200 pt-1">
            <DatoFila etiqueta="Total estimado" valor={formatearMoneda(liquidacion.totalPagar)} destacado />
          </div>
        </div>
        <p className="text-xs text-slate-500">El pago se realiza al profesional cuando el servicio queda completado.</p>
        <FormError mensaje={error} />
      </div>
    </Modal>
  );
}

"use client";

import { Clock, Percent, Wallet } from "lucide-react";
import { BarraSegmentada, Card, CardHeader, EmptyState, escalonado, PageHeader, StatCard, Table, Td, Th } from "@/components/ui";
import { COMISION_PLATAFORMA, RETENCION_FUENTE } from "@/lib/constants";
import { contratosVisiblesPara } from "@/lib/domain/contracts";
import { calcularComisionPlataforma, sumarTotales } from "@/lib/finance";
import { formatearFecha, formatearMoneda, pluralizar } from "@/lib/format";
import type { Usuario } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";

const porcentaje = (valor: number) => `${Math.round(valor * 100)} %`;

export function EarningsView({ usuario }: { usuario: Usuario }) {
  const { data } = useAppStore();
  const propios = contratosVisiblesPara(data.contratos, usuario);
  const completados = propios
    .filter((c) => c.estado === "Completado")
    .map((contrato) => ({ contrato, distribucion: calcularComisionPlataforma(contrato.total) }));
  const enCurso = propios.filter((c) => c.estado === "En proceso");

  const totalBruto = sumarTotales(completados, (c) => c.contrato.total);
  const totalNeto = sumarTotales(completados, (c) => c.distribucion.pagoNetoPrestador);
  const totalDescuentos = totalBruto - totalNeto;
  const porCobrar = sumarTotales(enCurso, (c) => calcularComisionPlataforma(c.total).pagoNetoPrestador);

  return (
    <>
      <PageHeader titulo="Ganancias" descripcion="Lo que has recibido por los servicios completados." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard destacado icono={Wallet} style={escalonado(0)} etiqueta="Neto recibido" valor={formatearMoneda(totalNeto)} detalle={pluralizar(completados.length, "servicio completado", "servicios completados")} />
        <StatCard
          icono={Percent}
          tono="neutral"
          style={escalonado(1)}
          etiqueta="Comisión y retención"
          valor={formatearMoneda(totalDescuentos)}
          detalle={`Comisión ${porcentaje(COMISION_PLATAFORMA)} y retención ${porcentaje(RETENCION_FUENTE)}`}
        />
        <StatCard icono={Clock} tono="accent" style={escalonado(2)} etiqueta="Por cobrar" valor={formatearMoneda(porCobrar)} detalle={pluralizar(enCurso.length, "servicio en curso", "servicios en curso")} />
      </div>

      {completados.length > 0 && (
        <Card className="mt-6 animate-fade-up p-5" style={escalonado(3)}>
          <h3 className="text-base font-semibold">Cómo se reparte lo que pagan tus clientes</h3>
          <p className="mb-5 text-sm text-muted-foreground">
            De {formatearMoneda(totalBruto)} cobrados, recibes {formatearMoneda(totalNeto)}.
          </p>
          <BarraSegmentada
            titulo="Reparto del total cobrado"
            formato={formatearMoneda}
            partes={[
              { etiqueta: "Tu pago neto", valor: totalNeto },
              { etiqueta: `Comisión YPRI (${porcentaje(COMISION_PLATAFORMA)})`, valor: sumarTotales(completados, (c) => c.distribucion.comisionYpri) },
              { etiqueta: `Retención en la fuente (${porcentaje(RETENCION_FUENTE)})`, valor: sumarTotales(completados, (c) => c.distribucion.retencionFuente) },
            ]}
          />
        </Card>
      )}

      <Card className="mt-6 animate-fade-up overflow-hidden" style={escalonado(4)}>
        <CardHeader titulo="Detalle por servicio" descripcion="Valores calculados sobre el total pagado por el cliente (IVA incluido)." />
        {completados.length ? (
          <Table>
            <thead>
              <tr>
                <Th>Contrato</Th>
                <Th>Cliente</Th>
                <Th>Fecha</Th>
                <Th numerico>Total cliente</Th>
                <Th numerico>Comisión</Th>
                <Th numerico>Retención</Th>
                <Th numerico>Neto</Th>
              </tr>
            </thead>
            <tbody>
              {completados.map(({ contrato, distribucion }) => (
                <tr key={contrato.id}>
                  <Td className="font-mono text-xs">{contrato.id}</Td>
                  <Td>{contrato.cliente_nombre}</Td>
                  <Td>{formatearFecha(contrato.fecha)}</Td>
                  <Td numerico>{formatearMoneda(contrato.total)}</Td>
                  <Td numerico>{formatearMoneda(distribucion.comisionYpri)}</Td>
                  <Td numerico>{formatearMoneda(distribucion.retencionFuente)}</Td>
                  <Td numerico className="font-semibold text-accent-strong">
                    {formatearMoneda(distribucion.pagoNetoPrestador)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="p-5">
            <EmptyState icono={Wallet} titulo="Todavía no tienes servicios completados" descripcion="Cuando completes un servicio verás aquí el detalle del pago." />
          </div>
        )}
      </Card>
    </>
  );
}

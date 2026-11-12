"use client";

import { Card, CardHeader, EstadoContratoBadge, PageHeader, StatCard, Table, Td, Th } from "@/components/ui";
import { CATEGORIA_LABEL, CIUDAD_LABEL } from "@/lib/constants";
import { ESTADOS_ACTIVOS } from "@/lib/domain/contracts";
import { calcularComisionPlataforma, sumarTotales } from "@/lib/finance";
import { formatearCalificacion, formatearFecha, formatearMoneda } from "@/lib/format";
import { useAppStore } from "@/store/AppStore";

const ULTIMOS_CONTRATOS = 5;

export function AdminOverview() {
  const { data } = useAppStore();
  const completados = data.contratos.filter((c) => c.estado === "Completado");
  const activos = data.contratos.filter((c) => ESTADOS_ACTIVOS.includes(c.estado));
  const valorTransado = sumarTotales(completados, (c) => c.total);
  const comisiones = sumarTotales(completados, (c) => calcularComisionPlataforma(c.total).comisionYpri);
  const profesionales = data.usuarios.filter((u) => u.rol === "prestador" && u.activo).length;
  const clientes = data.usuarios.filter((u) => u.rol === "cliente" && u.activo).length;
  const mejorCalificados = [...data.servicios]
    .filter((s) => s.num_resenas > 0)
    .sort((a, b) => b.calificacion - a.calificacion || b.num_resenas - a.num_resenas)
    .slice(0, 5);

  return (
    <>
      <PageHeader titulo="Resumen de la plataforma" descripcion="Actividad, usuarios y desempeño de los servicios." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard etiqueta="Valor transado" valor={formatearMoneda(valorTransado)} detalle={`${completados.length} servicios completados`} />
        <StatCard etiqueta="Ingresos por comisión" valor={formatearMoneda(comisiones)} detalle="Sobre servicios completados" />
        <StatCard etiqueta="Servicios en curso" valor={activos.length} detalle="Pendientes y en proceso" />
        <StatCard etiqueta="Usuarios activos" valor={clientes + profesionales} detalle={`${clientes} clientes · ${profesionales} profesionales`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader titulo="Contratos recientes" />
          <Table>
            <thead>
              <tr>
                <Th>Contrato</Th>
                <Th>Servicio</Th>
                <Th className="hidden xl:table-cell">Fecha</Th>
                <Th>Estado</Th>
                <Th numerico>Total</Th>
              </tr>
            </thead>
            <tbody>
              {data.contratos.slice(0, ULTIMOS_CONTRATOS).map((c) => (
                <tr key={c.id}>
                  <Td className="font-mono text-xs">{c.id}</Td>
                  <Td>
                    <span className="block text-slate-900">{c.servicio_nombre}</span>
                    <span className="text-xs text-slate-500">{c.cliente_nombre}</span>
                  </Td>
                  <Td className="hidden xl:table-cell">{formatearFecha(c.fecha)}</Td>
                  <Td>
                    <EstadoContratoBadge estado={c.estado} />
                  </Td>
                  <Td numerico>{formatearMoneda(c.total)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader titulo="Mejor calificados" />
          <ul className="divide-y divide-slate-100">
            {mejorCalificados.map((s) => (
              <li key={s.codigo} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{s.prestador_nombre}</p>
                  <p className="text-xs text-slate-500">
                    {CATEGORIA_LABEL[s.categoria]} · {CIUDAD_LABEL[s.ciudad]}
                  </p>
                </div>
                <p className="text-sm tabular-nums text-slate-700">
                  <span className="font-semibold text-slate-900">{formatearCalificacion(s.calificacion)}</span> / 5
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

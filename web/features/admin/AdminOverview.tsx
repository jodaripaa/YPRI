"use client";

import { Activity, Banknote, Star, TrendingUp, Users } from "lucide-react";
import { Avatar, Card, CardHeader, escalonado, EstadoContratoBadge, PageHeader, StatCard, Table, Td, Th } from "@/components/ui";
import { CATEGORIA_LABEL, CIUDAD_LABEL } from "@/lib/constants";
import { ESTADOS_ACTIVOS } from "@/lib/domain/contracts";
import { calcularComisionPlataforma, sumarTotales } from "@/lib/finance";
import { formatearCalificacion, formatearFecha, formatearMoneda, iniciales } from "@/lib/format";
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
        <StatCard destacado icono={Banknote} style={escalonado(0)} etiqueta="Valor transado" valor={formatearMoneda(valorTransado)} detalle={`${completados.length} servicios completados`} />
        <StatCard icono={TrendingUp} tono="accent" style={escalonado(1)} etiqueta="Ingresos por comisión" valor={formatearMoneda(comisiones)} detalle="Sobre servicios completados" />
        <StatCard icono={Activity} style={escalonado(2)} etiqueta="Servicios en curso" valor={activos.length} detalle="Pendientes y en proceso" />
        <StatCard icono={Users} tono="neutral" style={escalonado(3)} etiqueta="Usuarios activos" valor={clientes + profesionales} detalle={`${clientes} clientes · ${profesionales} profesionales`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="animate-fade-up overflow-hidden lg:col-span-3" style={escalonado(4)}>
          <CardHeader titulo="Contratos recientes" />
          <Table>
            <thead>
              <tr>
                <Th>Contrato</Th>
                <Th>Servicio</Th>
                <Th className="hidden 2xl:table-cell">Fecha</Th>
                <Th>Estado</Th>
                <Th numerico>Total</Th>
              </tr>
            </thead>
            <tbody>
              {data.contratos.slice(0, ULTIMOS_CONTRATOS).map((c) => (
                <tr key={c.id}>
                  <Td className="font-mono text-xs">{c.id}</Td>
                  <Td>
                    <span className="block text-foreground">{c.servicio_nombre}</span>
                    <span className="text-xs text-muted-foreground">{c.cliente_nombre}</span>
                  </Td>
                  <Td className="hidden 2xl:table-cell">{formatearFecha(c.fecha)}</Td>
                  <Td>
                    <EstadoContratoBadge estado={c.estado} />
                  </Td>
                  <Td numerico>{formatearMoneda(c.total)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card className="animate-fade-up overflow-hidden lg:col-span-2" style={escalonado(5)}>
          <CardHeader titulo="Mejor calificados" />
          <ul className="divide-y divide-border/70">
            {mejorCalificados.map((s, i) => (
              <li key={s.codigo} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40">
                <span className="w-4 text-xs font-semibold tabular-nums text-muted-foreground">{i + 1}</span>
                <Avatar texto={iniciales(s.prestador_nombre)} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{s.prestador_nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {CATEGORIA_LABEL[s.categoria]} · {CIUDAD_LABEL[s.ciudad]}
                  </p>
                </div>
                <p className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-sm tabular-nums">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                  <span className="font-semibold text-foreground">{formatearCalificacion(s.calificacion)}</span>
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

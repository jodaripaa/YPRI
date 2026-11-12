"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ClipboardList } from "lucide-react";
import { EmptyState, escalonado, PageHeader, Tabs, useToast } from "@/components/ui";
import type { EstadoContrato } from "@/lib/constants";
import { accionesDisponibles, contratosVisiblesPara, type AccionContrato } from "@/lib/domain/contracts";
import type { Contrato, Usuario } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";
import { useContratos } from "@/store/hooks";
import { ContractCard, distanciaContrato } from "./ContractCard";
import { ConfirmDialog, RateDialog } from "./ContractDialogs";
import { CONFIGURACION_ACCIONES } from "./contractActions";

export interface PestanaContratos {
  id: string;
  etiqueta: string;
  estados: readonly EstadoContrato[];
  vacio: string;
}

interface Props {
  usuario: Usuario;
  titulo: string;
  descripcion: string;
  pestanas: readonly PestanaContratos[];
  accionVacia?: ReactNode;
}

type Dialogo = { tipo: "calificar"; contrato: Contrato } | { tipo: "confirmar"; contrato: Contrato; accion: AccionContrato } | null;

/** Lista de contratos reutilizable: el dominio decide qué contratos y acciones ve cada rol. */
export function ContractsView({ usuario, titulo, descripcion, pestanas, accionVacia }: Props) {
  const { data } = useAppStore();
  const { transicionar, calificar } = useContratos();
  const toast = useToast();
  const [pestanaId, setPestanaId] = useState(pestanas[0].id);
  const [dialogo, setDialogo] = useState<Dialogo>(null);

  const visibles = useMemo(() => contratosVisiblesPara(data.contratos, usuario), [data.contratos, usuario]);
  const pestana = pestanas.find((p) => p.id === pestanaId) ?? pestanas[0];
  // Los pedidos inmediatos van primero: el cliente necesita a alguien ya.
  const contratos = visibles
    .filter((c) => pestana.estados.includes(c.estado))
    .sort((a, b) => Number(Boolean(b.urgente)) - Number(Boolean(a.urgente)));

  const ejecutar = (contrato: Contrato, accion: AccionContrato) => {
    if (accion === "calificar") return;
    const resultado = transicionar(contrato.id, accion);
    if (resultado.ok) toast.exito(CONFIGURACION_ACCIONES[accion].exito);
    else toast.error(resultado.error);
    setDialogo(null);
  };

  const alSolicitarAccion = (contrato: Contrato, accion: AccionContrato) => {
    if (accion === "calificar") return setDialogo({ tipo: "calificar", contrato });
    if (CONFIGURACION_ACCIONES[accion].confirmacion) return setDialogo({ tipo: "confirmar", contrato, accion });
    ejecutar(contrato, accion);
  };

  return (
    <>
      <PageHeader titulo={titulo} descripcion={descripcion} />
      <Tabs
        etiqueta="Filtrar contratos"
        activa={pestana.id}
        onCambiar={setPestanaId}
        opciones={pestanas.map((p) => ({
          id: p.id,
          etiqueta: p.etiqueta,
          conteo: visibles.filter((c) => p.estados.includes(c.estado)).length,
        }))}
      />

      <div key={pestana.id} className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {contratos.length ? (
          contratos.map((contrato, i) => (
            <ContractCard
              key={contrato.id}
              style={escalonado(i)}
              contrato={contrato}
              usuario={usuario}
              acciones={accionesDisponibles(contrato, usuario)}
              distanciaKm={distanciaContrato(contrato, data.servicios.find((s) => s.codigo === contrato.servicio_codigo))}
              onAccion={alSolicitarAccion}
            />
          ))
        ) : (
          <div className="lg:col-span-2">
            <EmptyState icono={ClipboardList} titulo={pestana.vacio} accion={accionVacia} />
          </div>
        )}
      </div>

      {dialogo?.tipo === "calificar" && (
        <RateDialog
          contrato={dialogo.contrato}
          onCerrar={() => setDialogo(null)}
          onEnviar={(puntuacion, comentario) => {
            const resultado = calificar(dialogo.contrato.id, puntuacion, comentario);
            if (!resultado.ok) return resultado.error;
            toast.exito(CONFIGURACION_ACCIONES.calificar.exito);
            setDialogo(null);
            return null;
          }}
        />
      )}

      {dialogo?.tipo === "confirmar" && (
        <ConfirmDialog
          titulo={`${CONFIGURACION_ACCIONES[dialogo.accion].etiqueta} ${dialogo.contrato.id}`}
          mensaje={CONFIGURACION_ACCIONES[dialogo.accion].confirmacion ?? ""}
          etiquetaConfirmar={CONFIGURACION_ACCIONES[dialogo.accion].etiqueta}
          onCerrar={() => setDialogo(null)}
          onConfirmar={() => ejecutar(dialogo.contrato, dialogo.accion)}
        />
      )}
    </>
  );
}

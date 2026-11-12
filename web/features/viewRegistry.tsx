"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui";
import type { VistaId } from "@/lib/domain/navigation";
import type { Usuario } from "@/lib/types";
import { AdminOverview } from "./admin/AdminOverview";
import { BillingView } from "./admin/BillingView";
import { SubalgoritmosView } from "./admin/subalgoritmos/SubalgoritmosView";
import { UsersView } from "./admin/UsersView";
import { CatalogView } from "./catalog/CatalogView";
import { ContractsView, type PestanaContratos } from "./contracts/ContractsView";
import { EarningsView } from "./provider/EarningsView";
import { MyServicesView } from "./provider/MyServicesView";

export interface ContextoVista {
  usuario: Usuario;
  navegar: (vista: VistaId) => void;
}

const PESTANAS_CLIENTE: PestanaContratos[] = [
  { id: "activas", etiqueta: "En curso", estados: ["Pendiente", "En proceso"], vacio: "No tienes solicitudes en curso" },
  { id: "historial", etiqueta: "Historial", estados: ["Completado", "Cancelado"], vacio: "Aún no tienes servicios finalizados" },
];

const PESTANAS_PROFESIONAL: PestanaContratos[] = [
  { id: "nuevas", etiqueta: "Nuevas", estados: ["Pendiente"], vacio: "No tienes solicitudes nuevas" },
  { id: "curso", etiqueta: "En curso", estados: ["En proceso"], vacio: "No tienes servicios en curso" },
  { id: "historial", etiqueta: "Historial", estados: ["Completado", "Cancelado"], vacio: "Aún no tienes servicios finalizados" },
];

const PESTANAS_ADMIN: PestanaContratos[] = [
  { id: "activos", etiqueta: "Activos", estados: ["Pendiente", "En proceso"], vacio: "No hay contratos activos" },
  { id: "completados", etiqueta: "Completados", estados: ["Completado"], vacio: "No hay contratos completados" },
  { id: "cancelados", etiqueta: "Cancelados", estados: ["Cancelado"], vacio: "No hay contratos cancelados" },
];

/** Registro de vistas: cada identificador de navegación se resuelve a su componente. */
export const REGISTRO_VISTAS: Record<VistaId, (contexto: ContextoVista) => ReactNode> = {
  explorar: ({ usuario, navegar }) => <CatalogView usuario={usuario} onSolicitudCreada={() => navegar("mis-solicitudes")} />,
  "mis-solicitudes": ({ usuario, navegar }) => (
    <ContractsView
      usuario={usuario}
      titulo="Mis solicitudes"
      descripcion="Sigue el estado de tus servicios y califica a los profesionales."
      pestanas={PESTANAS_CLIENTE}
      accionVacia={<Button onClick={() => navegar("explorar")}>Buscar un servicio</Button>}
    />
  ),
  solicitudes: ({ usuario }) => (
    <ContractsView usuario={usuario} titulo="Solicitudes" descripcion="Acepta nuevos trabajos y actualiza los que tienes en curso." pestanas={PESTANAS_PROFESIONAL} />
  ),
  "mis-servicios": ({ usuario }) => <MyServicesView usuario={usuario} />,
  ganancias: ({ usuario }) => <EarningsView usuario={usuario} />,
  resumen: () => <AdminOverview />,
  facturacion: () => <BillingView />,
  contratos: ({ usuario }) => (
    <ContractsView usuario={usuario} titulo="Contratos" descripcion="Todos los contratos de la plataforma." pestanas={PESTANAS_ADMIN} />
  ),
  usuarios: ({ usuario }) => <UsersView usuario={usuario} />,
  subalgoritmos: () => <SubalgoritmosView />,
};

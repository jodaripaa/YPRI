// Configuración declarativa de las vistas. Agregar una vista nueva solo
// requiere registrarla aquí y en el registro de componentes (principio
// abierto/cerrado); la navegación y la protección de rutas se derivan solas.

import type { Usuario } from "../types";
import { tienePermiso, type Permiso } from "./permissions";

export type VistaId =
  | "explorar"
  | "mis-solicitudes"
  | "solicitudes"
  | "mis-servicios"
  | "ganancias"
  | "resumen"
  | "facturacion"
  | "contratos"
  | "usuarios"
  | "subalgoritmos";

export interface DefinicionVista {
  id: VistaId;
  etiqueta: string;
  permiso: Permiso;
}

export const VISTAS: readonly DefinicionVista[] = [
  { id: "explorar", etiqueta: "Explorar", permiso: "catalogo:explorar" },
  { id: "mis-solicitudes", etiqueta: "Mis solicitudes", permiso: "contrato:ver_propios" },
  { id: "solicitudes", etiqueta: "Solicitudes", permiso: "contrato:gestionar_recibidos" },
  { id: "mis-servicios", etiqueta: "Mis servicios", permiso: "servicio:publicar" },
  { id: "ganancias", etiqueta: "Ganancias", permiso: "ganancias:ver" },
  { id: "resumen", etiqueta: "Resumen", permiso: "metricas:ver" },
  { id: "facturacion", etiqueta: "Facturación", permiso: "facturacion:ver" },
  { id: "contratos", etiqueta: "Contratos", permiso: "contrato:ver_todos" },
  { id: "usuarios", etiqueta: "Usuarios", permiso: "usuarios:gestionar" },
  { id: "subalgoritmos", etiqueta: "Subalgoritmos", permiso: "subalgoritmos:ver" },
];

export function vistasPermitidas(usuario: Usuario | null): DefinicionVista[] {
  return VISTAS.filter((vista) => tienePermiso(usuario, vista.permiso));
}

export function puedeVerVista(usuario: Usuario | null, vistaId: VistaId): boolean {
  return vistasPermitidas(usuario).some((vista) => vista.id === vistaId);
}

export function vistaInicial(usuario: Usuario | null): VistaId | null {
  return vistasPermitidas(usuario)[0]?.id ?? null;
}

/**
 * Quien puede solicitar servicios usa la app móvil (inicio, búsqueda, reservas
 * y perfil); los demás roles usan el panel con barra superior.
 */
export function usaAppMovil(usuario: Usuario | null): boolean {
  return tienePermiso(usuario, "contrato:solicitar");
}

// Control de acceso basado en roles (RBAC). Es la única fuente de verdad sobre
// qué puede hacer cada rol: la navegación, las vistas y las operaciones de
// dominio consultan estas funciones en lugar de comparar roles directamente.

import type { RolUsuario } from "../constants";
import type { Usuario } from "../types";

export type Permiso =
  | "catalogo:explorar"
  | "contrato:solicitar"
  | "contrato:ver_propios"
  | "contrato:gestionar_recibidos"
  | "contrato:ver_todos"
  | "contrato:cancelar_cualquiera"
  | "servicio:publicar"
  | "ganancias:ver"
  | "metricas:ver"
  | "facturacion:ver"
  | "facturacion:editar"
  | "usuarios:gestionar"
  | "subalgoritmos:ver";

const PERMISOS_POR_ROL: Record<RolUsuario, ReadonlySet<Permiso>> = {
  cliente: new Set<Permiso>(["catalogo:explorar", "contrato:solicitar", "contrato:ver_propios"]),
  prestador: new Set<Permiso>(["contrato:gestionar_recibidos", "servicio:publicar", "ganancias:ver"]),
  admin: new Set<Permiso>([
    "metricas:ver",
    "contrato:ver_todos",
    "contrato:cancelar_cualquiera",
    "facturacion:ver",
    "facturacion:editar",
    "usuarios:gestionar",
    "subalgoritmos:ver",
  ]),
};

export function tienePermiso(usuario: Pick<Usuario, "rol" | "activo"> | null | undefined, permiso: Permiso): boolean {
  if (!usuario || !usuario.activo) return false;
  return PERMISOS_POR_ROL[usuario.rol].has(permiso);
}

export const MENSAJE_SIN_PERMISO = "No tienes permisos para realizar esta acción.";

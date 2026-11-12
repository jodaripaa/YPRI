import type { AppData } from "@/lib/types";

const CLAVE = "ypri:estado:v2";

function esEstadoValido(valor: unknown): valor is AppData {
  if (!valor || typeof valor !== "object") return false;
  const estado = valor as Partial<AppData>;
  return (
    Array.isArray(estado.usuarios) &&
    Array.isArray(estado.servicios) &&
    Array.isArray(estado.contratos) &&
    Array.isArray(estado.matrizSemanal) &&
    Array.isArray(estado.matrizCiudades) &&
    Array.isArray(estado.contratosSincronizados)
  );
}

export function cargarEstado(): AppData | null {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (!crudo) return null;
    const estado: unknown = JSON.parse(crudo);
    return esEstadoValido(estado) ? estado : null;
  } catch {
    return null;
  }
}

export function guardarEstado(estado: AppData): void {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch {
    // Almacenamiento lleno o bloqueado: la app sigue funcionando en memoria.
  }
}

export function borrarEstado(): void {
  try {
    window.localStorage.removeItem(CLAVE);
  } catch {
    // Sin acceso al almacenamiento: no hay nada que borrar.
  }
}

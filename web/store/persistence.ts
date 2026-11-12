import { SERVICIOS_INICIALES, USUARIOS_INICIALES } from "@/lib/seed";
import type { AppData, Servicio } from "@/lib/types";
import { BARRIOS, RADIO_COBERTURA_KM } from "@/lib/zonas";

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

/**
 * Completa los servicios guardados antes de la geolocalización: toman la zona
 * de los datos de prueba si existen o el centro de su ciudad.
 */
export function migrarEstado(estado: AppData): AppData {
  const servicios = estado.servicios.map((s): Servicio => {
    if (s.ubicacion && s.zona && s.radio_km) return s;
    const semilla = SERVICIOS_INICIALES.find((x) => x.codigo === s.codigo && x.ciudad === s.ciudad);
    const centro = BARRIOS[s.ciudad]?.[0];
    return {
      ...s,
      zona: s.zona ?? semilla?.zona ?? centro?.nombre ?? "Centro",
      ubicacion: s.ubicacion ?? semilla?.ubicacion ?? centro.coordenadas,
      radio_km: s.radio_km ?? semilla?.radio_km ?? RADIO_COBERTURA_KM,
    };
  });
  // Registros de prueba agregados después (por ejemplo, la profesional de Belleza).
  const usuariosNuevos = USUARIOS_INICIALES.filter((u) => !estado.usuarios.some((x) => x.id === u.id));
  const serviciosNuevos = SERVICIOS_INICIALES.filter((s) => !servicios.some((x) => x.codigo === s.codigo));
  return { ...estado, usuarios: [...estado.usuarios, ...usuariosNuevos], servicios: [...servicios, ...serviciosNuevos] };
}

export function cargarEstado(): AppData | null {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (!crudo) return null;
    const estado: unknown = JSON.parse(crudo);
    return esEstadoValido(estado) ? migrarEstado(estado) : null;
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

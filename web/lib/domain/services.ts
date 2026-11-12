import {
  CATEGORIAS_SERVICIO,
  CIUDADES_COBERTURA,
  LONGITUD_MINIMA_DESCRIPCION,
  TARIFA_MAXIMA,
  TARIFA_MINIMA,
  type CategoriaServicio,
  type CiudadCobertura,
} from "../constants";
import { siguienteId } from "../ids";
import { fail, ok, type Result } from "../result";
import type { AppData, Servicio, Usuario } from "../types";
import { MENSAJE_SIN_PERMISO, tienePermiso } from "./permissions";

export type OrdenCatalogo = "relevancia" | "precio_asc" | "precio_desc" | "calificacion";

export interface FiltrosCatalogo {
  texto: string;
  categoria: CategoriaServicio | "todas";
  ciudad: CiudadCobertura | "todas";
  soloDisponibles: boolean;
  orden: OrdenCatalogo;
}

const COMPARADORES: Record<OrdenCatalogo, (a: Servicio, b: Servicio) => number> = {
  relevancia: (a, b) => Number(b.disponible) - Number(a.disponible) || b.calificacion - a.calificacion,
  precio_asc: (a, b) => a.tarifa_hora - b.tarifa_hora,
  precio_desc: (a, b) => b.tarifa_hora - a.tarifa_hora,
  calificacion: (a, b) => b.calificacion - a.calificacion || b.num_resenas - a.num_resenas,
};

export function filtrarCatalogo(servicios: readonly Servicio[], filtros: FiltrosCatalogo): Servicio[] {
  const texto = filtros.texto.trim().toLowerCase();
  return servicios
    .filter((s) => filtros.categoria === "todas" || s.categoria === filtros.categoria)
    .filter((s) => filtros.ciudad === "todas" || s.ciudad === filtros.ciudad)
    .filter((s) => !filtros.soloDisponibles || s.disponible)
    .filter(
      (s) =>
        !texto ||
        [s.descripcion, s.prestador_nombre, s.categoria].some((campo) => campo.toLowerCase().includes(texto)),
    )
    .sort(COMPARADORES[filtros.orden]);
}

export function serviciosDe(servicios: readonly Servicio[], prestadorId: string): Servicio[] {
  return servicios.filter((s) => s.prestador_id === prestadorId);
}

export interface DatosServicio {
  categoria: CategoriaServicio;
  ciudad: CiudadCobertura;
  tarifaHora: number;
  descripcion: string;
  aniosExperiencia: number;
}

export function validarServicio(datos: DatosServicio): string | null {
  if (!CATEGORIAS_SERVICIO.includes(datos.categoria)) return "Selecciona una categoría válida.";
  if (!CIUDADES_COBERTURA.includes(datos.ciudad)) return "Selecciona una ciudad con cobertura.";
  if (!Number.isFinite(datos.tarifaHora) || datos.tarifaHora < TARIFA_MINIMA || datos.tarifaHora > TARIFA_MAXIMA)
    return `La tarifa debe estar entre ${TARIFA_MINIMA.toLocaleString("es-CO")} y ${TARIFA_MAXIMA.toLocaleString("es-CO")} pesos.`;
  if (datos.descripcion.trim().length < LONGITUD_MINIMA_DESCRIPCION)
    return `Describe el servicio en al menos ${LONGITUD_MINIMA_DESCRIPCION} caracteres.`;
  if (!Number.isInteger(datos.aniosExperiencia) || datos.aniosExperiencia < 0 || datos.aniosExperiencia > 60)
    return "Indica tus años de experiencia (0 a 60).";
  return null;
}

export function publicarServicio(data: AppData, actor: Usuario, datos: DatosServicio): Result<{ data: AppData; servicio: Servicio }> {
  if (!tienePermiso(actor, "servicio:publicar")) return fail(MENSAJE_SIN_PERMISO);
  const error = validarServicio(datos);
  if (error) return fail(error);

  const duplicado = data.servicios.some(
    (s) => s.prestador_id === actor.id && s.categoria === datos.categoria && s.ciudad === datos.ciudad,
  );
  if (duplicado) return fail("Ya tienes un servicio publicado en esa categoría y ciudad.");

  const servicio: Servicio = {
    codigo: siguienteId("SERV", data.servicios.map((s) => s.codigo), 2),
    prestador_id: actor.id,
    prestador_nombre: actor.nombre,
    categoria: datos.categoria,
    descripcion: datos.descripcion.trim(),
    tarifa_hora: Math.round(datos.tarifaHora),
    ciudad: datos.ciudad,
    disponible: true,
    calificacion: 0,
    num_contratos: 0,
    num_resenas: 0,
    anios_experiencia: datos.aniosExperiencia,
  };
  return ok({ data: { ...data, servicios: [servicio, ...data.servicios] }, servicio });
}

export function cambiarDisponibilidad(data: AppData, actor: Usuario, codigo: string): Result<AppData> {
  const servicio = data.servicios.find((s) => s.codigo === codigo);
  if (!servicio) return fail("El servicio no existe.");
  if (!tienePermiso(actor, "servicio:publicar") || servicio.prestador_id !== actor.id) return fail(MENSAJE_SIN_PERMISO);
  return ok({
    ...data,
    servicios: data.servicios.map((s) => (s.codigo === codigo ? { ...s, disponible: !s.disponible } : s)),
  });
}

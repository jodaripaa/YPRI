// Ciclo de vida de los contratos. Las reglas de transición están declaradas
// como datos: cada acción define desde qué estados aplica, a cuál lleva y qué
// roles pueden ejecutarla.

import { HORAS_MAXIMAS, HORAS_MINIMAS, type EstadoContrato, type RolUsuario, CATEGORIA_LABEL } from "../constants";
import { calcularLiquidacionContrato, calcularPromedioRating } from "../finance";
import { fechaIsoHoy } from "../format";
import { siguienteId } from "../ids";
import { fail, ok, type Result } from "../result";
import type { AppData, Contrato, Usuario } from "../types";
import { sonCoordenadasValidas, type Coordenadas } from "../geo";
import { esEnteroEnRango } from "../validation";
import { MENSAJE_SIN_PERMISO, tienePermiso } from "./permissions";

export type AccionTransicion = "aceptar" | "rechazar" | "completar" | "cancelar";
export type AccionContrato = AccionTransicion | "calificar";

interface ReglaTransicion {
  accion: AccionTransicion;
  desde: readonly EstadoContrato[];
  hacia: EstadoContrato;
  roles: readonly RolUsuario[];
}

const REGLAS_TRANSICION: readonly ReglaTransicion[] = [
  { accion: "aceptar", desde: ["Pendiente"], hacia: "En proceso", roles: ["prestador"] },
  { accion: "rechazar", desde: ["Pendiente"], hacia: "Cancelado", roles: ["prestador"] },
  { accion: "completar", desde: ["En proceso"], hacia: "Completado", roles: ["prestador"] },
  { accion: "cancelar", desde: ["Pendiente"], hacia: "Cancelado", roles: ["cliente"] },
  { accion: "cancelar", desde: ["Pendiente", "En proceso"], hacia: "Cancelado", roles: ["admin"] },
];

export const ESTADOS_ACTIVOS: readonly EstadoContrato[] = ["Pendiente", "En proceso"];

export function esParteDelContrato(contrato: Contrato, usuario: Usuario): boolean {
  if (usuario.rol === "cliente") return contrato.cliente_id === usuario.id;
  if (usuario.rol === "prestador") return contrato.prestador_id === usuario.id;
  return tienePermiso(usuario, "contrato:ver_todos");
}

/** Contratos que el usuario tiene derecho a ver según su rol. */
export function contratosVisiblesPara(contratos: readonly Contrato[], usuario: Usuario): Contrato[] {
  return contratos.filter((c) => esParteDelContrato(c, usuario));
}

function buscarRegla(contrato: Contrato, usuario: Usuario, accion: AccionTransicion): ReglaTransicion | undefined {
  return REGLAS_TRANSICION.find(
    (regla) => regla.accion === accion && regla.roles.includes(usuario.rol) && regla.desde.includes(contrato.estado),
  );
}

export function puedeCalificar(contrato: Contrato, usuario: Usuario): boolean {
  return (
    usuario.rol === "cliente" &&
    contrato.cliente_id === usuario.id &&
    contrato.estado === "Completado" &&
    contrato.calificacion === undefined
  );
}

export function accionesDisponibles(contrato: Contrato, usuario: Usuario): AccionContrato[] {
  if (!usuario.activo || !esParteDelContrato(contrato, usuario)) return [];
  const transiciones = (["aceptar", "rechazar", "completar", "cancelar"] as const).filter((accion) =>
    Boolean(buscarRegla(contrato, usuario, accion)),
  );
  return puedeCalificar(contrato, usuario) ? [...transiciones, "calificar"] : transiciones;
}

export interface SolicitudContrato {
  servicioCodigo: string;
  horas: number;
  fecha: string;
  direccion: string;
  nota?: string;
  ubicacion?: Coordenadas;
}

export function crearContrato(
  data: AppData,
  actor: Usuario,
  solicitud: SolicitudContrato,
  hoy: string = fechaIsoHoy(),
): Result<{ data: AppData; contrato: Contrato }> {
  if (!tienePermiso(actor, "contrato:solicitar")) return fail(MENSAJE_SIN_PERMISO);

  const servicio = data.servicios.find((s) => s.codigo === solicitud.servicioCodigo);
  if (!servicio) return fail("El servicio seleccionado no existe.");
  if (!servicio.disponible) return fail("Este servicio no está disponible en este momento.");
  if (servicio.prestador_id === actor.id) return fail("No puedes contratar tu propio servicio.");
  if (!esEnteroEnRango(solicitud.horas, HORAS_MINIMAS, HORAS_MAXIMAS))
    return fail(`Las horas deben estar entre ${HORAS_MINIMAS} y ${HORAS_MAXIMAS}.`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(solicitud.fecha) || solicitud.fecha < hoy)
    return fail("Selecciona una fecha a partir de hoy.");
  if (solicitud.direccion.trim().length < 5) return fail("Escribe la dirección donde se prestará el servicio.");
  if (solicitud.ubicacion !== undefined && !sonCoordenadasValidas(solicitud.ubicacion)) return fail("La ubicación del servicio no es válida.");

  const liquidacion = calcularLiquidacionContrato(servicio.tarifa_hora, solicitud.horas);
  const contrato: Contrato = {
    id: siguienteId("CONTR", data.contratos.map((c) => c.id)),
    cliente_id: actor.id,
    cliente_nombre: actor.nombre,
    prestador_id: servicio.prestador_id,
    prestador_nombre: servicio.prestador_nombre,
    servicio_codigo: servicio.codigo,
    servicio_nombre: CATEGORIA_LABEL[servicio.categoria],
    horas: solicitud.horas,
    tarifa_hora: servicio.tarifa_hora,
    subtotal: liquidacion.subtotalNeto,
    iva: liquidacion.montoIva,
    total: liquidacion.totalPagar,
    estado: "Pendiente",
    fecha: solicitud.fecha,
    direccion: solicitud.direccion.trim(),
    nota: solicitud.nota?.trim() || undefined,
    ubicacion: solicitud.ubicacion,
  };

  return ok({ data: { ...data, contratos: [contrato, ...data.contratos] }, contrato });
}

export function ejecutarTransicion(
  data: AppData,
  actor: Usuario,
  contratoId: string,
  accion: AccionTransicion,
): Result<AppData> {
  const contrato = data.contratos.find((c) => c.id === contratoId);
  if (!contrato) return fail("El contrato no existe.");
  if (!actor.activo || !esParteDelContrato(contrato, actor)) return fail(MENSAJE_SIN_PERMISO);

  const regla = buscarRegla(contrato, actor, accion);
  if (!regla) return fail(`No es posible ${accion} un contrato en estado "${contrato.estado}".`);

  const contratos = data.contratos.map((c) => (c.id === contratoId ? { ...c, estado: regla.hacia } : c));
  const servicios =
    regla.hacia === "Completado"
      ? data.servicios.map((s) =>
          s.codigo === contrato.servicio_codigo ? { ...s, num_contratos: s.num_contratos + 1 } : s,
        )
      : data.servicios;

  return ok({ ...data, contratos, servicios });
}

export function calificarContrato(
  data: AppData,
  actor: Usuario,
  contratoId: string,
  puntuacion: number,
  comentario: string,
): Result<AppData> {
  const contrato = data.contratos.find((c) => c.id === contratoId);
  if (!contrato) return fail("El contrato no existe.");
  if (!puedeCalificar(contrato, actor)) return fail("Este contrato no se puede calificar.");
  if (!esEnteroEnRango(puntuacion, 1, 5)) return fail("La calificación debe estar entre 1 y 5.");

  const contratos = data.contratos.map((c) =>
    c.id === contratoId ? { ...c, calificacion: puntuacion, comentario: comentario.trim() || undefined } : c,
  );
  const servicios = data.servicios.map((s) => {
    if (s.codigo !== contrato.servicio_codigo) return s;
    const numResenas = s.num_resenas + 1;
    return { ...s, num_resenas: numResenas, calificacion: calcularPromedioRating(s.calificacion, numResenas, puntuacion) };
  });

  return ok({ ...data, contratos, servicios });
}

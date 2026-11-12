import { CATEGORIAS_MATRIZ, DIAS_SEMANA_MATRIZ, type CategoriaServicio } from "../constants";
import { fechaDesdeIso } from "../format";
import { actualizarCelda } from "../matrices";
import { fail, ok, type Result } from "../result";
import type { AppData, TipoMatriz, Usuario } from "../types";
import { MENSAJE_SIN_PERMISO, tienePermiso } from "./permissions";

/**
 * Columna de la matriz semanal (Lunes a Sábado) que corresponde a una fecha.
 * Los domingos se acumulan con el sábado porque la matriz no tiene esa columna.
 */
export function columnaDelDia(fechaIso: string): number {
  const fecha = fechaDesdeIso(fechaIso);
  if (!fecha) return DIAS_SEMANA_MATRIZ.length - 1;
  const dia = fecha.getDay();
  return dia === 0 ? DIAS_SEMANA_MATRIZ.length - 1 : dia - 1;
}

export interface ResultadoSincronizacion {
  data: AppData;
  cantidad: number;
  suma: number;
}

/** Suma a la matriz semanal los contratos completados que aún no se habían sumado. Es idempotente. */
export function sincronizarContratos(data: AppData, actor: Usuario): Result<ResultadoSincronizacion> {
  if (!tienePermiso(actor, "facturacion:editar")) return fail(MENSAJE_SIN_PERMISO);

  const yaSincronizados = new Set(data.contratosSincronizados);
  const pendientes = data.contratos.filter((c) => c.estado === "Completado" && !yaSincronizados.has(c.id));

  let matriz = data.matrizSemanal;
  let suma = 0;
  const sincronizados: string[] = [];
  // Contratos de oficios sin fila en la matriz (Belleza): se marcan como revisados sin sumarse.
  const sinFila: string[] = [];

  for (const contrato of pendientes) {
    const servicio = data.servicios.find((s) => s.codigo === contrato.servicio_codigo);
    const fila = servicio ? (CATEGORIAS_MATRIZ as readonly CategoriaServicio[]).indexOf(servicio.categoria) : -1;
    if (fila === -1) {
      if (servicio) sinFila.push(contrato.id);
      continue;
    }
    const columna = columnaDelDia(contrato.fecha);
    matriz = actualizarCelda(matriz, fila, columna, matriz[fila][columna] + contrato.total);
    suma += contrato.total;
    sincronizados.push(contrato.id);
  }

  return ok({
    data: {
      ...data,
      matrizSemanal: matriz,
      contratosSincronizados: [...data.contratosSincronizados, ...sincronizados, ...sinFila],
    },
    cantidad: sincronizados.length,
    suma,
  });
}

export function editarCeldaMatriz(
  data: AppData,
  actor: Usuario,
  tipo: TipoMatriz,
  fila: number,
  columna: number,
  valor: number,
): Result<AppData> {
  if (!tienePermiso(actor, "facturacion:editar")) return fail(MENSAJE_SIN_PERMISO);
  if (!Number.isFinite(valor) || valor < 0) return fail("Ingresa un valor numérico mayor o igual a cero.");

  const clave = tipo === "semanal" ? "matrizSemanal" : "matrizCiudades";
  const matriz = data[clave];
  if (!matriz[fila] || matriz[fila][columna] === undefined) return fail("La celda indicada no existe.");

  return ok({ ...data, [clave]: actualizarCelda(matriz, fila, columna, Math.round(valor)) });
}

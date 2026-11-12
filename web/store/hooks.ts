"use client";

// Hooks por funcionalidad: cada uno expone solo las operaciones que su vista
// necesita (segregación de interfaces) y delega las reglas al dominio puro.

import { useCallback } from "react";
import { autenticar, cambiarEstadoUsuario, registrarUsuario, type DatosRegistro } from "@/lib/domain/auth";
import { editarCeldaMatriz, sincronizarContratos } from "@/lib/domain/billing";
import {
  calificarContrato,
  crearContrato,
  ejecutarTransicion,
  type AccionTransicion,
  type SolicitudContrato,
} from "@/lib/domain/contracts";
import { MENSAJE_SIN_PERMISO } from "@/lib/domain/permissions";
import { cambiarDisponibilidad, publicarServicio, type DatosServicio } from "@/lib/domain/services";
import { fail, ok, type Result } from "@/lib/result";
import type { TipoMatriz, Usuario } from "@/lib/types";
import { useAppStore } from "./AppStore";

const SIN_SESION = fail<never>(MENSAJE_SIN_PERMISO);

/** Ejecuta una operación solo si hay sesión activa. */
function useConActor() {
  const { usuarioActual } = useAppStore();
  return useCallback(
    <T>(operacion: (actor: Usuario) => Result<T>): Result<T> => (usuarioActual ? operacion(usuarioActual) : SIN_SESION),
    [usuarioActual],
  );
}

export function useSesion() {
  const { data, aplicar, usuarioActual } = useAppStore();

  const iniciarSesion = useCallback(
    (correo: string, contrasena: string) => {
      const resultado = autenticar(data.usuarios, correo, contrasena);
      if (!resultado.ok) return resultado;
      return aplicar(ok({ ...data, sesionUsuarioId: resultado.value.id }));
    },
    [data, aplicar],
  );

  const registrarse = useCallback((datos: DatosRegistro) => aplicar(registrarUsuario(data, datos)), [data, aplicar]);

  const cerrarSesion = useCallback(() => aplicar(ok({ ...data, sesionUsuarioId: null })), [data, aplicar]);

  return { usuarioActual, iniciarSesion, registrarse, cerrarSesion };
}

export function useContratos() {
  const { data, aplicar } = useAppStore();
  const conActor = useConActor();

  return {
    solicitar: (solicitud: SolicitudContrato) => aplicar(conActor((actor) => crearContrato(data, actor, solicitud))),
    transicionar: (contratoId: string, accion: AccionTransicion) =>
      aplicar(conActor((actor) => ejecutarTransicion(data, actor, contratoId, accion))),
    calificar: (contratoId: string, puntuacion: number, comentario: string) =>
      aplicar(conActor((actor) => calificarContrato(data, actor, contratoId, puntuacion, comentario))),
  };
}

export function useServicios() {
  const { data, aplicar } = useAppStore();
  const conActor = useConActor();

  return {
    publicar: (datos: DatosServicio) => aplicar(conActor((actor) => publicarServicio(data, actor, datos))),
    alternarDisponibilidad: (codigo: string) => aplicar(conActor((actor) => cambiarDisponibilidad(data, actor, codigo))),
  };
}

export function useFacturacion() {
  const { data, aplicar } = useAppStore();
  const conActor = useConActor();

  return {
    sincronizar: () => aplicar(conActor((actor) => sincronizarContratos(data, actor))),
    editarCelda: (tipo: TipoMatriz, fila: number, columna: number, valor: number) =>
      aplicar(conActor((actor) => editarCeldaMatriz(data, actor, tipo, fila, columna, valor))),
  };
}

export function useAdministracionUsuarios() {
  const { data, aplicar } = useAppStore();
  const conActor = useConActor();

  return {
    alternarEstado: (usuarioId: string) => aplicar(conActor((actor) => cambiarEstadoUsuario(data, actor, usuarioId))),
  };
}

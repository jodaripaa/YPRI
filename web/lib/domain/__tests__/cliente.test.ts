import { describe, expect, it } from "vitest";
import { crearEstadoInicial } from "../../seed";
import type { AppData, Contrato, Usuario } from "../../types";
import {
  distribucionCalificaciones,
  estadisticasPlataforma,
  otrosServiciosDelProfesional,
  proximaReserva,
  resenasDeServicio,
  resumenCliente,
  serviciosDestacados,
} from "../cliente";
import { usaAppMovil } from "../navigation";

const usuario = (data: AppData, id: string): Usuario => data.usuarios.find((u) => u.id === id)!;

describe("consultas de la app del cliente", () => {
  const data = crearEstadoInicial();
  const juan = usuario(data, "USR-001");
  const laura = usuario(data, "USR-008");

  it("solo los clientes usan la app móvil", () => {
    expect(usaAppMovil(juan)).toBe(true);
    expect(usaAppMovil(usuario(data, "USR-002"))).toBe(false);
    expect(usaAppMovil(usuario(data, "USR-003"))).toBe(false);
    expect(usaAppMovil({ ...juan, activo: false })).toBe(false);
    expect(usaAppMovil(null)).toBe(false);
  });

  it("las reseñas de un servicio son sus contratos calificados", () => {
    const resenas = resenasDeServicio(data.contratos, "SERV-01");
    expect(resenas.map((c) => c.id)).toEqual(["CONTR-101"]);
    expect(resenasDeServicio(data.contratos, "SERV-04")).toEqual([]);
  });

  it("calcula la distribución de estrellas", () => {
    const base = data.contratos[0];
    const resenas: Contrato[] = [5, 5, 4, 1].map((calificacion, i) => ({ ...base, id: `C-${i}`, calificacion }));
    const distribucion = distribucionCalificaciones(resenas);
    expect(distribucion.map((f) => f.estrellas)).toEqual([5, 4, 3, 2, 1]);
    expect(distribucion.map((f) => f.cantidad)).toEqual([2, 1, 0, 0, 1]);
    expect(distribucion[0].porcentaje).toBe(50);
    expect(distribucionCalificaciones([]).every((f) => f.porcentaje === 0)).toBe(true);
  });

  it("los destacados excluyen servicios no disponibles y priorizan la ciudad", () => {
    const enCucuta = serviciosDestacados(data.servicios, "Cucuta", 10);
    expect(enCucuta.some((s) => s.codigo === "SERV-03")).toBe(false);
    expect(enCucuta[0].codigo).toBe("SERV-07");
    expect(enCucuta.at(-1)?.ciudad).toBe("Bogota");

    const enBogota = serviciosDestacados(data.servicios, "Bogota", 2);
    expect(enBogota.map((s) => s.codigo)).toEqual(["SERV-06", "SERV-07"]);
  });

  it("lista los otros servicios del mismo profesional", () => {
    const servicio = data.servicios[0];
    const extra = { ...data.servicios[1], codigo: "SERV-99", prestador_id: servicio.prestador_id };
    expect(otrosServiciosDelProfesional([...data.servicios, extra], servicio).map((s) => s.codigo)).toEqual(["SERV-99"]);
  });

  it("resume solo los contratos del propio cliente", () => {
    expect(resumenCliente(data.contratos, juan)).toEqual({ solicitudes: 2, enCurso: 1, completados: 1, totalInvertido: 208250 });
    expect(resumenCliente(data.contratos, laura)).toEqual({ solicitudes: 1, enCurso: 1, completados: 0, totalInvertido: 0 });
  });

  it("encuentra la próxima reserva activa", () => {
    expect(proximaReserva(data.contratos, juan)?.id).toBe("CONTR-102");
    const sinActivas = data.contratos.map((c) => (c.cliente_id === juan.id ? { ...c, estado: "Completado" as const } : c));
    expect(proximaReserva(sinActivas, juan)).toBeNull();
  });

  it("calcula las estadísticas reales de la plataforma", () => {
    const stats = estadisticasPlataforma(data);
    expect(stats.profesionales).toBe(7);
    expect(stats.serviciosCompletados).toBe(87);
    expect(stats.calificacionPromedio).toBe(4.7);
    expect(estadisticasPlataforma({ ...data, servicios: [] }).calificacionPromedio).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { crearEstadoInicial } from "../../seed";
import type { AppData, Usuario } from "../../types";
import { accionesDisponibles, calificarContrato, contratosVisiblesPara, crearContrato, ejecutarTransicion } from "../contracts";

const HOY = "2026-11-11";
const usuario = (data: AppData, id: string): Usuario => data.usuarios.find((u) => u.id === id)!;

describe("contratos", () => {
  const data = crearEstadoInicial();
  const juan = usuario(data, "USR-001");
  const laura = usuario(data, "USR-008");
  const carlos = usuario(data, "USR-002");
  const jorge = usuario(data, "USR-006");
  const admin = usuario(data, "USR-003");

  it("cada cliente solo ve sus propios contratos", () => {
    expect(contratosVisiblesPara(data.contratos, juan).every((c) => c.cliente_id === juan.id)).toBe(true);
    expect(contratosVisiblesPara(data.contratos, laura).map((c) => c.id)).toEqual(["CONTR-103"]);
  });

  it("cada profesional solo ve los contratos de sus servicios", () => {
    expect(contratosVisiblesPara(data.contratos, carlos).map((c) => c.id).sort()).toEqual(["CONTR-101", "CONTR-103"]);
    expect(contratosVisiblesPara(data.contratos, admin)).toHaveLength(data.contratos.length);
  });

  it("crea un contrato con IVA y lo asigna al profesional del servicio", () => {
    const r = crearContrato(data, juan, { servicioCodigo: "SERV-02", horas: 3, fecha: HOY, direccion: "Calle 5 # 3-10" }, HOY);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.contrato).toMatchObject({ prestador_id: "USR-004", subtotal: 90000, iva: 17100, total: 107100, estado: "Pendiente" });
    expect(r.value.contrato.id).toBe("CONTR-104");
  });

  it("rechaza solicitudes inválidas", () => {
    const base = { servicioCodigo: "SERV-02", horas: 3, fecha: HOY, direccion: "Calle 5 # 3-10" };
    expect(crearContrato(data, carlos, base, HOY).ok).toBe(false);
    expect(crearContrato(data, admin, base, HOY).ok).toBe(false);
    expect(crearContrato(data, juan, { ...base, servicioCodigo: "SERV-03" }, HOY).ok).toBe(false);
    expect(crearContrato(data, juan, { ...base, horas: 0 }, HOY).ok).toBe(false);
    expect(crearContrato(data, juan, { ...base, fecha: "2026-01-01" }, HOY).ok).toBe(false);
  });

  it("el cliente cancela, el profesional acepta y completa", () => {
    const pendiente = data.contratos.find((c) => c.id === "CONTR-102")!;
    expect(accionesDisponibles(pendiente, juan)).toEqual(["cancelar"]);
    expect(accionesDisponibles(pendiente, jorge)).toEqual(["aceptar", "rechazar"]);
    expect(accionesDisponibles(pendiente, carlos)).toEqual([]);

    expect(ejecutarTransicion(data, juan, "CONTR-102", "aceptar").ok).toBe(false);
    const aceptado = ejecutarTransicion(data, jorge, "CONTR-102", "aceptar");
    expect(aceptado.ok).toBe(true);
    if (!aceptado.ok) return;
    const completado = ejecutarTransicion(aceptado.value, jorge, "CONTR-102", "completar");
    expect(completado.ok).toBe(true);
    if (!completado.ok) return;
    expect(completado.value.servicios.find((s) => s.codigo === "SERV-04")!.num_contratos).toBe(16);
  });

  it("solo el cliente dueño califica, una sola vez", () => {
    const r = ejecutarTransicion(data, carlos, "CONTR-103", "completar");
    if (!r.ok) throw new Error(r.error);
    expect(calificarContrato(r.value, juan, "CONTR-103", 5, "").ok).toBe(false);
    expect(calificarContrato(r.value, carlos, "CONTR-103", 5, "").ok).toBe(false);
    const calificado = calificarContrato(r.value, laura, "CONTR-103", 4, "Bien");
    expect(calificado.ok).toBe(true);
    if (!calificado.ok) return;
    expect(calificarContrato(calificado.value, laura, "CONTR-103", 5, "").ok).toBe(false);
    expect(calificado.value.servicios.find((s) => s.codigo === "SERV-01")!.num_resenas).toBe(11);
  });
});

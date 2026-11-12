import { describe, expect, it } from "vitest";
import { calcularComisionPlataforma, calcularLiquidacionContrato, calcularPromedioRating } from "../../finance";
import { siguienteId } from "../../ids";
import { calcularTotalGeneral } from "../../matrices";
import { crearEstadoInicial } from "../../seed";
import { autenticar, cambiarEstadoUsuario, registrarUsuario, type DatosRegistro } from "../auth";
import { columnaDelDia, editarCeldaMatriz, sincronizarContratos } from "../billing";
import { cambiarDisponibilidad, filtrarCatalogo, publicarServicio } from "../services";

const data = crearEstadoInicial();
const usuario = (id: string) => data.usuarios.find((u) => u.id === id)!;
const admin = usuario("USR-003");
const juan = usuario("USR-001");
const carlos = usuario("USR-002");

describe("facturación", () => {
  it("sincronizar es idempotente (no suma dos veces el mismo contrato)", () => {
    const totalInicial = calcularTotalGeneral(data.matrizSemanal);
    const primera = sincronizarContratos(data, admin);
    if (!primera.ok) throw new Error(primera.error);
    expect(primera.value.cantidad).toBe(1);
    expect(calcularTotalGeneral(primera.value.data.matrizSemanal)).toBe(totalInicial + 208250);

    const segunda = sincronizarContratos(primera.value.data, admin);
    if (!segunda.ok) throw new Error(segunda.error);
    expect(segunda.value.cantidad).toBe(0);
    expect(calcularTotalGeneral(segunda.value.data.matrizSemanal)).toBe(totalInicial + 208250);
  });

  it("ubica el contrato en el día real de la semana", () => {
    expect(columnaDelDia("2026-09-18")).toBe(4); // viernes
    expect(columnaDelDia("2026-11-15")).toBe(5); // domingo se acumula con sábado
  });

  it("solo el administrador modifica la facturación", () => {
    expect(sincronizarContratos(data, juan).ok).toBe(false);
    expect(editarCeldaMatriz(data, carlos, "semanal", 0, 0, 1).ok).toBe(false);
    expect(editarCeldaMatriz(data, admin, "semanal", 0, 0, -5).ok).toBe(false);
    const r = editarCeldaMatriz(data, admin, "ciudades", 1, 2, 999000);
    expect(r.ok && r.value.matrizCiudades[1][2]).toBe(999000);
  });
});

describe("autenticación y usuarios", () => {
  const registro: DatosRegistro = {
    nombre: "Ana Lopez",
    correo: "Ana.Lopez@Email.com",
    telefono: "3001112233",
    ciudad: "Cali",
    rol: "cliente",
    contrasena: "secreta1",
    confirmacion: "secreta1",
  };

  it("valida credenciales y cuentas suspendidas", () => {
    expect(autenticar(data.usuarios, "ADMIN@ypri.com", "admin2026").ok).toBe(true);
    expect(autenticar(data.usuarios, "admin@ypri.com", "mala").ok).toBe(false);
    const suspendido = cambiarEstadoUsuario(data, admin, juan.id);
    if (!suspendido.ok) throw new Error(suspendido.error);
    expect(autenticar(suspendido.value.usuarios, juan.correo, juan.contrasena).ok).toBe(false);
  });

  it("registra usuarios sin permitir correos repetidos ni el rol administrador", () => {
    const r = registrarUsuario(data, registro);
    expect(r.ok && r.value.usuario).toMatchObject({ id: "USR-011", correo: "ana.lopez@email.com", rol: "cliente" });
    expect(registrarUsuario(data, { ...registro, correo: juan.correo }).ok).toBe(false);
    expect(registrarUsuario(data, { ...registro, confirmacion: "otra" }).ok).toBe(false);
    expect(registrarUsuario(data, { ...registro, rol: "admin" as unknown as "cliente" }).ok).toBe(false);
  });

  it("solo el administrador suspende y nunca a sí mismo", () => {
    expect(cambiarEstadoUsuario(data, carlos, juan.id).ok).toBe(false);
    expect(cambiarEstadoUsuario(data, admin, admin.id).ok).toBe(false);
  });
});

describe("servicios", () => {
  it("el profesional publica y solo cambia la disponibilidad de los suyos", () => {
    const datos = { categoria: "Plomeria" as const, ciudad: "Cali" as const, tarifaHora: 40000, descripcion: "Destape de cañerías y reparación de fugas", aniosExperiencia: 3 };
    const r = publicarServicio(data, carlos, datos);
    expect(r.ok && r.value.servicio.codigo).toBe("SERV-08");
    expect(publicarServicio(data, juan, datos).ok).toBe(false);
    expect(publicarServicio(data, carlos, { ...datos, tarifaHora: 500 }).ok).toBe(false);
    expect(cambiarDisponibilidad(data, carlos, "SERV-02").ok).toBe(false);
    expect(cambiarDisponibilidad(data, carlos, "SERV-01").ok).toBe(true);
  });

  it("filtra y ordena el catálogo", () => {
    const r = filtrarCatalogo(data.servicios, { texto: "", categoria: "todas", ciudad: "Cucuta", soloDisponibles: true, orden: "precio_asc" });
    expect(r.map((s) => s.codigo)).toEqual(["SERV-05", "SERV-02", "SERV-07", "SERV-01", "SERV-04"]);
  });
});

describe("utilidades", () => {
  it("calcula la liquidación, la comisión y el promedio", () => {
    expect(calcularLiquidacionContrato(35000, 5).totalPagar).toBe(208250);
    expect(calcularComisionPlataforma(208250)).toEqual({ comisionYpri: 20825, retencionFuente: 8330, pagoNetoPrestador: 179095 });
    expect(calcularPromedioRating(4.0, 2, 5)).toBe(4.5);
  });

  it("genera identificadores sin colisiones", () => {
    expect(siguienteId("SERV", ["SERV-01", "SERV-09"], 2)).toBe("SERV-10");
    expect(siguienteId("USR", [])).toBe("USR-001");
  });
});

describe("facturación con oficios fuera de la matriz", () => {
  it("un servicio de belleza completado se marca como revisado sin sumarse a la matriz", () => {
    const base = crearEstadoInicial();
    const contrato = { ...base.contratos[2], id: "CONTR-B01", servicio_codigo: "SERV-07", servicio_nombre: "Belleza", total: 35700 };
    const data = { ...base, contratos: [...base.contratos, contrato] };
    const r = sincronizarContratos(data, admin);
    if (!r.ok) throw new Error(r.error);
    expect(r.value.data.contratosSincronizados).toContain("CONTR-B01");
    expect(r.value.suma).toBe(base.contratos[2].total);
    expect(r.value.data.matrizSemanal).toHaveLength(5);
  });
});

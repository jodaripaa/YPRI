import { describe, expect, it } from "vitest";
import { crearEstadoInicial } from "../../seed";
import { BARRIOS, barrioMasCercano } from "../../zonas";
import { calcularCercania, candidatosPedidoInmediato, posicionActual } from "../cercania";
import { crearContrato } from "../contracts";

const barrio = (nombre: string) => BARRIOS.Cucuta.find((b) => b.nombre === nombre)!.coordenadas;
const HOY = "2026-11-11";

describe("posición actual del operario", () => {
  const data = crearEstadoInicial();
  const carlos = data.servicios.find((s) => s.codigo === "SERV-01")!;
  const marta = data.servicios.find((s) => s.codigo === "SERV-02")!;

  it("si está atendiendo un servicio, su referencia es ese lugar", () => {
    // Carlos tiene el contrato CONTR-103 "En proceso" en La Playa.
    const posicion = posicionActual(carlos, data.contratos);
    expect(posicion).toMatchObject({ enServicio: true, contratoId: "CONTR-103", zonaReferencia: "La Playa" });
    expect(posicion.coordenadas).toEqual(barrio("La Playa"));
  });

  it("si está libre, su referencia es su barrio base", () => {
    expect(posicionActual(marta, data.contratos)).toMatchObject({ enServicio: false, zonaReferencia: "La Libertad", coordenadas: marta.ubicacion });
    expect(posicionActual(carlos, []).enServicio).toBe(false);
  });

  it("la distancia se mide desde donde está, la cobertura desde su base", () => {
    const desdeLaPlaya = calcularCercania(carlos, barrio("La Playa"), data.contratos);
    expect(desdeLaPlaya.distanciaKm).toBeCloseTo(0, 6);
    expect(desdeLaPlaya.enCobertura).toBe(true);
    expect(calcularCercania(carlos, barrio("La Playa")).distanciaKm).toBeGreaterThan(1);
  });

  it("describe el barrio más cercano a cualquier punto", () => {
    expect(barrioMasCercano("Cucuta", { lat: 7.8937, lng: -72.4993 }).nombre).toBe("La Playa");
  });
});

describe("pedido inmediato", () => {
  const data = crearEstadoInicial();

  it("asigna al operario libre que llega antes y deja a los ocupados como alternativa", () => {
    const electricistas = candidatosPedidoInmediato(data.servicios, data.contratos, barrio("Caobos"), "Electricidad");
    // El único electricista (Carlos) está atendiendo otro servicio.
    expect(electricistas.asignado).toBeNull();
    expect(electricistas.ocupados.map((c) => c.servicio.codigo)).toEqual(["SERV-01"]);

    const cerrajeros = candidatosPedidoInmediato(data.servicios, data.contratos, barrio("Centro"), "Cerrajeria");
    expect(cerrajeros.asignado?.servicio.codigo).toBe("SERV-04");
    expect(cerrajeros.libres.every((c) => !c.posicion.enServicio)).toBe(true);
  });

  it("no asigna operarios pausados ni fuera de su zona", () => {
    expect(candidatosPedidoInmediato(data.servicios, data.contratos, barrio("Prados del Este"), "Climatizacion").asignado).toBeNull();
    expect(candidatosPedidoInmediato(data.servicios, data.contratos, { lat: 6.2518, lng: -75.5636 }, "Limpieza").asignado).toBeNull();
  });

  it("un pedido inmediato se guarda como urgente y solo puede ser para hoy", () => {
    const juan = data.usuarios.find((u) => u.id === "USR-001")!;
    const solicitud = { servicioCodigo: "SERV-04", horas: 1, direccion: "Calle 10 # 5-20", ubicacion: barrio("Centro"), urgente: true };
    const hoy = crearContrato(data, juan, { ...solicitud, fecha: HOY }, HOY);
    expect(hoy.ok && hoy.value.contrato.urgente).toBe(true);
    expect(crearContrato(data, juan, { ...solicitud, fecha: "2026-11-20" }, HOY).ok).toBe(false);
    const normal = crearContrato(data, juan, { ...solicitud, urgente: false, fecha: "2026-11-20" }, HOY);
    expect(normal.ok && normal.value.contrato.urgente).toBeUndefined();
  });
});

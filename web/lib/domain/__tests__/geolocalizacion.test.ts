import { describe, expect, it } from "vitest";
import { desplazar, distanciaKm, formatearDistancia, formatearTiempo, interpolar, sonCoordenadasValidas, tiempoLlegadaMin } from "../../geo";
import { crearEstadoInicial } from "../../seed";
import { BARRIOS, CENTRO_CIUDAD } from "../../zonas";
import { calcularCercania, profesionalMasCercano, serviciosCercanos, simularSeguimiento } from "../cercania";
import { crearContrato } from "../contracts";
import { publicarServicio } from "../services";

const centroCucuta = CENTRO_CIUDAD.Cucuta;
const barrio = (nombre: string) => BARRIOS.Cucuta.find((b) => b.nombre === nombre)!.coordenadas;

describe("fórmulas de georreferenciación", () => {
  it("la distancia de un punto a sí mismo es cero y es simétrica", () => {
    expect(distanciaKm(centroCucuta, centroCucuta)).toBe(0);
    const a = barrio("Caobos");
    const b = barrio("Atalaya");
    expect(distanciaKm(a, b)).toBeCloseTo(distanciaKm(b, a), 10);
  });

  it("calcula distancias reales conocidas con la fórmula de Haversine", () => {
    // Un grado de latitud mide unos 111,2 km.
    expect(distanciaKm({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeCloseTo(111.19, 1);
    // Cúcuta – Bogotá en línea recta: unos 400 km.
    expect(distanciaKm(CENTRO_CIUDAD.Cucuta, CENTRO_CIUDAD.Bogota)).toBeGreaterThan(380);
    expect(distanciaKm(CENTRO_CIUDAD.Cucuta, CENTRO_CIUDAD.Bogota)).toBeLessThan(420);
  });

  it("desplazar y medir son operaciones inversas", () => {
    const punto = desplazar(centroCucuta, 3, 90);
    expect(distanciaKm(centroCucuta, punto)).toBeCloseTo(3, 6);
  });

  it("estima el tiempo de llegada con alistamiento y factor de ruta", () => {
    expect(tiempoLlegadaMin(centroCucuta, centroCucuta)).toBe(5);
    // 6 km rectos -> 7,8 km por calles a 24 km/h = 19,5 min + 5 de alistamiento.
    expect(tiempoLlegadaMin(centroCucuta, desplazar(centroCucuta, 6, 0))).toBe(25);
  });

  it("interpola el trayecto y limita el progreso entre 0 y 1", () => {
    const a = { lat: 0, lng: 0 };
    const b = { lat: 2, lng: 4 };
    expect(interpolar(a, b, 0.5)).toEqual({ lat: 1, lng: 2 });
    expect(interpolar(a, b, 3)).toEqual(b);
    expect(interpolar(a, b, -1)).toEqual(a);
  });

  it("valida coordenadas y formatea distancias y tiempos", () => {
    expect(sonCoordenadasValidas({ lat: 7.9, lng: -72.5 })).toBe(true);
    expect(sonCoordenadasValidas({ lat: 95, lng: 0 })).toBe(false);
    expect(sonCoordenadasValidas({ lat: Number.NaN, lng: 0 })).toBe(false);
    expect(formatearDistancia(0.42)).toBe("400 m");
    expect(formatearDistancia(2.345)).toBe("2,3 km");
    expect(formatearTiempo(45)).toBe("45 min");
    expect(formatearTiempo(75)).toBe("1 h 15 min");
  });
});

describe("profesionales cercanos", () => {
  const data = crearEstadoInicial();

  it("ordena por distancia y excluye a quien no cubre la ubicación", () => {
    const desdeCaobos = serviciosCercanos(data.servicios, barrio("Caobos"));
    expect(desdeCaobos[0].servicio.codigo).toBe("SERV-01");
    expect(desdeCaobos.every((c, i, lista) => i === 0 || lista[i - 1].distanciaKm <= c.distanciaKm)).toBe(true);
    // Diana atiende en Bogotá: nunca aparece cerca de Cúcuta.
    expect(desdeCaobos.some((c) => c.servicio.codigo === "SERV-06")).toBe(false);
  });

  it("respeta el radio de atención de cada profesional", () => {
    const sandra = data.servicios.find((s) => s.codigo === "SERV-05")!;
    expect(calcularCercania(sandra, barrio("Atalaya")).enCobertura).toBe(true);
    const lejos = desplazar(sandra.ubicacion, sandra.radio_km + 1, 0);
    expect(calcularCercania(sandra, lejos).enCobertura).toBe(false);
    expect(serviciosCercanos(data.servicios, lejos).some((c) => c.servicio.codigo === "SERV-05")).toBe(false);
    expect(serviciosCercanos(data.servicios, lejos, { soloEnCobertura: false }).some((c) => c.servicio.codigo === "SERV-05")).toBe(true);
  });

  it("filtra por categoría, disponibilidad y distancia máxima", () => {
    const origen = barrio("Centro");
    expect(serviciosCercanos(data.servicios, origen, { categoria: "Limpieza" }).map((c) => c.servicio.codigo)).toEqual(["SERV-05"]);
    expect(serviciosCercanos(data.servicios, origen, { soloDisponibles: true }).some((c) => c.servicio.codigo === "SERV-03")).toBe(false);
    expect(serviciosCercanos(data.servicios, origen, { radioMaxKm: 1 }).map((c) => c.servicio.codigo)).toEqual(["SERV-04"]);
  });

  it("encuentra al profesional disponible más cercano", () => {
    expect(profesionalMasCercano(data.servicios, barrio("Prados del Este"))?.servicio.codigo).toBe("SERV-01");
    expect(profesionalMasCercano(data.servicios, barrio("Prados del Este"), "Climatizacion")).toBeNull();
    expect(profesionalMasCercano(data.servicios, CENTRO_CIUDAD.Medellin)).toBeNull();
  });
});

describe("seguimiento simulado del profesional", () => {
  const origen = barrio("Caobos");
  const destino = barrio("Centro");

  it("avanza del origen al destino y descuenta el tiempo", () => {
    const inicio = simularSeguimiento(origen, destino, 0, 60);
    expect(inicio.posicion).toEqual(origen);
    expect(inicio.llego).toBe(false);
    const mitad = simularSeguimiento(origen, destino, 30, 60);
    expect(mitad.progreso).toBe(0.5);
    expect(mitad.minutosRestantes).toBeLessThan(inicio.minutosRestantes);
    const fin = simularSeguimiento(origen, destino, 90, 60);
    expect(fin.llego).toBe(true);
    expect(fin.minutosRestantes).toBe(0);
    expect(fin.distanciaRestanteKm).toBeCloseTo(0, 6);
  });
});

describe("ubicación en servicios y contratos", () => {
  const data = crearEstadoInicial();
  const carlos = data.usuarios.find((u) => u.id === "USR-002")!;
  const juan = data.usuarios.find((u) => u.id === "USR-001")!;
  const base = { categoria: "Plomeria" as const, ciudad: "Cucuta" as const, tarifaHora: 30000, descripcion: "Arreglo de fugas y tuberías", aniosExperiencia: 3 };

  it("un servicio nuevo toma el barrio y el radio elegidos", () => {
    const r = publicarServicio(data, carlos, { ...base, zona: "San Luis", radioKm: 5 });
    expect(r.ok && r.value.servicio).toMatchObject({ zona: "San Luis", radio_km: 5, ubicacion: barrio("San Luis") });
    const sinZona = publicarServicio(data, carlos, base);
    expect(sinZona.ok && sinZona.value.servicio.zona).toBe("Centro");
    expect(publicarServicio(data, carlos, { ...base, zona: "Chapinero" }).ok).toBe(false);
    expect(publicarServicio(data, carlos, { ...base, radioKm: 80 }).ok).toBe(false);
  });

  it("el contrato guarda la ubicación del servicio y rechaza coordenadas inválidas", () => {
    const solicitud = { servicioCodigo: "SERV-02", horas: 2, fecha: "2026-12-01", direccion: "Calle 5 # 3-10" };
    const r = crearContrato(data, juan, { ...solicitud, ubicacion: barrio("La Playa") }, "2026-11-11");
    expect(r.ok && r.value.contrato.ubicacion).toEqual(barrio("La Playa"));
    expect(crearContrato(data, juan, { ...solicitud, ubicacion: { lat: 200, lng: 0 } }, "2026-11-11").ok).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { USUARIOS_INICIALES } from "../../seed";
import type { Usuario } from "../../types";
import { puedeVerVista, vistaInicial, vistasPermitidas } from "../navigation";
import { tienePermiso } from "../permissions";

const porRol = (rol: Usuario["rol"]) => USUARIOS_INICIALES.find((u) => u.rol === rol)!;
const cliente = porRol("cliente");
const prestador = porRol("prestador");
const admin = porRol("admin");

describe("control de acceso por rol", () => {
  it("el cliente no ve facturación, métricas ni usuarios", () => {
    for (const vista of ["facturacion", "resumen", "usuarios", "contratos", "subalgoritmos", "ganancias"] as const) {
      expect(puedeVerVista(cliente, vista)).toBe(false);
    }
    expect(vistasPermitidas(cliente).map((v) => v.id)).toEqual(["explorar", "mis-solicitudes"]);
  });

  it("el profesional solo ve su operación", () => {
    expect(vistasPermitidas(prestador).map((v) => v.id)).toEqual(["solicitudes", "mis-servicios", "ganancias"]);
    expect(tienePermiso(prestador, "facturacion:ver")).toBe(false);
    expect(tienePermiso(prestador, "contrato:solicitar")).toBe(false);
  });

  it("el administrador no contrata servicios pero sí ve la facturación", () => {
    expect(tienePermiso(admin, "contrato:solicitar")).toBe(false);
    expect(puedeVerVista(admin, "facturacion")).toBe(true);
    expect(vistaInicial(admin)).toBe("resumen");
  });

  it("un usuario suspendido o sin sesión no tiene permisos", () => {
    expect(vistasPermitidas({ ...admin, activo: false })).toEqual([]);
    expect(vistaInicial(null)).toBeNull();
  });
});

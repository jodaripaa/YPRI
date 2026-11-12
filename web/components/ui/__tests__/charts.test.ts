import { describe, expect, it } from "vitest";
import { techoLimpio } from "../charts";

describe("techoLimpio", () => {
  it("redondea hacia arriba a valores limpios para el eje", () => {
    expect(techoLimpio(2_520_000)).toBe(3_000_000);
    expect(techoLimpio(3_200_000)).toBe(4_000_000);
    expect(techoLimpio(180_000)).toBe(200_000);
    expect(techoLimpio(1_000)).toBe(1_000);
    expect(techoLimpio(0)).toBe(1);
  });
});

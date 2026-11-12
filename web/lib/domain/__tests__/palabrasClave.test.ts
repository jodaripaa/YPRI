import { describe, expect, it } from "vitest";
import { detectarCategorias, distanciaEdicion, interpretarNecesidad, normalizar, pareceUrgente } from "../../palabrasClave";
import { crearEstadoInicial } from "../../seed";
import { filtrarCatalogo } from "../services";

const categoriaDe = (texto: string) => interpretarNecesidad(texto)?.categoria ?? null;

describe("catálogo de palabras clave", () => {
  it("normaliza tildes, eñes, mayúsculas y signos", () => {
    expect(normalizar("¡Se fue la LUZ en el baño!")).toBe("se fue la luz en el bano");
  });

  it("reconoce el oficio con frases de la vida diaria", () => {
    expect(categoriaDe("se me quedaron las llaves por dentro")).toBe("Cerrajeria");
    expect(categoriaDe("me quedé por fuera de la casa")).toBe("Cerrajeria");
    expect(categoriaDe("se fue la luz en la cocina")).toBe("Electricidad");
    expect(categoriaDe("necesito un plomero")).toBe("Plomeria");
    expect(categoriaDe("hay una fuga en el baño")).toBe("Plomeria");
    expect(categoriaDe("el aire acondicionado no enfría")).toBe("Climatizacion");
    expect(categoriaDe("señora del aseo para el sábado")).toBe("Limpieza");
  });

  it("una frase exacta gana sobre una palabra suelta", () => {
    expect(categoriaDe("se daño la llave de agua")).toBe("Plomeria");
    expect(categoriaDe("perdí la llave de la casa")).toBe("Cerrajeria");
  });

  it("tolera errores de escritura y palabras incompletas", () => {
    expect(distanciaEdicion("electrisista", "electricista")).toBe(1);
    expect(categoriaDe("electrisista")).toBe("Electricidad");
    expect(categoriaDe("cerrajer")).toBe("Cerrajeria");
    expect(categoriaDe("plomer")).toBe("Plomeria");
  });

  it("no inventa categorías para textos sin relación", () => {
    expect(interpretarNecesidad("hola")).toBeNull();
    expect(detectarCategorias("")).toEqual([]);
  });

  it("detecta cuando se necesita a alguien de inmediato", () => {
    expect(pareceUrgente("urgente, me quedé por fuera")).toBe(true);
    expect(pareceUrgente("lo necesito ya")).toBe(true);
    expect(pareceUrgente("limpieza para el próximo mes")).toBe(false);
  });

  it("la búsqueda del catálogo entiende sinónimos", () => {
    const data = crearEstadoInicial();
    const base = { categoria: "todas" as const, ciudad: "todas" as const, soloDisponibles: false, orden: "relevancia" as const };
    expect(filtrarCatalogo(data.servicios, { ...base, texto: "llaves adentro" }).map((s) => s.codigo)).toEqual(["SERV-04"]);
    expect(filtrarCatalogo(data.servicios, { ...base, texto: "electrisista" }).map((s) => s.codigo)).toEqual(["SERV-01"]);
    expect(filtrarCatalogo(data.servicios, { ...base, texto: "Gomez" }).map((s) => s.codigo)).toEqual(["SERV-01"]);
  });
});

describe("oficio de belleza", () => {
  it("reconoce barbero, peluquero y servicios de belleza", () => {
    expect(categoriaDe("necesito un barbero")).toBe("Belleza");
    expect(categoriaDe("peluquera a domicilio")).toBe("Belleza");
    expect(categoriaDe("me quiero motilar")).toBe("Belleza");
    expect(categoriaDe("corte de cabello para niño")).toBe("Belleza");
    expect(categoriaDe("manicure y pedicure")).toBe("Belleza");
    expect(categoriaDe("arreglo de uñas")).toBe("Belleza");
  });

  it("no confunde frases parecidas de otros oficios", () => {
    expect(categoriaDe("hubo un corte de luz")).toBe("Electricidad");
    expect(categoriaDe("unas tuberías con fuga")).toBe("Plomeria");
  });

  it("la búsqueda encuentra a la profesional de belleza", () => {
    const data = crearEstadoInicial();
    const base = { categoria: "todas" as const, ciudad: "todas" as const, soloDisponibles: false, orden: "relevancia" as const };
    expect(filtrarCatalogo(data.servicios, { ...base, texto: "peluquero" }).map((s) => s.codigo)).toEqual(["SERV-07"]);
  });
});

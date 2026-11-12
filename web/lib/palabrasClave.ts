// Catálogo de palabras clave por oficio: permite buscar como habla la gente
// ("se me quedaron las llaves adentro", "se fue la luz", "plomero") y encontrar
// la categoría correcta, con tolerancia a tildes y errores de escritura.
// El mismo catálogo existe en backend/modules/palabras_clave.py.

import type { CategoriaServicio } from "./constants";

/** Palabras y frases por categoría (en minúsculas y sin tildes). */
export const PALABRAS_CLAVE: Record<CategoriaServicio, readonly string[]> = {
  Electricidad: [
    "electricista", "electrico", "electrica", "electricidad", "luz", "sin luz", "se fue la luz", "no hay luz", "apagon",
    "corto", "cortocircuito", "chispa", "chisporrotea", "toma", "tomacorriente", "enchufe", "interruptor", "suiche",
    "breaker", "taco", "se bajo el taco", "tablero", "bombillo", "foco", "lampara", "cableado", "cable", "cables",
    "instalacion electrica", "voltaje", "contador de luz", "medidor", "ducha electrica", "timbre", "reflector", "planta electrica",
  ],
  Plomeria: [
    "plomero", "plomeria", "fontanero", "fontaneria", "fuga", "fuga de agua", "gotera", "goteo", "gotea", "escape de agua",
    "tuberia", "tubo", "tubos", "grifo", "llave de agua", "llave del lavaplatos", "llave de la ducha", "lavamanos", "lavaplatos",
    "sanitario", "inodoro", "taza del bano", "tanque", "ducha", "regadera", "desague", "destapar", "tapado", "tapada",
    "atascado", "caneria", "alcantarilla", "calentador", "humedad", "bomba de agua", "se inundo", "inundacion",
  ],
  Limpieza: [
    "limpieza", "aseo", "asear", "limpiar", "empleada", "empleada domestica", "senora del aseo", "servicio domestico",
    "domestica", "barrer", "trapear", "desinfeccion", "desinfectar", "lavar", "planchar", "limpieza profunda", "mudanza",
    "post obra", "despues de obra", "vidrios", "ventanas", "alfombra", "tapete", "muebles", "sofa", "colchon", "cocina",
    "oficina", "polvo", "organizar",
  ],
  Climatizacion: [
    "aire", "aire acondicionado", "aires", "acondicionado", "minisplit", "mini split", "split", "no enfria", "no prende el aire",
    "calor", "refrigeracion", "ventilador", "climatizacion", "tecnico de aires", "recarga de gas", "gas refrigerante",
    "mantenimiento de aire", "condensador", "evaporador", "nevera", "refrigerador", "congelador", "gotea el aire",
  ],
  Cerrajeria: [
    "cerrajero", "cerrajeria", "llave", "llaves", "llaves adentro", "llaves por dentro", "deje las llaves", "perdi las llaves",
    "me quede por fuera", "quede por fuera", "quede afuera", "me quede afuera", "encerrado", "encerrada", "puerta",
    "no abre la puerta", "chapa", "cerradura", "candado", "guarda", "cambio de guarda", "copia de llave", "duplicado",
    "caja fuerte", "no abre", "forzar", "pasador", "cerrojo", "seguridad",
  ],
};

/** Palabras que indican que el cliente necesita a alguien ya. */
export const PALABRAS_URGENCIA = [
  "urgente", "urgencia", "ya", "ahora", "ahorita", "inmediato", "inmediata", "emergencia", "rapido", "auxilio", "ayuda",
  "lo antes posible", "cuanto antes", "encerrado", "encerrada", "me quede por fuera", "quede por fuera", "se inundo", "inundacion",
  "cortocircuito", "chispa", "sin luz",
] as const;

/** Sugerencias de un toque para la búsqueda rápida. */
export const NECESIDADES_FRECUENTES: readonly { texto: string; categoria: CategoriaServicio; urgente: boolean }[] = [
  { texto: "Me quedé por fuera", categoria: "Cerrajeria", urgente: true },
  { texto: "Se fue la luz", categoria: "Electricidad", urgente: true },
  { texto: "Fuga de agua", categoria: "Plomeria", urgente: true },
  { texto: "El aire no enfría", categoria: "Climatizacion", urgente: false },
  { texto: "Limpieza profunda", categoria: "Limpieza", urgente: false },
  { texto: "Destapar el baño", categoria: "Plomeria", urgente: false },
];

/** Minúsculas, sin tildes ni signos, espacios simples. */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Distancia de edición (cuántas letras hay que cambiar para pasar de una palabra a otra). */
export function distanciaEdicion(a: string, b: string): number {
  if (a === b) return 0;
  const fila = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let anterior = fila[0];
    fila[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temporal = fila[j];
      fila[j] = Math.min(fila[j] + 1, fila[j - 1] + 1, anterior + (a[i - 1] === b[j - 1] ? 0 : 1));
      anterior = temporal;
    }
  }
  return fila[b.length];
}

/** Dos palabras se parecen si una empieza por la otra o difieren en pocas letras. */
function palabrasParecidas(escrita: string, clave: string): boolean {
  if (escrita.length < 4 || clave.length < 4) return false;
  if (clave.startsWith(escrita) || escrita.startsWith(clave)) return true;
  const tolerancia = clave.length >= 8 ? 2 : clave.length >= 5 ? 1 : 0;
  return tolerancia > 0 && Math.abs(escrita.length - clave.length) <= tolerancia && distanciaEdicion(escrita, clave) <= tolerancia;
}

export interface CategoriaDetectada {
  categoria: CategoriaServicio;
  /** Mayor es mejor: las frases largas exactas pesan más que una palabra parecida. */
  puntaje: number;
  /** Palabra o frase del catálogo que coincidió (para explicar la sugerencia). */
  coincidencia: string;
}

/**
 * Categorías que corresponden a lo que escribió el cliente, de la más probable
 * a la menos probable. Una frase exacta ("llave de agua") gana sobre una palabra
 * suelta ("llave"), así se distinguen plomería y cerrajería.
 */
export function detectarCategorias(texto: string): CategoriaDetectada[] {
  const limpio = normalizar(texto);
  if (!limpio) return [];
  const conEspacios = ` ${limpio} `;
  const palabras = limpio.split(" ");
  const resultados: CategoriaDetectada[] = [];

  for (const [categoria, claves] of Object.entries(PALABRAS_CLAVE) as [CategoriaServicio, readonly string[]][]) {
    let puntaje = 0;
    let mejor = { clave: "", peso: 0 };
    for (const clave of claves) {
      const nPalabras = clave.split(" ").length;
      let peso = 0;
      if (conEspacios.includes(` ${clave} `)) peso = nPalabras * 3;
      else if (nPalabras === 1 && palabras.some((p) => palabrasParecidas(p, clave))) peso = 1;
      puntaje += peso;
      if (peso > mejor.peso) mejor = { clave, peso };
    }
    if (puntaje > 0) resultados.push({ categoria, puntaje, coincidencia: mejor.clave });
  }
  return resultados.sort((a, b) => b.puntaje - a.puntaje);
}

/** La categoría más probable, o null si el texto no se parece a ningún oficio. */
export function interpretarNecesidad(texto: string): CategoriaDetectada | null {
  return detectarCategorias(texto)[0] ?? null;
}

/** El texto sugiere una emergencia o que se necesita a alguien de inmediato. */
export function pareceUrgente(texto: string): boolean {
  const conEspacios = ` ${normalizar(texto)} `;
  return PALABRAS_URGENCIA.some((p) => conEspacios.includes(` ${p} `));
}

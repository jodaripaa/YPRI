// Operaciones sobre matrices bidimensionales (Guía 9).

export function calcularTotalFilas(matriz: readonly number[][]): number[] {
  return matriz.map((fila) => fila.reduce((acumulado, valor) => acumulado + valor, 0));
}

export function calcularTotalColumnas(matriz: readonly number[][]): number[] {
  if (!matriz.length || !matriz[0].length) return [];
  return matriz[0].map((_, columna) => matriz.reduce((acumulado, fila) => acumulado + fila[columna], 0));
}

export function calcularTotalGeneral(matriz: readonly number[][]): number {
  return calcularTotalFilas(matriz).reduce((acumulado, valor) => acumulado + valor, 0);
}

export function calcularPromedioGeneral(matriz: readonly number[][]): number {
  if (!matriz.length || !matriz[0].length) return 0;
  return calcularTotalGeneral(matriz) / (matriz.length * matriz[0].length);
}

export function crearMatrizNula(filas: number, columnas: number): number[][] {
  return Array.from({ length: filas }, () => Array<number>(columnas).fill(0));
}

export function crearMatrizIdentidad(n: number): number[][] {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
}

export function obtenerDiagonal(matriz: readonly number[][]): number[] {
  return matriz.slice(0, Math.min(matriz.length, matriz[0]?.length ?? 0)).map((fila, i) => fila[i]);
}

/** Devuelve una copia de la matriz con la celda indicada actualizada (inmutable). */
export function actualizarCelda(matriz: readonly number[][], fila: number, columna: number, valor: number): number[][] {
  return matriz.map((f, i) => (i === fila ? f.map((c, j) => (j === columna ? valor : c)) : [...f]));
}

const indiceDelMayor = (valores: readonly number[]): number => valores.indexOf(Math.max(...valores));

export interface AnalisisMatriz {
  totalGeneral: number;
  promedio: number;
  totalesFila: number[];
  totalesColumna: number[];
  filaLider: number;
  columnaLider: number;
}

export function analizarMatriz(matriz: readonly number[][]): AnalisisMatriz {
  const totalesFila = calcularTotalFilas(matriz);
  const totalesColumna = calcularTotalColumnas(matriz);
  return {
    totalGeneral: calcularTotalGeneral(matriz),
    promedio: calcularPromedioGeneral(matriz),
    totalesFila,
    totalesColumna,
    filaLider: indiceDelMayor(totalesFila),
    columnaLider: indiceDelMayor(totalesColumna),
  };
}

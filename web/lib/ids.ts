/**
 * Genera el siguiente identificador secuencial a partir del mayor sufijo
 * numérico existente. A diferencia de usar `lista.length + 1`, no colisiona
 * cuando se eliminan o reordenan elementos.
 */
export function siguienteId(prefijo: string, existentes: readonly string[], digitos = 3): string {
  const maximo = existentes.reduce((mayor, id) => {
    if (!id.startsWith(`${prefijo}-`)) return mayor;
    const numero = Number.parseInt(id.slice(prefijo.length + 1), 10);
    return Number.isNaN(numero) ? mayor : Math.max(mayor, numero);
  }, 0);
  return `${prefijo}-${String(maximo + 1).padStart(digitos, "0")}`;
}

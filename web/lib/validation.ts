const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PATRON_CELULAR_CO = /^3\d{9}$/;

export function esCorreoValido(correo: string): boolean {
  return PATRON_CORREO.test(correo.trim());
}

export function esCelularValido(telefono: string): boolean {
  return PATRON_CELULAR_CO.test(telefono.replace(/\s+/g, ""));
}

export function normalizarCorreo(correo: string): string {
  return correo.trim().toLowerCase();
}

export function esEnteroEnRango(valor: number, minimo: number, maximo: number): boolean {
  return Number.isInteger(valor) && valor >= minimo && valor <= maximo;
}

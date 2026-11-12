const formatoMoneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formatoFecha = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatearMoneda(valor: number): string {
  return formatoMoneda.format(valor);
}

/** Convierte una fecha ISO (AAAA-MM-DD) en texto legible sin desfase de zona horaria. */
export function formatearFecha(iso: string): string {
  const fecha = fechaDesdeIso(iso);
  return fecha ? formatoFecha.format(fecha) : iso;
}

export function fechaDesdeIso(iso: string): Date | null {
  const [anio, mes, dia] = iso.split("-").map(Number);
  if (!anio || !mes || !dia) return null;
  return new Date(anio, mes - 1, dia, 12);
}

export function fechaIsoHoy(hoy: Date = new Date()): string {
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

export function formatearCalificacion(valor: number): string {
  return valor.toFixed(1);
}

export function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");
}

export function pluralizar(cantidad: number, singular: string, plural: string): string {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}

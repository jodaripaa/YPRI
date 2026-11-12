// Cómo se muestra un operario en mapas y tarjetas según dónde está ahora.

import type { MarcadorMapa } from "@/components/mapa/Mapa";
import { CATEGORIA_LABEL } from "@/lib/constants";
import type { ServicioCercano } from "@/lib/domain/cercania";
import { iniciales } from "@/lib/format";
import { formatearDistancia } from "@/lib/geo";
import type { Cercania } from "./componentes";

/** Texto corto de dónde está el operario: "cerca de Caobos" o "atendiendo cerca de La Playa". */
export function dondeEsta(c: ServicioCercano): string {
  return c.posicion.enServicio ? `atendiendo un servicio cerca de ${c.posicion.zonaReferencia}` : `cerca de ${c.posicion.zonaReferencia}`;
}

/** Marcador del operario en su posición actual (ámbar si está ocupado). */
export function marcadorOperario(c: ServicioCercano, extra: Partial<MarcadorMapa> = {}): MarcadorMapa {
  const { servicio, posicion, distanciaKm } = c;
  return {
    id: servicio.codigo,
    coordenadas: posicion.coordenadas,
    tipo: !servicio.disponible ? "inactivo" : posicion.enServicio ? "ocupado" : "profesional",
    etiqueta: `${servicio.prestador_nombre} · ${CATEGORIA_LABEL[servicio.categoria]} · ${dondeEsta(c)} · a ${formatearDistancia(distanciaKm)}`,
    texto: iniciales(servicio.prestador_nombre),
    ...extra,
  };
}

/** Datos de cercanía que muestran las tarjetas. */
export function cercaniaTarjeta(c: ServicioCercano): Cercania {
  return {
    distanciaKm: c.distanciaKm,
    minutos: c.minutos,
    enCobertura: c.enCobertura,
    enServicio: c.posicion.enServicio,
    zonaReferencia: c.posicion.zonaReferencia,
  };
}

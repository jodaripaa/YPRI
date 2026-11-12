import type { Coordenadas } from "@/lib/geo";

/** cliente: tu ubicación · profesional: disponible · inactivo: no disponible · movil: profesional en camino */
export type TipoMarcador = "cliente" | "profesional" | "inactivo" | "movil";

export interface MarcadorMapa {
  id: string;
  coordenadas: Coordenadas;
  tipo: TipoMarcador;
  /** Texto accesible y del globo al pasar el cursor. */
  etiqueta: string;
  /** Texto corto dentro del marcador (iniciales). */
  texto?: string;
  seleccionado?: boolean;
  onClic?: () => void;
}

export interface CirculoMapa {
  id: string;
  centro: Coordenadas;
  radioKm: number;
}

export interface PropsMapa {
  centro: Coordenadas;
  zoom?: number;
  marcadores: MarcadorMapa[];
  circulos?: CirculoMapa[];
  /** Línea entre dos o más puntos (por ejemplo, profesional → cliente). */
  ruta?: Coordenadas[];
  /** Ajusta la vista para mostrar todos los marcadores. */
  ajustar?: boolean;
  /** Punto que la cámara sigue mientras se mueve. */
  seguir?: Coordenadas;
  onClicMapa?: (coordenadas: Coordenadas) => void;
  /** Descripción del mapa para lectores de pantalla. */
  etiqueta: string;
  alto?: number;
}

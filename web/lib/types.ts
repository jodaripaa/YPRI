import type { CategoriaServicio, CiudadCobertura, EstadoContrato, RolUsuario } from "./constants";
import type { Coordenadas } from "./geo";

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  contrasena: string;
  rol: RolUsuario;
  ciudad: CiudadCobertura;
  telefono: string;
  activo: boolean;
}

export interface Servicio {
  codigo: string;
  prestador_id: string;
  prestador_nombre: string;
  categoria: CategoriaServicio;
  descripcion: string;
  tarifa_hora: number;
  ciudad: CiudadCobertura;
  disponible: boolean;
  calificacion: number;
  /** Trabajos completados a través de la plataforma. */
  num_contratos: number;
  /** Cantidad de reseñas que componen la calificación promedio. */
  num_resenas: number;
  anios_experiencia: number;
  /** Barrio desde donde sale el profesional (punto base de su zona de trabajo). */
  zona: string;
  ubicacion: Coordenadas;
  /** Distancia máxima, en km, a la que el profesional acepta trabajos. */
  radio_km: number;
}

export interface Contrato {
  id: string;
  cliente_id: string;
  cliente_nombre: string;
  prestador_id: string;
  prestador_nombre: string;
  servicio_codigo: string;
  servicio_nombre: string;
  horas: number;
  tarifa_hora: number;
  subtotal: number;
  iva: number;
  total: number;
  estado: EstadoContrato;
  /** Fecha programada del servicio en formato ISO (AAAA-MM-DD). */
  fecha: string;
  direccion: string;
  nota?: string;
  /** Punto exacto donde se presta el servicio (si el cliente lo compartió). */
  ubicacion?: Coordenadas;
  calificacion?: number;
  comentario?: string;
}

export type TipoMatriz = "semanal" | "ciudades";

export interface AppData {
  usuarios: Usuario[];
  servicios: Servicio[];
  contratos: Contrato[];
  matrizSemanal: number[][];
  matrizCiudades: number[][];
  /** Contratos ya sumados a la matriz semanal (evita la doble contabilización). */
  contratosSincronizados: string[];
  sesionUsuarioId: string | null;
}

export interface ProductoInventario {
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

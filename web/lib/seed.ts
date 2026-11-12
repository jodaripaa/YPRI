// Datos iniciales de demostración. Cada servicio pertenece a su propio
// profesional (antes todos apuntaban al mismo usuario con nombres distintos).

import { CATEGORIA_LABEL } from "./constants";
import { calcularLiquidacionContrato } from "./finance";
import type { AppData, Contrato, Servicio, Usuario } from "./types";

export const USUARIOS_INICIALES: Usuario[] = [
  { id: "USR-001", nombre: "Juan Perez", correo: "juan.perez@email.com", contrasena: "juan123", rol: "cliente", ciudad: "Cucuta", telefono: "3001234567", activo: true },
  { id: "USR-002", nombre: "Carlos Gomez", correo: "carlos.gomez@email.com", contrasena: "carlos456", rol: "prestador", ciudad: "Cucuta", telefono: "3109876543", activo: true },
  { id: "USR-003", nombre: "Admin YPRI", correo: "admin@ypri.com", contrasena: "admin2026", rol: "admin", ciudad: "Cucuta", telefono: "3200000000", activo: true },
  { id: "USR-004", nombre: "Marta Rodriguez", correo: "marta.rodriguez@email.com", contrasena: "marta123", rol: "prestador", ciudad: "Cucuta", telefono: "3114567890", activo: true },
  { id: "USR-005", nombre: "Andres Silva", correo: "andres.silva@email.com", contrasena: "andres123", rol: "prestador", ciudad: "Cucuta", telefono: "3125678901", activo: true },
  { id: "USR-006", nombre: "Jorge Mendoza", correo: "jorge.mendoza@email.com", contrasena: "jorge123", rol: "prestador", ciudad: "Cucuta", telefono: "3136789012", activo: true },
  { id: "USR-007", nombre: "Sandra Rios", correo: "sandra.rios@email.com", contrasena: "sandra123", rol: "prestador", ciudad: "Cucuta", telefono: "3147890123", activo: true },
  { id: "USR-008", nombre: "Laura Martinez", correo: "laura.martinez@email.com", contrasena: "laura123", rol: "cliente", ciudad: "Cucuta", telefono: "3158901234", activo: true },
  { id: "USR-009", nombre: "Diana Torres", correo: "diana.torres@email.com", contrasena: "diana123", rol: "prestador", ciudad: "Bogota", telefono: "3169012345", activo: true },
];

export const SERVICIOS_INICIALES: Servicio[] = [
  { codigo: "SERV-01", prestador_id: "USR-002", prestador_nombre: "Carlos Gomez", categoria: "Electricidad", descripcion: "Instalaciones eléctricas residenciales y comerciales, tableros y tomas.", tarifa_hora: 35000, ciudad: "Cucuta", disponible: true, calificacion: 4.8, num_contratos: 12, num_resenas: 10, anios_experiencia: 8 },
  { codigo: "SERV-02", prestador_id: "USR-004", prestador_nombre: "Marta Rodriguez", categoria: "Plomeria", descripcion: "Reparación de tuberías, grifos, sanitarios y sistemas hidráulicos.", tarifa_hora: 30000, ciudad: "Cucuta", disponible: true, calificacion: 4.5, num_contratos: 8, num_resenas: 7, anios_experiencia: 5 },
  { codigo: "SERV-03", prestador_id: "USR-005", prestador_nombre: "Andres Silva", categoria: "Climatizacion", descripcion: "Mantenimiento, instalación y reparación de aires acondicionados.", tarifa_hora: 45000, ciudad: "Cucuta", disponible: false, calificacion: 5.0, num_contratos: 5, num_resenas: 5, anios_experiencia: 10 },
  { codigo: "SERV-04", prestador_id: "USR-006", prestador_nombre: "Jorge Mendoza", categoria: "Cerrajeria", descripcion: "Apertura de puertas, cambio de guardas y cerraduras de seguridad.", tarifa_hora: 38000, ciudad: "Cucuta", disponible: true, calificacion: 4.7, num_contratos: 15, num_resenas: 12, anios_experiencia: 12 },
  { codigo: "SERV-05", prestador_id: "USR-007", prestador_nombre: "Sandra Rios", categoria: "Limpieza", descripcion: "Limpieza profunda de hogares y oficinas, incluye insumos.", tarifa_hora: 25000, ciudad: "Cucuta", disponible: true, calificacion: 4.3, num_contratos: 20, num_resenas: 16, anios_experiencia: 4 },
  { codigo: "SERV-06", prestador_id: "USR-009", prestador_nombre: "Diana Torres", categoria: "Limpieza", descripcion: "Limpieza de apartamentos antes y después de mudanzas.", tarifa_hora: 28000, ciudad: "Bogota", disponible: true, calificacion: 4.6, num_contratos: 9, num_resenas: 8, anios_experiencia: 6 },
];

function contratoSemilla(
  datos: Pick<Contrato, "id" | "cliente_id" | "cliente_nombre" | "estado" | "fecha" | "direccion" | "horas" | "calificacion" | "comentario">,
  servicio: Servicio,
): Contrato {
  const liquidacion = calcularLiquidacionContrato(servicio.tarifa_hora, datos.horas);
  return {
    ...datos,
    prestador_id: servicio.prestador_id,
    prestador_nombre: servicio.prestador_nombre,
    servicio_codigo: servicio.codigo,
    servicio_nombre: CATEGORIA_LABEL[servicio.categoria],
    tarifa_hora: servicio.tarifa_hora,
    subtotal: liquidacion.subtotalNeto,
    iva: liquidacion.montoIva,
    total: liquidacion.totalPagar,
  };
}

const [electricidad, , , cerrajeria] = SERVICIOS_INICIALES;

export const CONTRATOS_INICIALES: Contrato[] = [
  contratoSemilla(
    { id: "CONTR-103", cliente_id: "USR-008", cliente_nombre: "Laura Martinez", estado: "En proceso", fecha: "2026-11-12", direccion: "Calle 10 # 4-21, barrio La Playa", horas: 3 },
    electricidad,
  ),
  contratoSemilla(
    { id: "CONTR-102", cliente_id: "USR-001", cliente_nombre: "Juan Perez", estado: "Pendiente", fecha: "2026-11-14", direccion: "Avenida 0 # 12-45, apartamento 302", horas: 2 },
    cerrajeria,
  ),
  contratoSemilla(
    { id: "CONTR-101", cliente_id: "USR-001", cliente_nombre: "Juan Perez", estado: "Completado", fecha: "2026-09-18", direccion: "Avenida 0 # 12-45, apartamento 302", horas: 5, calificacion: 5, comentario: "Excelente trabajo, muy puntual." },
    electricidad,
  ),
];

// Matrices de la Guía 9 (filas: categorías; columnas: días o ciudades).
export const MATRIZ_SEMANAL_INICIAL: number[][] = [
  [350000, 420000, 280000, 510000, 600000, 450000],
  [280000, 310000, 390000, 250000, 480000, 320000],
  [180000, 220000, 250000, 290000, 380000, 420000],
  [450000, 520000, 380000, 490000, 650000, 710000],
  [220000, 190000, 260000, 310000, 410000, 300000],
];

export const MATRIZ_CIUDADES_INICIAL: number[][] = [
  [450000, 380000, 850000, 720000, 210000],
  [320000, 290000, 640000, 510000, 180000],
  [250000, 210000, 490000, 430000, 160000],
  [580000, 620000, 950000, 890000, 310000],
  [290000, 240000, 530000, 470000, 150000],
];

export function crearEstadoInicial(): AppData {
  return {
    usuarios: USUARIOS_INICIALES,
    servicios: SERVICIOS_INICIALES,
    contratos: CONTRATOS_INICIALES,
    matrizSemanal: MATRIZ_SEMANAL_INICIAL,
    matrizCiudades: MATRIZ_CIUDADES_INICIAL,
    contratosSincronizados: [],
    sesionUsuarioId: null,
  };
}

/** Cuentas visibles en la pantalla de acceso para la demostración académica. */
export const CUENTAS_DEMO = [
  { rol: "cliente", correo: "juan.perez@email.com", contrasena: "juan123" },
  { rol: "prestador", correo: "carlos.gomez@email.com", contrasena: "carlos456" },
  { rol: "admin", correo: "admin@ypri.com", contrasena: "admin2026" },
] as const;

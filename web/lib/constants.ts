// Constantes del dominio YPRI. Los valores internos se mantienen sin tildes para
// conservar la compatibilidad con el backend en Python; las etiquetas visibles
// para el usuario se definen en los mapas *_LABEL.

export const ROLES_SISTEMA = ["cliente", "prestador", "admin"] as const;
export type RolUsuario = (typeof ROLES_SISTEMA)[number];

export const ROL_LABEL: Record<RolUsuario, string> = {
  cliente: "Cliente",
  prestador: "Profesional",
  admin: "Administrador",
};

export const CATEGORIAS_SERVICIO = [
  "Electricidad",
  "Plomeria",
  "Limpieza",
  "Climatizacion",
  "Cerrajeria",
] as const;
export type CategoriaServicio = (typeof CATEGORIAS_SERVICIO)[number];

export const CATEGORIA_LABEL: Record<CategoriaServicio, string> = {
  Electricidad: "Electricidad",
  Plomeria: "Plomería",
  Limpieza: "Limpieza",
  Climatizacion: "Climatización",
  Cerrajeria: "Cerrajería",
};

export const CIUDADES_COBERTURA = ["Cucuta", "Cali", "Bogota", "Medellin", "Bucaramanga"] as const;
export type CiudadCobertura = (typeof CIUDADES_COBERTURA)[number];

export const CIUDAD_LABEL: Record<CiudadCobertura, string> = {
  Cucuta: "Cúcuta",
  Cali: "Cali",
  Bogota: "Bogotá",
  Medellin: "Medellín",
  Bucaramanga: "Bucaramanga",
};

export const DIAS_SEMANA_MATRIZ = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"] as const;
export type DiaSemana = (typeof DIAS_SEMANA_MATRIZ)[number];

export const DIA_LABEL: Record<DiaSemana, string> = {
  Lunes: "Lunes",
  Martes: "Martes",
  Miercoles: "Miércoles",
  Jueves: "Jueves",
  Viernes: "Viernes",
  Sabado: "Sábado",
};

export const ESTADOS_CONTRATO = ["Pendiente", "En proceso", "Completado", "Cancelado"] as const;
export type EstadoContrato = (typeof ESTADOS_CONTRATO)[number];

export const IVA_PORCENTAJE = 0.19;
export const COMISION_PLATAFORMA = 0.1;
export const RETENCION_FUENTE = 0.04;

export const HORAS_MINIMAS = 1;
export const HORAS_MAXIMAS = 20;
export const TARIFA_MINIMA = 10000;
export const TARIFA_MAXIMA = 1000000;
export const LONGITUD_MINIMA_DESCRIPCION = 15;
export const LONGITUD_MINIMA_CONTRASENA = 6;

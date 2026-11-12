import { CIUDADES_COBERTURA, LONGITUD_MINIMA_CONTRASENA, type CiudadCobertura } from "../constants";
import { siguienteId } from "../ids";
import { fail, ok, type Result } from "../result";
import type { AppData, Usuario } from "../types";
import { esCelularValido, esCorreoValido, normalizarCorreo } from "../validation";
import { MENSAJE_SIN_PERMISO, tienePermiso } from "./permissions";

const MENSAJE_CREDENCIALES = "Correo o contraseña incorrectos.";

export function autenticar(usuarios: readonly Usuario[], correo: string, contrasena: string): Result<Usuario> {
  const usuario = usuarios.find((u) => normalizarCorreo(u.correo) === normalizarCorreo(correo));
  if (!usuario || usuario.contrasena !== contrasena) return fail(MENSAJE_CREDENCIALES);
  if (!usuario.activo) return fail("Tu cuenta está suspendida. Comunícate con soporte.");
  return ok(usuario);
}

export interface DatosRegistro {
  nombre: string;
  correo: string;
  telefono: string;
  ciudad: CiudadCobertura;
  /** El registro público nunca crea administradores. */
  rol: "cliente" | "prestador";
  contrasena: string;
  confirmacion: string;
}

export function validarRegistro(usuarios: readonly Usuario[], datos: DatosRegistro): string | null {
  if (datos.nombre.trim().length < 3) return "Escribe tu nombre completo.";
  if (!esCorreoValido(datos.correo)) return "El correo electrónico no es válido.";
  const correo = normalizarCorreo(datos.correo);
  if (usuarios.some((u) => normalizarCorreo(u.correo) === correo)) return "Ya existe una cuenta con ese correo.";
  if (!esCelularValido(datos.telefono)) return "El celular debe tener 10 dígitos y empezar por 3.";
  if (!CIUDADES_COBERTURA.includes(datos.ciudad)) return "Selecciona una ciudad con cobertura.";
  if (datos.rol !== "cliente" && datos.rol !== "prestador") return "Selecciona un tipo de cuenta válido.";
  if (datos.contrasena.length < LONGITUD_MINIMA_CONTRASENA)
    return `La contraseña debe tener al menos ${LONGITUD_MINIMA_CONTRASENA} caracteres.`;
  if (datos.contrasena !== datos.confirmacion) return "Las contraseñas no coinciden.";
  return null;
}

export function registrarUsuario(data: AppData, datos: DatosRegistro): Result<{ data: AppData; usuario: Usuario }> {
  const error = validarRegistro(data.usuarios, datos);
  if (error) return fail(error);

  const usuario: Usuario = {
    id: siguienteId("USR", data.usuarios.map((u) => u.id)),
    nombre: datos.nombre.trim(),
    correo: normalizarCorreo(datos.correo),
    contrasena: datos.contrasena,
    rol: datos.rol,
    ciudad: datos.ciudad,
    telefono: datos.telefono.replace(/\s+/g, ""),
    activo: true,
  };
  return ok({ data: { ...data, usuarios: [...data.usuarios, usuario], sesionUsuarioId: usuario.id }, usuario });
}

export function cambiarEstadoUsuario(data: AppData, actor: Usuario, usuarioId: string): Result<AppData> {
  if (!tienePermiso(actor, "usuarios:gestionar")) return fail(MENSAJE_SIN_PERMISO);
  if (actor.id === usuarioId) return fail("No puedes suspender tu propia cuenta.");
  const objetivo = data.usuarios.find((u) => u.id === usuarioId);
  if (!objetivo) return fail("El usuario no existe.");
  if (objetivo.rol === "admin") return fail("No es posible suspender a otro administrador.");

  return ok({
    ...data,
    usuarios: data.usuarios.map((u) => (u.id === usuarioId ? { ...u, activo: !u.activo } : u)),
  });
}
